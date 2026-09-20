import { createClient } from "@supabase/supabase-js"

// Usar variáveis de ambiente injetadas pelo Vite (VITE_*)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://xtfblkmufvgvsxzydzkl.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJ..."

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
