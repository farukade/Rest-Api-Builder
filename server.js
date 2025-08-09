#!/usr/bin/env node

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || "/rest-builder";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Default directories
const API_DOCS_DIR = path.join(process.cwd(), "api-docs");
const PROJECTS_DIR = path.join(API_DOCS_DIR, "projects");
const CONFIG_FILE = path.join(API_DOCS_DIR, "config.json");

// Default configuration
const DEFAULT_CONFIG = {
  theme: "dark",
  primaryColor: "#6B7280",
  basePath: BASE_PATH,
  allowExternalEdit: false,
  currentProject: "default",
};

// Default project structure
const DEFAULT_PROJECT = {
  id: "default",
  name: "My API Project",
  description: "Default API documentation project",
  baseUrl: "https://api.example.com",
  version: "1.0.0",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default endpoint template
const DEFAULT_ENDPOINT = {
  id: "",
  name: "New Endpoint",
  method: "GET",
  path: "/endpoint",
  description: "Endpoint description",
  tags: [],
  parameters: {
    query: [],
    path: [],
    headers: {},
  },
  requestBody: {
    required: false,
    contentType: "application/json",
    schema: {},
  },
  responses: {
    200: {
      description: "Success response",
      contentType: "application/json",
      schema: {},
    },
  },
  examples: {
    request: {},
    response: {},
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default socket endpoint template
const DEFAULT_SOCKET = {
  id: "",
  name: "New Socket Event",
  event: "eventName",
  description: "Socket event description",
  tags: [],
  payload: {
    schema: {},
  },
  response: {
    schema: {},
  },
  examples: {
    payload: {},
    response: {},
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

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

function canEdit(req) {
  const config = readJsonFile(CONFIG_FILE, DEFAULT_CONFIG);
  return isLocalhost(req) || config.allowExternalEdit;
}

// Initialize directories and files
function initializeProject() {
  ensureDirectoryExists(API_DOCS_DIR);
  ensureDirectoryExists(PROJECTS_DIR);

  // Create default config if it doesn't exist
  if (!fs.existsSync(CONFIG_FILE)) {
    writeJsonFile(CONFIG_FILE, DEFAULT_CONFIG);
  }

  // Create default project if it doesn't exist
  const defaultProjectDir = path.join(PROJECTS_DIR, "default");
  const projectFile = path.join(defaultProjectDir, "project.json");

  if (!fs.existsSync(projectFile)) {
    ensureDirectoryExists(defaultProjectDir);
    ensureDirectoryExists(path.join(defaultProjectDir, "endpoints"));
    ensureDirectoryExists(path.join(defaultProjectDir, "sockets"));
    writeJsonFile(projectFile, DEFAULT_PROJECT);

    // Create a sample endpoint
    const sampleEndpoint = {
      ...DEFAULT_ENDPOINT,
      id: generateId(),
      name: "Get Users",
      path: "/users",
      description: "Retrieve a list of users",
    };
    writeJsonFile(
      path.join(defaultProjectDir, "endpoints", "get-users.json"),
      sampleEndpoint
    );
  }
}

// API Routes

// Get configuration
app.get("/api/config", (req, res) => {
  const config = readJsonFile(CONFIG_FILE, DEFAULT_CONFIG);
  res.json({
    success: true,
    data: { ...config, canEdit: canEdit(req) },
  });
});

// Update configuration
app.put("/api/config", (req, res) => {
  if (!canEdit(req)) {
    return res.status(403).json({
      success: false,
      message: "Edit access denied",
    });
  }

  const config = readJsonFile(CONFIG_FILE, DEFAULT_CONFIG);
  const updatedConfig = { ...config, ...req.body };

  if (writeJsonFile(CONFIG_FILE, updatedConfig)) {
    res.json({ success: true, data: updatedConfig });
  } else {
    res
      .status(500)
      .json({ success: false, message: "Failed to update config" });
  }
});

// Get all projects
app.get("/api/projects", (req, res) => {
  try {
    const projects = [];
    const projectDirs = fs.readdirSync(PROJECTS_DIR);

    projectDirs.forEach((dir) => {
      const projectFile = path.join(PROJECTS_DIR, dir, "project.json");
      const project = readJsonFile(projectFile);
      if (project.id) {
        projects.push(project);
      }
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get project details
app.get("/api/projects/:projectId", (req, res) => {
  const { projectId } = req.params;
  const projectFile = path.join(PROJECTS_DIR, projectId, "project.json");
  const project = readJsonFile(projectFile);

  if (!project.id) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found" });
  }

  res.json({ success: true, data: project });
});

// Create new project
app.post("/api/projects", (req, res) => {
  if (!canEdit(req)) {
    return res
      .status(403)
      .json({ success: false, message: "Edit access denied" });
  }

  const projectId = req.body.id || generateId();
  const project = {
    ...DEFAULT_PROJECT,
    ...req.body,
    id: projectId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const projectDir = path.join(PROJECTS_DIR, projectId);
  const projectFile = path.join(projectDir, "project.json");

  if (fs.existsSync(projectFile)) {
    return res
      .status(400)
      .json({ success: false, message: "Project already exists" });
  }

  ensureDirectoryExists(path.join(projectDir, "endpoints"));
  ensureDirectoryExists(path.join(projectDir, "sockets"));

  if (writeJsonFile(projectFile, project)) {
    res.status(201).json({ success: true, data: project });
  } else {
    res
      .status(500)
      .json({ success: false, message: "Failed to create project" });
  }
});

// Get project structure (folders and files)
app.get("/api/projects/:projectId/structure", (req, res) => {
  const { projectId } = req.params;
  const projectDir = path.join(PROJECTS_DIR, projectId);

  if (!fs.existsSync(projectDir)) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found" });
  }

  function buildTree(dirPath, relativePath = "") {
    const items = [];

    try {
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
            children: buildTree(filePath, itemPath),
          });
        } else if (file.endsWith(".json") && file !== "project.json") {
          const data = readJsonFile(filePath);
          items.push({
            type: "file",
            name: file.replace(".json", ""),
            path: itemPath,
            data: data,
          });
        }
      });
    } catch (error) {
      console.error("Error reading directory:", dirPath, error.message);
    }

    return items;
  }

  const structure = buildTree(projectDir);
  res.json({ success: true, data: structure });
});

// Get all endpoints for a project
app.get("/api/projects/:projectId/endpoints", (req, res) => {
  const { projectId } = req.params;
  const endpointsDir = path.join(PROJECTS_DIR, projectId, "endpoints");

  if (!fs.existsSync(endpointsDir)) {
    return res.json({ success: true, data: [] });
  }

  function getEndpointsFromDir(dirPath, folder = "") {
    const endpoints = [];

    try {
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
            endpoint.filename = file;
            endpoints.push(endpoint);
          }
        }
      });
    } catch (error) {
      console.error(
        "Error reading endpoints directory:",
        dirPath,
        error.message
      );
    }

    return endpoints;
  }

  const endpoints = getEndpointsFromDir(endpointsDir);
  res.json({ success: true, data: endpoints });
});

