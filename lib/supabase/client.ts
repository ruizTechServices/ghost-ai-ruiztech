"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";

const getSupabaseBrowserEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return { supabasePublishableKey, supabaseUrl };
};

const createSupabaseBrowserClient = () => {
  const { supabasePublishableKey, supabaseUrl } = getSupabaseBrowserEnv();

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
};

export { createSupabaseBrowserClient };
