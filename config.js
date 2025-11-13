import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

/** OpenAI config */
if (!process.env.OPENAI_API_KEY)
  throw new Error("OpenAI API key is missing or invalid.");
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL:
    "https://gateway.ai.cloudflare.com/v1/1433d8205e17a783fa1805576eb2de76/popchoice/openai",
  dangerouslyAllowBrowser: true,
});

/** Supabase config */
const privateKey = process.env.SUPABASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_API_KEY`);
const url = process.env.SUPABASE_URL;
if (!url) throw new Error(`Expected env var SUPABASE_URL`);
export const supabase = createClient(url, privateKey);
