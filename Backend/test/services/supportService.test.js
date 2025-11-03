const User = require('../../models/User');
const {
  getSupportInfo,
  createSupportTicket,
  getTicketHistory,
} = require('../../services/supportService');

describe('supportService', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('returns support metadata based on plan', async () => {
    const user = await User.create({
      firebaseUid: 'enterprise-uid',
      email: 'enterprise@example.com',
      plan: 'enterprise',
    });

    const info = await getSupportInfo(user.firebaseUid);
    expect(info.plan).toBe('enterprise');
    expect(info.features.enterprise.features).toContain('Support technique avancé');
    expect(info.hasPrioritySupport).toBe(true);
  });

  it('creates support ticket with estimated response', async () => {
    const user = await User.create({
      firebaseUid: 'premium-uid',
      email: 'premium@example.com',
      plan: 'premium',
    });

    const ticket = await createSupportTicket(user.firebaseUid, {
      subject: 'Aide urgente',
      message: 'Nous avons besoin d\'assistance.',
      urgency: 'high',
      category: 'technical',
    });

    expect(ticket.status).toBe('created');
    expect(ticket.ticketId).toMatch(/^TPAI-/);
    expect(ticket.estimatedResponse).toBe('6h');
  });

  it('returns ticket history placeholder data', async () => {
    const user = await User.create({
      firebaseUid: 'starter-uid',
      email: 'starter@example.com',
      plan: 'starter',
    });

    const history = await getTicketHistory(user.firebaseUid);
    expect(Array.isArray(history)).toBe(true);
    expect(history[0]).toHaveProperty('status');
  });
});
