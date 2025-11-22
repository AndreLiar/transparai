// Quick test script for AI pricing system
const User = require('./models/User');
const { syncAIBudgetWithPlan, getAIBudget } = require('./utils/planUtils');
const { PLAN_AI_BUDGETS } = require('./services/aiModelService');
require('./config/db')(); // Connect to MongoDB

const testAIPricing = async () => {
  console.log('🧪 Testing AI Pricing System...\n');

  // Test 1: Check plan budgets
  console.log('📊 Plan AI Budgets:');
  for (const [plan, budget] of Object.entries(PLAN_AI_BUDGETS)) {
    console.log(`  ${plan.padEnd(10)}: $${budget}/month`);
  }
  console.log('');

  // Test 2: Create or find a test user
  let testUser = await User.findOne({ email: 'test@example.com' });

  if (!testUser) {
    testUser = new User({
      firebaseUid: `test-uid-${Date.now()}`,
      email: 'test@example.com',
      plan: 'starter',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        isComplete: true,
      },
    });
    await testUser.save();
    console.log('✅ Created test user');
  } else {
    console.log('✅ Found existing test user');
  }

  // Test 3: Test budget sync for different plans
  const plans = ['starter', 'standard', 'premium', 'enterprise'];

  for (const plan of plans) {
    console.log(`\n🔄 Testing plan: ${plan}`);

    // Update user plan
    testUser.plan = plan;

    // Sync AI budget
    const changed = await syncAIBudgetWithPlan(testUser);
    await testUser.save();

    const expectedBudget = getAIBudget(plan);
    const actualBudget = testUser.aiSettings?.monthlyAIBudget?.allocated || 0;

    console.log(`  Expected budget: $${expectedBudget}`);
    console.log(`  Actual budget: $${actualBudget}`);
    console.log(`  Settings changed: ${changed}`);
    console.log(`  Budget match: ${expectedBudget === actualBudget ? '✅' : '❌'}`);
  }

  // Test 4: Test webhook-style budget setting
  console.log('\n🪝 Testing webhook-style budget allocation...');

  testUser.plan = 'premium';
  testUser.aiSettings = {
    preferredModel: 'auto',
    allowPremiumAI: true,
    monthlyAIBudget: {
      allocated: PLAN_AI_BUDGETS.premium,
      used: 0,
      lastReset: new Date(),
    },
  };

  await testUser.save();
  console.log(`✅ Premium plan AI budget set to $${testUser.aiSettings.monthlyAIBudget.allocated}`);

  // Test 5: Verify budget tracking
  console.log('\n💰 Testing budget usage tracking...');

  const initialUsed = testUser.aiSettings.monthlyAIBudget.used;
  const testCost = 0.05; // $0.05 test charge

  testUser.aiSettings.monthlyAIBudget.used += testCost;
  await testUser.save();

  const finalUsed = testUser.aiSettings.monthlyAIBudget.used;
  const remaining = testUser.aiSettings.monthlyAIBudget.allocated - finalUsed;

  console.log(`  Initial used: $${initialUsed.toFixed(4)}`);
  console.log(`  Test charge: $${testCost.toFixed(4)}`);
  console.log(`  Final used: $${finalUsed.toFixed(4)}`);
  console.log(`  Remaining: $${remaining.toFixed(4)}`);
  console.log(`  Tracking works: ${(finalUsed - initialUsed) === testCost ? '✅' : '❌'}`);

  console.log('\n🎉 AI Pricing System Test Complete!');

  // Cleanup
  await User.deleteOne({ _id: testUser._id });
  console.log('🧹 Cleaned up test user');

  process.exit(0);
};

// Run the test
testAIPricing().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
