import '../SinglePageApp.css';

export interface AvatarProps {
  name: string;
  avatar?: string | null;
  role?: 'boyfriend' | 'girlfriend' | string;
  haloColor?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
}

export function Avatar({
  name,
  avatar,
  haloColor,
  isOnline = false,
  size = 'md',
  showStatus = true,
}: AvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className={`avatar avatar--${size}`}>
      <div
        className="avatar__ring"
        style={haloColor ? { borderColor: haloColor } : undefined}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="avatar__img" />
        ) : (
          <div className="avatar__fallback">{initial}</div>
        )}
      </div>

      {showStatus && (
        <span
          className={`avatar__status ${isOnline ? 'avatar__status--online' : 'avatar__status--offline'}`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
