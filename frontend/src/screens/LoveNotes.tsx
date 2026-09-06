import { useState, useEffect } from 'react';
import { socialAPI } from '../api/client';
import { Navbar } from '../components/Navbar';
import { FlameIcon, MailIcon, SparklesIcon, HeartIcon, CandleIcon, LightningIcon } from '../components/Icons';
import type { LoveNote, Streak } from '../api/types';
import './LoveNotes.css';

export function LoveNotes() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [notes, setNotes] = useState<LoveNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('heart');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [streakRes, notesData] = await Promise.all([
        socialAPI.getStreak(),
        socialAPI.getNotes(),
      ]);
      setStreak(streakRes.data);
      setNotes(notesData);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await socialAPI.sendNote(newNoteContent.trim());
      setNewNoteContent('');
      await fetchData();
    } catch (err) {
      console.error('Failed to send note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMoodIcon = (m: string, size = 20) => {
    switch (m) {
      case 'heart': return <HeartIcon size={size} color="var(--muted-rose)" fill="var(--muted-rose)" />;
      case 'candle': return <CandleIcon size={size} color="var(--candlelight-amber)" />;
      case 'flame': return <FlameIcon size={size} color="var(--candlelight-amber)" />;
      case 'sparkles': return <SparklesIcon size={size} color="var(--candlelight-amber)" />;
      case 'lightning': return <LightningIcon size={size} color="#E8A94C" />;
      default: return <HeartIcon size={size} color="var(--muted-rose)" fill="var(--muted-rose)" />;
    }
  };

  const todayNote = notes.length > 0 ? notes[0] : null;

  return (
    <div className="notes-container">
      <header className="notes-header">
        <h1 className="notes-title">Love Notes & Streaks</h1>
        {streak && (
          <div className="streak-badge">
            <FlameIcon size={20} color="var(--candlelight-amber)" className="streak-badge__flame" />
            <span className="streak-badge__count">{streak.current_streak} Day Streak!</span>
          </div>
        )}
      </header>

      <main className="notes-content">
        {/* Today's Secret Note Card */}
        {todayNote && (
          <section className="today-note-card">
            <div className="today-note-card__badge">
              <MailIcon size={16} color="var(--candlelight-amber)" style={{ marginRight: 6 }} />
              Today's Daily Note
            </div>
            <div
              className={`note-reveal-box ${isRevealed ? 'note-reveal-box--revealed' : ''}`}
              onClick={() => setIsRevealed(true)}
            >
              {isRevealed ? (
                <div className="note-text">
                  <p>"{todayNote.content}"</p>
                  <small>Sent by {todayNote.sender_name} • {todayNote.created_at}</small>
                </div>
              ) : (
                <div className="note-hidden-prompt">
                  <SparklesIcon size={32} color="var(--candlelight-amber)" className="sparkle-icon" />
                  <p>Tap to reveal today's secret love note</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Send New Note Form */}
        <section className="send-note-section">
          <h2 className="section-title">Leave a Note for Your Partner</h2>
          <form onSubmit={handleSendNote} className="note-form">
            <div className="mood-picker">
              {['heart', 'candle', 'flame', 'sparkles', 'lightning'].map((m) => (
                <button
                  type="button"
                  key={m}
                  className={`mood-btn ${selectedMood === m ? 'mood-btn--selected' : ''}`}
                  onClick={() => setSelectedMood(m)}
                >
                  {renderMoodIcon(m, 22)}
                </button>
              ))}
            </div>

            <textarea
              className="note-textarea"
              placeholder="Write a sweet message, an inside joke, or how much you miss them..."
              rows={3}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
            />

            <button
              type="submit"
              className="btn btn--primary send-note-btn"
              disabled={isSubmitting || !newNoteContent.trim()}
            >
              <MailIcon size={18} color="var(--plum-900)" style={{ marginRight: 6 }} />
              {isSubmitting ? 'Sending Note...' : 'Drop Love Note'}
            </button>
          </form>
        </section>

        {/* Note Capsule History */}
        <section className="notes-history-section">
          <h2 className="section-title">Memory Capsule ({notes.length} Notes)</h2>
          <div className="notes-list">
            {notes.map((note) => (
              <div key={note.id} className="note-item">
                <div className="note-item__header">
                  <strong>{note.sender_name}</strong>
                  <span className="note-item__date">{note.created_at}</span>
                </div>
                <p className="note-item__body">{note.content}</p>
                {note.is_seen && <span className="seen-check">Read</span>}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Navbar />
    </div>
  );
}