// Create new endpoint
app.post("/api/projects/:projectId/endpoints", (req, res) => {
  if (!canEdit(req)) {
    return res
      .status(403)
      .json({ success: false, message: "Edit access denied" });
  }

  const { projectId } = req.params;
  const { folder = "", filename } = req.body;

  if (!filename) {
    return res
      .status(400)
      .json({ success: false, message: "Filename is required" });
  }

  const endpointId = generateId();
  const endpoint = {
    ...DEFAULT_ENDPOINT,
    ...req.body,
    id: endpointId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  delete endpoint.folder;
  delete endpoint.filename;

  const endpointsDir = path.join(PROJECTS_DIR, projectId, "endpoints", folder);
  const endpointFile = path.join(endpointsDir, `${filename}.json`);

  if (fs.existsSync(endpointFile)) {
    return res
      .status(400)
      .json({ success: false, message: "Endpoint file already exists" });
  }

  if (writeJsonFile(endpointFile, endpoint)) {
    res
      .status(201)
      .json({ success: true, data: { ...endpoint, folder, filename } });
  } else {
    res
      .status(500)
      .json({ success: false, message: "Failed to create endpoint" });
  }
});

// Update endpoint
app.put("/api/projects/:projectId/endpoints/:folder/:filename", (req, res) => {
  if (!canEdit(req)) {
    return res
      .status(403)
      .json({ success: false, message: "Edit access denied" });
  }

  const { projectId, folder, filename } = req.params;
  const endpointFile = path.join(
    PROJECTS_DIR,
    projectId,
    "endpoints",
    folder,
    `${filename}.json`
  );

  if (!fs.existsSync(endpointFile)) {
    return res
      .status(404)
      .json({ success: false, message: "Endpoint not found" });
  }

  const existingEndpoint = readJsonFile(endpointFile);
  const updatedEndpoint = {
    ...existingEndpoint,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  if (writeJsonFile(endpointFile, updatedEndpoint)) {
    res.json({ success: true, data: updatedEndpoint });
  } else {
    res
      .status(500)
      .json({ success: false, message: "Failed to update endpoint" });
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
    };

    if (method.toUpperCase() !== "GET" && body) {
      options.body = JSON.stringify(body);
    }

    const startTime = Date.now();
    const response = await fetch(url, options);
    const endTime = Date.now();

    const responseData = await response.text();
    let jsonData;

    try {
      jsonData = JSON.parse(responseData);
    } catch {
      jsonData = responseData;
    }

    res.json({
      success: true,
      data: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: jsonData,
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

// Serve the main app
app.get(BASE_PATH, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get(`${BASE_PATH}/*`, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "REST API Builder is running",
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      basePath: BASE_PATH,
      canEdit: canEdit(req),
    },
  });
});

// Initialize and start server
initializeProject();

app.listen(PORT, () => {
  console.log("🚀 REST API Builder is running!");
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Access URL: http://localhost:${PORT}${BASE_PATH}`);
  console.log(`📁 API Docs Directory: ${API_DOCS_DIR}`);
  console.log("");
  console.log("Press Ctrl+C to stop the server");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
});
