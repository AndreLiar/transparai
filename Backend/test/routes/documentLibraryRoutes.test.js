const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const documentLibraryService = require('../../services/documentLibraryService');

jest.mock('firebase-admin');
jest.mock('../../services/documentLibraryService');

describe('Document Library Routes', () => {
  beforeAll(async () => {
    const user = new User({ firebaseUid: 'test-uid', email: 'test@test.com', plan: 'enterprise' });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/documents/library', () => {
    it('should return a 200 response with the document library', async () => {
      const libraryData = {
        documents: [],
        pagination: {},
      };

      documentLibraryService.getUserDocuments.mockResolvedValue(libraryData);

      const res = await request(app)
        .get('/api/documents/library')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(libraryData);
    });
  });

  describe('GET /api/documents/library/:documentId', () => {
    it('should return a 200 response with the document content', async () => {
      const documentData = {
        id: 'test-doc-id',
        name: 'Test Document',
        extractedText: 'This is a test document.',
      };

      documentLibraryService.getDocumentContent.mockResolvedValue(documentData);

      const res = await request(app)
        .get('/api/documents/library/test-doc-id')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(documentData);
    });
  });

  describe('DELETE /api/documents/library/:documentId', () => {
    it('should return a 200 response with a success message', async () => {
      const deleteResult = { success: true, message: 'Document deleted' };

      documentLibraryService.deleteDocument.mockResolvedValue(deleteResult);

      const res = await request(app)
        .delete('/api/documents/library/test-doc-id')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(deleteResult);
    });
  });

  describe('PUT /api/documents/library/:documentId/share', () => {
    it('should return a 200 response with the updated sharing info', async () => {
      const shareResult = { success: true, message: 'Sharing settings updated' };

      documentLibraryService.shareDocumentWithOrg.mockResolvedValue(shareResult);

      const res = await request(app)
        .put('/api/documents/library/test-doc-id/share')
        .set('Authorization', 'Bearer test-token')
        .send({ share: true });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(shareResult);
    });
  });
});
