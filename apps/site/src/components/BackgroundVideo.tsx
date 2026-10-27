import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const BackgroundVideo: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isHome) return;

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
  }, [isHome]);

  return (
    <>
      {/* Wrapper de fundo com cor de base cinza azulado */}
      <div
        className="fixed inset-0 overflow-hidden z-0 pointer-events-none select-none bg-[var(--color-bg)]"
        aria-hidden="true"
      >
        {/* Vídeo do boneco 3D interativo exclusivo na página principal */}
        {isHome && (
          <>
            <video
              ref={videoRef}
              src="/video/background.mp4"
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover translate-x-0 md:translate-x-[26%] scale-[0.92] origin-center opacity-95"
            />
            {/* Soft edge blend na lateral esquerda para garantir legibilidade perfeita do hero */}
            <div className="hidden md:block absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent pointer-events-none" />
          </>
        )}

        {/* Gradientes atmosféricos sutis de cinza azulado profundo */}
        <div 
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-to-b from-[#161D26]/40 via-[#0E1520]/20 to-transparent blur-[140px] rounded-full pointer-events-none" 
        />
        <div 
          className="absolute top-[40%] -right-[15%] w-[600px] h-[600px] bg-[#0E1520]/30 blur-[130px] rounded-full pointer-events-none" 
        />
        <div 
          className="absolute bottom-[-10%] -left-[10%] w-[700px] h-[700px] bg-[#0A1017]/40 blur-[150px] rounded-full pointer-events-none" 
        />

        {/* Grid de profundidade */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" 
        />
      </div>

      {/* Overlay escuro de contraste */}
      <div
        className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/80 pointer-events-none z-0"
        aria-hidden="true"
      />
    </>
  );
};
