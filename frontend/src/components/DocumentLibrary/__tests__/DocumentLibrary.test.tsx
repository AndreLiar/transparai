import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentLibrary from '../DocumentLibrary';

const getDocumentLibraryMock = vi.fn();
const getDocumentContentMock = vi.fn();
const deleteDocumentMock = vi.fn();
const getIdTokenMock = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      getIdToken: getIdTokenMock,
    },
  }),
}));

vi.mock('@/services/documentLibraryService', () => ({
  getDocumentLibrary: (...args: unknown[]) => getDocumentLibraryMock(...args),
  getDocumentContent: (...args: unknown[]) => getDocumentContentMock(...args),
  deleteDocument: (...args: unknown[]) => deleteDocumentMock(...args),
}));

const sampleDocuments = [
  {
    id: 'doc-1',
    name: 'Contrat Premium',
    originalName: 'Contrat Premium.pdf',
    source: 'upload' as const,
    fileType: 'pdf',
    usageCount: 4,
    lastUsed: '2025-01-10T10:00:00Z',
    createdAt: '2025-01-01T09:00:00Z',
    isOwnDocument: true,
  },
];

describe('DocumentLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getIdTokenMock.mockResolvedValue('token-123');
    getDocumentLibraryMock.mockResolvedValue({
      documents: sampleDocuments,
      pagination: {
        current: 1,
        total: 1,
        count: 1,
        totalItems: 1,
      },
    });
  });

  it('loads documents and allows selection for reuse', async () => {
    const onDocumentSelect = vi.fn();
    getDocumentContentMock.mockResolvedValue({
      ...sampleDocuments[0],
      extractedText: 'Texte analysé',
    });

    const user = userEvent.setup();
    render(
      <DocumentLibrary
        onDocumentSelect={onDocumentSelect}
      />,
    );

    await waitFor(() => expect(getDocumentLibraryMock).toHaveBeenCalled());
    expect(await screen.findByText('Contrat Premium')).toBeInTheDocument();

    await user.click(screen.getByText('Contrat Premium'));

    await waitFor(() => expect(getDocumentContentMock).toHaveBeenCalledWith('token-123', 'doc-1'));
    expect(onDocumentSelect).toHaveBeenCalledWith({
      id: 'doc-1',
      name: 'Contrat Premium',
      text: 'Texte analysé',
    });
  });

  it('supports multi-selection mode', async () => {
    const onSelectionChange = vi.fn();

    const user = userEvent.setup();
    render(
      <DocumentLibrary
        selectionMode
        multiSelect
        onSelectionChange={onSelectionChange}
      />,
    );

    expect(await screen.findByText('Contrat Premium')).toBeInTheDocument();

    const selectionCheckbox = screen.getAllByRole('checkbox')[1];
    await user.click(selectionCheckbox);
    expect(onSelectionChange).toHaveBeenCalledWith(['doc-1']);

    await user.click(selectionCheckbox);
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });
});
