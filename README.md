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

### iOS
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"

### Desktop
1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click to install

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
