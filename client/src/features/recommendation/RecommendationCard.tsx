import React, { useState } from 'react';
import { RecommendationResponse, ArtworkResponse } from '@shared/types';
import {
  getProxiedArtworkUrl,
  buildAppleMusicSearchUrl,
  buildSpotifySearchUrl,
} from '../../services/apiClient';

interface RecommendationCardProps {
  recommendation: RecommendationResponse | null;
  artworkResponse: ArtworkResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function RecommendationCard({
  recommendation,
  artworkResponse,
  isLoading,
  error,
}: RecommendationCardProps): React.ReactElement {
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: 48,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            border: '2px solid var(--border2)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
          }}
        />
        <div
          style={{
            fontSize: 12,
            color: 'var(--muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Finding your next favourite…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '48px 28px',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 36,
            color: 'var(--danger)',
            marginBottom: 12,
          }}
        >
          !
        </div>
        <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '48px 28px',
          textAlign: 'center',
          color: 'var(--muted)',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 36,
            color: 'var(--accent)',
            marginBottom: 12,
          }}
        >
          ♪
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6 }}>
          Your next favourite album is waiting.
          <br />
          Set your preferences and hit the button.
        </p>
      </div>
    );
  }

  const [imgErrored, setImgErrored] = useState(false);

  const year = recommendation.year || artworkResponse?.year || '—';
  const appleMusicUrl =
    artworkResponse?.appleMusicUrl ??
    buildAppleMusicSearchUrl(recommendation.artist, recommendation.album);
  const appleMusicLabel = artworkResponse?.appleMusicUrl
    ? 'Open in Apple Music'
    : 'Search in Apple Music';
  const spotifyUrl = buildSpotifySearchUrl(recommendation.artist, recommendation.album);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        animation: 'fadeUp 0.4s ease both',
        marginBottom: 48,
      }}
    >
      <div className="recommendation-card-content" style={{ display: 'flex', gap: 24 }}>
        <div
          className="recommendation-card-artwork"
          style={{
            borderRadius: 8,
            overflow: 'hidden',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
          }}
        >
          {artworkResponse?.artworkUrl && !imgErrored ? (
            <img
              src={getProxiedArtworkUrl(artworkResponse.artworkUrl)}
              alt={`${recommendation.album} album artwork`}
              loading="lazy"
              onError={() => setImgErrored(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--muted)',
                fontSize: 40,
                fontFamily: 'var(--serif)',
              }}
            >
              ♪
            </div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 26,
              fontWeight: 400,
              lineHeight: 1.2,
              marginBottom: 8,
            }}
          >
            {recommendation.album}
          </div>
          <div
            style={{
              fontSize: 14,
              color: 'var(--accent)',
              marginBottom: 6,
              letterSpacing: '0.02em',
            }}
          >
            {recommendation.artist}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--muted)',
              marginBottom: 20,
              letterSpacing: '0.06em',
            }}
          >
            {year}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a
              href={appleMusicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="service-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--muted)',
                textDecoration: 'none',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '6px 12px',
                width: 'fit-content',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="5" cy="5" r="3.5" />
                <line x1="8" y1="8" x2="11" y2="11" />
              </svg>
              {appleMusicLabel}
            </a>
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="service-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--muted)',
                textDecoration: 'none',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '6px 12px',
                width: 'fit-content',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="6" cy="6" r="5" />
                <path
                  d="M3.5 4.5c1.5-.5 3.5-.5 5 .5M3 6.5c1.3-.4 3.2-.4 4.5.5M3.5 8.5c1-.3 2.5-.3 3.5.3"
                  strokeLinecap="round"
                />
              </svg>
              Search in Spotify
            </a>
          </div>
        </div>
      </div>
      <div
        className="recommendation-card-reason"
        style={{
          borderTop: '1px solid var(--border)',
          fontSize: 15,
          color: 'var(--muted)',
          lineHeight: 1.7,
          fontStyle: 'italic',
          fontFamily: 'var(--serif)',
        }}
      >
        {recommendation.reason}
      </div>
    </div>
  );
}
