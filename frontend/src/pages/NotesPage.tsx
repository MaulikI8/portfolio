import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { Mail, Heart } from 'lucide-react';

export function NotesPage() {
  const { partner } = useAuth();
  const { data: initialNotes, loading, error, refetch } = useFetch<any[]>('/api/notes');
  const [notes, setNotes] = useState<any[]>([]);
  const [text, setText] = useState('');

  const currentNotes = notes.length > 0 ? notes : initialNotes || [];
  const partnerName = partner?.role === 'boyfriend' ? 'Seema' : 'Maulik';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      author: partner?.role || 'boyfriend',
      text: text.trim(),
      timestamp: 'Just now',
      seen_at: null,
    };

    setNotes([newNote, ...currentNotes]);
    setText('');
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--pink-primary)', fontSize: '1.75rem', marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        Love Notes <Mail size={24} color="var(--pink-primary)" />
      </h1>

      {/* Compose Row */}
      <form onSubmit={handleSubmit} className="card-surface" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder={`Leave a gentle note for ${partnerName}...`}
          className="input-field"
          style={{ height: '80px', resize: 'none', marginBottom: '0.75rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{500 - text.length} chars left</span>
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
            Leave a note
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div style={{ background: 'var(--pink-pale)', padding: '0.75rem', borderRadius: 'var(--radius-card)', marginBottom: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--pink-deep)' }}>Couldn’t load previous notes. </span>
          <button className="btn-quiet" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '90px' }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && currentNotes.length === 0 && (
        <div className="card-surface" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
          No notes yet — leave the first one. <Heart size={16} fill="var(--coral)" color="var(--coral)" />
        </div>
      )}

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {currentNotes.map((note) => {
          const isAuthor = note.author === partner?.role;
          const authorLabel = isAuthor ? 'You' : partnerName;

          return (
            <div
              key={note.id}
              className="card-surface"
              style={{
                borderLeft: `4px solid ${isAuthor ? 'var(--pink-primary)' : 'var(--magenta-accent)'}`,
                padding: '1.1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)' }}>{authorLabel}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{note.timestamp}</span>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{note.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

