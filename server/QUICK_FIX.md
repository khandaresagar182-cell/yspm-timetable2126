# Quick Fix Instructions

## ✅ MySQL is Working!
Database is running with all tables created.

## 🔄 Final Step

**Restart your server** to create users automatically:

1. Stop the current server (Ctrl+C in the terminal)
2. Run: `npm run dev` (in the `server` folder)
3. The server will automatically create these users:
   - `admin@yspm.com` / `admin123` (admin)
   - `sagarkhandare@gmail.com` / `admin123` (teacher)
   - **`faculty@1.com` is NOT pre-created** - you need to create it

## 🆕 Create Faculty User

After server starts, create the faculty@1.com user either:

**Option 1: Via API**
```bash
curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d "{\"email\":\"faculty@1.com\",\"password\":\"admin123\",\"role\":\"teacher\"}"
```

**Option 2: Login with admin first**
Use `admin@yspm.com` / `admin123` to login, then create users through your admin panel (if you have one).

**Option 3: Directly in database**
Let the server create the hash and run:
```sql
-- After server starts and creates other users successfully
```

## 🎯 For Now
**Use `admin@yspm.com` / `admin123` to login and test!**
