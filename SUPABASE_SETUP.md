# 🚀 Phase 5 Setup: Supabase Integration

## ✅ What's Done

The application is now ready for Supabase backend integration. All the infrastructure is in place:

- ✅ Supabase service layer (`src/utils/supabase.ts`)
- ✅ Database types defined (`src/utils/database.types.ts`)
- ✅ Sync hooks for automatic updates (`useShiftsSync`, `useUserSettingsSync`)
- ✅ Leaderboard integration ready for real data
- ✅ Environment config (`env.example`, `.env.local`)
- ✅ Fallback to localStorage when Supabase is not configured

## 🔧 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Create a new project (choose your region, set a strong password)
4. Wait for the project to initialize (~2 min)

### Step 2: Create Database Tables

Go to **SQL Editor** and run this script:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  telegram_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  settings JSONB,
  leaderboard_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutes INTEGER NOT NULL,
  zone1 INTEGER NOT NULL,
  zone2 INTEGER NOT NULL,
  zone3 INTEGER NOT NULL,
  kilometers INTEGER NOT NULL,
  fuelCost INTEGER NOT NULL,
  timeIncome INTEGER NOT NULL,
  ordersIncome INTEGER NOT NULL,
  totalWithTax INTEGER NOT NULL,
  totalWithoutTax INTEGER NOT NULL,
  netProfit INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(telegram_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shifts_telegram_id ON shifts(telegram_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_period ON shifts(telegram_id, date);

-- Leaderboard cache table (for aggregations)
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('day', 'week', 'month')),
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  total_earnings INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(period_start, period_end, period_type, telegram_id)
);

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_cache(period_start, period_end, period_type);

-- Create function for leaderboard aggregation
CREATE OR REPLACE FUNCTION get_leaderboard(
  start_date DATE,
  end_date DATE,
  limit_count INT DEFAULT 5
)
RETURNS TABLE(
  rank INT,
  telegram_id TEXT,
  username TEXT,
  total_earnings INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(s.totalWithoutTax) DESC)::INT as rank,
    s.telegram_id,
    u.username,
    SUM(s.totalWithoutTax)::INT as total_earnings
  FROM shifts s
  JOIN users u ON s.telegram_id = u.telegram_id
  WHERE s.date >= start_date
    AND s.date <= end_date
    AND u.leaderboard_opt_in = true
  GROUP BY s.telegram_id, u.username
  ORDER BY total_earnings DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### Step 3: Set Up RLS (Row Level Security)

Go to **Authentication** → **Policies** and enable RLS for tables:

```sql
-- For users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (telegram_id = current_setting('app.current_telegram_id', true)::TEXT OR leaderboard_opt_in = true);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (telegram_id = current_setting('app.current_telegram_id', true)::TEXT);

-- For shifts table
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shifts"
  ON shifts FOR SELECT
  USING (telegram_id = current_setting('app.current_telegram_id', true)::TEXT);

CREATE POLICY "Users can insert own shifts"
  ON shifts FOR INSERT
  WITH CHECK (telegram_id = current_setting('app.current_telegram_id', true)::TEXT);

CREATE POLICY "Users can update own shifts"
  ON shifts FOR UPDATE
  USING (telegram_id = current_setting('app.current_telegram_id', true)::TEXT);

CREATE POLICY "Users can delete own shifts"
  ON shifts FOR DELETE
  USING (telegram_id = current_setting('app.current_telegram_id', true)::TEXT);
```

### Step 4: Get Your API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Step 5: Configure Environment

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials in `.env.local`:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_ENABLE_SYNC=true
   VITE_SYNC_INTERVAL=30000
   ```

3. **DO NOT commit `.env.local` to git!** (already in .gitignore)

### Step 6: Generate TypeScript Types (Optional but Recommended)

```bash
npx supabase gen types typescript --project-id your-project-id > src/utils/database.types.ts
```

Then uncomment the import in `src/utils/supabase.ts`:

```typescript
import type { Database } from "./database.types";
// And use it when creating client:
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### Step 7: Test the Integration

1. Start dev server:

   ```bash
   npm run dev
   ```

2. Open DevTools Console and check for:
   - ✅ "Supabase initialized" message
   - ✅ "Syncing shifts to Supabase..." logs
   - ✅ "Loading shifts from Supabase..." logs

3. Try:
   - Enter a shift in ShiftCalculator
   - Click Save
   - Check **Database** → **shifts** table in Supabase
   - The shift should appear there

## 🔄 How Sync Works

1. **On App Load**:
   - Loads user settings from Supabase (or localStorage fallback)
   - Loads last 6 months of shifts from Supabase

2. **On Every Change**:
   - Debounces for 2 seconds (prevents too many requests)
   - Syncs shifts/settings to Supabase
   - Continues working offline if Supabase is down

3. **On Leaderboard View**:
   - Queries real leaderboard from `get_leaderboard()` function
   - Falls back to mock data if Supabase is unconfigured

## 📊 Real-time Features (Future)

The app already has subscription setup ready:

```typescript
subscribeToShifts((shifts) => {
  // Updates UI when shifts change
  updateStore(shifts);
});
```

This will be enabled in Phase 7 for multi-user real-time sync.

## ⚠️ Important Security Notes

1. **Never commit `.env.local`** - Keep secrets safe
2. **RLS Policies** - Protect user data
3. **Telegram Auth** - In production, use Telegram WebApp SDK
4. **Rate Limiting** - Supabase provides free tier limits

## 🐛 Troubleshooting

### "Supabase not configured" warning?

- Check `.env.local` has correct values
- Restart dev server: `npm run dev`

### Shifts not syncing?

- Check browser DevTools Console for errors
- Verify RLS policies allow operations
- Check Supabase project status

### Building fails?

- Run `npm install` to ensure all deps
- Clear node_modules if needed: `rm -rf node_modules && npm install`

## ✅ Phase 5 Checklist

- [ ] Supabase project created
- [ ] Database tables created with SQL script
- [ ] RLS policies configured
- [ ] API credentials copied to `.env.local`
- [ ] Dev server running without errors
- [ ] Shifts sync working (check in Database tab)
- [ ] Leaderboard loads real data
- [ ] Build passes: `npm run build`

## 🚀 Next Steps

- **Phase 6**: Telegram WebApp integration for real authentication
- **Phase 7**: Real-time subscriptions for multi-user features
- **Phase 8**: Production deployment to Telegram

---

**Status**: Phase 5 Infrastructure Complete ✅  
**Ready for**: Manual Supabase setup + testing
