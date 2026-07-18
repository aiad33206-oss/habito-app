/* ==========================================================================
   CONFIG — Supabase connection
   NOTE: this app runs as a standalone deployed site (GitHub Pages / Vercel /
   TWA), so auth sessions are persisted with the browser's own localStorage
   (Supabase's default). Earlier builds tried to use a Claude-artifact-only
   `window.storage` API for this, which does not exist outside Claude's
   preview sandbox — that was the root cause of "add habit does nothing"
   and "can't log back in": the session silently failed to persist, so
   every request after the first went out unauthenticated and Row Level
   Security quietly rejected it.
   ========================================================================== */
window.HABITO_CONFIG = {
  SUPABASE_URL: 'https://xthjlbgksdzpzypjsjyj.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0aGpsYmdrc2R6cHp5cGpzanlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4OTI5NjAsImV4cCI6MjA5OTQ2ODk2MH0.EqIMb35wHBOPCnHRyF9L5BgWgDKJUYRyxnTaP5qFuFg',
  AVATAR_BUCKET: 'avatars'
};
