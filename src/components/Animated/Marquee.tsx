import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  direction = 'left',
  speed = 35,
  pauseOnHover = true,
  className = '',
}) => {
  return (
    <div
      className={`group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] select-none ${className}`}
    >
      <div
        className={`flex shrink-0 justify-around [gap:var(--gap)] animate-marquee ${
          direction === 'right' ? '[animation-direction:reverse]' : ''
        } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`flex shrink-0 justify-around [gap:var(--gap)] animate-marquee ${
          direction === 'right' ? '[animation-direction:reverse]' : ''
        } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
};
