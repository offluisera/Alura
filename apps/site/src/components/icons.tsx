import React from 'react';

interface IconProps extends React.SVGAttributes<SVGElement> {
  size?: number;
}

const defaults: React.SVGAttributes<SVGElement> = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const icon = (paths: React.ReactNode, displayName: string) => {
  const Component: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} {...defaults} {...props}>
      {paths}
    </svg>
  );
  Component.displayName = displayName;
  return Component;
};

/* ——————————————————————————————————————————————————————————— */

export const IconHome = icon(
  <>
    <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V10.5z" />
  </>,
  'IconHome'
);

export const IconFriends = icon(
  <>
    <circle cx="9" cy="7" r="3" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <circle cx="18" cy="8" r="2.5" />
    <path d="M21 21v-1.5a3 3 0 0 0-2.5-2.96" />
  </>,
  'IconFriends'
);

export const IconProfile = icon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
  </>,
  'IconProfile'
);

export const IconUserAdd = icon(
  <>
    <circle cx="10" cy="8" r="4" />
    <path d="M4 21v-1a6 6 0 0 1 6-6h1" />
    <line x1="19" y1="14" x2="19" y2="20" />
    <line x1="16" y1="17" x2="22" y2="17" />
  </>,
  'IconUserAdd'
);

export const IconMessage = icon(
  <>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
  </>,
  'IconMessage'
);

export const IconServers = icon(
  <>
    <rect x="2" y="3" width="20" height="7" rx="1.5" />
    <rect x="2" y="14" width="20" height="7" rx="1.5" />
    <circle cx="6" cy="6.5" r="1" />
    <circle cx="6" cy="17.5" r="1" />
  </>,
  'IconServers'
);

export const IconSettings = icon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
  </>,
  'IconSettings'
);

export const IconSearch = icon(
  <>
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </>,
  'IconSearch'
);

export const IconBell = icon(
  <>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </>,
  'IconBell'
);

export const IconLogout = icon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>,
  'IconLogout'
);

export const IconChevronDown = icon(
  <>
    <polyline points="6 9 12 15 18 9" />
  </>,
  'IconChevronDown'
);

export const IconHeart = icon(
  <>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </>,
  'IconHeart'
);

export const IconComment = icon(
  <>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </>,
  'IconComment'
);

export const IconShare = icon(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>,
  'IconShare'
);

export const IconImage = icon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </>,
  'IconImage'
);

export const IconAttachment = icon(
  <>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </>,
  'IconAttachment'
);

export const IconEmoji = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </>,
  'IconEmoji'
);

export const IconSend = icon(
  <>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </>,
  'IconSend'
);

/* Social icons for footer */
export const IconGitHub = icon(
  <>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </>,
  'IconGitHub'
);

export const IconYouTube = icon(
  <>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </>,
  'IconYouTube'
);

export const IconTwitch = icon(
  <>
    <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
  </>,
  'IconTwitch'
);

export const IconDiscord = icon(
  <>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    <ellipse cx="8.5" cy="13.5" rx="1.8" ry="2" />
    <ellipse cx="15.5" cy="13.5" rx="1.8" ry="2" />
  </>,
  'IconDiscord'
);

/* Ícone oficial da Alura em SVG */
export const IconAlura: React.FC<IconProps> = ({
  size = 24,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <defs>
      <linearGradient id="alura-icon-left" x1="15%" y1="85%" x2="65%" y2="15%">
        <stop offset="0%" stopColor="#00DFA0" />
        <stop offset="40%" stopColor="#39FF88" />
        <stop offset="100%" stopColor="#7EFFBD" />
      </linearGradient>
      <linearGradient id="alura-icon-right" x1="35%" y1="15%" x2="85%" y2="85%">
        <stop offset="0%" stopColor="#00DFA0" />
        <stop offset="45%" stopColor="#00B377" />
        <stop offset="100%" stopColor="#004B1F" />
      </linearGradient>
      <linearGradient id="alura-icon-arch" x1="50%" y1="45%" x2="50%" y2="90%">
        <stop offset="0%" stopColor="#007A40" />
        <stop offset="45%" stopColor="#003516" />
        <stop offset="100%" stopColor="#001609" />
      </linearGradient>
      <linearGradient id="alura-icon-crest" x1="20%" y1="70%" x2="80%" y2="70%">
        <stop offset="0%" stopColor="#00DFA0" stopOpacity="0.15" />
        <stop offset="50%" stopColor="#39FF88" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#00DFA0" stopOpacity="0.15" />
      </linearGradient>
      <filter id="alura-icon-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodColor="#001B0B" floodOpacity="0.6" />
      </filter>
    </defs>
    <path
      d="M 26,73 C 34,60 41,53 50,53 C 59,53 66,60 74,73 C 66,64 58,59 50,59 C 42,59 34,64 26,73 Z"
      fill="url(#alura-icon-arch)"
    />
    <path
      d="M 28,73 C 35,61 42,54 50,54 C 58,54 65,61 72,73 C 65,65 57,60 50,60 C 43,60 35,65 28,73 Z"
      fill="url(#alura-icon-crest)"
    />
    <path
      d="M 50,14 C 55,14 59,18 61,22 L 83,67 C 87,75 80,83 73,81 C 69,80 66,77 64,72 L 51,44 C 50,42 49,32 50,14 Z"
      fill="url(#alura-icon-right)"
    />
    <path
      d="M 50,14 C 44,14 40,18 38,22 L 17,67 C 13,75 20,83 27,81 C 31,80 34,77 36,72 L 49,44 C 51,40 52,30 55,22 C 54,16 52,14 50,14 Z"
      fill="url(#alura-icon-left)"
      filter="url(#alura-icon-shadow)"
    />
  </svg>
);
