# API Documentation UI

A React-based frontend for the API documentation tool. This replaces the vanilla HTML/JS implementation with a modern React setup for better development experience and maintainability.

## Features

- **Modern React Architecture**: Uses React 18 with functional components and hooks
- **State Management**: Context API with useReducer for global state
- **Build System**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first styling
- **Minimal Dependencies**: Only essential packages to keep the bundle small
- **Development Proxy**: Built-in proxy to your backend API during development
- **Resizable Sidebar**: Drag the right edge to resize (200px - 600px range)
- **Auto Edit Mode**: Automatically enables editing when running on localhost
- **Debug Panel**: Built-in debugging tools for API connectivity issues
- **Keyboard Shortcuts**: Full keyboard navigation support

## Setup

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure your backend proxy** (optional):
   Edit `vite.config.js` and update the proxy target to match your backend port:
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8080', // Change this to your backend port
         changeOrigin: true
       }
     }
   }
   ```

## Development

### Start Development Server

```bash
npm run dev
```

This will:

- Start the Vite dev server on `http://localhost:3000`
- Enable hot module reloading
- Proxy API calls to your backend server (default: `localhost:8080`)
- Provide fast refresh for React components

**🚨 Important**: Make sure your backend is running before starting the dev server!

### Configure Backend Proxy

Edit `vite.config.js` and update the proxy target to match your backend port:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080', // Change this to your backend port
      changeOrigin: true
    }
  }
}
```

### Debug API Issues

If you're seeing 404 errors:

1. **Check the Debug Panel**: Click the 🐛 Debug button (bottom right) and test API connectivity
2. **Verify Backend**: Ensure your backend is running and accessible
3. **Check Console**: Look for API call logs in browser DevTools
4. **Read Troubleshooting**: See `TROUBLESHOOTING.md` for detailed solutions

### Build for Production

```bash
npm run build
```

This will:

- Create an optimized production build
- Output files to the `public/` directory
- Generate `app.js` and `style.css` files that can be served by your backend

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Sidebar.jsx     # Navigation sidebar
│   ├── Header.jsx      # Page header
│   ├── MainContent.jsx # Main content router
│   ├── WelcomeView.jsx # Welcome/landing page
│   ├── EndpointView.jsx # Endpoint detail view
│   ├── LoadingView.jsx # Loading spinner
│   ├── Modal.jsx       # Modal dialog
│   ├── ToastContainer.jsx # Toast notifications
│   ├── ParametersSection.jsx # Parameters editor
│   ├── ResponsesSection.jsx # Responses editor
│   └── TestEndpointModal.jsx # API testing modal
├── utils/
│   └── api.js          # API helper functions
├── App.jsx             # Main app component with context
├── main.jsx            # React entry point
└── index.css           # Global styles
```

## Integration with Backend

The built files are designed to integrate seamlessly with your existing backend:

- **Output**: Files are built to the `public/` directory
- **Naming**:
  - Main JS: `app.js` (replaces your existing `app.js`)
  - Styles: `style.css` (replaces your existing `style.css`)
  - HTML: Your existing `index.html` can remain mostly the same

### Backend Integration Steps

1. **Build the React app**:

   ```bash
   npm run build
   ```

2. **Update your existing `index.html`**:
   Replace the script and CSS links:

   ```html
   <!-- Remove old script tag -->
   <!-- <script src="app.js"></script> -->

   <!-- Add new script tag -->
   <script type="module" src="app.js"></script>
   ```

3. **Remove old files**: You can remove the old `app.js` and `style.css` from your backend's public folder

## Key Differences from Vanilla Implementation

### State Management

- **Before**: Global variables and manual DOM manipulation
- **After**: React Context API with useReducer for predictable state updates

### Component Architecture

- **Before**: Monolithic JavaScript with function-based organization
- **After**: Modular React components with clear separation of concerns

### Styling

- **Before**: Global CSS with manual class management
- **After**: Tailwind CSS with component-scoped styling

### Development Experience

- **Before**: Manual browser refresh and debugging
- **After**: Hot module reloading, React DevTools, and modern debugging

## Development Tips

### Adding New Components

1. Create component in `src/components/`
2. Export from the component file
3. Import and use in parent component
4. Use the `useApp()` hook to access global state

### State Updates

Use the actions from the app context:

```javascript
const { state, actions } = useApp();

// Update state
actions.setCurrentEndpoint(endpoint);
actions.addToast({ message: "Success!", type: "success" });
```

### API Calls

Use the `apiCall` utility:

```javascript
import { apiCall } from "../utils/api";

const result = await apiCall("/api/endpoints", {
  method: "POST",
  body: JSON.stringify(data),
});
```

## Build Configuration

The build is configured to:

- Output modern ES modules for better performance
- Generate source maps for debugging
- Optimize assets and chunks
- Maintain compatibility with your existing backend serving

## Troubleshooting

### Build Issues

- Ensure Node.js version is 16+
- Clear node_modules and reinstall if needed
- Check for TypeScript errors (basic TypeScript support included)

### Development Server Issues

- Verify backend is running on configured proxy port
- Check CORS settings if API calls fail
- Ensure no conflicting processes on port 3000

### Production Issues

- Verify built files are correctly served by backend
- Check browser console for module loading errors
- Ensure proper MIME types for `.js` files (should be `text/javascript` or `application/javascript`)

## Performance

The React build includes:

- **Tree shaking**: Unused code is eliminated
- **Code splitting**: Automatic chunk splitting for optimal loading
- **Asset optimization**: CSS and JS are minified and optimized
- **Modern syntax**: Targets modern browsers for smaller bundles

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

For broader support, additional Babel configuration may be needed.
