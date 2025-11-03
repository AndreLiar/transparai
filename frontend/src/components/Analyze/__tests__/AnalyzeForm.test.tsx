import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalyzeForm from '../AnalyzeForm';

const onSubmitMock = vi.fn();

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        source_label: 'Source',
        upload_option: 'Upload',
        ocr_option: 'OCR',
        text_input_label: 'Paste text',
        file_input_label: 'Upload file',
        analyzing_button: 'Analyzing…',
        submit_button: 'Analyze',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('AnalyzeForm', () => {
  beforeEach(() => {
    onSubmitMock.mockReset();
  });

  it('submits typed text when using upload mode', async () => {
    const user = userEvent.setup();
    render(
      <AnalyzeForm
        onSubmit={onSubmitMock}
        loading={false}
        ocrStatus=""
        quotaExceeded={false}
      />,
    );

    await user.type(screen.getByLabelText('Paste text'), 'Sample contract');
    await user.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith('Sample contract', 'upload', null);
    });
  });

  it('switches to OCR mode and submits selected file', async () => {
    const user = userEvent.setup();
    render(
      <AnalyzeForm
        onSubmit={onSubmitMock}
        loading={false}
        ocrStatus="Ready for OCR"
        quotaExceeded={false}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Source'), 'OCR');
    expect(screen.queryByLabelText('Paste text')).not.toBeInTheDocument();

    const fileField = await screen.findByLabelText('Upload file');
    const file = new File(['content'], 'cga.pdf', { type: 'application/pdf' });
    await user.upload(fileField, file);
    const submitButton = screen.getByRole('button', { name: 'Analyze' });
    await user.click(submitButton);
    fireEvent.submit(submitButton.closest('form')!);

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith('', 'ocr', file);
    });
    expect(screen.getByText('Ready for OCR')).toBeInTheDocument();
  });

  it('disables submit button when loading or quota exceeded', () => {
    const { rerender } = render(
      <AnalyzeForm
        onSubmit={onSubmitMock}
        loading
        ocrStatus=""
        quotaExceeded={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Analyzing…' })).toBeDisabled();

    rerender(
      <AnalyzeForm
        onSubmit={onSubmitMock}
        loading={false}
        ocrStatus=""
        quotaExceeded
      />,
    );

    expect(screen.getByRole('button', { name: 'Analyze' })).toBeDisabled();
  });
});
