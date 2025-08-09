const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

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

async function startServer(config) {
  const app = express();
  const API_DOCS_DIR = path.join(process.cwd(), "api-docs");
  const ENDPOINTS_DIR = path.join(API_DOCS_DIR, "endpoints");
  const SOCKETS_DIR = path.join(API_DOCS_DIR, "sockets");

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.static(path.join(__dirname, "../public")));

  // Ensure directories exist
  ensureDirectoryExists(ENDPOINTS_DIR);
  ensureDirectoryExists(SOCKETS_DIR);

  // API Routes

  // Get configuration
  app.get("/api/config", (req, res) => {
    res.json({
      success: true,
      data: { ...config, canEdit: canEdit(req, config) },
    });
  });

  // Get all endpoints
  app.get("/api/endpoints", (req, res) => {
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
  app.get("/api/endpoints/:id", (req, res) => {
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
  app.post("/api/endpoints", (req, res) => {
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
  app.put("/api/endpoints/:id", (req, res) => {
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
  app.delete("/api/endpoints/:id", (req, res) => {
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
  app.post("/api/folders", (req, res) => {
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
  app.get("/api/structure", (req, res) => {
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
  app.post("/api/test-endpoint", async (req, res) => {
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
  app.get(config.path, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  app.get(`${config.path}/*`, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  // Health check
  app.get("/health", (req, res) => {
    res.json({
      success: true,
      message: "REST API Builder is running",
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

  // Start server
  app.listen(config.port, () => {
    console.log(chalk.green("🚀 REST API Builder is running!"));
    console.log(chalk.blue(`📖 ${config.name} v${config.version}`));
    console.log(
      chalk.gray(
        `🔗 Documentation: http://localhost:${config.port}${config.path}`
      )
    );
    console.log(chalk.gray(`👤 Author: ${config.author}`));
    console.log(chalk.gray(`📁 Docs Directory: ${API_DOCS_DIR}`));
    console.log(
      chalk.gray(
        `✏️  Edit Mode: ${
          config.allowExternalEdit ? "Enabled for all" : "Localhost only"
        }`
      )
    );
    console.log("");
    console.log(chalk.yellow("Press Ctrl+C to stop the server"));
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log(chalk.blue("\n🛑 Shutting down gracefully..."));
    process.exit(0);
  });
}

module.exports = { startServer };
