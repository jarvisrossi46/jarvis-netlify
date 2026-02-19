# Jarvis Interface

A real-time chat interface using Netlify Functions + Supabase PostgreSQL.
Always-on, globally accessible, completely free.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Netlify        │────▶│  Netlify         │────▶│  Supabase       │
│  (Frontend)     │     │  Functions       │     │  (PostgreSQL)   │
│  Static CDN     │◄────│  Serverless API  │◄────│  Persistent DB  │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                                 ▼ (Webhook)
                         ┌─────────────────┐
                         │  User's Mac     │
                         │  (OpenClaw)     │
                         │  WhatsApp Out   │
                         └─────────────────┘
```

## Quick Start

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In the SQL Editor, run:

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

3. Get your credentials:
   - Go to Project Settings → API
   - Copy `Project URL` (SUPABASE_URL)
   - Copy `service_role key` (SUPABASE_KEY)

### 2. Deploy to Netlify

#### Option A: One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=YOUR_REPO_URL)

#### Option B: Manual Deploy

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Select your repository
4. Build settings:
   - Build command: (leave empty)
   - Publish directory: `.`
5. Click Deploy

### 3. Configure Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables, add:

| Variable | Value | Required |
|----------|-------|----------|
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_KEY` | Your Supabase service_role key | ✅ |
| `WEBHOOK_URL` | `http://100.112.231.84:8081/webhook/notify` | Optional |

### 4. Redeploy

After adding environment variables, trigger a redeploy:
- Netlify Dashboard → Deploys → Trigger deploy → Deploy site

## Usage

### For Users (Send Message)

1. Open your Netlify site URL
2. Select sender name (Ashwin/Nakul/Arry)
3. Type message and send
4. Message appears in Supabase + webhook sent to Mac

### For You (Receive & Respond)

**When someone sends a message:**
- You get WhatsApp notification via webhook
- Message stored in Supabase

**To send a response:**

```bash
# Using curl
curl -X POST https://your-site.netlify.app/.netlify/functions/response \
  -H "Content-Type: application/json" \
  -d '{"sender":"jarvis","content":"Your response here"}'
```

Or use OpenClaw `sessions_send` to call the endpoint.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/.netlify/functions/messages?since=0` | GET | Fetch messages since ID |
| `/.netlify/functions/messages` | POST | Send incoming message |
| `/.netlify/functions/response` | POST | Send outgoing response |

## Files

```
jarvis-netlify/
├── index.html              # Chat UI (dark theme, mobile responsive)
├── netlify.toml            # Netlify config
├── package.json            # Dependencies
├── netlify/
│   └── functions/
│       ├── messages.js     # GET/POST messages
│       └── response.js     # Receive Jarvis responses
└── README.md               # This file
```

## Features

- ✅ Dark theme, mobile responsive
- ✅ Real-time polling (3 second refresh)
- ✅ Sender selector (Ashwin/Nakul/Arry)
- ✅ Webhook notifications to Mac
- ✅ Works from anywhere, no VPN needed
- ✅ Completely free (Netlify + Supabase free tiers)
- ✅ No credit card required

## Troubleshooting

### Messages not appearing
- Check browser console for errors
- Verify Supabase credentials in Netlify env vars
- Check Netlify function logs

### Webhook not working
- Verify Mac is online and OpenClaw is running
- Check webhook URL is correct
- Webhook failures are logged but don't block message storage

### CORS errors
- Already handled in functions with proper headers
- If issues persist, check Netlify function logs

## Free Tier Limits

**Netlify:**
- 100GB bandwidth/month
- 125k function requests/month
- 100 hours build time/month

**Supabase:**
- 500MB database
- 2GB bandwidth
- Unlimited API requests

More than enough for personal use!

## License

MIT - Feel free to modify and use as needed.