import { createServerClient } from "@supabase/ssr";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for server-side use (e.g., in server actions, route handlers).
 * This client is designed to be used in server environments and handles cookies via the request/response cycle.
 */
export function createServerSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // This is a placeholder. In a real Next.js app, you would get cookies from the request.
          // For server actions and route handlers, we use the `cookies()` function from 'next/headers'.
          // However, since this function might be called in different contexts, we return an empty array
          // and let the caller handle the cookies appropriately.
          // In practice, you should use the `createServerClient` function from '@supabase/ssr' directly in your server code
          // and pass the cookies from the request.
          return [];
        },
        setAll() {
          // No-op for server-side only operations that don't set cookies.
        },
      },
    }
  );
}

/**
 * Creates a Supabase client for client-side use (e.g., in React components).
 * This client uses localStorage and cookies to persist the user's session.
 */
export function createClientSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export { createServerSupabaseClient as createServerClient, createClientSupabaseClient as createClient };