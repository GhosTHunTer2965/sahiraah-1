import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jcjlcswhgfkoxkowwmac.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impjamxjc3doZ2Zrb3hrb3d3bWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyOTk2NzksImV4cCI6MjA2Mjg3NTY3OX0.Zp20F9wtp9Xutk__zTue41wKGfEDwzso2vbo9lmkH3g";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSessions() {
  const { data: users, error: userError } = await supabase.from('user_profiles').select('id, email, name');
  console.log("Users:", users);

  const { data: sessions, error: sessionError } = await supabase.from('user_quiz_sessions').select('*');
  console.log("Sessions:", sessions?.length, sessions);

  const { data: history, error: historyError } = await supabase.from('user_career_history').select('*');
  console.log("History:", history?.length, history);
}

checkSessions();
