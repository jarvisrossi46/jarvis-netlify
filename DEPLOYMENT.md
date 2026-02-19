# 🚀 Deployment Checklist

## Files Created ✅

All files are ready in `/Users/arry/.openclaw/workspace/jarvis-netlify/`:

```
jarvis-netlify/
├── index.html              ✅ Chat UI (dark theme, mobile responsive)
├── netlify.toml            ✅ Netlify configuration
├── package.json            ✅ Dependencies (@supabase/supabase-js)
├── netlify/
│   └── functions/
│       ├── messages.js     ✅ GET/POST messages endpoint
│       └── response.js     ✅ Receive Jarvis responses
├── README.md               ✅ Full documentation
└── push-to-github.sh       ✅ Helper script
```

## Step-by-Step Deployment

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `jarvis-interface` (or any name)
3. Make it Public or Private
4. **Do NOT** initialize with README (we already have one)
5. Click "Create repository"
6. Copy the repository URL (e.g., `https://github.com/username/jarvis-interface.git`)

### Step 2: Push Code to GitHub

Run the helper script:
```bash
cd /Users/arry/.openclaw/workspace/jarvis-netlify
./push-to-github.sh
```

Or manually:
```bash
cd /Users/arry/.openclaw/workspace/jarvis-netlify
git remote add origin https://github.com/YOUR_USERNAME/jarvis-interface.git
git branch -M main
git push -u origin main
```

### Step 3: Create Supabase Project

1. Go to https://supabase.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Choose organization, name it `jarvis-interface`
5. Select region closest to you (for lowest latency)
6. Click "Create new project" (takes ~2 minutes)

### Step 4: Create Database Table

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste this SQL:

```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'incoming',
    created_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);
```

4. Click **Run** (green button)
5. You should see "Success. No rows returned"

### Step 5: Get Supabase Credentials

1. In Supabase, go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **service_role secret** → `SUPABASE_KEY` (NOT the anon key!)

⚠️ **Important**: Use `service_role` key, not `anon` key!

### Step 6: Deploy to Netlify

1. Go to https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Select **GitHub** and authorize Netlify
4. Find and select your `jarvis-interface` repository
5. Configure build:
   - **Branch to deploy**: `main`
   - **Build command**: (leave empty)
   - **Publish directory**: `.`
6. Click **Deploy jarvis-interface**

### Step 7: Add Environment Variables

1. In Netlify dashboard, go to **Site configuration** → **Environment variables**
2. Click **Add a variable** → Add each:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_KEY` | Your Supabase service_role key |
| `WEBHOOK_URL` | `http://100.112.231.84:8081/webhook/notify` |

3. Click **Save** for each variable

### Step 8: Redeploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete (~30 seconds)
4. Click the site URL (e.g., `https://jarvis-interface-xxx.netlify.app`)

## ✅ Success Verification

Test the complete flow:

**Test 1: Send Message from Web**
1. Open your Netlify site URL
2. Select sender (Ashwin/Nakul/Arry)
3. Type a message and send
4. Check: Message appears in chat ✓

**Test 2: Check Supabase**
1. Go to Supabase → Table Editor → `messages`
2. Check: Message is stored in database ✓

**Test 3: Check Webhook (if Mac is online)**
1. You should receive WhatsApp notification ✓

**Test 4: Send Response**
```bash
curl -X POST https://YOUR_SITE.netlify.app/.netlify/functions/response \
  -H "Content-Type: application/json" \
  -d '{"sender":"jarvis","content":"Hello from the other side!"}'
```
2. Check: Response appears in web chat within 3 seconds ✓

## 🎉 Done!

Your Jarvis Interface is now:
- ✅ Always online (Netlify CDN)
- ✅ Globally accessible (no Tailscale needed)
- ✅ Real-time chat (3-second polling)
- ✅ Free forever (Netlify + Supabase free tiers)

## Troubleshooting

**Build fails?**
- Check Netlify deploy logs for errors
- Ensure `netlify.toml` is in root directory

**Functions not working?**
- Verify environment variables are set correctly
- Check function logs in Netlify dashboard

**Database connection errors?**
- Verify SUPABASE_URL and SUPABASE_KEY
- Ensure you used service_role key, not anon key

**Messages not appearing?**
- Open browser console (F12) and check for errors
- Verify Supabase table exists with correct schema

## Your Site URL

After deployment, your site will be at:
```
https://[your-site-name].netlify.app
```

Share this URL with Ashwin, Nakul, or anyone who needs to reach you!
