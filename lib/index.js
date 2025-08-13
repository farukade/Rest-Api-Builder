const { createMiddleware } = require("./server");

/**
 * API Docs Creator Middleware
 *
 * @param {Object} options - Configuration options
 * @param {string} options.name - Project name (default: "API Documentation")
 * @param {string} options.description - Project description
 * @param {string} options.version - API version (default: "1.0.0")
 * @param {string} options.author - Author name (default: "API Team")
 * @param {string} options.baseUrl - Base API URL (default: "http://localhost:3000")
 * @param {string} options.path - Mount path (default: "/api-docs-creator")
 * @param {boolean} options.allowExternalEdit - Allow editing from external IPs (default: false)
 * @param {string} options.theme - Theme (default: "dark")
 * @param {string} options.primaryColor - Primary color (default: "#6B7280")
 * @param {string} options.dataDir - Data directory (default: "./api-docs")
 * @returns {Function} Express middleware
 *
 * @example
 * const express = require('express');
 * const apiDocsCreator = require('api-docs-creator');
 *
 * const app = express();
 *
 * app.use('/api-docs', apiDocsCreator({
 *   name: 'My API',
 *   description: 'API documentation and testing',
 *   baseUrl: 'https://api.myproject.com'
 * }));
 *
 * app.listen(3000);
 */
function apiDocsCreator(options = {}) {
  const config = {
    name: "API Documentation",
    description: "API documentation and testing interface",
    version: "1.0.0",
    author: "API Team",
    baseUrl: "http://localhost:3000",
    path: "/api-docs-creator",
    allowExternalEdit: false,
    theme: "dark",
    primaryColor: "#6B7280",
    dataDir: "./api-docs",
    ...options,
  };

  return createMiddleware(config);
}

module.exports = apiDocsCreator;
