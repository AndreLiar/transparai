// Backend/controllers/collaborationController.js
const SharedAnalysis = require('../models/SharedAnalysis');
const User = require('../models/User');
const Organization = require('../models/Organization');

// Share an analysis with the team
const shareAnalysis = async (req, res) => {
  try {
    const { uid } = req.user;
    const {
      analysisId,
      analysisType,
      title,
      description,
      tags = [],
      sharedWith = 'organization',
      specificUsers = [],
      allowComments = true,
      requiresApproval = false,
    } = req.body;

    // Get user and verify enterprise access
    const user = await User.findOne({ firebaseUid: uid });
    if (!user || user.plan !== 'enterprise' || !user.organization?.id) {
      return res.status(403).json({
        message: 'Fonctionnalité réservée aux utilisateurs Enterprise avec organisation.',
      });
    }

    // Verify user has sharing permissions (admin/manager)
    if (!['admin', 'manager'].includes(user.organization.role)) {
      return res.status(403).json({
        message: 'Seuls les admins et managers peuvent partager des analyses.',
      });
    }

    const organizationId = user.organization.id;

    // Create shared analysis
    const sharedAnalysis = new SharedAnalysis({
      analysisId,
      analysisType,
      organizationId,
      sharedBy: user._id,
      sharedWith,
      specificUsers,
      title,
      description,
      tags,
      allowComments,
      requiresApproval,
    });

    // Set permissions based on sharing scope
    const organization = await Organization.findById(organizationId);
    const orgUsers = await User.find({ 'organization.id': organizationId });

    switch (sharedWith) {
      case 'organization':
        sharedAnalysis.permissions.canView = orgUsers.map((u) => u._id);
        sharedAnalysis.permissions.canComment = orgUsers.map((u) => u._id);
        break;
      case 'managers':
        const managers = orgUsers.filter((u) => ['admin', 'manager'].includes(u.organization?.role));
        sharedAnalysis.permissions.canView = managers.map((u) => u._id);
        sharedAnalysis.permissions.canComment = managers.map((u) => u._id);
        break;
      case 'specific_users':
        sharedAnalysis.permissions.canView = specificUsers;
        sharedAnalysis.permissions.canComment = specificUsers;
        break;
    }

    // Set approval permissions (only admins and managers)
    const approvers = orgUsers.filter((u) => ['admin', 'manager'].includes(u.organization?.role));
    sharedAnalysis.permissions.canApprove = approvers.map((u) => u._id);

    await sharedAnalysis.save();

    res.json({
      message: 'Analyse partagée avec succès',
      sharedAnalysis: {
        id: sharedAnalysis._id,
        title: sharedAnalysis.title,
        status: sharedAnalysis.status,
        sharedWith: sharedAnalysis.sharedWith,
        createdAt: sharedAnalysis.createdAt,
      },
    });
  } catch (err) {
    console.error('❌ Erreur partage analyse :', err.message);
    res.status(500).json({ message: err.message || 'Erreur lors du partage de l\'analyse.' });
  }
};

