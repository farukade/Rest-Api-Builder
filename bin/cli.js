#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const program = new Command();

const DEFAULT_CONFIG = {
  name: "My API Documentation",
  description: "API documentation and testing interface",
  version: "1.0.0",
  author: "API Team",
  baseUrl: "https://api.example.com",
  port: 3000,
  path: "/api-docs",
  allowExternalEdit: false,
  theme: "dark",
  primaryColor: "#6B7280",
};

program
  .name("rest-api-builder")
  .description("Simple REST API documentation builder")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize REST API Builder in current directory")
  .option("-n, --name <name>", "Project name")
  .option("-d, --description <description>", "Project description")
  .option("-v, --version <version>", "API version")
  .option("-a, --author <author>", "Author name")
  .option("-u, --base-url <url>", "Base API URL")
  .action(async (options) => {
    try {
      console.log(chalk.blue("🚀 Initializing REST API Builder..."));

      const configPath = path.join(process.cwd(), "rest-api-builder.config.js");
      const apiDocsPath = path.join(process.cwd(), "api-docs");

      // Create configuration
      const config = {
        ...DEFAULT_CONFIG,
        ...options,
      };

      // Read package.json if exists to get defaults
      const packageJsonPath = path.join(process.cwd(), "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );
        config.name = config.name || packageJson.name || DEFAULT_CONFIG.name;
        config.description =
          config.description ||
          packageJson.description ||
          DEFAULT_CONFIG.description;
        config.version =
          config.version || packageJson.version || DEFAULT_CONFIG.version;
        config.author =
          config.author || packageJson.author || DEFAULT_CONFIG.author;
      }

      const configContent = `module.exports = ${JSON.stringify(
        config,
        null,
        2
      )};`;

      // Create config file
      fs.writeFileSync(configPath, configContent);

      // Create api-docs directory structure
      if (!fs.existsSync(apiDocsPath)) {
        fs.mkdirSync(apiDocsPath, { recursive: true });
        fs.mkdirSync(path.join(apiDocsPath, "endpoints"), { recursive: true });
        fs.mkdirSync(path.join(apiDocsPath, "sockets"), { recursive: true });

        // Create sample endpoint
        const sampleEndpoint = {
          id: Date.now().toString(36),
          name: "Get Users",
          method: "GET",
          path: "/users",
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

        fs.writeFileSync(
          path.join(apiDocsPath, "endpoints", "get-users.json"),
          JSON.stringify(sampleEndpoint, null, 2)
        );
      }

      console.log(chalk.green("✅ REST API Builder initialized successfully!"));
      console.log(chalk.gray(`📁 Config: ${configPath}`));
      console.log(chalk.gray(`📂 Docs: ${apiDocsPath}`));
      console.log(chalk.blue('\n🚀 Run "rest-api-builder start" to begin'));
    } catch (error) {
      console.error(chalk.red("❌ Initialization failed:"), error.message);
      process.exit(1);
    }
  });

program
  .command("start")
  .description("Start the documentation server")
  .option("-p, --port <port>", "Port to run on", "3000")
  .option("--path <path>", "URL path for documentation")
  .option("--allow-external-edit", "Allow editing from external connections")
  .action(async (options) => {
    try {
      // Check if initialized
      const configPath = path.join(process.cwd(), "rest-api-builder.config.js");
      if (!fs.existsSync(configPath)) {
        console.log(
          chalk.red('❌ Not initialized. Run "rest-api-builder init" first.')
        );
        process.exit(1);
      }

      // Load config
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);

      // Override with CLI options
      if (options.port) config.port = parseInt(options.port);
      if (options.path) config.path = options.path;
      if (options.allowExternalEdit) config.allowExternalEdit = true;

      // Start server
      const { startServer } = require("../lib/server");
      await startServer(config);
    } catch (error) {
      console.error(chalk.red("❌ Failed to start server:"), error.message);
      process.exit(1);
    }
  });

program
  .command("config")
  .description("Show current configuration")
  .action(() => {
    try {
      const configPath = path.join(process.cwd(), "rest-api-builder.config.js");
      if (!fs.existsSync(configPath)) {
        console.log(
          chalk.red('❌ Not initialized. Run "rest-api-builder init" first.')
        );
        return;
      }

      const config = require(configPath);
      console.log(chalk.blue("📋 Current Configuration:"));
      console.log(JSON.stringify(config, null, 2));
    } catch (error) {
      console.error(chalk.red("❌ Failed to read config:"), error.message);
    }
  });

program.parse();
