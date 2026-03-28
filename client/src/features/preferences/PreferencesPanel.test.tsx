import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesPanel } from './PreferencesPanel';
import { DEFAULT_PREFERENCES } from '../../hooks/useRecommendation';

const defaultPreferences = DEFAULT_PREFERENCES;

describe('PreferencesPanel', () => {
  it('renders all genre pills', () => {
    render(<PreferencesPanel preferences={defaultPreferences} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Electronic genre' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post-punk genre' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ambient genre' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Classical genre' })).toBeInTheDocument();
  });

  it('renders all mood pills', () => {
    render(<PreferencesPanel preferences={defaultPreferences} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Late night mood' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Melancholic mood' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'High energy mood' })).toBeInTheDocument();
  });

  it('renders tempo, energy, and density sliders', () => {
    render(<PreferencesPanel preferences={defaultPreferences} onChange={vi.fn()} />);
    expect(screen.getByRole('slider', { name: 'tempo' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'energy' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'density' })).toBeInTheDocument();
  });

  it('renders era segment buttons', () => {
    render(<PreferencesPanel preferences={defaultPreferences} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Any' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pre-80s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '80s–90s' })).toBeInTheDocument();
  });

  it('renders discovery checkboxes', () => {
    render(<PreferencesPanel preferences={defaultPreferences} onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Allow well-known artists' })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Underground & lesser-known only' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Stick strictly to my preferences' }),
    ).toBeInTheDocument();
  });

  it('clicking a genre pill adds it to genres', async () => {
    const onChange = vi.fn();
    render(<PreferencesPanel preferences={defaultPreferences} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Jazz genre' }));

    expect(onChange).toHaveBeenCalledWith({ ...defaultPreferences, genres: ['Jazz'] });
  });

  it('clicking a selected genre pill removes it from genres', async () => {
    const onChange = vi.fn();
    const prefs = { ...defaultPreferences, genres: ['Jazz', 'Folk'] };
    render(<PreferencesPanel preferences={prefs} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Jazz genre' }));

    expect(onChange).toHaveBeenCalledWith({ ...prefs, genres: ['Folk'] });
  });

  it('clicking a mood pill adds it to moods', async () => {
    const onChange = vi.fn();
    render(<PreferencesPanel preferences={defaultPreferences} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Chill mood' }));

    expect(onChange).toHaveBeenCalledWith({ ...defaultPreferences, moods: ['Chill'] });
  });

  it('clicking a selected mood pill removes it from moods', async () => {
    const onChange = vi.fn();
    const prefs = { ...defaultPreferences, moods: ['Chill', 'Focus'] };
    render(<PreferencesPanel preferences={prefs} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Chill mood' }));

    expect(onChange).toHaveBeenCalledWith({ ...prefs, moods: ['Focus'] });
  });

  it('changing tempo slider calls onChange with updated tempo', () => {
    const onChange = vi.fn();
    render(<PreferencesPanel preferences={defaultPreferences} onChange={onChange} />);

    const slider = screen.getByRole('slider', { name: 'tempo' });
    fireEvent.change(slider, { target: { value: '8' } });

    expect(onChange).toHaveBeenCalledWith({ ...defaultPreferences, tempo: 8 });
  });

  it('clicking an era button calls onChange with correct era', async () => {
    const onChange = vi.fn();
    render(<PreferencesPanel preferences={defaultPreferences} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: '80s–90s' }));

    expect(onChange).toHaveBeenCalledWith({ ...defaultPreferences, era: '80s-90s' });
  });

  it('toggling includeFamiliarArtists checkbox calls onChange with flipped value', async () => {
    const onChange = vi.fn();
    render(<PreferencesPanel preferences={defaultPreferences} onChange={onChange} />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Allow well-known artists' }));

    expect(onChange).toHaveBeenCalledWith({
      ...defaultPreferences,
      includeFamiliarArtists: false,
    });
  });

  it('toggling prioritiseObscure checkbox calls onChange with flipped value', async () => {
    const onChange = vi.fn();
    render(<PreferencesPanel preferences={defaultPreferences} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Underground & lesser-known only' }),
    );

    expect(onChange).toHaveBeenCalledWith({ ...defaultPreferences, prioritiseObscure: true });
  });

  it('toggling stayFocused checkbox calls onChange with flipped value', async () => {
    const onChange = vi.fn();
    render(<PreferencesPanel preferences={defaultPreferences} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Stick strictly to my preferences' }),
    );

    expect(onChange).toHaveBeenCalledWith({ ...defaultPreferences, stayFocused: true });
  });

  it('selected genre pill has aria-pressed=true', () => {
    const prefs = { ...defaultPreferences, genres: ['Jazz'] };
    render(<PreferencesPanel preferences={prefs} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Jazz genre' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Folk genre' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