// Get shared analyses for user's organization
const getSharedAnalyses = async (req, res) => {
  try {
    const { uid } = req.user;
    const { status, page = 1, limit = 10 } = req.query;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user || !user.organization?.id) {
      return res.status(403).json({
        message: 'Utilisateur sans organisation.',
      });
    }

    const query = {
      organizationId: user.organization.id,
      'permissions.canView': user._id,
    };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const sharedAnalyses = await SharedAnalysis.find(query)
      .populate('sharedBy', 'profile email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SharedAnalysis.countDocuments(query);

    res.json({
      sharedAnalyses: sharedAnalyses.map((sa) => ({
        id: sa._id,
        title: sa.title,
        description: sa.description,
        analysisType: sa.analysisType,
        status: sa.status,
        tags: sa.tags,
        sharedBy: {
          name: `${sa.sharedBy.profile?.firstName} ${sa.sharedBy.profile?.lastName}`.trim() || sa.sharedBy.email,
          email: sa.sharedBy.email,
        },
        viewCount: sa.viewCount,
        commentCount: sa.comments.length,
        createdAt: sa.createdAt,
        updatedAt: sa.updatedAt,
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: sharedAnalyses.length,
        totalItems: total,
      },
    });
  } catch (err) {
    console.error('❌ Erreur récupération analyses partagées :', err.message);
    res.status(500).json({ message: err.message || 'Erreur lors de la récupération des analyses.' });
  }
};

// Get specific shared analysis details
const getSharedAnalysisDetails = async (req, res) => {
  try {
    const { uid } = req.user;
    const { analysisId } = req.params;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const sharedAnalysis = await SharedAnalysis.findById(analysisId)
      .populate('sharedBy', 'profile email')
      .populate('comments.authorId', 'profile email')
      .populate('approvalWorkflow.approverId', 'profile email');

    if (!sharedAnalysis) {
      return res.status(404).json({ message: 'Analyse partagée introuvable.' });
    }

    // Check permissions
    if (!sharedAnalysis.permissions.canView.includes(user._id)) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    // Increment view count
    await SharedAnalysis.findByIdAndUpdate(analysisId, {
      $inc: { viewCount: 1 },
      lastViewed: new Date(),
    });

    res.json({
      id: sharedAnalysis._id,
      analysisId: sharedAnalysis.analysisId,
      analysisType: sharedAnalysis.analysisType,
      title: sharedAnalysis.title,
      description: sharedAnalysis.description,
      tags: sharedAnalysis.tags,
      status: sharedAnalysis.status,
      sharedBy: {
        name: `${sharedAnalysis.sharedBy.profile?.firstName} ${sharedAnalysis.sharedBy.profile?.lastName}`.trim() || sharedAnalysis.sharedBy.email,
        email: sharedAnalysis.sharedBy.email,
      },
      allowComments: sharedAnalysis.allowComments,
      requiresApproval: sharedAnalysis.requiresApproval,
      comments: sharedAnalysis.comments.map((c) => ({
        id: c._id,
        content: c.content,
        author: {
          name: `${c.authorId.profile?.firstName} ${c.authorId.profile?.lastName}`.trim() || c.authorId.email,
          email: c.authorId.email,
        },
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      approvalWorkflow: sharedAnalysis.approvalWorkflow,
      permissions: {
        canComment: sharedAnalysis.permissions.canComment.includes(user._id),
        canApprove: sharedAnalysis.permissions.canApprove.includes(user._id),
      },
      viewCount: sharedAnalysis.viewCount,
      createdAt: sharedAnalysis.createdAt,
      updatedAt: sharedAnalysis.updatedAt,
    });
  } catch (err) {
    console.error('❌ Erreur détails analyse partagée :', err.message);
    res.status(500).json({ message: err.message || 'Erreur lors de la récupération des détails.' });
  }
};

// Add comment to shared analysis
const addComment = async (req, res) => {
  try {
    const { uid } = req.user;
    const { analysisId } = req.params;
    const { content } = req.body;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const sharedAnalysis = await SharedAnalysis.findById(analysisId);
    if (!sharedAnalysis) {
      return res.status(404).json({ message: 'Analyse partagée introuvable.' });
    }

    // Check permissions
    if (!sharedAnalysis.permissions.canComment.includes(user._id) || !sharedAnalysis.allowComments) {
      return res.status(403).json({ message: 'Vous ne pouvez pas commenter cette analyse.' });
    }

    const comment = {
      authorId: user._id,
      authorName: `${user.profile?.firstName} ${user.profile?.lastName}`.trim() || user.email,
      content: content.trim(),
    };

    sharedAnalysis.comments.push(comment);
    await sharedAnalysis.save();

    res.json({
      message: 'Commentaire ajouté avec succès',
      comment: {
        id: sharedAnalysis.comments[sharedAnalysis.comments.length - 1]._id,
        content: comment.content,
        author: {
          name: comment.authorName,
          email: user.email,
        },
        createdAt: sharedAnalysis.comments[sharedAnalysis.comments.length - 1].createdAt,
      },
    });
  } catch (err) {
    console.error('❌ Erreur ajout commentaire :', err.message);
    res.status(500).json({ message: err.message || 'Erreur lors de l\'ajout du commentaire.' });
  }
};

module.exports = {
  shareAnalysis,
  getSharedAnalyses,
  getSharedAnalysisDetails,
  addComment,
};
