# PWA Testing Guide - Spärmen

## What's Been Fixed

### 1. **Standalone Mode (No Address Bar)**
- Updated manifest with `display_override: ["standalone", "minimal-ui"]`
- Added proper `scope` and PWA source tracking
- iOS-specific settings: `black-translucent` status bar and `viewport-fit: cover`
- Separated icon purposes (maskable and any) for better compatibility

### 2. **Better Offline Support**
- **NetworkFirst** caching for pages - tries network first, falls back to cache
- **CacheFirst** for static assets (images, fonts, Next.js bundles)
- API responses cached for 1 hour with 5-second network timeout
- Song and spex pages cached for 24 hours
- Auth endpoints use NetworkOnly (never cached for security)

### 3. **Install Prompt**
- Added native install prompt that appears after 3 seconds
- Only shows if not already installed
- Dismissible and won't show again if dismissed
- Dark theme matching your app design

## How to Test Properly

### On Android (Chrome/Edge)
1. **Deploy your app** to a server (Vercel, Netlify, etc.) - PWA requires HTTPS
2. Open the site in Chrome
3. You'll see a banner at the bottom to install
4. Click "Install" and add to home screen
5. Open from home screen - **no address bar!**

### On iOS (Safari)
1. Open your deployed site in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name it "Spärmen" and add
5. Open from home screen - **runs in standalone mode!**

### Testing Offline Mode

1. **Visit some pages first** while online (songs, spex pages)
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Reload the page
5. Previously visited pages should load from cache!
6. New pages will show the offline fallback

## What Works Offline Now

✅ **Previously visited pages** - cached for 24 hours
✅ **Static assets** - JS, CSS, images cached
✅ **API responses** - cached for 1 hour
✅ **App shell** - navbar, layout always available
✅ **Offline fallback page** - matches your dark theme

## What Requires Internet

❌ **Authentication** - security requirement
❌ **Search** - needs live database
❌ **Creating/editing content** - needs server
❌ **First-time page visits** - not yet cached

## Development vs Production

- PWA is **disabled in development mode** for easier debugging
- Service worker only registers in production builds
- Use `npm run build && npm start` to test PWA locally

## Uninstalling/Reinstalling for Testing

### Chrome/Android
1. Long-press the app icon → App info
2. Storage → Clear data
3. Uninstall from home screen
4. Revisit site to test fresh install

### iOS
1. Long-press app icon → Remove App
2. Revisit site in Safari to reinstall

## Key Improvements Made

1. **Manifest scope** prevents browser from taking over navigation
2. **Display override** ensures standalone mode on supported devices
3. **Viewport-fit: cover** uses full screen on notched devices
4. **Black-translucent status bar** integrates with iOS status bar
5. **Runtime caching strategies** balance freshness with offline capability
6. **Install prompt component** guides users to install properly

## Troubleshooting

**Still seeing address bar?**
- Make sure you opened from home screen, not browser
- On iOS: Must install via Safari's "Add to Home Screen"
- On Android: Must click "Install" from the browser prompt

**Offline not working?**
- Visit pages while online first to cache them
- Check DevTools → Application → Cache Storage
- Clear old caches and reinstall if needed

**Install prompt not showing?**
- Already installed? Uninstall first
- Previously dismissed? Clear localStorage
- Using Chrome/Edge? (Safari doesn't support install events)

## Next Steps

Deploy your app to test the full PWA experience:
```bash
npm run build
# Deploy to Vercel, Netlify, or your hosting platform
```

The PWA will automatically work once deployed with HTTPS!

