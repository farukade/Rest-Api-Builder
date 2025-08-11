# REST API Builder 📚

> A simple, file-based REST API documentation builder with built-in testing capabilities. Create beautiful, interactive API documentation that works offline and requires no database.

[![npm version](https://badge.fury.io/js/rest-api-builder.svg)](https://www.npmjs.com/package/rest-api-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Why REST API Builder?

- 🏠 **Localhost Editing** - Full editing capabilities on localhost, view-only elsewhere for security
- 📁 **File-Based** - Simple JSON files, no database setup required
- 🎨 **Beautiful Interface** - Dark theme with clean, modern design
- 🧪 **Built-in Testing** - Test your APIs directly from the documentation
- 📤 **Export/Import** - OpenAPI, Postman collection support
- 🚀 **Zero Setup** - Works immediately after installation
- 🔒 **Secure by Default** - Edit-only on localhost, view-only for external access

## 🚀 Quick Start (2 minutes)

```bash
# 1. Install globally
npm install -g rest-api-builder

# 2. Navigate to your project
cd my-api-project

# 3. Initialize
rest-api-builder init

# 4. Start documenting
rest-api-builder start

# 5. Open your browser
# Go to: http://localhost:3000/api-docs
```

That's it! You now have a beautiful API documentation interface running locally.

## 📋 Prerequisites

- **Node.js** 14.0.0 or higher
- **npm** 6.0.0 or higher

Check your versions:

```bash
node --version
npm --version
```

## 🛠️ Installation

### Option 1: Global Installation (Recommended)

```bash
# Install globally to use anywhere
npm install -g rest-api-builder

# Verify installation
rest-api-builder --version
```

### Option 2: Local Project Installation

```bash
# Install in your project
npm install rest-api-builder

# Use with npx
npx rest-api-builder init
npx rest-api-builder start
```

## 🎯 Getting Started

### Step 1: Initialize Your Project

Navigate to your project directory and initialize:

```bash
cd my-api-project
rest-api-builder init
```

**With custom options:**

```bash
rest-api-builder init \
  --name "My Amazing API" \
  --description "The best API documentation ever" \
  --version "1.0.0" \
  --author "Your Name" \
  --base-url "https://api.myproject.com"
```

This creates:

- `rest-api-builder.config.js` - Your project configuration
- `api-docs/` folder - Where all your documentation is stored

### Step 2: Start the Documentation Server

```bash
rest-api-builder start
```

**With custom options:**

```bash
rest-api-builder start --port 4000 --path /docs
```

### Step 3: Open Your Browser

Go to: `http://localhost:3000/api-docs`

You'll see a beautiful interface where you can:

- ✅ Create folders to organize your endpoints
- ✅ Add API endpoints with full documentation
- ✅ Test your APIs directly in the browser
- ✅ Edit everything with a user-friendly interface

## 📁 What Gets Created

After initialization, your project will have:

```
my-api-project/
├── rest-api-builder.config.js    # Main configuration
├── api-docs/                     # Documentation data
│   ├── endpoints/                # API endpoint definitions
│   │   └── get-users.json        # Sample endpoint (created automatically)
│   └── sockets/                  # WebSocket endpoints (future use)
├── package.json                  # Your existing package.json
└── ... (your other project files)
```

## ⚙️ Configuration

### Basic Configuration

Edit `rest-api-builder.config.js`:

```javascript
module.exports = {
  // Project Information
  name: "My API Documentation",
  description: "Complete API documentation for my project",
  version: "1.0.0",
  author: "Your Name",

  // API Settings
  baseUrl: "https://api.myproject.com", // Your actual API URL

  // Server Settings
  port: 3000, // Port for documentation server
  path: "/api-docs", // URL path (http://localhost:3000/api-docs)

  // Security
  allowExternalEdit: false, // Keep false for security

  // Appearance
  theme: "dark",
  primaryColor: "#6B7280",
};
```

### Configuration Options

| Option              | Type    | Default                   | Description                              |
| ------------------- | ------- | ------------------------- | ---------------------------------------- |
| `name`              | string  | "My API Documentation"    | Project name shown in interface          |
| `description`       | string  | "API documentation..."    | Project description                      |
| `version`           | string  | "1.0.0"                   | API version                              |
| `author`            | string  | "API Team"                | Author name                              |
| `baseUrl`           | string  | "https://api.example.com" | Your API's base URL                      |
| `port`              | number  | 3000                      | Documentation server port                |
| `path`              | string  | "/api-docs"               | URL path for documentation               |
| `allowExternalEdit` | boolean | false                     | Allow editing from external IPs          |
| `theme`             | string  | "dark"                    | UI theme (only dark supported currently) |
| `primaryColor`      | string  | "#6B7280"                 | Primary color for UI                     |

## 📝 Creating Your First API Endpoint

### Method 1: Using the Web Interface (Recommended)

1. **Start the server:** `rest-api-builder start`
2. **Open browser:** `http://localhost:3000/api-docs`
3. **Click "New Endpoint"** (+ button in sidebar)
4. **Fill out the form:**
   - Name: "Get Users"
   - Method: GET
   - Path: /users
   - Description: "Retrieve a list of users"
   - Filename: "get-users"
5. **Click "Create Endpoint"**
6. **Click on the new endpoint** to edit details
7. **Add parameters, responses, examples**
8. **Save changes**

### Method 2: Manual File Creation

Create a file in `api-docs/endpoints/get-users.json`:

```json
{
  "id": "get-users-123",
  "name": "Get Users",
  "method": "GET",
  "path": "/users",
  "description": "Retrieve a paginated list of users",
  "tags": ["users"],
  "parameters": {
    "query": [
      {
        "name": "page",
        "type": "integer",
        "description": "Page number",
        "required": false,
        "example": 1
      },
      {
        "name": "limit",
        "type": "integer",
        "description": "Users per page",
        "required": false,
        "example": 20
      }
    ],
    "path": [],
    "headers": {
      "Authorization": "Bearer {your-token}"
    }
  },
  "requestBody": {
    "required": false,
    "contentType": "application/json",
    "schema": {},
    "example": {}
  },
  "responses": {
    "200": {
      "description": "Users retrieved successfully",
      "contentType": "application/json",
      "schema": {
        "type": "object",
        "properties": {
          "users": { "type": "array" },
          "total": { "type": "integer" }
        }
      },
      "example": {
        "users": [
          {
            "id": "user_123",
            "name": "John Doe",
            "email": "john@example.com"
          }
        ],
        "total": 1
      }
    },
    "401": {
      "description": "Unauthorized",
      "contentType": "application/json",
      "schema": {
        "type": "object",
        "properties": {
          "error": { "type": "string" }
        }
      },
      "example": {
        "error": "Invalid authentication token"
      }
    }
  },
  "examples": {
    "request": {
      "headers": {
        "Authorization": "Bearer abc123"
      },
      "query": {
        "page": 1,
        "limit": 10
      }
    },
    "response": {
      "users": [{ "id": "user_123", "name": "John Doe" }],
      "total": 1
    }
  },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

## 🗂️ Organizing with Folders

### Creating Folders

**Via Web Interface:**

1. Click the folder "+" button in sidebar
2. Enter folder name (e.g., "users", "auth", "products")
3. Click "Create Folder"

**Via File System:**
Just create directories in `api-docs/endpoints/`:

```bash
mkdir api-docs/endpoints/users
mkdir api-docs/endpoints/auth
mkdir api-docs/endpoints/products
```

### Folder Structure Example

```
api-docs/endpoints/
├── users/
│   ├── get-users.json
│   ├── create-user.json
│   ├── update-user.json
│   └── delete-user.json
├── auth/
│   ├── login.json
│   ├── logout.json
│   └── refresh-token.json
└── products/
    ├── list-products.json
    └── get-product-details.json
```

## 🧪 Testing Your APIs

### Built-in API Tester

1. **Open any endpoint** in the web interface
2. **Click "Test API"** button
3. **Configure the test:**
   - URL (auto-filled from your baseUrl + endpoint path)
   - Headers (auto-filled from endpoint definition)
   - Request body (for POST/PUT/PATCH)
4. **Click "Send Request"**
5. **View the response** with status code, timing, and data

### Testing Features

- ✅ **Real HTTP requests** to your actual API
- ✅ **Auto-filled forms** from endpoint definitions
- ✅ **Response timing** and status codes
- ✅ **JSON formatting** for easy reading
- ✅ **Error handling** for failed requests
- ✅ **Copy response** to clipboard

## 📤 Export & Import

### Export Your Documentation

```bash
# Export to OpenAPI/Swagger format
rest-api-builder export --format openapi --output api-spec.json

# Export to Postman collection
rest-api-builder export --format postman --output collection.json

# Export everything as JSON
rest-api-builder export --format json --output backup.json
```

### Import from External Sources

```bash
# Import from OpenAPI specification
rest-api-builder import --format openapi --input swagger.json

# Import from Postman collection
rest-api-builder import --format postman --input collection.json

# Merge with existing (don't overwrite)
rest-api-builder import --format openapi --input swagger.json --merge
```

## 🔧 Command Line Reference

### `rest-api-builder init`

Initialize a new documentation project.

```bash
rest-api-builder init [options]

Options:
  -n, --name <name>           Project name
  -d, --description <desc>    Project description
  -v, --version <version>     API version
  -a, --author <author>       Author name
  -u, --base-url <url>        Base API URL
  -p, --port <port>           Server port (default: 3000)
  --path <path>               Documentation path (default: /api-docs)
  --force                     Overwrite existing configuration
```

**Examples:**

```bash
# Basic initialization
rest-api-builder init

# Custom initialization
rest-api-builder init --name "E-commerce API" --base-url "https://api.shop.com"

# Force overwrite existing config
rest-api-builder init --force
```

### `rest-api-builder start`

Start the documentation server.

```bash
rest-api-builder start [options]

Options:
  -p, --port <port>          Port to run on
  --path <path>              URL path for documentation
  --allow-external-edit      Allow editing from external connections
  --open                     Open browser automatically
```

**Examples:**

```bash
# Start with defaults
rest-api-builder start

# Custom port and path
rest-api-builder start --port 4000 --path /docs

# Allow external editing (be careful!)
rest-api-builder start --allow-external-edit

# Auto-open browser
rest-api-builder start --open
```

### `rest-api-builder export`

Export documentation to various formats.

```bash
rest-api-builder export [options]

Options:
  -f, --format <format>      Export format (json, openapi, postman)
  -o, --output <file>        Output file path
```

### `rest-api-builder import`

Import documentation from external sources.

```bash
rest-api-builder import [options]

Options:
  -f, --format <format>      Import format (openapi, postman)
  -i, --input <file>         Input file path (required)
  --merge                    Merge with existing documentation
```

### `rest-api-builder config`

Show or update configuration.

```bash
rest-api-builder config [options]

Options:
  --get <key>               Get configuration value
  --set <key=value>         Set configuration value
```

**Examples:**

```bash
# Show all configuration
rest-api-builder config

# Get specific value
rest-api-builder config --get baseUrl

# Set values
rest-api-builder config --set name="New API Name" --set version="2.0.0"
```

### `rest-api-builder validate`

Validate all endpoint definitions.

```bash
rest-api-builder validate [options]

Options:
  --fix                     Attempt to fix validation errors
```

## 🚀 Real-World Examples

### Example 1: E-commerce API

```bash
# Setup
mkdir ecommerce-api && cd ecommerce-api
rest-api-builder init \
  --name "E-commerce API" \
  --description "Complete e-commerce platform API" \
  --base-url "https://api.myshop.com" \
  --version "2.0.0"

# Start documenting
rest-api-builder start
```

Create these endpoints via the web interface:

- `GET /products` - List products
- `GET /products/{id}` - Get product details
- `POST /cart/items` - Add to cart
- `POST /orders` - Create order
- `GET /orders/{id}` - Get order status

### Example 2: SaaS Platform API

```bash
# Setup
mkdir saas-api && cd saas-api
rest-api-builder init \
  --name "SaaS Platform API" \
  --base-url "https://api.myplatform.com" \
  --author "Platform Team"
```

Organize with folders:

- `auth/` - Authentication endpoints
- `users/` - User management
- `billing/` - Subscription and billing
- `analytics/` - Usage analytics
- `webhooks/` - Webhook endpoints

### Example 3: Team Collaboration

```bash
# Developer 1 - Initial setup
rest-api-builder init --name "Team API"
rest-api-builder start

# Create endpoints, commit to Git
git add api-docs/ rest-api-builder.config.js
git commit -m "Add API documentation"
git push

# Developer 2 - Continue documentation
git pull
rest-api-builder start
# Add more endpoints, commit changes
```

## 🔒 Security Considerations

### Localhost-Only Editing

By default, REST API Builder only allows editing when accessed from localhost. This means:

- ✅ **Local development** - Full editing capabilities
- ✅ **External viewing** - Read-only access for sharing
- ✅ **Production safety** - Can't accidentally modify docs remotely

### External Access

If you need to allow external editing (e.g., for remote team members):

```bash
# Temporary external access
rest-api-builder start --allow-external-edit

# Permanent external access
rest-api-builder config --set allowExternalEdit=true
```

**⚠️ Security Warning:** Only enable external editing if you trust all users who can access the server.

### Production Deployment

For production documentation:

1. **Build static version:**

```bash
rest-api-builder export --format json
# Deploy the api-docs/ folder to your web server
```

2. **Run read-only server:**

```bash
# Ensure allowExternalEdit is false
rest-api-builder config --set allowExternalEdit=false
rest-api-builder start --port 80
```

## 🐛 Troubleshooting

### Common Issues

**❌ "Not initialized" error**

```bash
# Solution: Run init first
rest-api-builder init
```

**❌ Port already in use**

```bash
# Solution: Use different port
rest-api-builder start --port 4000
```

**❌ Cannot edit endpoints (view-only mode)**

- Check if you're accessing from localhost
- Or enable external editing: `--allow-external-edit`

**❌ Endpoints not showing in interface**

- Check that JSON files are valid
- Run validation: `rest-api-builder validate --fix`

**❌ API tests failing**

- Verify your `baseUrl` in configuration
- Check API server is running
- Verify authentication tokens/headers

### Debug Mode

Enable debug logging:

```bash
DEBUG=rest-api-builder:* rest-api-builder start
```

### Reset Everything

To start fresh:

```bash
# Backup first (optional)
cp -r api-docs api-docs-backup

# Remove all data
rm -rf api-docs rest-api-builder.config.js

# Re-initialize
rest-api-builder init
```

## 🎯 Best Practices

### 1. **Organize by Feature**

```
api-docs/endpoints/
├── auth/          # Authentication
├── users/         # User management
├── products/      # Product catalog
└── orders/        # Order processing
```

### 2. **Consistent Naming**

- Use kebab-case for filenames: `get-user-profile.json`
- Use descriptive names: `create-user-account.json` not `post-user.json`

### 3. **Complete Documentation**

- Always add descriptions
- Include example requests and responses
- Document all parameters
- Add error responses (400, 401, 404, 500)

### 4. **Version Control**

```bash
# Always commit documentation changes
git add api-docs/ rest-api-builder.config.js
git commit -m "Update API documentation"
```

### 5. **Team Workflow**

1. **Local editing** - Use localhost interface for safety
2. **Review changes** - Use Git diffs to review documentation changes
3. **Deploy documentation** - Export to production after review

### 6. **Testing Integration**

- Keep `baseUrl` pointing to your development API
- Test endpoints regularly to ensure docs stay accurate
- Use the built-in tester for quick verification

## 📚 Advanced Features

### Environment-Specific Configs

Create multiple config files:

```javascript
// rest-api-builder.config.js
const env = process.env.NODE_ENV || "development";

const configs = {
  development: {
    baseUrl: "http://localhost:3001",
    allowExternalEdit: true,
  },
  staging: {
    baseUrl: "https://staging-api.example.com",
    allowExternalEdit: true,
  },
  production: {
    baseUrl: "https://api.example.com",
    allowExternalEdit: false,
  },
};

module.exports = {
  name: "Multi-Environment API",
  description: "API with multiple environments",
  version: "1.0.0",
  port: 3000,
  path: "/api-docs",
  ...configs[env],
};
```

### CI/CD Integration

```yaml
# .github/workflows/docs.yml
name: Deploy API Documentation

on:
  push:
    paths: ["api-docs/**", "rest-api-builder.config.js"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install REST API Builder
        run: npm install -g rest-api-builder

      - name: Export documentation
        run: rest-api-builder export --format openapi --output openapi.json

      - name: Deploy to S3
        run: aws s3 sync . s3://my-docs-bucket --exclude "*" --include "openapi.json"
```

## 🤝 Getting Help

### Documentation

- [GitHub Repository](https://github.com/yourusername/rest-api-builder)
- [Issue Tracker](https://github.com/yourusername/rest-api-builder/issues)
- [Examples](https://github.com/yourusername/rest-api-builder/tree/main/examples)

### Community

- Create an issue for bugs or feature requests
- Discussions for questions and help
- Pull requests welcome for contributions

### Support

- Check existing issues first
- Provide clear reproduction steps
- Include your configuration and system info

---

**🎉 You're all set!** Start documenting your API and enjoy the beautiful, interactive documentation interface that REST API Builder provides.

**Questions?** Open an issue on GitHub or check our examples repository for more detailed use cases.
