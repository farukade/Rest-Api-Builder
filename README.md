# REST API Builder

Express middleware for creating beautiful API documentation and testing interfaces. No setup required - just add it to your Express app!

## Installation

```bash
npm install rest-api-documenter
```

## Quick Start

```javascript
const express = require("express");
const restApiBuilder = require("rest-api-documenter");

const app = express();

// Add REST API Builder middleware
app.use(
  "/api-docs",
  restApiBuilder({
    name: "My API",
    description: "API documentation and testing",
    baseUrl: "https://api.myproject.com",
  })
);

// Your existing API routes
app.get("/api/users", (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
  console.log("API Docs: http://localhost:3000/api-docs");
});
```

## Configuration Options

| Option              | Type    | Default                                   | Description                     |
| ------------------- | ------- | ----------------------------------------- | ------------------------------- |
| `name`              | string  | "API Documentation"                       | Project name                    |
| `description`       | string  | "API documentation and testing interface" | Project description             |
| `version`           | string  | "1.0.0"                                   | API version                     |
| `author`            | string  | "API Team"                                | Author name                     |
| `baseUrl`           | string  | "http://localhost:3000"                   | Base API URL for testing        |
| `path`              | string  | "/rest-builder"                           | Mount path (auto-detected)      |
| `allowExternalEdit` | boolean | false                                     | Allow editing from external IPs |
| `theme`             | string  | "dark"                                    | UI theme                        |
| `primaryColor`      | string  | "#6B7280"                                 | Primary color                   |
| `dataDir`           | string  | "./api-docs"                              | Data storage directory          |

## Advanced Usage

```javascript
const express = require("express");
const restApiBuilder = require("rest-api-documenter");

const app = express();

// Advanced configuration
app.use(
  "/docs",
  restApiBuilder({
    name: "Advanced API",
    description: "Full featured API documentation",
    version: "2.0.0",
    author: "Development Team",
    baseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    allowExternalEdit: process.env.NODE_ENV === "development",
    dataDir: "./custom-api-docs",
    theme: "dark",
    primaryColor: "#3B82F6",
  })
);

app.listen(3000);
```

## Features

- 🚀 **Zero Configuration** - Works out of the box
- 📝 **Visual Editor** - Create and edit API endpoints with a beautiful UI
- 🧪 **Built-in Testing** - Test your APIs directly from the documentation
- 📁 **Organized Structure** - Group endpoints in folders
- 🔒 **Smart Permissions** - Edit mode on localhost, read-only elsewhere
- 🎨 **Customizable** - Themes and colors
- 📱 **Responsive** - Works on all devices
- ⚡ **Fast** - No database required, uses JSON files

## File Structure

The middleware creates an `api-docs` directory (or custom `dataDir`) with this structure:

```
api-docs/
├── endpoints/
│   ├── users/
│   │   ├── get-users.json
│   │   └── create-user.json
│   └── auth/
│       ├── login.json
│       └── logout.json
└── sockets/
    └── (WebSocket documentation - future feature)
```

## Demo

Run a demo server to see REST API Builder in action:

```bash
npx rest-api-documenter demo
```

Then visit: http://localhost:3000/api-docs

## CLI Commands

```bash
# Show usage examples
npx rest-api-documenter usage

# Run demo server
npx rest-api-documenter demo --port 3000 --path /docs
```

## Examples

### Basic Integration

```javascript
const express = require("express");
const restApiBuilder = require("rest-api-documenter");

const app = express();

// Mount at /api-docs
app.use("/api-docs", restApiBuilder());

app.listen(3000);
```

### Multiple Documentation Sites

```javascript
const app = express();

// Public API docs
app.use(
  "/docs",
  restApiBuilder({
    name: "Public API",
    allowExternalEdit: false,
  })
);

// Internal API docs
app.use(
  "/internal-docs",
  restApiBuilder({
    name: "Internal API",
    allowExternalEdit: true,
    dataDir: "./internal-api-docs",
  })
);
```

### With Authentication

```javascript
const app = express();

// Protect with authentication middleware
app.use(
  "/admin/api-docs",
  authMiddleware,
  restApiBuilder({
    name: "Admin API",
    allowExternalEdit: true,
  })
);
```

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## License

MIT

## Contributing

Pull requests welcome! Please read the contributing guidelines first.
