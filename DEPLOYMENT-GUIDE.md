# 🚀 Deployment Guide: Vercel + Supabase

This guide will walk you through deploying your bike tracker to Vercel with Supabase as the database.

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Supabase account (sign up at https://supabase.com)
- Mapbox account (sign up at https://mapbox.com)

## 🗄️ Part 1: Set Up Supabase (5 minutes)

### Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name:** `bike-tracker` (or your preferred name)
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free
4. Click **"Create new project"**
5. Wait ~2 minutes for the project to be created

### Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase-schema.sql` from your project
4. Copy ALL the content and paste it into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. You should see: "Success. No rows returned"
7. Go to **Table Editor** to verify tables were created:
   - You should see `locations` and `posts` tables

### Step 3: Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API** (left sidebar)
2. Copy these 3 values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **service_role secret key:** (⚠️ Keep this secret!)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save these somewhere safe - you'll need them soon!

## 🎨 Part 2: Get Your Mapbox Token (2 minutes)

1. Go to https://account.mapbox.com/
2. Sign in or create a free account
3. Go to **Access tokens**
4. Copy your **Default public token** (or create a new one)
   ```
   pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6IiJ9...
   ```
5. Save this token

## 📝 Part 3: Update Local Environment Variables (1 minute)

1. Open `bike-tracker/.env.local` in your code editor
2. Replace the placeholder values:

```env
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Replace with your actual Mapbox token
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6IiJ9...

# Change to a secure password
ADMIN_PASSWORD=your_secure_password_here
```

3. Save the file

## 🧪 Part 4: Test Locally (3 minutes)

1. Start the development server:
```bash
cd bike-tracker
npm run dev
```

2. Open http://localhost:3000 in your browser

3. **Test the map:**
   - You should see the Mapbox map load
   - No location will show yet (that's normal - no data)

4. **Test the admin panel:**
   - Go to http://localhost:3000/admin
   - Enter your admin password
   - Try creating a test post:
     - Title: "Test Post"
     - Content: "Testing the deployment!"
   - Click "Create Post"
   - Go back to home page - you should see your post!

5. **Test the API endpoint:**
   Open a new terminal and run:
   ```bash
   curl -X POST http://localhost:3000/api/location \
     -H "Content-Type: application/json" \
     -d '{
       "_type": "location",
       "lat": 50.8503,
       "lon": 4.3517,
       "tst": 1234567890
     }'
   ```
   
   You should get: `{"success":true}`
   
   Refresh the home page - you should see Brussels on the map!

✅ **If everything works, you're ready to deploy!**

## 🌐 Part 5: Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

1. Make sure your code is committed:
```bash
git add .
git commit -m "Migrate to Supabase for production deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. **Import your GitHub repository:**
   - Find `bike-tracker` in the list
   - Click **"Import"**

4. **Configure the project:**
   - **Framework Preset:** Next.js (should be auto-detected)
   - **Root Directory:** `bike-tracker`
   - **Build Command:** (leave default)
   - **Output Directory:** (leave default)

5. **Add Environment Variables:**
   Click **"Environment Variables"** and add these:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
   | `NEXT_PUBLIC_MAPBOX_TOKEN` | Your Mapbox token |
   | `ADMIN_PASSWORD` | Your admin password |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` (update after deployment) |

6. Click **"Deploy"**

7. Wait 2-3 minutes for the deployment to complete

8. Once deployed, you'll get a URL like: `https://bike-tracker-xxx.vercel.app`

### Step 3: Update Site URL

1. Copy your Vercel deployment URL
2. In Vercel dashboard, go to **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_SITE_URL`
4. Click **Edit** and update it to your actual Vercel URL
5. **Redeploy** (Vercel will prompt you or go to Deployments → click ⋮ → Redeploy)

## 📱 Part 6: Configure OwnTracks (2 minutes)

Now that your site is live, update OwnTracks to send data to your production URL:

1. Open **OwnTracks app** on your phone
2. Go to **Settings/Preferences**
3. Set **Mode** to **HTTP**
4. Set **URL** to:
   ```
   https://your-app.vercel.app/api/location
   ```
5. Set **Device ID:** `bike` (or your name)
6. Enable **Background updates**
7. Start tracking!

## ✅ Verification Checklist

Test your deployed site:

- [ ] Map loads correctly at `https://your-app.vercel.app`
- [ ] Admin panel accessible at `/admin`
- [ ] Can create posts via admin panel
- [ ] Posts appear on home page
- [ ] OwnTracks sends location successfully
- [ ] Location appears on map
- [ ] Statistics update correctly

## 🔧 Troubleshooting

### Map doesn't load
- Check that `NEXT_PUBLIC_MAPBOX_TOKEN` is set in Vercel
- Verify the token is valid at mapbox.com

### "Missing Supabase environment variables" error
- Check that all 3 Supabase variables are set in Vercel
- Make sure they're spelled correctly
- Redeploy after adding variables

### OwnTracks location not appearing
- Verify the URL in OwnTracks is correct
- Check Supabase → Table Editor → locations to see if data is arriving
- Check Vercel → Functions logs for errors

### Can't create posts
- Verify `ADMIN_PASSWORD` is set
- Check browser console for errors
- Verify Supabase tables were created correctly

## 💰 Cost Breakdown

**Monthly costs: $0** 🎉

- **Vercel:** Free tier
  - 100GB bandwidth
  - Unlimited deployments
  - Custom domains

- **Supabase:** Free tier
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users

- **Mapbox:** Free tier
  - 50,000 map loads/month
  - Unlimited markers

**You're well within free tier limits for a personal bike tracker!**

## 🚀 Next Steps

1. **Custom Domain (Optional):**
   - Buy a domain (e.g., yourname-bikes.com)
   - Add it in Vercel → Settings → Domains
   - Update `NEXT_PUBLIC_SITE_URL`

2. **Share with Friends:**
   - Send them your Vercel URL
   - They can follow your journey live!

3. **Add Donation Links:**
   - Set up your charity donation pages
   - Update `components/DonationSection.tsx` with real URLs

4. **Customize Content:**
   - Update `app/about/page.tsx` with your story
   - Add photos and details about your journey

## 📊 Monitoring

### View Database in Supabase
- Go to Supabase → Table Editor
- See all locations and posts in real-time

### View Logs in Vercel
- Go to Vercel → Your Project → Logs
- See all API requests and errors

### Check Analytics
- Vercel provides free analytics
- See visitor stats in Vercel dashboard

---

## 🎉 You're All Set!

Your bike tracker is now live and ready for your European adventure!

**Questions or issues?** Check the main README.md for more details.

**Happy cycling! 🚴‍♂️🌍**
