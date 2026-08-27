import { useCallback, useEffect, useRef, useState } from "react";

export default function useAnimatedDrawer<T = undefined>() {
  const [content, setContent] = useState<T | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback((nextContent?: T) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    setContent((nextContent ?? null) as T | null);
    setIsMounted(true);
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsMounted(false);
      setContent(null);
      closeTimerRef.current = null;
    }, 300);
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  return { content, isMounted, isOpen, open, close };
}
