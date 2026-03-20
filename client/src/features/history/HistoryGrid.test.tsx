import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoryGrid } from './HistoryGrid';
import { HistoryEntry } from '../../types/history';

const entries: HistoryEntry[] = [
  {
    recommendation: { artist: 'Burial', album: 'Untrue', year: '2007', reason: 'Great album.' },
    artworkResponse: { artworkUrl: null, year: '2007' },
  },
  {
    recommendation: { artist: 'Four Tet', album: 'There Is Love In You', year: '2010', reason: 'Lovely.' },
    artworkResponse: { artworkUrl: 'https://example.com/art.jpg', year: '2010' },
  },
];

describe('HistoryGrid', () => {
  it('renders all history entries', () => {
    render(<HistoryGrid history={entries} />);
    expect(screen.getByText('Untrue')).toBeInTheDocument();
    expect(screen.getByText('There Is Love In You')).toBeInTheDocument();
  });

  it('renders artist names', () => {
    render(<HistoryGrid history={entries} />);
    expect(screen.getByText('Burial')).toBeInTheDocument();
    expect(screen.getByText('Four Tet')).toBeInTheDocument();
  });

  it('renders artwork when artworkUrl is provided', () => {
    render(<HistoryGrid history={entries} />);
    const img = screen.getByAltText('There Is Love In You') as HTMLImageElement;
    expect(img.src).toBe('https://example.com/art.jpg');
  });
});
