# Supabase Redirect Configuration

The magic link is redirecting to `http://localhost:3000` because Supabase doesn't recognize your Vercel URL as a valid redirect target, so it falls back to the default "Site URL".

## Steps to Fix

1.  **Open Dashboard**: Go to [Supabase Dashboard](https://supabase.com/dashboard).
2.  **Navigate**: Go to **Authentication** -> **URL Configuration**.
3.  **Site URL**: Ensure this is set to your production URL (e.g., `https://johnnyfrontend.vercel.app`) OR keep it as localhost if you do local dev often.
4.  **Redirect URLs**: **CRITICAL STEP**
    - Add your Vercel URL: `https://johnnyfrontend.vercel.app/**` (The `**` is a wildcard).
    - Also add: `https://johnnyfrontend.vercel.app` (without wildcard just in case).
5.  **Save**: Click Save.

## Why this works
When the app sends `redirectTo: window.location.origin` (which is `https://johnnyfrontend.vercel.app`), Supabase checks if this URL is in the allowed list. If it is, it redirects there. If NOT, it redirects to the "Site URL" (localhost).
