# 🚴‍♂️ Bike Tracker - Live Cycling Journey Tracker

A beautiful, real-time bike tracking website built with Next.js for tracking cycling journeys across Europe with live GPS updates, blog posts, and donation integration.

## ✨ Features

- 🗺️ **Live GPS Tracking** - Real-time location updates via OwnTracks
- 📊 **Journey Statistics** - Distance, elevation, speed, and days on road
- 📝 **Live Updates Feed** - Post blog updates with photos while on the road
- 💰 **Donation Integration** - Links to multiple donation platforms
- 🔐 **Simple Admin Panel** - Password-protected panel for posting updates
- 📱 **Responsive Design** - Works beautifully on all devices
- 🌍 **Interactive Map** - Custom Mapbox map with route trail

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Mapbox account (free tier works great)
- OwnTracks app on your phone (iOS/Android)

### Installation

1. **Clone and install dependencies:**
```bash
cd bike-tracker
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Mapbox token:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
ADMIN_PASSWORD=your_secure_password_here
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open in browser:**
```
http://localhost:3000
```

## 🔑 Getting API Keys

### Mapbox Token (Required)

1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account
3. Go to "Access tokens"
4. Copy your default public token or create a new one
5. Add to `.env.local` as `NEXT_PUBLIC_MAPBOX_TOKEN`

**Free tier includes:** 50,000 map loads/month (plenty for personal use)

## 📱 Setting Up OwnTracks

OwnTracks is a free, open-source GPS tracking app that will send your location to your website.

### Installing OwnTracks

**iOS:** [Download from App Store](https://apps.apple.com/app/owntracks/id692424691)  
**Android:** [Download from Play Store](https://play.google.com/store/apps/details?id=org.owntracks.android)

### Configuring OwnTracks

1. **Open OwnTracks app**
2. **Go to Settings/Preferences**
3. **Set Mode to "HTTP"**
4. **Configure the following:**
   - **URL:** `https://yourdomain.com/api/location` (or `http://localhost:3000/api/location` for testing)
   - **Device ID:** `tony` (or any identifier)
   - **Tracker ID:** `bike` (optional)
   - **Authentication:** None needed (endpoint is public for receiving data)

5. **Adjust tracking settings:**
   - **Monitoring:** Significant changes (battery-efficient)
   - **Move mode distance:** 100-200m (updates every 100-200 meters moved)
   - **Background updates:** Enabled

6. **Start tracking!** Your location will now automatically update on your website.

### Testing OwnTracks Locally

To test before deployment:

1. Run your dev server: `npm run dev`
2. Use a tool like [ngrok](https://ngrok.com/) to create a public URL:
   ```bash
   ngrok http 3000
   ```
3. Use the ngrok URL in OwnTracks: `https://xxxxx.ngrok.io/api/location`

## 🎨 Customization

### Update Site Content

**Hero Section:** Edit `app/page.tsx`  
**About Page:** Edit `app/about/page.tsx`  
**Donation Links:** Edit `components/DonationSection.tsx`  
**Colors:** Modify Tailwind classes throughout the components

### Add Your Charity Details

1. Go to `components/DonationSection.tsx`
2. Update the donation platform URLs
3. Update the fundraising goal
4. Add charity description

### Customize Map Style

In `components/LiveMap.tsx`, change the map style:
```typescript
style: 'mapbox://styles/mapbox/outdoors-v12'
```

Available styles:
- `streets-v12` - Classic street map
- `outdoors-v12` - Outdoor/hiking focused (default)
- `satellite-v9` - Satellite imagery
- `light-v11` - Light theme
- `dark-v11` - Dark theme

## 📝 Posting Updates

### Using the Admin Panel

1. Navigate to `/admin`
2. Enter your admin password (set in `.env.local`)
3. Fill out the post form:
   - **Title:** Short, engaging title
   - **Location:** City/landmark name
   - **Content:** Your update (supports Markdown)
   - **Images:** URLs to images (upload to Imgur, Cloudinary, etc.)
4. Click "Create Post"

### Markdown Support

Use Markdown for rich formatting:
```markdown
**Bold text**
*Italic text*
- Bullet points
- Another point

Paragraphs are separated by blank lines.
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Update OwnTracks URL:**
   - Use your Vercel URL: `https://your-app.vercel.app/api/location`

### Environment Variables in Production

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`

## 📂 Project Structure

```
bike-tracker/
├── app/
│   ├── page.tsx                 # Home page
│   ├── about/page.tsx           # About page
│   ├── admin/page.tsx           # Admin panel
│   └── api/
│       ├── location/route.ts    # GPS endpoint
│       ├── stats/route.ts       # Statistics
│       └── posts/route.ts       # Blog posts
├── components/
│   ├── LiveMap.tsx              # Mapbox map
│   ├── StatsPanel.tsx           # Statistics display
│   ├── LiveFeed.tsx             # Blog posts feed
│   ├── DonationSection.tsx      # Donation CTA
│   └── Navigation.tsx           # Navigation bar
├── lib/
│   └── db.ts                    # Database & queries
├── data/
│   └── tracker.db               # SQLite database (auto-created)
└── .env.local                   # Your environment variables
```

## 🗄️ Database

The app uses SQLite for simple, file-based storage. The database is automatically created at `data/tracker.db` when you first run the app.

### Tables

**locations:** GPS tracking data  
**posts:** Blog posts and updates

### Backing Up Data

Simply copy the `data/tracker.db` file to back up all your tracking data and posts.

## 🔧 Troubleshooting

### Map not loading?
- Check that `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly
- Verify the token is valid at mapbox.com
- Check browser console for errors

### OwnTracks not updating location?
- Verify the URL is correct in OwnTracks settings
- Check that the app has location permissions
- Test the endpoint: `curl -X POST https://yoursite.com/api/location -H "Content-Type: application/json" -d '{"_type":"location","lat":50.8503,"lon":4.3517,"tst":1234567890}'`

### Admin panel not accepting password?
- Verify `ADMIN_PASSWORD` is set in `.env.local`
- Clear browser cache
- Check browser console for errors

### No stats showing?
- You need at least 2 location points for statistics
- Send a test location via the API or OwnTracks

## 📊 API Endpoints

### `POST /api/location`
Receive GPS data from OwnTracks

### `GET /api/location`
Get current location

### `GET /api/location/history`
Get all historical locations

### `GET /api/stats`
Get journey statistics

### `GET /api/posts`
Get all blog posts

### `POST /api/posts`
Create a new post (requires authentication)

## 🤝 Contributing

Feel free to fork and customize for your own journey!

## 📄 License

MIT License - feel free to use this for your own adventures!

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Maps by [Mapbox](https://www.mapbox.com/)
- GPS tracking via [OwnTracks](https://owntracks.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

Happy cycling! 🚴‍♂️🌍
