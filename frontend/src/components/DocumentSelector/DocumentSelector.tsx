// src/components/DocumentSelector/DocumentSelector.tsx
import React, { useState } from 'react';
import DocumentLibrary from '@/components/DocumentLibrary/DocumentLibrary';
import './DocumentSelector.css';

interface DocumentSelectorProps {
  onDocumentSelect: (document: { id: string; name: string; text: string; fromLibrary: boolean }) => void;
  onFileUpload: (file: File) => void;
  selectedDocument?: { id: string; name: string } | null;
  multiSelect?: boolean;
  onMultiSelect?: (documents: { id: string; name: string; text: string }[]) => void;
  selectedDocuments?: string[];
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  onDocumentSelect,
  onFileUpload,
  selectedDocument,
  multiSelect = false,
  onMultiSelect,
  selectedDocuments = []
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [selectedLibraryDocs, setSelectedLibraryDocs] = useState<string[]>(selectedDocuments);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleLibraryDocumentSelect = (document: { id: string; name: string; text: string }) => {
    onDocumentSelect({
      ...document,
      fromLibrary: true
    });
  };

  const handleLibrarySelectionChange = async (selectedIds: string[]) => {
    setSelectedLibraryDocs(selectedIds);
    
    if (multiSelect && onMultiSelect) {
      // For multi-select, we would need to fetch all selected documents
      // This is a simplified version - you might want to batch fetch these
      onMultiSelect([]);
    }
  };

  return (
    <div className="document-selector">
      <div className="selector-tabs">
        <button
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📁 Nouveau Document
        </button>
        <button
          className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          📚 Ma Bibliothèque
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'upload' && (
          <div className="upload-section">
            <div
              className={`upload-area ${dragOver ? 'drag-over' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="upload-content">
                <div className="upload-icon">📄</div>
                <h3>Analyser un nouveau document</h3>
                <p>Glissez-déposez un fichier PDF ou image, ou cliquez pour sélectionner</p>
                
                <input
                  type="file"
                  id="file-input"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                <label htmlFor="file-input" className="upload-btn">
                  Choisir un fichier
                </label>

                <div className="file-types">
                  <p>Formats supportés: PDF, JPG, PNG, GIF, BMP, TIFF</p>
                </div>
              </div>
            </div>

            {selectedDocument && !multiSelect && (
              <div className="selected-document">
                <div className="selected-header">
                  <span className="selected-icon">📄</span>
                  <span className="selected-name">{selectedDocument.name}</span>
                  <span className="selected-badge">Sélectionné</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div className="library-section">
            <div className="library-header">
              <h3>Réutiliser un document existant</h3>
              <p>Sélectionnez un document de votre bibliothèque pour éviter de le re-télécharger</p>
            </div>

            <DocumentLibrary
              onDocumentSelect={handleLibraryDocumentSelect}
              selectionMode={multiSelect}
              multiSelect={multiSelect}
              selectedDocuments={selectedLibraryDocs}
              onSelectionChange={handleLibrarySelectionChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSelector;