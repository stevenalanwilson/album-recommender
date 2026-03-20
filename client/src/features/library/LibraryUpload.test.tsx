import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LibraryUpload } from './LibraryUpload';

vi.mock('../../services/libraryParser', () => ({
  parseAppleMusicXml: vi.fn().mockReturnValue({
    artists: ['Radiohead'],
    albums: ['OK Computer'],
    trackCount: 10,
  }),
  parseArtistText: vi.fn().mockReturnValue({
    artists: ['Radiohead', 'Portishead'],
    albums: [],
    trackCount: 2,
  }),
}));

describe('LibraryUpload', () => {
  it('renders the upload tab drop zone by default', () => {
    render(<LibraryUpload libraryData={null} onLibraryParsed={vi.fn()} />);
    expect(screen.getByText(/Drop your Library\.xml/)).toBeInTheDocument();
  });

  it('renders library stats when library is loaded', () => {
    const libraryData = {
      artists: ['Radiohead'],
      albums: ['OK Computer', 'Kid A'],
      trackCount: 50,
    };
    render(<LibraryUpload libraryData={libraryData} onLibraryParsed={vi.fn()} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onLibraryParsed with null when clear is clicked', () => {
    const libraryData = { artists: ['Radiohead'], albums: ['OK Computer'], trackCount: 10 };
    const onParsed = vi.fn();
    render(<LibraryUpload libraryData={libraryData} onLibraryParsed={onParsed} />);
    fireEvent.click(screen.getByText(/✕ clear/));
    expect(onParsed).toHaveBeenCalledWith(null);
  });

  it('shows an error for non-xml files', async () => {
    render(<LibraryUpload libraryData={null} onLibraryParsed={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'library.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Please select an \.xml file/)).toBeInTheDocument();
  });

  it('switches to the paste tab when clicked', () => {
    render(<LibraryUpload libraryData={null} onLibraryParsed={vi.fn()} />);
    fireEvent.click(screen.getByText('Paste artists'));
    expect(screen.getByPlaceholderText(/Massive Attack/)).toBeInTheDocument();
  });

  it('shows an error when paste tab is submitted with no text', () => {
    render(<LibraryUpload libraryData={null} onLibraryParsed={vi.fn()} />);
    fireEvent.click(screen.getByText('Paste artists'));
    fireEvent.click(screen.getByText('Use this library'));
    expect(screen.getByText(/Please enter at least one artist name/)).toBeInTheDocument();
  });

  it('loads the example library when the preset link is clicked', () => {
    render(<LibraryUpload libraryData={null} onLibraryParsed={vi.fn()} />);
    fireEvent.click(screen.getByText('Paste artists'));
    fireEvent.click(screen.getByText('Load example library'));
    const textarea = screen.getByPlaceholderText(/Massive Attack/) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Massive Attack');
  });
});
