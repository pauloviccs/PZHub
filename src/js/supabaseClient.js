/**
 * PZHub Desktop - Supabase Client & Data Layer
 * Conexão direta com o banco de dados oficial do ecossistema PZHub (mesmo banco do Website)
 */

export const SUPABASE_URL = 'https://legqoupwzpdzqqhwuwwv.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ3FvdXB3enBkenFxaHd1d3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTQ5MTUsImV4cCI6MjEwMzg3MDkxNX0.B1WzociWqnXIE9AM3NA6cY7c7UM-2kLztjgeIQOYJQs';

export const supabase = (window.supabase && typeof window.supabase.createClient === 'function')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  : null;

export const isConfigured = Boolean(supabase);

