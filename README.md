# Smart Budget Shopping List

A Progressive Web App (PWA) for managing a prioritized shopping list with three categories (need to have, good to have, nice to have). Track expected prices, mark items as purchased, and automatically reorganize items based on your monthly budget. Items can be manually reordered within categories, and all data is stored securely and locally on your device.

## Features

- 📱 **Progressive Web App** - Install on any device, works offline
- 💰 **Budget Tracking** - Set monthly budget and track spending in real-time
- 📝 **Prioritized Categories** - Organize items by priority (need/good/nice to have)
- ✅ **Purchase Tracking** - Mark items as purchased and see budget adjust
- 🔒 **Offline First** - All data stored locally using IndexedDB
- 🎨 **Mobile-First Design** - Optimized for touch input and mobile devices
- 🌙 **Dark Mode** - Automatic dark mode support based on system preferences

## Tech Stack

- **React 19** - Latest React with TypeScript
- **Vite** - Fast build tool and dev server
- **Vite PWA Plugin** - Service worker and manifest generation
- **IndexedDB (via idb)** - Client-side storage for offline functionality
- **React Router** - Client-side routing
- **Google Fonts** - Space Grotesk, Inter, and JetBrains Mono

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nayyarcoder/smartbudgetshoppinglist.git
cd smartbudgetshoppinglist
```

2. Install dependencies:
```bash
npm install
```

3. Generate PWA icons:
```bash
npm run generate:icons
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to deploy.

### Preview Production Build

```bash
npm run preview
```

## PWA Installation

### Android
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home screen"
4. Alternatively, use the custom install prompt that appears at the bottom of the screen

### iOS
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"

### Desktop
1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click to install

## PWA Testing

### Testing with Lighthouse

To verify the PWA implementation meets all requirements, run a Lighthouse audit:

1. **Using Chrome DevTools:**
   ```bash
   # Start the preview server
   npm run preview
   ```
   - Open Chrome and navigate to `http://localhost:4173`
   - Open DevTools (F12 or Cmd+Option+I)
   - Go to the "Lighthouse" tab
   - Select "Progressive Web App" category
   - Click "Analyze page load"
   - Verify score is 100 with all audits passing

2. **Using Lighthouse CLI:**
   ```bash
   # Install Lighthouse globally (if not already installed)
   npm install -g lighthouse

   # Run the preview server
   npm run preview

   # In another terminal, run Lighthouse
   lighthouse http://localhost:4173 --only-categories=pwa --view
   ```

### Manual Testing Checklist

#### Service Worker
- [ ] Service worker registers successfully (check DevTools > Application > Service Workers)
- [ ] App works offline (go offline in DevTools Network tab, refresh page)
- [ ] Static assets are cached (check Cache Storage in DevTools)
- [ ] Google Fonts are cached after first load

#### Web App Manifest
- [ ] Manifest loads correctly (DevTools > Application > Manifest)
- [ ] All required properties are present (name, short_name, icons, display, start_url)
- [ ] Icons display correctly in different sizes
- [ ] Theme color matches app design (#4F46E5)

#### Install Prompt
- [ ] Custom install prompt appears on first visit (if browser supports PWA installation)
- [ ] Dismiss button hides the prompt
- [ ] Prompt doesn't reappear for 7 days after dismissal
- [ ] Install button triggers native installation
- [ ] Browser's native install prompt is properly handled

#### Offline Functionality
- [ ] App loads when offline
- [ ] Shopping list items persist offline (stored in IndexedDB)
- [ ] Budget settings are available offline
- [ ] All UI interactions work offline
- [ ] Data syncs when connection is restored

#### Responsive Design
- [ ] App is fully responsive on mobile (320px - 768px)
- [ ] Touch targets are at least 48x48px
- [ ] Text is readable without zooming
- [ ] App works in portrait and landscape orientations
- [ ] No horizontal scrolling on mobile devices

#### Android-Specific Testing
- [ ] Install app from Chrome on Android device
- [ ] App opens in standalone mode (no browser UI)
- [ ] Status bar color matches theme color
- [ ] App appears in app drawer and home screen
- [ ] App can be uninstalled like a native app
- [ ] Back button navigation works correctly

### Testing on Different Devices

**Android Devices:**
- Chrome 90+ on Android 8.0+
- Samsung Internet Browser
- Microsoft Edge on Android

**iOS Devices (Limited PWA Support):**
- Safari on iOS 14+
- Note: Some PWA features are limited on iOS

**Desktop:**
- Chrome/Edge/Brave on Windows/Mac/Linux
- Test standalone window mode

### Troubleshooting

**Install prompt doesn't appear:**
- Ensure the app is served over HTTPS (required for service worker)
- Check if the app was already installed
- Clear browser cache and site data
- Verify manifest.json is valid

**Offline mode not working:**
- Check service worker registration in DevTools
- Verify service worker is activated
- Check Cache Storage for cached assets
- Review console for service worker errors

**HTTPS Requirement:**
- PWA requires HTTPS in production
- localhost is exempt from HTTPS requirement
- Use services like Netlify, Vercel, or GitHub Pages for HTTPS deployment

## Development

### Project Structure

```
src/
├── components/        # React components
│   ├── BudgetHeader.tsx
│   └── BudgetHeader.css
├── pages/            # Route pages
│   ├── Home.tsx
│   └── Home.css
├── utils/            # Utilities
│   └── db.ts        # IndexedDB wrapper
├── App.tsx          # Main app component
├── main.tsx         # Entry point with SW registration
└── index.css        # Global styles
```

### Linting

```bash
npm run lint
```

## Offline Functionality

The app uses a service worker with workbox to provide:
- Offline page loading
- Asset caching (JS, CSS, images, fonts)
- Runtime caching for Google Fonts
- Background sync for data updates

All shopping list data is stored locally in IndexedDB and persists across sessions.

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers with PWA support

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
