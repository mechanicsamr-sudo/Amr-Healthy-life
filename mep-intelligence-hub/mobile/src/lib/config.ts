// Public, build-time configuration only. Secrets never live in the app.
export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  apiUrl: (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, ''),
};

export const isConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey && config.apiUrl);
