import { describe, it, expect } from 'vitest';
import { parseAppleMusicXml, parseArtistText } from './libraryParser';

function buildPlist(tracks: Record<string, string>[]): string {
  const trackEntries = tracks
    .map(
      (track, i) => `
      <key>${i}</key>
      <dict>
        ${Object.entries(track)
          .map(([k, v]) => `<key>${k}</key><string>${v}</string>`)
          .join('\n        ')}
      </dict>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Tracks</key>
  <dict>${trackEntries}
  </dict>
</dict>
</plist>`;
}

describe('parseAppleMusicXml', () => {
  it('extracts unique artists and albums', () => {
    const xml = buildPlist([
      { Artist: 'Radiohead', Album: 'OK Computer' },
      { Artist: 'Radiohead', Album: 'Kid A' },
      { Artist: 'Portishead', Album: 'Dummy' },
    ]);

    const result = parseAppleMusicXml(xml);

    expect(result.artists).toEqual(['Portishead', 'Radiohead']);
    expect(result.albums).toContain('OK Computer');
    expect(result.albums).toContain('Kid A');
    expect(result.albums).toContain('Dummy');
    expect(result.trackCount).toBe(3);
  });

  it('deduplicates artists across multiple tracks', () => {
    const xml = buildPlist([
      { Artist: 'Massive Attack', Album: 'Blue Lines' },
      { Artist: 'Massive Attack', Album: 'Blue Lines' },
      { Artist: 'Massive Attack', Album: 'Mezzanine' },
    ]);

    const result = parseAppleMusicXml(xml);

    expect(result.artists).toHaveLength(1);
    expect(result.albums).toHaveLength(2);
  });

  it('skips podcast tracks', () => {
    const xml = buildPlist([
      { Artist: 'Radiohead', Album: 'OK Computer', Kind: 'MPEG audio file' },
      { Artist: 'Some Podcast', Album: 'Episode 1', Kind: 'podcast audio file' },
    ]);

    const result = parseAppleMusicXml(xml);

    expect(result.artists).not.toContain('Some Podcast');
    expect(result.artists).toContain('Radiohead');
  });

  it('skips video tracks', () => {
    const xml = buildPlist([
      { Artist: 'Björk', Album: 'Homogenic', Kind: 'MPEG audio file' },
      { Artist: 'Björk', Album: 'Music Video', Kind: 'QuickTime video file' },
    ]);

    const result = parseAppleMusicXml(xml);

    expect(result.albums).not.toContain('Music Video');
    expect(result.albums).toContain('Homogenic');
  });

  it('returns sorted artists and albums', () => {
    const xml = buildPlist([
      { Artist: 'Zzz Artist', Album: 'Zzz Album' },
      { Artist: 'Aaa Artist', Album: 'Aaa Album' },
    ]);

    const result = parseAppleMusicXml(xml);

    expect(result.artists[0]).toBe('Aaa Artist');
    expect(result.albums[0]).toBe('Aaa Album');
  });

  it('throws on invalid XML', () => {
    expect(() => parseAppleMusicXml('<not valid xml <')).toThrow();
  });

  it('throws when Tracks dict is missing', () => {
    const xml = `<?xml version="1.0"?><plist version="1.0"><dict><key>Other</key><string>data</string></dict></plist>`;
    expect(() => parseAppleMusicXml(xml)).toThrow('Could not find Tracks dictionary');
  });
});

describe('parseArtistText', () => {
  it('parses a simple list of artists', () => {
    const result = parseArtistText('Radiohead\nPortishead\nMassive Attack');
    expect(result.artists).toEqual(['Massive Attack', 'Portishead', 'Radiohead']);
    expect(result.trackCount).toBe(3);
  });

  it('parses Artist — Album format and extracts both', () => {
    const result = parseArtistText('Radiohead — OK Computer\nPortishead — Dummy');
    expect(result.artists).toContain('Radiohead');
    expect(result.artists).toContain('Portishead');
    expect(result.albums).toContain('OK Computer');
    expect(result.albums).toContain('Dummy');
  });

  it('parses Artist -- Album (double hyphen) format', () => {
    const result = parseArtistText('Burial -- Untrue');
    expect(result.artists).toContain('Burial');
    expect(result.albums).toContain('Untrue');
  });

  it('ignores empty lines and comment lines', () => {
    const result = parseArtistText('Radiohead\n\n# a comment\nPortishead');
    expect(result.artists).toHaveLength(2);
    expect(result.trackCount).toBe(2);
  });

  it('deduplicates artists', () => {
    const result = parseArtistText('Radiohead\nRadiohead\nPortishead');
    expect(result.artists).toHaveLength(2);
  });

  it('returns sorted artists and albums', () => {
    const result = parseArtistText('Zzz\nAaa');
    expect(result.artists[0]).toBe('Aaa');
  });
});
