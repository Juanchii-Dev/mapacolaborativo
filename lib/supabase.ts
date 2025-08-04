import { createClient } from "@supabase/supabase-js"
import { supabaseHelpers } from "./supabase-config"
import type { Database } from "./supabase-config"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export { supabaseHelpers }
export type { Database }
