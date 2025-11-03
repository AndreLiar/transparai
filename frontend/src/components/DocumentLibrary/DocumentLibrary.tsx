// src/components/DocumentLibrary/DocumentLibrary.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getDocumentLibrary, 
  deleteDocument, 
  getDocumentContent,
  DocumentLibraryItem, 
  DocumentLibraryOptions 
} from '@/services/documentLibraryService';
import './DocumentLibrary.css';

interface DocumentLibraryProps {
  onDocumentSelect?: (document: { id: string; name: string; text: string }) => void;
  selectionMode?: boolean;
  multiSelect?: boolean;
  selectedDocuments?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  onDocumentSelect,
  selectionMode = false,
  multiSelect = false,
  selectedDocuments = [],
  onSelectionChange
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'lastUsed' | 'createdAt' | 'name' | 'usageCount'>('lastUsed');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [includeOrgDocs, setIncludeOrgDocs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDocs, setSelectedDocs] = useState<string[]>(selectedDocuments);

  useEffect(() => {
    setSelectedDocs(selectedDocuments);
  }, [selectedDocuments]);

  const loadDocuments = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const options: DocumentLibraryOptions = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        sortBy,
        sortOrder,
        includeOrgDocs
      };

      const response = await getDocumentLibrary(token, options);
      setDocuments(response.documents);
      setTotalPages(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la bibliothèque');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user, searchTerm, sortBy, sortOrder, includeOrgDocs, currentPage]);

  const handleDocumentUse = async (doc: DocumentLibraryItem) => {
    if (!user || !onDocumentSelect) return;

    try {
      const token = await user.getIdToken();
      const documentDetails = await getDocumentContent(token, doc.id);
      
      onDocumentSelect({
        id: doc.id,
        name: doc.name,
        text: documentDetails.extractedText
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du document');
    }
  };

  const handleDocumentSelection = (docId: string) => {
    if (!selectionMode) return;

    let newSelection: string[];
    
    if (multiSelect) {
      if (selectedDocs.includes(docId)) {
        newSelection = selectedDocs.filter(id => id !== docId);
      } else {
        newSelection = [...selectedDocs, docId];
      }
    } else {
      newSelection = selectedDocs.includes(docId) ? [] : [docId];
    }

    setSelectedDocs(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleDelete = async (docId: string) => {
    if (!user || !confirm('Êtes-vous sûr de vouloir supprimer ce document de votre bibliothèque ?')) return;

    try {
      const token = await user.getIdToken();
      await deleteDocument(token, docId);
      loadDocuments(); // Reload the list
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="document-library">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement de votre bibliothèque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-library">
      <div className="library-header">
        <h3>📚 Bibliothèque de Documents</h3>
        <p className="library-description">
          Vos documents précédemment analysés sont automatiquement sauvegardés ici pour réutilisation.
        </p>
      </div>

      <div className="library-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="lastUsed">Dernière utilisation</option>
            <option value="createdAt">Date d'ajout</option>
            <option value="name">Nom</option>
            <option value="usageCount">Nombre d'utilisations</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            className="order-select"
          >
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeOrgDocs}
              onChange={(e) => setIncludeOrgDocs(e.target.checked)}
            />
            Inclure documents d'organisation
          </label>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h4>Aucun document dans votre bibliothèque</h4>
          <p>Les documents que vous analysez sont automatiquement ajoutés ici pour réutilisation future.</p>
        </div>
      ) : (
        <>
          <div className="documents-grid">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className={`document-card ${selectionMode ? 'selectable' : ''} ${
                  selectedDocs.includes(doc.id) ? 'selected' : ''
                }`}
                onClick={() => selectionMode ? handleDocumentSelection(doc.id) : handleDocumentUse(doc)}
              >
                {selectionMode && (
                  <div className="selection-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => handleDocumentSelection(doc.id)}
                    />
                  </div>
                )}

                <div className="document-icon">
                  {doc.fileType === 'pdf' ? '📄' : 
                   doc.source === 'ocr' ? '🖼️' : '📁'}
                </div>

                <div className="document-info">
                  <h4 className="document-name" title={doc.originalName}>
                    {doc.name}
                  </h4>
                  
                  <div className="document-meta">
                    <span className="source-badge source-{doc.source}">
                      {doc.source === 'ocr' ? 'OCR' : 'Upload'}
                    </span>
                    {doc.fileType && (
                      <span className="file-type">{doc.fileType.toUpperCase()}</span>
                    )}
                  </div>

                  <div className="document-stats">
                    <div className="stat">
                      <span className="stat-label">Utilisé:</span>
                      <span className="stat-value">{doc.usageCount} fois</span>
                    </div>
                    {doc.sizeBytes && (
                      <div className="stat">
                        <span className="stat-label">Taille:</span>
                        <span className="stat-value">{formatFileSize(doc.sizeBytes)}</span>
                      </div>
                    )}
                    {doc.pageCount && (
                      <div className="stat">
                        <span className="stat-label">Pages:</span>
                        <span className="stat-value">{doc.pageCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="document-dates">
                    <div className="date-info">
                      <span className="date-label">Ajouté:</span>
                      <span className="date-value">{formatDate(doc.createdAt)}</span>
                    </div>
                    <div className="date-info">
                      <span className="date-label">Dernière utilisation:</span>
                      <span className="date-value">{formatDate(doc.lastUsed)}</span>
                    </div>
                  </div>

                  {!doc.isOwnDocument && doc.owner && (
                    <div className="owner-info">
                      <span className="owner-label">Partagé par:</span>
                      <span className="owner-name">{doc.owner.name}</span>
                    </div>
                  )}
                </div>

                {!selectionMode && doc.isOwnDocument && (
                  <div className="document-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      className="btn-delete"
                      title="Supprimer de la bibliothèque"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Précédent
              </button>
              
              <span className="pagination-info">
                Page {currentPage} sur {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentLibrary;