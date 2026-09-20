import { useState, useEffect } from 'react';

interface UseTypewriterOptions {
  speed?: number;
  startDelay?: number;
}

interface UseTypewriterResult {
  displayed: string;
  done: boolean;
}

export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {}
): UseTypewriterResult {
  const { speed = 38, startDelay = 600 } = options;
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    let intervalId: number | null = null;
    let startTimeoutId: number | null = null;

    setDisplayed('');
    setDone(false);

    startTimeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index++;
        if (index <= text.length) {
          setDisplayed(text.slice(0, index));
        }
        if (index >= text.length) {
          setDone(true);
          if (intervalId !== null) clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      if (startTimeoutId !== null) clearTimeout(startTimeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}
