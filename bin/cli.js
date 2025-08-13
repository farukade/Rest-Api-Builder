#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const express = require("express");
const apiDocsCreator = require("../lib/index");

const program = new Command();

program
  .name("api-docs-creator")
  .description("Simple REST API documentation creator and testing interface")
  .version("1.0.0");

program
  .command("demo")
  .description("Start a demo server with API Docs Creator")
  .option("-p, --port <port>", "Port to run on", "3000")
  .option(
    "--path <path>",
    "Mount path for the API documentation creator",
    "/api-docs"
  )
  .action(async (options) => {
    try {
      const app = express();
      const port = parseInt(options.port);

      // Mount the API Docs Creator middleware
      app.use(
        options.path,
        apiDocsCreator({
          name: "Demo API Documentation",
          description: "Demo of API Docs Creator middleware",
          version: "1.0.0",
          author: "Demo Team",
          baseUrl: `http://localhost:${port}`,
          allowExternalEdit: true,
        })
      );

      // Add a simple API endpoint for testing
      app.get("/api/demo", (req, res) => {
        res.json({
          message: "Hello from demo API!",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      });

      app.listen(port, () => {
        console.log(chalk.green("🚀 Demo server is running!"));
        console.log(
          chalk.blue(
            `📖 API Documentation: http://localhost:${port}${options.path}`
          )
        );
        console.log(
          chalk.gray(`🔗 Demo API endpoint: http://localhost:${port}/api/demo`)
        );
        console.log("");
        console.log(chalk.yellow("Press Ctrl+C to stop the server"));
      });
    } catch (error) {
      console.error(
        chalk.red("❌ Failed to start demo server:"),
        error.message
      );
      process.exit(1);
    }
  });

program
  .command("usage")
  .description("Show usage examples")
  .action(() => {
    console.log(chalk.blue("📚 API Docs Creator - Usage Examples\n"));

    console.log(chalk.green("Basic Express Integration:"));
    console.log(`
const express = require('express');
const apiDocsCreator = require('api-docs-creator');

const app = express();

// Mount API Docs Creator at /api-docs
app.use('/api-docs', apiDocsCreator({
  name: 'My API',
  description: 'API documentation and testing',
  baseUrl: 'https://api.myproject.com'
}));

app.listen(3000);
    `);

    console.log(chalk.green("Advanced Configuration:"));
    console.log(`
app.use('/docs', apiDocsCreator({
  name: 'Advanced API',
  description: 'Full featured API documentation',
  version: '2.0.0',
  author: 'Development Team',
  baseUrl: 'https://api.example.com',
  allowExternalEdit: true,  // Allow editing from any IP
  dataDir: './custom-api-docs',  // Custom data directory
  theme: 'dark',
  primaryColor: '#3B82F6'
}));
    `);

    console.log(chalk.yellow("\nThen visit: http://localhost:3000/api-docs"));
  });

if (process.argv.length === 2) {
  program.help();
}

program.parse();
