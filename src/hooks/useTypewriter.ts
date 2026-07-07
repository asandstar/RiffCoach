import { useState, useEffect, useRef } from 'react';

export function useTypewriter(text: string, speed: number = 30, startDelay: number = 0) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!text) return;

    setDisplayText('');
    setIsTyping(false);
    setIsComplete(false);
    indexRef.current = 0;

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      type();
    }, startDelay);

    function type() {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        timeoutRef.current = setTimeout(type, speed);
      } else {
        setIsTyping(false);
        setIsComplete(true);
      }
    }

    return () => {
      clearTimeout(startTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, startDelay]);

  return { displayText, isTyping, isComplete };
}
