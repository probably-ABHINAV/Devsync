# Supabase Setup Instructions

Your Supabase database is missing the required tables. Follow these steps to set them up:

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire content of `migrations/001_create_tables.sql`
5. Click **Run**
6. Wait for the query to complete (should see "Success" message)

## Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Verification

After creating the tables, verify they exist:

1. Go to Supabase Dashboard → **Table Editor**
2. You should see these tables:
   - `users`
   - `activities`
   - `discord_configs`
   - `user_stats`
   - `user_badges`
   - `webhooks`

## Next Steps

Once the tables are created:

1. Test the app at: https://opscord.vercel.app/
2. Click "Get Started Free"
3. Log in with GitHub
4. Your user data will be saved
5. Your GitHub activities will sync automatically
6. Check the **Activity** tab to see your contributions

## Troubleshooting

If you still get "Could not find the table" error:

1. Go to Supabase dashboard
2. Make sure you're viewing the **public** schema
3. Double-check that all tables were created successfully
4. Refresh your browser and try logging in again

## Questions?

The tables are defined in `migrations/001_create_tables.sql` if you need to reference them.
