import { LibraryData } from '@shared/types';

const SKIP_KINDS = ['podcast', 'video', 'Audiobook'];

function shouldSkipTrack(kind: string | null): boolean {
  if (!kind) return false;
  return SKIP_KINDS.some((skip) => kind.includes(skip));
}

function extractTrackField(keyElements: HTMLCollectionOf<Element>, fieldName: string): string | null {
  const keyArray = Array.from(keyElements);
  for (const keyEl of keyArray) {
    if (keyEl.textContent === fieldName) {
      const valueEl = keyEl.nextElementSibling;
      return valueEl ? valueEl.textContent?.trim() ?? null : null;
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
