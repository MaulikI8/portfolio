import React from 'react';

export interface IconProps { size?: number | string; color?: string; className?: string; style?: React.CSSProperties; }

export function CandleIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 2a2.5 2.5 0 0 0-2.5 2.5c0 1.5 2.5 4.5 2.5 4.5s2.5-3 2.5-4.5A2.5 2.5 0 0 0 12 2z" fill={color} opacity="0.8" />
      <rect x="9" y="9" width="6" height="13" rx="1.5" stroke={color} fill="none" /><line x1="12" y1="9" x2="12" y2="7" />
    </svg>
  );
}

export function HeartIcon({ size = 20, color = 'currentColor', className = '', fill, style }: IconProps & { fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function FlameIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-2.5-3.5-5.5-3.5-5.5s-1.5 1.5-1.5 3z" fill={color} />
      <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.53 2.04-6.71 5-8.25 0 2.75 2.25 5 5 5s5-2.25 5-5c2.96 1.54 5 4.72 5 8.25 0 4.97-4.03 9-9 9z" />
    </svg>
  );
}

export function GamepadIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><circle cx="15" cy="11" r="1" fill={color} /><circle cx="18" cy="13" r="1" fill={color} /><rect x="2" y="6" width="20" height="12" rx="5" />
    </svg>
  );
}

export function MailIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function ChatIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function SparklesIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

export function CrossIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function CircleIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function DiscIcon({ size = 20, color = 'currentColor', className = '', fill, style }: IconProps & { fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke={color} strokeWidth="2" className={className} style={style}>
      <circle cx="12" cy="12" r="10" fill={fill || color} />
    </svg>
  );
}

export function DownArrowIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

export function RockIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="7" fill={color} opacity="0.3" /><path d="M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
    </svg>
  );
}

export function PaperIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="5" y="4" width="14" height="16" rx="2" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

export function ScissorsIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="8.12" y1="8.12" x2="12" y2="12" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.7" y1="14.7" x2="20" y2="20" />
    </svg>
  );
}

export function ShipIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M2 20l2-8h16l2 8H2z" /><path d="M12 4v8" /><path d="M12 4l6 4h-6" fill={color} opacity="0.3" />
    </svg>
  );
}

export function ExplosionIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 2l2.5 5 5.5 1-4 4 1 5.5-5-2.5-5 2.5 1-5.5-4-4 5.5-1z" fill={color} opacity="0.6" />
    </svg>
  );
}

export function WaveIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M2 12c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2" /><path d="M2 17c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2" />
    </svg>
  );
}

export function BrainIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 5a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0-3 3c0 .8.3 1.5.8 2a3 3 0 0 0-.8 2 3 3 0 0 0 3 3 3 3 0 0 0 3-3V5z" />
      <path d="M12 5a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1 3 3c0 .8-.3 1.5-.8 2a3 3 0 0 1 .8 2 3 3 0 0 1-3 3 3 3 0 0 1-3-3V5z" />
    </svg>
  );
}

export function QuestionIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function CoinIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v10M9 9.5a2.5 2.5 0 0 1 5 0c0 3-5 2-5 5a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export function CrownIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill={color} opacity="0.3" />
    </svg>
  );
}

export function FlowerIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="3" fill={color} />
      <path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3zM5 12a3 3 0 0 0 3-3 3 3 0 0 0 3 3 3 3 0 0 0-3 3 3 3 0 0 0-3-3zM12 19a3 3 0 0 0 3-3 3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3zM19 12a3 3 0 0 0-3 3 3 3 0 0 0-3-3 3 3 0 0 0 3-3 3 3 0 0 0 3 3z" />
    </svg>
  );
}

export function LightningIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} opacity="0.8" />
    </svg>
  );
}

export function GridIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function GlobeIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function RefreshIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

export function LaughIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
    </svg>
  );
}

export function ClapIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9" /><path d="M6 14v-2a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5a9 9 0 0 0 18 0v-3" />
    </svg>
  );
}

export function SendIcon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

