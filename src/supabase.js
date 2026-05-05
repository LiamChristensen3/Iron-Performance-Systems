import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gghvgcnldqruelslwytw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaHZnY25sZHFydWVsc2x3eXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTQyNzUsImV4cCI6MjA5MzQzMDI3NX0.aPqcMDTU_cDkt35Nt4ModDRc7xUQPX13DTqUQqT5KtM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)