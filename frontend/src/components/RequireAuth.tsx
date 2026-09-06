import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    const maulikAvatar = localStorage.getItem('icecream_avatar_boyfriend');
    const seemaAvatar = localStorage.getItem('icecream_avatar_girlfriend');

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-dark, #120A16)',
          color: 'var(--ink-deep, #FBF3E7)',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <style>{`
          @keyframes avatarPulseGlow {
            0% { transform: scale(0.96); box-shadow: 0 0 0 0 rgba(232, 86, 125, 0.4); }
            50% { transform: scale(1.04); box-shadow: 0 0 25px 8px rgba(232, 86, 125, 0.6); }
            100% { transform: scale(0.96); box-shadow: 0 0 0 0 rgba(232, 86, 125, 0.4); }
          }
          @keyframes heartBeat {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.25); }
            50% { transform: scale(1); }
            75% { transform: scale(1.15); }
          }
        `}</style>

        {/* Dual Avatars Display with Glowing Rings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Maulik Avatar */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8567D 0%, #C43F63 100%)',
              padding: '3px',
              animation: 'avatarPulseGlow 2.5s ease-in-out infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#291A2E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.4rem',
              }}
            >
              {maulikAvatar ? (
                <img src={maulikAvatar} alt="Maulik" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                'M'
              )}
            </div>
          </div>

          {/* Animated Glowing Heart */}
          <div style={{ animation: 'heartBeat 1.4s ease-in-out infinite', fontSize: '1.6rem' }}>
            💖
          </div>

          {/* Seema Avatar */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B 0%, #E8567D 100%)',
              padding: '3px',
              animation: 'avatarPulseGlow 2.5s ease-in-out 0.5s infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#291A2E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.4rem',
              }}
            >
              {seemaAvatar ? (
                <img src={seemaAvatar} alt="Seema" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                'S'
              )}
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--ink-deep, #FBF3E7)', letterSpacing: '0.02em' }}>
          Opening our sanctuary...
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--strawberry-500, #E8567D)', marginTop: '0.35rem', fontWeight: 600 }}>
          Maulik & Seema
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
