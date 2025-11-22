// Backend/controllers/adminController.js
const User = require('../models/User');
const ErrorLog = require('../models/ErrorLog');
const FailedAttempt = require('../models/FailedAttempt');
const logger = require('../utils/logger');

const getQuotaAnalytics = async (req, res) => {
  try {
    // Get current date for filtering
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Aggregate user data by plan
    const userAnalytics = await User.aggregate([
      {
        $group: {
          _id: '$plan',
          totalUsers: { $sum: 1 },
          totalAnalyses: { $sum: '$analysisCount' },
          avgAnalysesPerUser: { $avg: '$analysisCount' },
          totalQuotaUsed: { $sum: '$currentUsage.analyses' },
          totalQuotaLimit: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$plan', 'free'] }, then: 5 },
                  { case: { $eq: ['$plan', 'standard'] }, then: 50 },
                  { case: { $eq: ['$plan', 'premium'] }, then: 200 },
                  { case: { $eq: ['$plan', 'enterprise'] }, then: 1000 },
                ],
                default: 5,
              },
            },
          },
        },
      },
      {
        $addFields: {
          utilizationRate: {
            $multiply: [
              { $divide: ['$totalQuotaUsed', '$totalQuotaLimit'] },
              100,
            ],
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get recent usage trends
    const usageTrends = await User.aggregate([
      {
        $match: {
          lastAnalysisAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            plan: '$plan',
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$lastAnalysisAt',
              },
            },
          },
          dailyAnalyses: { $sum: 1 },
          uniqueUsers: { $addToSet: '$_id' },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          planBreakdown: {
            $push: {
              plan: '$_id.plan',
              analyses: '$dailyAnalyses',
              users: { $size: '$uniqueUsers' },
            },
          },
          totalAnalyses: { $sum: '$dailyAnalyses' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $limit: 30,
      },
    ]);

    // Get users approaching quota limits
    const usersNearLimit = await User.aggregate([
      {
        $addFields: {
          quotaLimit: {
            $switch: {
              branches: [
                { case: { $eq: ['$plan', 'free'] }, then: 5 },
                { case: { $eq: ['$plan', 'standard'] }, then: 50 },
                { case: { $eq: ['$plan', 'premium'] }, then: 200 },
                { case: { $eq: ['$plan', 'enterprise'] }, then: 1000 },
              ],
              default: 5,
            },
          },
        },
      },
      {
        $addFields: {
          utilizationRate: {
            $multiply: [
              { $divide: ['$currentUsage.analyses', '$quotaLimit'] },
              100,
            ],
          },
        },
      },
      {
        $match: {
          utilizationRate: { $gte: 80 }, // 80% or more of quota used
        },
      },
      {
        $project: {
          email: 1,
          plan: 1,
          currentUsage: 1,
          quotaLimit: 1,
          utilizationRate: 1,
          lastAnalysisAt: 1,
        },
      },
      {
        $sort: { utilizationRate: -1 },
      },
      {
        $limit: 50,
      },
    ]);

    // Get error analytics
    const errorAnalytics = await ErrorLog.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            level: '$level',
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp',
              },
            },
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$request.userId' },
          commonErrors: { $push: '$message' },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          errorBreakdown: {
            $push: {
              level: '$_id.level',
              count: '$count',
              uniqueUsers: { $size: '$uniqueUsers' },
            },
          },
          totalErrors: { $sum: '$count' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get rate limit analytics
    const rateLimitHits = await ErrorLog.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo },
          'metadata.code': { $in: ['RATE_LIMIT_EXCEEDED', 'ANALYSIS_QUOTA_EXCEEDED'] },
        },
      },
      {
        $group: {
          _id: {
            code: '$metadata.code',
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp',
              },
            },
          },
          count: { $sum: 1 },
          affectedUsers: { $addToSet: '$request.userId' },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Calculate summary statistics
    const totalUsers = userAnalytics.reduce((sum, plan) => sum + plan.totalUsers, 0);
    const totalAnalyses = userAnalytics.reduce((sum, plan) => sum + plan.totalAnalyses, 0);
    const avgUtilization = userAnalytics.reduce((sum, plan) => sum + (plan.utilizationRate * plan.totalUsers), 0) / totalUsers;

    const analytics = {
      summary: {
        totalUsers,
        totalAnalyses,
        avgUtilizationRate: Math.round(avgUtilization * 100) / 100,
        usersNearLimit: usersNearLimit.length,
        generatedAt: now.toISOString(),
      },
      planBreakdown: userAnalytics,
      usageTrends,
      usersNearLimit: usersNearLimit.slice(0, 20), // Limit to top 20
      errorAnalytics,
      rateLimitAnalytics: rateLimitHits,
      recommendations: generateRecommendations(userAnalytics, usersNearLimit, errorAnalytics),
    };

    logger.info('Admin quota analytics accessed', {
      adminUserId: req.user?.uid,
      totalUsers,
      totalAnalyses,
    });

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    logger.error('Failed to generate quota analytics', {
      error: error.message,
      stack: error.stack,
      adminUserId: req.user?.uid,
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate analytics',
        code: 'ANALYTICS_ERROR',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

const generateRecommendations = (userAnalytics, usersNearLimit, errorAnalytics) => {
  const recommendations = [];

  // Check for high utilization plans
  userAnalytics.forEach((plan) => {
    if (plan.utilizationRate > 85) {
      recommendations.push({
        type: 'quota_management',
        priority: 'high',
        message: `Plan ${plan._id} has ${Math.round(plan.utilizationRate)}% quota utilization. Consider monitoring for upgrade opportunities.`,
        action: 'Monitor users approaching limits and suggest plan upgrades',
      });
    }
  });

  // Check for users near limit
  if (usersNearLimit.length > 10) {
    recommendations.push({
      type: 'user_engagement',
      priority: 'medium',
      message: `${usersNearLimit.length} users are approaching their quota limits. Consider proactive upgrade campaigns.`,
      action: 'Send upgrade notifications to users at 80%+ utilization',
    });
  }

  // Check error rates
  const totalErrors = errorAnalytics.reduce((sum, day) => sum + day.totalErrors, 0);
  if (totalErrors > 100) {
    recommendations.push({
      type: 'system_health',
      priority: 'high',
      message: `High error rate detected: ${totalErrors} errors in the last 7 days.`,
      action: 'Investigate common error patterns and implement fixes',
    });
  }

  // Free plan conversion opportunity
  const freePlan = userAnalytics.find((plan) => plan._id === 'free');
  if (freePlan && freePlan.utilizationRate > 70) {
    recommendations.push({
      type: 'conversion_opportunity',
      priority: 'medium',
      message: `Free plan users have ${Math.round(freePlan.utilizationRate)}% utilization. High conversion potential.`,
      action: 'Create targeted upgrade campaigns for active free users',
    });
  }

  return recommendations;
};

const getSystemMetrics = async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get real-time system metrics
    const metrics = {
      timestamp: now.toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
      database: {
        // These would be actual MongoDB metrics in production
        connections: 'Available via MongoDB monitoring',
        operations: 'Available via MongoDB monitoring',
        performance: 'Available via MongoDB monitoring',
      },
      errors: {
        last24h: await ErrorLog.countDocuments({
          timestamp: { $gte: oneDayAgo },
          level: 'error',
        }),
        unresolved: await ErrorLog.countDocuments({
          resolved: false,
          level: 'error',
        }),
      },
      users: {
        total: await User.countDocuments(),
        active24h: await User.countDocuments({
          lastAnalysisAt: { $gte: oneDayAgo },
        }),
      },
    };

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    logger.error('Failed to get system metrics', {
      error: error.message,
      adminUserId: req.user?.uid,
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve system metrics',
        code: 'METRICS_ERROR',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get security monitoring data (failed attempts, locked accounts)
 */
const getSecurityMetrics = async (req, res) => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get failed attempts in last 15 minutes
    const recentAttempts = await FailedAttempt.countDocuments({
      timestamp: { $gte: fifteenMinutesAgo },
    });

    // Get failed attempts in last 24 hours by type
    const attemptsByType = await FailedAttempt.aggregate([
      {
        $match: {
          timestamp: { $gte: oneDayAgo },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get top IPs with failed attempts
    const topFailedIPs = await FailedAttempt.aggregate([
      {
        $match: {
          timestamp: { $gte: oneDayAgo },
        },
      },
      {
        $group: {
          _id: '$ip',
          count: { $sum: 1 },
          lastAttempt: { $max: '$timestamp' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get accounts with multiple failed attempts
    const lockedAccounts = await FailedAttempt.aggregate([
      {
        $match: {
          timestamp: { $gte: fifteenMinutesAgo },
        },
      },
      {
        $group: {
          _id: '$identifier',
          count: { $sum: 1 },
          lastAttempt: { $max: '$timestamp' },
        },
      },
      {
        $match: {
          count: { $gte: 5 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    logger.info('Security metrics retrieved', {
      adminUserId: req.user.uid,
      recentAttempts,
    });

    res.json({
      success: true,
      metrics: {
        timestamp: new Date().toISOString(),
        recentAttempts: {
          last15Minutes: recentAttempts,
          last24Hours: attemptsByType.reduce((sum, item) => sum + item.count, 0),
        },
        attemptsByType,
        topFailedIPs,
        lockedAccounts: {
          count: lockedAccounts.length,
          accounts: lockedAccounts,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to get security metrics', {
      error: error.message,
      adminUserId: req.user?.uid,
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve security metrics',
        code: 'SECURITY_METRICS_ERROR',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

module.exports = {
  getQuotaAnalytics,
  getSystemMetrics,
  getSecurityMetrics,
};
