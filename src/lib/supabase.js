import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xidistookwiyhlipygnp.supabase.co";
const supabaseAnonKey = "sb_publishable_9zRuhuR67x1Rl2MKLAsXlg_Y-ELUZ85";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
