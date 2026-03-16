import { useEffect, useCallback } from 'react';

type HotkeyHandler = (event: KeyboardEvent) => void;

interface HotkeyMap {
  [key: string]: HotkeyHandler;
}

export function useHotkeys(hotkeys: HotkeyMap, deps: any[] = []) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Игнорируем, если пользователь печатает в input или textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = event.key.toLowerCase();
    const ctrlKey = event.ctrlKey || event.metaKey;
    const shiftKey = event.shiftKey;
    const altKey = event.altKey;

    // Формируем строку комбинации клавиш
    let combo = '';
    if (ctrlKey) combo += 'mod+';
    if (shiftKey) combo += 'shift+';
    if (altKey) combo += 'alt+';
    combo += key;

    const handler = hotkeys[combo];
    if (handler) {
      event.preventDefault();
      handler(event);
    }
  }, [hotkeys]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, ...deps]);
}