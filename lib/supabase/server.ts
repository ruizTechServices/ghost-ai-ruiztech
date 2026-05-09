import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/supabase/database.types";

const getSupabaseServerEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { supabasePublishableKey, supabaseUrl };
};

const createSupabaseServerClient = async () => {
  const { supabasePublishableKey, supabaseUrl } = getSupabaseServerEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components can read cookies but cannot write them.
        }
      },
    },
  });
};

export { createSupabaseServerClient };
