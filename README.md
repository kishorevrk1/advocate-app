# Advocate

AI-powered consumer rights app. Helps everyday people understand their rights, generate demand letters, and get phone scripts — powered by Claude.

## Project Structure

```
new_apps/
├── advocate/          # React Native + Expo mobile app
└── advocate-api/      # Node.js + Express backend (Claude API integration)
```

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 22+ | https://nodejs.org |
| Expo CLI | latest | `npm install -g expo-cli` |
| EAS CLI | latest | `npm install -g eas-cli` |

A [Supabase](https://supabase.com) project and an [Anthropic API key](https://console.anthropic.com) are required before running locally.

---

## Setup

### 1. Backend — advocate-api

```bash
cd advocate-api
npm install
cp .env.example .env
# Edit .env — fill in ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
```

### 2. Mobile app — advocate

```bash
cd advocate
npm install
cp .env.example .env
# Edit .env — fill in EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_KEY, EXPO_PUBLIC_API_URL
```

---

## Running Locally

Start the backend first, then the mobile app.

### Backend

```bash
cd advocate-api
npm run dev
# Server starts on http://localhost:3001
# Health check: GET http://localhost:3001/health
```

### Mobile App

```bash
cd advocate
npm start
# Opens Expo Dev Tools — press 'a' for Android emulator, 'i' for iOS simulator
```

> **Note:** RevenueCat in-app purchases do not work in Expo Go. Use a custom development client or production build to test purchases. All other features work normally in Expo Go.

---

## Deploying the Backend to Railway

1. Push `advocate-api/` to a GitHub repository.
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → select the repo.
3. In Railway dashboard → Variables, add:
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `PORT` is set automatically by Railway — do not override it.
4. Railway auto-detects the `npm run build` + `npm start` scripts and deploys.
5. Copy the generated Railway URL (e.g. `https://advocate-api-production.up.railway.app`).
6. Update `advocate/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://advocate-api-production.up.railway.app
   ```

---

## Building with EAS (Expo Application Services)

### First-time setup

```bash
cd advocate
eas login          # log in to your Expo account
eas build:configure
```

### Android build

```bash
eas build --platform android --profile production
```

### iOS build

```bash
eas build --platform ios --profile production
```

Build artifacts are available in the [Expo dashboard](https://expo.dev). Submit to stores with:

```bash
eas submit --platform android
eas submit --platform ios
```

---

## Environment Variables Reference

| File | Variable | Description |
|------|----------|-------------|
| `advocate/.env` | `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `advocate/.env` | `EXPO_PUBLIC_SUPABASE_KEY` | Supabase anon (public) key |
| `advocate/.env` | `EXPO_PUBLIC_API_URL` | advocate-api base URL |
| `advocate/.env` | `EXPO_PUBLIC_REVENUECAT_KEY` | RevenueCat public SDK key |
| `advocate/.env` | `EXPO_PUBLIC_MIXPANEL_TOKEN` | Mixpanel project token |
| `advocate/.env` | `EXPO_PUBLIC_ENV` | `development` / `staging` / `production` |
| `advocate-api/.env` | `PORT` | Express server port (default: 3001) |
| `advocate-api/.env` | `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `advocate-api/.env` | `SUPABASE_URL` | Supabase project URL |
| `advocate-api/.env` | `SUPABASE_SERVICE_KEY` | Supabase service role key (server-only) |

See `advocate/.env.example` and `advocate-api/.env.example` for annotated templates.
