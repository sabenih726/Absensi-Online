import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type AttendanceRecord = {
  id?: string
  name: string
  time: string
  date: string
  location: string
  status: "masuk" | "keluar"
  face_image?: string
  created_at?: string
}
