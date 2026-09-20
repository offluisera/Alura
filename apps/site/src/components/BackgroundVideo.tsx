import React, { useEffect, useRef } from 'react';

export const BackgroundVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const SENSITIVITY = 0.6;

    const handleLoadedMetadata = () => {
      targetTimeRef.current = video.currentTime;
    };
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    const applySeek = () => {
      if (!video || !video.duration || Number.isNaN(video.duration)) return;
      if (isSeekingRef.current) return;
      const diff = Math.abs(video.currentTime - targetTimeRef.current);
      if (diff > 0.01) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    const handleSeeked = () => {
      isSeekingRef.current = false;
      applySeek();
    };
    video.addEventListener('seeked', handleSeeked);

    const handleMouseMove = (e: MouseEvent) => {
      if (!video || !video.duration || Number.isNaN(video.duration)) return;
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }
      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;
      const timeOffset =
        (delta / window.innerWidth) * SENSITIVITY * video.duration;
      let nextTarget = targetTimeRef.current + timeOffset;
      if (nextTarget < 0) nextTarget = 0;
      if (nextTarget > video.duration) nextTarget = video.duration;
      targetTimeRef.current = nextTarget;
      applySeek();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  return (
    <>
      {/* Wrapper with dark background */}
      <div
        className="fixed inset-0 overflow-hidden z-0 pointer-events-none select-none bg-[var(--color-bg)]"
        aria-hidden="true"
      >
        <video
          ref={videoRef}
          src="/video/background.mp4"
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover translate-x-0 md:translate-x-[26%] scale-[0.92] origin-center"
        />
        {/* Soft edge blend on the left so hero text has clean contrast */}
        <div className="hidden md:block absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent pointer-events-none" />
      </div>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/80 pointer-events-none z-0"
        aria-hidden="true"
      />
    </>
  );
};
