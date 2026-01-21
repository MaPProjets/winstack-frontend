import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bfbaekwizhcqkthzluui.supabase.co'  // Remplace par ton URL
const supabaseAnonKey = 'sb_publishable_JV9bUwIfUBtFp52o1ruVFg_243vqVuf'  // Remplace par ta clé anon

export const supabase = createClient(supabaseUrl, supabaseAnonKey)