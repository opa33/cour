# 🧪 Quick Testing Guide

## Current State

✅ **Phase 5 Ready**: Supabase infrastructure is complete but not yet configured.  
✅ **Fallback Works**: App uses localStorage when Supabase is not configured.  
✅ **Production Ready**: Can be deployed now (with localStorage only).

## Quick Test (Without Supabase)

### 1. Start Dev Server

```bash
cd c:\Users\vesht\Documents\vscode\cour-1
npm run dev
```

Open http://localhost:5173

### 2. Test ShiftCalculator

- Enter today's date
- Set: 480 min, Zone1: 5, Zone2: 3, Zone3: 2, Km: 82, Fuel: 1000
- Click "Calculate" → See results
- Click "Save" → Data persists in localStorage

### 3. Test Statistics

- Switch to "📊 Статистика" tab
- See calendar for current month
- Click on days with shifts
- Check charts render properly
- Try different periods (День/Неделя/Месяц/Период)

### 4. Test Profile

- Go to "⚙️ Профиль" tab
- Edit tariffs (try changing rate/minute to 0.50)
- Toggle "Учитывать бензин"
- Toggle "Участвовать в рейтинге"
- Click "Сохранить"

### 5. Test Leaderboard

- Go to "🏆 Рейтинг" tab
- See mock data (with variance)
- If you enabled leaderboard opt-in, you'll see yourself
- Try different periods

### 6. Verify localStorage

Open DevTools Console (F12) and run:

```javascript
// View all shifts
JSON.parse(localStorage.getItem("courier-finance:shifts"));

// View settings
JSON.parse(localStorage.getItem("courier-finance:user-settings"));

// View user ID
localStorage.getItem("courier-finance:user-id");

// Clear all (for fresh start)
localStorage.clear();
```

## Test With Supabase (When Configured)

1. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
2. Add credentials to `.env.local`
3. Restart: `npm run dev`
4. Check browser console:
   - Should see: "🔄 Syncing shifts to Supabase..."
   - Should see: "✅ Loaded X shifts from Supabase"
5. Go to Supabase Dashboard → SQL Editor:
   - Run: `SELECT * FROM shifts;`
   - Should see your saved shift data

## Build Test

```bash
npm run build
```

Should complete successfully:

```
✓ 729 modules transformed.
dist/index.html                    0.55 kB │ gzip:   0.34 kB
dist/assets/index-CyG06RaM.css    17.43 kB │ gzip:   3.79 kB
dist/assets/...js                ...
✓ built in 10.30s
```

## Common Issues

### "Supabase not configured" warning

- ✅ **Expected** if `.env.local` not filled
- ✅ **Normal** - app works with localStorage
- Only a problem if you want real leaderboard

### Shifts not saving

- Check localStorage isn't disabled in browser
- Try: `localStorage.setItem('test', '1')` in console
- If error → enable localStorage

### Build fails

```bash
rm -rf node_modules
npm install
npm run build
```

## Performance Check

In DevTools Performance tab:

- Page load should take < 2 seconds
- Charts lazy-load (good for mobile)
- No console errors ✅

## Mobile Testing

```bash
npm run dev -- --host
```

Then access from mobile:

```
http://<your-ip>:5173
```

Should work well on mobile (Tailwind responsive design).

## What's Ready to Deploy?

✅ **Now**: Can deploy to production right now  
✅ **Features**: All 4 screens work, localStorage persistence  
⏸️ **Next**: Supabase setup + Telegram WebApp integration

## Files to Remember

| File                | Purpose                               |
| ------------------- | ------------------------------------- |
| `.env.local`        | Your Supabase secrets (DO NOT COMMIT) |
| `.env.example`      | Template for `.env.local`             |
| `SUPABASE_SETUP.md` | Complete setup guide                  |
| `STATUS.md`         | Project status & phases               |

---

**Tips**:

- Use localStorage to test locally fast
- Setup Supabase for real multi-user features
- Mobile-first testing on small screens
- Check console logs for sync activity
