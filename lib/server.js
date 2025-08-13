const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Utility functions
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJsonFile(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (error) {
    console.error("Error reading file:", filePath, error.message);
  }
  return defaultValue;
}

function writeJsonFile(filePath, data) {
  try {
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing file:", filePath, error.message);
    return false;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isLocalhost(req) {
  const host = req.get("host") || "";
  return host.includes("localhost") || host.includes("127.0.0.1");
}

function canEdit(req, config) {
  return isLocalhost(req) || config.allowExternalEdit;
}

function createMiddleware(config) {
  const router = express.Router();
  const API_DOCS_DIR = path.resolve(config.dataDir);
  const ENDPOINTS_DIR = path.join(API_DOCS_DIR, "endpoints");
  const SOCKETS_DIR = path.join(API_DOCS_DIR, "sockets");

  // Initialize directories and sample data
  function initializeProject() {
    ensureDirectoryExists(ENDPOINTS_DIR);
    ensureDirectoryExists(SOCKETS_DIR);

    // Create sample endpoint if none exist
    const sampleEndpointFile = path.join(ENDPOINTS_DIR, "get-users.json");
    if (!fs.existsSync(sampleEndpointFile)) {
      const sampleEndpoint = {
        id: generateId(),
        name: "Get Users",
        method: "GET",
        path: "/api/users",
        description: "Retrieve a list of all users",
        tags: ["users"],
        parameters: {
          query: [
            {
              name: "limit",
              type: "integer",
              description: "Number of users to return",
              required: false,
              example: 10,
            },
            {
              name: "page",
              type: "integer",
              description: "Page number for pagination",
              required: false,
              example: 1,
            },
          ],
          path: [],
          headers: {
            Authorization: "Bearer your-token",
          },
        },
        requestBody: {
          required: false,
          contentType: "application/json",
          schema: {},
          example: {},
        },
        responses: {
          200: {
            description: "Successful response",
            contentType: "application/json",
            schema: {
              type: "object",
              properties: {
                users: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      email: { type: "string" },
                    },
                  },
                },
                total: { type: "integer" },
                page: { type: "integer" },
              },
            },
            example: {
              users: [
                { id: "1", name: "John Doe", email: "john@example.com" },
                { id: "2", name: "Jane Smith", email: "jane@example.com" },
              ],
              total: 50,
              page: 1,
            },
          },
          401: {
            description: "Unauthorized",
            contentType: "application/json",
            schema: {
              type: "object",
              properties: {
                error: { type: "string" },
                message: { type: "string" },
              },
            },
            example: {
              error: "Unauthorized",
              message: "Invalid or missing authentication token",
            },
          },
        },
        examples: {
          request: {
            headers: {
              Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            query: {
              limit: 10,
              page: 1,
            },
          },
          response: {
            users: [{ id: "1", name: "John Doe", email: "john@example.com" }],
            total: 50,
            page: 1,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      writeJsonFile(sampleEndpointFile, sampleEndpoint);
    }
  }

  // Initialize project
  initializeProject();

  // Middleware
  router.use(cors());
  router.use(express.json({ limit: "10mb" }));

  // Serve static files with the correct base path
  router.use(express.static(path.join(__dirname, "../public")));

  // API Routes

  // Get configuration
  router.get("/api/config", (req, res) => {
    res.json({
      success: true,
      data: {
        ...config,
        canEdit: canEdit(req, config),
        mountPath: req.baseUrl || config.path,
      },
    });
  });

  // Get all endpoints
  router.get("/api/endpoints", (req, res) => {
    try {
      function getEndpointsFromDir(dirPath, folder = "") {
        const endpoints = [];

        if (!fs.existsSync(dirPath)) return endpoints;

        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            endpoints.push(
              ...getEndpointsFromDir(
                filePath,
                folder ? `${folder}/${file}` : file
              )
            );
          } else if (file.endsWith(".json")) {
            const endpoint = readJsonFile(filePath);
            if (endpoint.id) {
              endpoint.folder = folder;
              endpoint.filename = file.replace(".json", "");
              endpoints.push(endpoint);
            }
          }
        });

        return endpoints;
      }

      const endpoints = getEndpointsFromDir(ENDPOINTS_DIR);
      res.json({ success: true, data: endpoints });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get endpoint by ID
  router.get("/api/endpoints/:id", (req, res) => {
    try {
      const { id } = req.params;

      function findEndpointById(dirPath, targetId) {
        if (!fs.existsSync(dirPath)) return null;

        const files = fs.readdirSync(dirPath);

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            const result = findEndpointById(filePath, targetId);
            if (result) return result;
          } else if (file.endsWith(".json")) {
            const endpoint = readJsonFile(filePath);
            if (endpoint.id === targetId) {
              return { endpoint, filePath };
            }
          }
        }
        return null;
      }

      const result = findEndpointById(ENDPOINTS_DIR, id);
      if (!result) {
        return res
          .status(404)
          .json({ success: false, message: "Endpoint not found" });
      }

      res.json({ success: true, data: result.endpoint });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Create new endpoint
  router.post("/api/endpoints", (req, res) => {
    if (!canEdit(req, config)) {
      return res
        .status(403)
        .json({ success: false, message: "Edit access denied" });
    }

    try {
      const { folder = "", filename, ...endpointData } = req.body;

      if (!filename) {
        return res
          .status(400)
          .json({ success: false, message: "Filename is required" });
      }

      const endpointId = generateId();
      const endpoint = {
        id: endpointId,
        name: endpointData.name || "New Endpoint",
        method: endpointData.method || "GET",
        path: endpointData.path || "/endpoint",
        description: endpointData.description || "",
        tags: endpointData.tags || [],
        parameters: {
          query: [],
          path: [],
          headers: {},
        },
        requestBody: {
          required: false,
          contentType: "application/json",
          schema: {},
          example: {},
        },
        responses: {
          200: {
            description: "Success response",
            contentType: "application/json",
            schema: {},
            example: {},
          },
        },
        examples: {
          request: {},
          response: {},
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...endpointData,
      };

      const endpointDir = path.join(ENDPOINTS_DIR, folder);
      const endpointFile = path.join(endpointDir, `${filename}.json`);

      if (fs.existsSync(endpointFile)) {
        return res
          .status(400)
          .json({ success: false, message: "Endpoint file already exists" });
      }

      if (writeJsonFile(endpointFile, endpoint)) {
        res.status(201).json({ success: true, data: endpoint });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Failed to create endpoint" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Update endpoint
  router.put("/api/endpoints/:id", (req, res) => {
    if (!canEdit(req, config)) {
      return res
        .status(403)
        .json({ success: false, message: "Edit access denied" });
    }

    try {
      const { id } = req.params;
      const updateData = req.body;

      function findAndUpdateEndpoint(dirPath, targetId) {
        if (!fs.existsSync(dirPath)) return null;

        const files = fs.readdirSync(dirPath);

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            const result = findAndUpdateEndpoint(filePath, targetId);
            if (result) return result;
          } else if (file.endsWith(".json")) {
            const endpoint = readJsonFile(filePath);
            if (endpoint.id === targetId) {
              const updatedEndpoint = {
                ...endpoint,
                ...updateData,
                id: targetId, // Ensure ID doesn't change
                updatedAt: new Date().toISOString(),
              };

              if (writeJsonFile(filePath, updatedEndpoint)) {
                return updatedEndpoint;
              }
            }
          }
        }
        return null;
      }

      const updatedEndpoint = findAndUpdateEndpoint(ENDPOINTS_DIR, id);
      if (!updatedEndpoint) {
        return res
          .status(404)
          .json({ success: false, message: "Endpoint not found" });
      }

      res.json({ success: true, data: updatedEndpoint });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Delete endpoint
  router.delete("/api/endpoints/:id", (req, res) => {
    if (!canEdit(req, config)) {
      return res
        .status(403)
        .json({ success: false, message: "Edit access denied" });
    }

    try {
      const { id } = req.params;

      function findAndDeleteEndpoint(dirPath, targetId) {
        if (!fs.existsSync(dirPath)) return false;

        const files = fs.readdirSync(dirPath);

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            if (findAndDeleteEndpoint(filePath, targetId)) return true;
          } else if (file.endsWith(".json")) {
            const endpoint = readJsonFile(filePath);
            if (endpoint.id === targetId) {
              fs.unlinkSync(filePath);
              return true;
            }
          }
        }
        return false;
      }

      const deleted = findAndDeleteEndpoint(ENDPOINTS_DIR, id);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Endpoint not found" });
      }

      res.json({ success: true, message: "Endpoint deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Create folder
  router.post("/api/folders", (req, res) => {
    if (!canEdit(req, config)) {
      return res
        .status(403)
        .json({ success: false, message: "Edit access denied" });
    }

    try {
      const { name, parent = "" } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Folder name is required" });
      }

      const folderPath = path.join(ENDPOINTS_DIR, parent, name);

      if (fs.existsSync(folderPath)) {
        return res
          .status(400)
          .json({ success: false, message: "Folder already exists" });
      }

      ensureDirectoryExists(folderPath);
      res
        .status(201)
        .json({ success: true, data: { name, parent, path: folderPath } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get folder structure
  router.get("/api/structure", (req, res) => {
    try {
      function buildStructure(dirPath, relativePath = "") {
        const items = [];

        if (!fs.existsSync(dirPath)) return items;

        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);
          const itemPath = relativePath ? `${relativePath}/${file}` : file;

          if (stat.isDirectory()) {
            items.push({
              type: "folder",
              name: file,
              path: itemPath,
              children: buildStructure(filePath, itemPath),
            });
          } else if (file.endsWith(".json")) {
            const endpoint = readJsonFile(filePath);
            items.push({
              type: "endpoint",
              name: file.replace(".json", ""),
              path: itemPath,
              data: endpoint,
            });
          }
        });

        return items.sort((a, b) => {
          if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      }

      const structure = buildStructure(ENDPOINTS_DIR);
      res.json({ success: true, data: structure });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Test API endpoint
  router.post("/api/test-endpoint", async (req, res) => {
    const { url, method, headers = {}, body } = req.body;

    try {
      const fetch = (await import("node-fetch")).default;
      const options = {
        method: method.toUpperCase(),
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        timeout: 30000,
      };

      if (method.toUpperCase() !== "GET" && body) {
        options.body = typeof body === "string" ? body : JSON.stringify(body);
      }

      const startTime = Date.now();
      const response = await fetch(url, options);
      const endTime = Date.now();

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      res.json({
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData,
          responseTime: endTime - startTime,
        },
      });
    } catch (error) {
      res.json({
        success: false,
        message: "Request failed",
        error: error.message,
      });
    }
  });

  // Serve the documentation interface
  router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  router.get("/*", (req, res) => {
    // Check if it's a static file request
    const staticExtensions = [
      ".js",
      ".css",
      ".html",
      ".png",
      ".jpg",
      ".svg",
      ".ico",
    ];
    const hasExtension = staticExtensions.some((ext) => req.path.endsWith(ext));

    if (hasExtension) {
      // Let the static middleware handle it
      res.status(404).send("File not found");
    } else {
      // Serve the main HTML for SPA routing
      res.sendFile(path.join(__dirname, "../public/index.html"));
    }
  });

  // Health check
  router.get("/health", (req, res) => {
    res.json({
      success: true,
      message: "API Docs Creator is running",
      data: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        config: {
          name: config.name,
          version: config.version,
          path: config.path,
        },
        canEdit: canEdit(req, config),
      },
    });
  });

  return router;
}

module.exports = { createMiddleware };
