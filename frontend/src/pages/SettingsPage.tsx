import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Image, Smartphone, LogOut, ArrowLeft } from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout, updateAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [turnReminders, setTurnReminders] = useState(true);
  const [streakRisk, setStreakRisk] = useState(true);
  const [thinkingPings, setThinkingPings] = useState(true);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("That photo's a bit large — try one under 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        updateAvatar(reader.result as string);
        alert('Profile picture updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ display: 'none' }}
      />

      {/* Compact Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button className="btn-quiet" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/profile')}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--pink-primary)', fontSize: '1.5rem' }}>Settings</h1>
      </div>

      {/* Account Section */}
      <div className="card-surface" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>Account</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => alert('Change PIN modal')}>
            <Lock size={18} /> Change PIN
          </button>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => fileInputRef.current?.click()}>
            <Image size={18} /> Change Profile Picture
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card-surface" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>Notifications</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>Turn reminders</span>
            <input type="checkbox" checked={turnReminders} onChange={(e) => setTurnReminders(e.target.checked)} />
          </label>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>Streak risk alerts</span>
            <input type="checkbox" checked={streakRisk} onChange={(e) => setStreakRisk(e.target.checked)} />
          </label>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>Thinking of you pings</span>
            <input type="checkbox" checked={thinkingPings} onChange={(e) => setThinkingPings(e.target.checked)} />
          </label>
        </div>
      </div>

      {/* About Section */}
      <div className="card-surface" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>About</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => alert('Tap Share -> Add to Home Screen in browser menu')}>
            <Smartphone size={18} /> Add to Home Screen
          </button>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--pink-deep)', borderColor: 'var(--pink-soft)', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={handleLogout}>
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

