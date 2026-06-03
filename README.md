# sabai-japan-lotto

Sabai Japan Lotto Booking — single-page app (`index.html`) + Supabase.

## Deploy

- Site: [sabai-japan-lotto.netlify.app](https://sabai-japan-lotto.netlify.app/)
- Database: Supabase project `jbxvloruouddlkovdoot`

## First-time Supabase setup (required)

If booking fails with **permission denied for table bookings** (or prices show `บาท -` / `บาท 0` and never load):

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste and run the entire contents of [`supabase-setup.sql`](./supabase-setup.sql)
3. Reload the site; set sell/cost prices under **Admin 1 / Admin 2 → ราคา**

This script creates `prices` and `bookings` (if missing), seeds game rows, grants `anon` access, adds RLS policies, and enables Realtime on `bookings`.

If Realtime was set up separately, you can run only:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
```
