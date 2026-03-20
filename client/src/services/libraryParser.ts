import { LibraryData } from '@shared/types';

const SKIP_KINDS = ['podcast', 'video', 'Audiobook'];

function shouldSkipTrack(kind: string | null): boolean {
  if (!kind) return false;
  return SKIP_KINDS.some((skip) => kind.includes(skip));
}

function extractTrackField(
  keyElements: HTMLCollectionOf<Element>,
  fieldName: string,
): string | null {
  const keyArray = Array.from(keyElements);
  for (const keyEl of keyArray) {
    if (keyEl.textContent === fieldName) {
      const valueEl = keyEl.nextElementSibling;
      return valueEl ? (valueEl.textContent?.trim() ?? null) : null;
    }
  }
  return null;
}

function findTracksDict(rootDict: Element): Element {
  const children = rootDict.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].tagName === 'key' && children[i].textContent === 'Tracks') {
      return children[i + 1];
    }
  }
  throw new Error('Could not find Tracks dictionary in XML');
}

/**
 * Parses a plain-text artist list into a LibraryData object.
 * Each line may be "Artist" or "Artist — Album" (em-dash or double-hyphen).
 * Empty lines and lines starting with # are ignored.
 */
export function parseArtistText(text: string): LibraryData {
  const artists = new Set<string>();
  const albums = new Set<string>();
  let lineCount = 0;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Support both em-dash (—) and " -- " as separators
    const separatorMatch = line.match(/^(.+?)\s*(?:—|--)\s*(.+)$/);
    if (separatorMatch) {
      const artist = separatorMatch[1].trim();
      const album = separatorMatch[2].trim();
      if (artist) artists.add(artist);
      if (album) albums.add(album);
    } else {
      artists.add(line);
    }
    lineCount++;
  }

  return {
    artists: [...artists].sort(),
    albums: [...albums].sort(),
    trackCount: lineCount,
  };
}

export function parseAppleMusicXml(xmlText: string): LibraryData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('Invalid XML file');

  const rootDict = doc.querySelector('plist > dict');
  if (!rootDict) throw new Error('Not a valid Apple Music plist');

  const tracksDict = findTracksDict(rootDict);
  const trackDicts = tracksDict.querySelectorAll(':scope > dict');

  const artists = new Set<string>();
  const albums = new Set<string>();

  trackDicts.forEach((trackDict) => {
    const keys = trackDict.getElementsByTagName('key');
    const artist = extractTrackField(keys, 'Artist');
    const album = extractTrackField(keys, 'Album');
    const kind = extractTrackField(keys, 'Kind');

    if (shouldSkipTrack(kind)) return;

    if (artist) artists.add(artist);
    if (album) albums.add(album);
  });

  return {
    artists: [...artists].sort(),
    albums: [...albums].sort(),
    trackCount: trackDicts.length,
  };
}
