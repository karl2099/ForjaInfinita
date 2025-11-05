
export type Handler = (params: Record<string, string>) => void;


export const routes: [RegExp, Handler][] = [];

/**
 * bootRouter
 *
 * Initializes the router. In the current implementation, this function
 * intentionally does nothing because route handling is performed inside
 * the React application (see `src/main.tsx`). If you need to react to
 * hash changes outside of React, you can add listeners here and
 * dispatch events or call functions accordingly. For example, you might
 * dispatch a custom event when a particular hash is encountered:
 *
 *   window.addEventListener('hashchange', () => {
 *     const hash = window.location.hash;
 *     // perform custom logic
 *   });
 */
export function bootRouter(): void {
  // No operation – React handles routing internally.
}
