// src/lib/authEvents.ts
type Listener = (message?: string) => void;

let listeners: Listener[] = [];

export function onAuthExpired(cb: Listener) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((x) => x !== cb);
  };
}

export function emitAuthExpired(message?: string) {
  for (const cb of listeners) cb(message);
}
