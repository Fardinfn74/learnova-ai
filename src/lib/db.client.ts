// Browser-side helper for calling the SQL functions added in supabase/migrations (not in the generated types).
import { supabase } from "@/integrations/supabase/client";

export async function rpc<T = unknown>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await (supabase as any).rpc(fn, args);
  if (error) throw new Error(friendly(error.message));
  return data as T;
}

const FRIENDLY: Array<[RegExp, string]> = [
  [/no longer available/i, "That battle is no longer available."],
  [/not in progress/i, "This battle has ended."],
  [/out of order/i, "That answer was already recorded."],
  [/room not found/i, "No room with that code. Check the code and try again."],
  [/not authenticated/i, "Please sign in again."],
];
function friendly(msg: string) {
  for (const [re, text] of FRIENDLY) if (re.test(msg)) return text;
  return "Something went wrong. Please try again.";
}
