import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LibraryUpload } from './LibraryUpload';

vi.mock('../../services/libraryParser', () => ({
  parseAppleMusicXml: vi.fn().mockReturnValue({
    artists: ['Radiohead'],
    albums: ['OK Computer'],
    trackCount: 10,
  }),
}));

describe('LibraryUpload', () => {
  it('renders the drop zone when no library is loaded', () => {
    render(<LibraryUpload libraryData={null} onLibraryParsed={vi.fn()} />);
    expect(screen.getByText(/Drop your Library\.xml/)).toBeInTheDocument();
  });

  it('renders library stats when library is loaded', () => {
    const libraryData = { artists: ['Radiohead'], albums: ['OK Computer', 'Kid A'], trackCount: 50 };
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
});
