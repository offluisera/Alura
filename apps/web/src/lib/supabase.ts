import { createClient } from "@supabase/supabase-js"

// Usar variáveis de ambiente injetadas pelo Vite (VITE_*)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://xtfblkmufvgvsxzydzkl.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZmJsa211ZnZndnN4enlkemtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDAzODAsImV4cCI6MjEwNDgxNjM4MH0.2qjvwnsKBRmml16yu4Psbbw_wxqRRmyIDsvk3MkVEzI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
