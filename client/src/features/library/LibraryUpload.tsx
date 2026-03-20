import React, { useRef, useState } from 'react';
import { LibraryData } from '@shared/types';
import { parseAppleMusicXml, parseArtistText } from '../../services/libraryParser';

interface LibraryUploadProps {
  libraryData: LibraryData | null;
  onLibraryParsed: (data: LibraryData | null) => void;
}

type ActiveTab = 'upload' | 'paste';

const PRESET_LIBRARY = `Massive Attack
Portishead
Burial
Goldie
Leftfield
Underworld
IDLES
Yard Act
Sleaford Mods
shame
The Smiths
Joy Division
Wild Beasts
David Bowie
Beck
Radiohead
Björk
Grimes
DJ Shadow
De La Soul
Freddie Gibbs
Madlib
Nujabes
Jurassic 5
Cut Chemist
Nils Frahm
Max Richter
Brian Eno
Ryuichi Sakamoto
Kraftwerk
Tangerine Dream
Orbital
Aphex Twin
The Unthanks
Spiro
Ye Vagabonds
Noisia
Black Sun Empire
Future Funk Squad
Four Tet
Bonobo
Flying Lotus
Kendrick Lamar
J Dilla
MF DOOM
Boards of Canada
Arca
Nicolas Jaar
Actress
Andy Stott
Tricky
Massive Attack
The xx
James Blake
Bon Iver
Sufjan Stevens
Nick Drake
Joni Mitchell
Leonard Cohen
Scott Walker
Talk Talk
Magazine
Wire
Gang of Four
Public Image Ltd
The Fall
Cabaret Voltaire
Throbbing Gristle
Can
Neu!
Faust
Cluster
Harmonia
Popol Vuh
Steve Reich
Philip Glass
Arvo Pärt
Harold Budd
Stars of the Lid
Godspeed You! Black Emperor
Mogwai
Explosions in the Sky
Sigur Rós
Tim Hecker
William Basinski
Leyland Kirby
Shackleton
Actress
Pole
Vladislav Delay
Mark Fell
Autechre
Squarepusher
µ-Ziq
Luke Vibert
Richard D. James
Plaid`.trim();

export function LibraryUpload({
  libraryData,
  onLibraryParsed,
}: LibraryUploadProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processFile(file: File): void {
    setParseError(null);

    if (!file.name.endsWith('.xml')) {
      setParseError('Please select an .xml file exported from Apple Music.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') return;

      try {
        const data = parseAppleMusicXml(content);
        if (data.trackCount === 0) {
          setParseError("No tracks found. Make sure it's an Apple Music library export.");
          return;
        }
        onLibraryParsed(data);
      } catch (err) {
        setParseError(
          err instanceof Error ? `Could not parse XML: ${err.message}` : 'Could not parse XML.',
        );
      }
    };
    reader.onerror = () => setParseError('Could not read the file. Please try again.');
    reader.readAsText(file, 'UTF-8');
  }

  function handleDrop(event: React.DragEvent): void {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDropZoneKeyDown(event: React.KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  }

  function handlePasteSubmit(): void {
    setParseError(null);
    const trimmed = pasteText.trim();
    if (!trimmed) {
      setParseError('Please enter at least one artist name.');
      return;
    }
    const data = parseArtistText(trimmed);
    if (data.artists.length === 0) {
      setParseError('No artist names found. Enter one per line.');
      return;
    }
    onLibraryParsed(data);
  }

  const tabStyle = (tab: ActiveTab): React.CSSProperties => ({
    flex: 1,
    padding: '6px 0',
    fontSize: 11,
    fontFamily: 'var(--mono)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    background: activeTab === tab ? 'var(--surface2)' : 'transparent',
    color: activeTab === tab ? 'var(--text)' : 'var(--muted)',
    border: 'none',
    borderBottom: activeTab === tab ? '1px solid var(--accent)' : '1px solid var(--border)',
    cursor: 'pointer',
  });

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 28,
        marginBottom: 40,
      }}
    >
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, marginBottom: 6 }}>
        Your Apple Music library
      </h2>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
        Upload your library XML for accurate recommendations. Export from Apple Music: File →
        Library → Export Library…
      </p>

      {parseError && (
        <div
          style={{
            background: 'rgba(224,90,90,0.08)',
            border: '1px solid rgba(224,90,90,0.25)',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 12,
            color: 'var(--danger)',
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          {parseError}
        </div>
      )}

      {libraryData ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: 'var(--surface2)',
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
            {libraryData.trackCount.toLocaleString()}
          </span>
          <span style={{ color: 'var(--muted)' }}>tracks</span>
          <span style={{ color: 'var(--border2)' }}>·</span>
          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
            {libraryData.artists.length.toLocaleString()}
          </span>
          <span style={{ color: 'var(--muted)' }}>artists</span>
          <span style={{ color: 'var(--border2)' }}>·</span>
          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
            {libraryData.albums.length.toLocaleString()}
          </span>
          <span style={{ color: 'var(--muted)' }}>albums</span>
          <button
            type="button"
            onClick={() => onLibraryParsed(null)}
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: 'var(--muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              padding: '2px 6px',
            }}
          >
            ✕ clear
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <button type="button" style={tabStyle('upload')} onClick={() => setActiveTab('upload')}>
              Upload XML
            </button>
            <button type="button" style={tabStyle('paste')} onClick={() => setActiveTab('paste')}>
              Paste artists
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div
              role="button"
              tabIndex={0}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={handleDropZoneKeyDown}
              style={{
                border: `1px dashed ${isDragOver ? 'var(--accent)' : 'var(--border2)'}`,
                borderRadius: 10,
                padding: '36px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragOver ? 'rgba(200,169,110,0.04)' : 'transparent',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 32,
                  color: 'var(--accent)',
                  marginBottom: 10,
                }}
              >
                ♫
              </div>
              <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
                Drop your Library.xml here, or click to browse
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                Export from Apple Music: File → Library → Export Library…
              </div>
            </div>
          ) : (
            <div>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={
                  'Massive Attack\nPortishead\nBurial\nAphex Twin — Selected Ambient Works\n…'
                }
                rows={8}
                style={{
                  width: '100%',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  color: 'var(--text)',
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  resize: 'vertical',
                  lineHeight: 1.6,
                  outline: 'none',
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setPasteText(PRESET_LIBRARY)}
                  style={{
                    fontSize: 11,
                    color: 'var(--accent2)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--mono)',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Load example library
                </button>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  One artist per line · Artist — Album optional
                </span>
              </div>
              <button
                type="button"
                onClick={handlePasteSubmit}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: 12,
                  letterSpacing: '0.04em',
                  borderRadius: 8,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border2)',
                  color: 'var(--text)',
                  fontFamily: 'var(--mono)',
                  cursor: 'pointer',
                }}
              >
                Use this library
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
