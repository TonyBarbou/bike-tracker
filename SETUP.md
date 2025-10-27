# 🚀 Quick Setup Guide

Follow these steps to get your bike tracker running!

## Step 1: Install Dependencies ✅

You've already done this! If you need to reinstall:
```bash
cd bike-tracker
npm install
```

## Step 2: Get Your Mapbox Token 🗺️

1. Visit [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account
3. Go to "Access tokens" in your dashboard
4. Copy your "Default public token" (starts with `pk.`)

## Step 3: Configure Environment Variables 🔑

Edit the file `bike-tracker/.env.local` and replace the placeholder:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_actual_mapbox_token_here
ADMIN_PASSWORD=choose_a_secure_password
```

**Important:** Replace `pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjaXJzZXhhbXBsZSJ9.example` with your real Mapbox token!

## Step 4: Run the Development Server 🏃

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 5: Test the Admin Panel 🔐

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Enter the password you set in `.env.local`
3. Try creating a test post!

## Step 6: Set Up OwnTracks (When Ready) 📱

### Install OwnTracks App

- **iOS:** [App Store](https://apps.apple.com/app/owntracks/id692424691)
- **Android:** [Play Store](https://play.google.com/store/apps/details?id=org.owntracks.android)

### Test Locally First

Before your trip, test with ngrok:

1. Install ngrok: [https://ngrok.com/download](https://ngrok.com/download)
2. Run: `ngrok http 3000`
3. Use the https URL in OwnTracks: `https://xxxxx.ngrok.io/api/location`

### Configure OwnTracks

1. Open OwnTracks app
2. Settings → Mode → **HTTP**
3. Settings → Connection:
   - **URL:** `http://localhost:3000/api/location` (or your ngrok URL)
   - **Device ID:** `bike` (or your name)
4. Enable background updates
5. Start tracking!

## Step 7: Customize Your Site ✏️

### Update donation links:
Edit `components/DonationSection.tsx` - replace `#` with your actual donation URLs

### Update about page:
Edit `app/about/page.tsx` - add your story and charity details

### Change colors/design:
Modify the Tailwind classes in any component

## Step 8: Deploy (When Ready) 🚀

### Deploy to Vercel (Free):

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial bike tracker setup"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Deploy!

### Update OwnTracks with production URL:
`https://your-app.vercel.app/api/location`

## Testing Your Setup ✅

### Test the API endpoint:

```bash
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"_type":"location","lat":50.8503,"lon":4.3517,"tst":1234567890}'
```

Then visit [http://localhost:3000](http://localhost:3000) - you should see the location on the map!

### Test creating a post:

1. Go to `/admin`
2. Login with your password
3. Create a test post
4. Check the home page - your post should appear!

## Need Help? 🆘

Check the main README.md for:
- Detailed documentation
- Troubleshooting guide
- API documentation
- Customization tips

---

**You're all set! Happy cycling! 🚴‍♂️**
