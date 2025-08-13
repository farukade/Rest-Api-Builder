// Global state
let currentConfig = null;
let allEndpoints = [];
let apiStructure = [];
let currentEndpoint = null;
let isEditing = false;
let basePath = "";

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  // Detect the base path from current URL
  const path = window.location.pathname;
  const segments = path.split("/").filter(Boolean);

  // If we're not at root, assume the first segment is our base path
  if (segments.length > 0 && !path.endsWith(".html")) {
    basePath = "/" + segments[0];
  }

  await loadConfig();
  await loadApiStructure();
  showWelcome();
});

// API helper functions
async function apiCall(endpoint, options = {}) {
  try {
    // Make API calls relative to the base path
    const url = basePath + endpoint;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return {
      success: response.ok,
      data: response.ok ? data.data : data,
      response: data,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Load configuration
async function loadConfig() {
  const result = await apiCall("/api/config");
  if (result.success) {
    currentConfig = result.data;
    // Update basePath if provided in config
    if (currentConfig.mountPath) {
      basePath = currentConfig.mountPath;
    }
    updateUI();
  }
}

// Update UI based on config
function updateUI() {
  // Update project info
  document.getElementById("project-title").textContent = currentConfig.name;
  document.getElementById("project-description").textContent =
    currentConfig.description;

  // Update edit indicator
  const indicator = document.getElementById("edit-indicator");
  const actionButtons = document.getElementById("action-buttons");

  if (currentConfig?.canEdit) {
    indicator.innerHTML = '<span class="text-green-400">✏️ Edit Mode</span>';
    document.getElementById("new-folder-btn").classList.remove("hidden");
    document.getElementById("new-endpoint-btn").classList.remove("hidden");
  } else {
    indicator.innerHTML = '<span class="text-yellow-400">👁️ View Only</span>';
    document.getElementById("new-folder-btn").classList.add("hidden");
    document.getElementById("new-endpoint-btn").classList.add("hidden");
  }
}

// Load API structure
async function loadApiStructure() {
  const [structureResult, endpointsResult] = await Promise.all([
    apiCall("/api/structure"),
    apiCall("/api/endpoints"),
  ]);

  if (structureResult.success) {
    apiStructure = structureResult.data;
  }

  if (endpointsResult.success) {
    allEndpoints = endpointsResult.data;
  }

  renderApiStructure();
}

// Render API structure in sidebar
function renderApiStructure() {
  const container = document.getElementById("api-structure");

  if (!apiStructure.length) {
    container.innerHTML = `
            <div class="text-center py-4 text-gray-500 text-sm">
                <p>No endpoints yet</p>
                ${
                  currentConfig?.canEdit
                    ? '<p class="mt-1">Create your first endpoint</p>'
                    : ""
                }
            </div>
        `;
    return;
  }

  function renderItem(item, level = 0) {
    const indent = level * 16;

    if (item.type === "folder") {
      let html = `
                <div class="folder-item" style="margin-left: ${indent}px">
                    <div class="flex items-center justify-between py-1 px-2 hover:bg-gray-700 rounded">
                        <div class="flex items-center space-x-2 cursor-pointer" onclick="toggleFolder(this)">
                            <svg class="w-4 h-4 text-gray-400 folder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                            </svg>
                            <span class="text-sm text-gray-300">${
                              item.name
                            }</span>
                        </div>
                        ${
                          currentConfig?.canEdit
                            ? `
                                <svg onclick="addToFolder('${item.path}')" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                        `
                            : ""
                        }
                    </div>
                    <div class="folder-content hidden">
            `;

      item.children.forEach((child) => {
        html += renderItem(child, level + 1);
      });

      html += "</div></div>";
      return html;
    } else {
      // Endpoint item
      const endpoint = item.data;
      return `
                <div class="endpoint-item" style="margin-left: ${indent}px">
                    <div class="flex items-center justify-between py-1 px-2 hover:bg-gray-700 rounded cursor-pointer group"
                         onclick="showEndpoint('${endpoint.id}')">
                        <div class="flex items-center space-x-2 min-w-0 flex-1">
                            <span class="endpoint-method method-${endpoint.method.toLowerCase()}">${
        endpoint.method
      }</span>
                            <span class="text-sm text-gray-300 truncate">${
                              endpoint.name
                            }</span>
                        </div>
                        ${
                          currentConfig?.canEdit
                            ? `
                            <div class="flex space-x-1 opacity-0 group-hover:opacity-100">
                                <button onclick="event.stopPropagation(); editEndpoint('${endpoint.id}')" 
                                        class="p-1 text-gray-400 hover:text-white" title="Edit">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>
                                <button onclick="event.stopPropagation(); deleteEndpoint('${endpoint.id}')" 
                                        class="p-1 text-gray-400 hover:text-red-400" title="Delete">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `;
    }
  }

  let html = "";
  apiStructure.forEach((item) => {
    html += renderItem(item);
  });

  container.innerHTML = html;
}

// Toggle folder visibility
function toggleFolder(element) {
  const folderItem = element.closest(".folder-item");
  const content = folderItem.querySelector(".folder-content");
  const icon = folderItem.querySelector(".folder-icon");

  content.classList.toggle("hidden");
  icon.style.transform = content.classList.contains("hidden")
    ? "rotate(0deg)"
    : "rotate(90deg)";
}

// Show welcome screen
function showWelcome() {
  const content = document.getElementById("main-content");
  document.getElementById("page-title").textContent =
    currentConfig?.name || "API Documentation";

  content.innerHTML = `
        <div class="flex items-center justify-center h-full">
            <div class="text-center max-w-2xl px-6">
                <div class="mb-8">
                    <div class="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <h1 class="text-3xl font-bold mb-4">${
                      currentConfig?.name || "API Documentation"
                    }</h1>
                    <p class="text-xl text-gray-400 mb-2">${
                      currentConfig?.description ||
                      "Welcome to your API documentation"
                    }</p>
                    <div class="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <span>Version ${
                          currentConfig?.version || "1.0.0"
                        }</span>
                        <span>•</span>
                        <span>by ${currentConfig?.author || "API Team"}</span>
                    </div>
                </div>
                
                <div class="space-y-4">
                    ${
                      allEndpoints.length === 0
                        ? `
                        <p class="text-gray-400 mb-6">No API endpoints defined yet.</p>
                        ${
                          currentConfig?.canEdit
                            ? `
                            <div class="flex justify-center space-x-4">
                                <button onclick="showCreateEndpoint()" 
                                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Create First Endpoint
                                </button>
                                <button onclick="showCreateFolder()" 
                                        class="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                                    Create Folder
                                </button>
                            </div>
                        `
                            : ""
                        }
                    `
                        : `
                        <p class="text-gray-400 mb-6">Browse the API endpoints in the sidebar or use the testing interface.</p>
                        <div class="grid gap-4 md:grid-cols-3 text-left">
                            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <h3 class="font-semibold mb-2">📚 Documentation</h3>
                                <p class="text-sm text-gray-400">View detailed API endpoint documentation with examples and schemas.</p>
                            </div>
                            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <h3 class="font-semibold mb-2">🧪 Testing</h3>
                                <p class="text-sm text-gray-400">Test API endpoints directly with custom headers and request bodies.</p>
                            </div>
                            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <h3 class="font-semibold mb-2">${
                                  currentConfig?.canEdit
                                    ? "✏️ Editing"
                                    : "👁️ View Only"
                                }</h3>
                                <p class="text-sm text-gray-400">${
                                  currentConfig?.canEdit
                                    ? "Create and edit endpoints with full documentation."
                                    : "Read-only access. Run locally to edit."
                                }</p>
                            </div>
                        </div>
                    `
                    }
                </div>
                
                ${
                  currentConfig?.baseUrl &&
                  currentConfig.baseUrl !== "https://api.example.com"
                    ? `
                    <div class="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                        <h3 class="font-semibold mb-2">Base URL</h3>
                        <code class="text-blue-400">${currentConfig.baseUrl}</code>
                    </div>
                `
                    : ""
                }
            </div>
        </div>
    `;
}

// Show endpoint details
async function showEndpoint(endpointId) {
  const result = await apiCall(`/api/endpoints/${endpointId}`);
  if (!result.success) {
    showToast("Failed to load endpoint", "error");
    return;
  }

  currentEndpoint = result.data;
  isEditing = false;
  renderEndpointView();
}

// Edit endpoint
async function editEndpoint(endpointId) {
  if (!currentConfig?.canEdit) return;

  const result = await apiCall(`/api/endpoints/${endpointId}`);
  if (!result.success) {
    showToast("Failed to load endpoint", "error");
    return;
  }

  currentEndpoint = result.data;
  isEditing = true;
  renderEndpointView();
}

// Render endpoint view (either readonly or editable)
function renderEndpointView() {
  const content = document.getElementById("main-content");
  const endpoint = currentEndpoint;

  document.getElementById("page-title").textContent = isEditing
    ? `Editing: ${endpoint.name}`
    : endpoint.name;

  content.innerHTML = `
        <div class="h-full flex flex-col">
            <div class="flex-none p-6 border-b border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-4">
                        <button onclick="showWelcome()" class="text-gray-400 hover:text-white">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                        </button>
                        <span class="endpoint-method method-${endpoint.method.toLowerCase()}">${
    endpoint.method
  }</span>
                        ${
                          isEditing
                            ? `
                            <input type="text" id="endpoint-name" value="${endpoint.name}" 
                                   class="text-2xl font-bold bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none">
                        `
                            : `
                            <h1 class="text-2xl font-bold">${endpoint.name}</h1>
                        `
                        }
                    </div>
                    <div class="flex space-x-2">
                        ${
                          isEditing
                            ? `
                            <button onclick="cancelEdit()" 
                                    class="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button onclick="saveEndpoint()" 
                                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                Save Changes
                            </button>
                        `
                            : `
                            ${
                              currentConfig?.canEdit
                                ? `
                                <button onclick="editEndpoint('${endpoint.id}')" 
                                        class="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors">
                                    Edit
                                </button>
                            `
                                : ""
                            }
                            <button onclick="testEndpoint('${endpoint.id}')" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                Test API
                            </button>
                        `
                        }
                    </div>
                </div>
                
                <div class="mb-4">
                    <code class="text-lg text-blue-400">${
                      currentConfig?.baseUrl || "https://api.example.com"
                    }${endpoint.path}</code>
                </div>
                
                ${
                  isEditing
                    ? `
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">HTTP Method</label>
                            <select id="endpoint-method" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md">
                                <option value="GET" ${
                                  endpoint.method === "GET" ? "selected" : ""
                                }>GET</option>
                                <option value="POST" ${
                                  endpoint.method === "POST" ? "selected" : ""
                                }>POST</option>
                                <option value="PUT" ${
                                  endpoint.method === "PUT" ? "selected" : ""
                                }>PUT</option>
                                <option value="PATCH" ${
                                  endpoint.method === "PATCH" ? "selected" : ""
                                }>PATCH</option>
                                <option value="DELETE" ${
                                  endpoint.method === "DELETE" ? "selected" : ""
                                }>DELETE</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Path</label>
                            <input type="text" id="endpoint-path" value="${
                              endpoint.path
                            }" 
                                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md">
                        </div>
                    </div>
                `
                    : ""
                }
                
                <div>
                    ${
                      isEditing
                        ? `
                        <label class="block text-sm font-medium mb-1">Description</label>
                        <textarea id="endpoint-description" rows="2" 
                                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md">${
                                    endpoint.description || ""
                                  }</textarea>
                    `
                        : `
                        ${
                          endpoint.description
                            ? `<p class="text-gray-400">${endpoint.description}</p>`
                            : ""
                        }
                    `
                    }
                </div>
            </div>
            
            <div class="flex-1 overflow-auto">
                <div class="grid lg:grid-cols-2 gap-6 p-6">
                    <!-- Request Section -->
                    <div class="space-y-6">
                        <h3 class="text-lg font-semibold">Request</h3>
                        
                        <!-- Parameters -->
                        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="font-medium">Parameters</h4>
                                ${
                                  isEditing
                                    ? `
                                    <button onclick="addParameter()" class="text-sm text-blue-400 hover:text-blue-300">
                                        + Add Parameter
                                    </button>
                                `
                                    : ""
                                }
                            </div>
                            <div id="parameters-section">
                                ${renderParameters(
                                  endpoint.parameters,
                                  isEditing
                                )}
                            </div>
                        </div>
                        
                        <!-- Request Body -->
                        ${
                          endpoint.method !== "GET"
                            ? `
                            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <h4 class="font-medium mb-3">Request Body</h4>
                                ${
                                  isEditing
                                    ? `
                                    <div class="space-y-3">
                                        <div>
                                            <label class="block text-sm mb-1">Content Type</label>
                                            <select id="request-content-type" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm">
                                                <option value="application/json" ${
                                                  endpoint.requestBody
                                                    ?.contentType ===
                                                  "application/json"
                                                    ? "selected"
                                                    : ""
                                                }>application/json</option>
                                                <option value="application/x-www-form-urlencoded" ${
                                                  endpoint.requestBody
                                                    ?.contentType ===
                                                  "application/x-www-form-urlencoded"
                                                    ? "selected"
                                                    : ""
                                                }>application/x-www-form-urlencoded</option>
                                                <option value="multipart/form-data" ${
                                                  endpoint.requestBody
                                                    ?.contentType ===
                                                  "multipart/form-data"
                                                    ? "selected"
                                                    : ""
                                                }>multipart/form-data</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm mb-1">Example</label>
                                            <textarea id="request-example" rows="6" 
                                                      class="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-sm">${JSON.stringify(
                                                        endpoint.requestBody
                                                          ?.example || {},
                                                        null,
                                                        2
                                                      )}</textarea>
                                        </div>
                                    </div>
                                `
                                    : `
                                    ${
                                      endpoint.requestBody?.example &&
                                      Object.keys(endpoint.requestBody.example)
                                        .length
                                        ? `
                                        <div class="bg-gray-900 rounded p-3 font-mono text-sm overflow-auto">
                                            <pre>${JSON.stringify(
                                              endpoint.requestBody.example,
                                              null,
                                              2
                                            )}</pre>
                                        </div>
                                    `
                                        : '<p class="text-gray-500 text-sm">No request body example</p>'
                                    }
                                `
                                }
                            </div>
                        `
                            : ""
                        }
                    </div>
                    
                    <!-- Response Section -->
                    <div class="space-y-6">
                        <h3 class="text-lg font-semibold">Response</h3>
                        
                        <div class="space-y-4" id="responses-section">
                            ${renderResponses(endpoint.responses, isEditing)}
                        </div>
                        
                        ${
                          isEditing
                            ? `
                            <button onclick="addResponse()" 
                                    class="w-full py-2 border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded transition-colors">
                                + Add Response Status
                            </button>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render parameters section
function renderParameters(parameters, editing) {
  let html = "";

  // Query parameters
  if (parameters.query && parameters.query.length > 0) {
    html +=
      '<div class="mb-4"><h5 class="text-sm font-medium text-gray-300 mb-2">Query Parameters</h5>';
    parameters.query.forEach((param, index) => {
      html += `
                <div class="flex items-center space-x-2 mb-2 ${
                  editing ? "parameter-item" : ""
                }">
                    ${
                      editing
                        ? `
                        <input type="text" value="${
                          param.name
                        }" placeholder="name" 
                               class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                               onchange="updateParameter('query', ${index}, 'name', this.value)">
                        <select onchange="updateParameter('query', ${index}, 'type', this.value)"
                                class="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm">
                            <option value="string" ${
                              param.type === "string" ? "selected" : ""
                            }>string</option>
                            <option value="integer" ${
                              param.type === "integer" ? "selected" : ""
                            }>integer</option>
                            <option value="boolean" ${
                              param.type === "boolean" ? "selected" : ""
                            }>boolean</option>
                        </select>
                        <label class="flex items-center text-sm">
                            <input type="checkbox" ${
                              param.required ? "checked" : ""
                            } 
                                   onchange="updateParameter('query', ${index}, 'required', this.checked)"
                                   class="mr-1"> Required
                        </label>
                        <button onclick="removeParameter('query', ${index})" class="text-red-400 hover:text-red-300">×</button>
                    `
                        : `
                        <code class="text-blue-400">${param.name}</code>
                        <span class="text-gray-500">(${param.type})</span>
                        ${
                          param.required
                            ? '<span class="text-red-400">*</span>'
                            : ""
                        }
                        ${
                          param.description
                            ? `<span class="text-gray-400">- ${param.description}</span>`
                            : ""
                        }
                    `
                    }
                </div>
            `;
    });
    html += "</div>";
  }

  // Headers
  if (parameters.headers && Object.keys(parameters.headers).length > 0) {
    html +=
      '<div><h5 class="text-sm font-medium text-gray-300 mb-2">Headers</h5>';
    if (editing) {
      html += `<textarea id="headers-editor" rows="3" 
                             class="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-sm">${JSON.stringify(
                               parameters.headers,
                               null,
                               2
                             )}</textarea>`;
    } else {
      html += `<div class="bg-gray-900 rounded p-3 font-mono text-sm"><pre>${JSON.stringify(
        parameters.headers,
        null,
        2
      )}</pre></div>`;
    }
    html += "</div>";
  }

  return html || '<p class="text-gray-500 text-sm">No parameters defined</p>';
}

// Render responses section
function renderResponses(responses, editing) {
  let html = "";

  Object.keys(responses).forEach((statusCode) => {
    const response = responses[statusCode];
    const statusClass = statusCode.startsWith("2")
      ? "status-2xx"
      : statusCode.startsWith("4")
      ? "status-4xx"
      : "status-5xx";

    html += `
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 response-item" data-status="${statusCode}">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <span class="response-status ${statusClass}">${statusCode}</span>
                        ${
                          editing
                            ? `
                            <input type="text" value="${response.description}" 
                                   class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                                   onchange="updateResponseDescription('${statusCode}', this.value)">
                        `
                            : `
                            <span class="font-medium">${response.description}</span>
                        `
                        }
                    </div>
                    ${
                      editing
                        ? `
                        <button onclick="removeResponse('${statusCode}')" class="text-red-400 hover:text-red-300">×</button>
                    `
                        : ""
                    }
                </div>
                
                ${
                  editing
                    ? `
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm mb-1">Content Type</label>
                            <input type="text" value="${
                              response.contentType || "application/json"
                            }" 
                                   class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                                   onchange="updateResponseContentType('${statusCode}', this.value)">
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Example Response</label>
                            <textarea rows="8" 
                                      class="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-sm response-example"
                                      data-status="${statusCode}"
                                      onchange="updateResponseExample('${statusCode}', this.value)">${JSON.stringify(
                        response.example || {},
                        null,
                        2
                      )}</textarea>
                        </div>
                    </div>
                `
                    : `
                    ${
                      response.example && Object.keys(response.example).length
                        ? `
                        <div class="bg-gray-900 rounded p-3 font-mono text-sm overflow-auto">
                            <pre>${JSON.stringify(
                              response.example,
                              null,
                              2
                            )}</pre>
                        </div>
                    `
                        : '<p class="text-gray-500 text-sm">No example response</p>'
                    }
                `
                }
            </div>
        `;
  });

  return html;
}

// Save endpoint changes
async function saveEndpoint() {
  try {
    const updatedEndpoint = {
      ...currentEndpoint,
      name: document.getElementById("endpoint-name").value,
      method: document.getElementById("endpoint-method").value,
      path: document.getElementById("endpoint-path").value,
      description: document.getElementById("endpoint-description").value,
    };

    // Update headers if edited
    const headersEditor = document.getElementById("headers-editor");
    if (headersEditor) {
      try {
        updatedEndpoint.parameters.headers = JSON.parse(headersEditor.value);
      } catch (e) {
        showToast("Invalid JSON in headers", "error");
        return;
      }
    }

    // Update request body if edited
    const requestExample = document.getElementById("request-example");
    if (requestExample) {
      try {
        updatedEndpoint.requestBody.example = JSON.parse(requestExample.value);
        updatedEndpoint.requestBody.contentType = document.getElementById(
          "request-content-type"
        ).value;
      } catch (e) {
        showToast("Invalid JSON in request example", "error");
        return;
      }
    }

    // Update response examples
    document.querySelectorAll(".response-example").forEach((textarea) => {
      const statusCode = textarea.dataset.status;
      try {
        updatedEndpoint.responses[statusCode].example = JSON.parse(
          textarea.value
        );
      } catch (e) {
        showToast(`Invalid JSON in ${statusCode} response example`, "error");
        return;
      }
    });

    const result = await apiCall(`/api/endpoints/${currentEndpoint.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedEndpoint),
    });

    if (result.success) {
      currentEndpoint = result.data;
      isEditing = false;
      showToast("Endpoint saved successfully!", "success");
      await loadApiStructure();
      renderEndpointView();
    } else {
      showToast(result.error || "Failed to save endpoint", "error");
    }
  } catch (error) {
    showToast("Error saving endpoint: " + error.message, "error");
  }
}

// Cancel editing
function cancelEdit() {
  isEditing = false;
  renderEndpointView();
}

// Add endpoint to specific folder (called from folder context menu)
function addToFolder(folderPath) {
  if (!currentConfig?.canEdit) return;
  showCreateEndpoint(folderPath);
}

// Helper function to get folder structure for dropdowns
function getFolderStructure() {
  function getAllFolders(items, currentPath = "") {
    let folders = [];

    items.forEach((item) => {
      if (item.type === "folder") {
        const folderPath = currentPath
          ? `${currentPath}/${item.name}`
          : item.name;
        folders.push({
          name: item.name,
          path: folderPath,
          level: currentPath.split("/").filter(Boolean).length,
          fullPath: folderPath,
        });

        // Recursively get subfolders
        if (item.children && item.children.length > 0) {
          folders = folders.concat(getAllFolders(item.children, folderPath));
        }
      }
    });

    return folders;
  }

  return getAllFolders(apiStructure);
}

// Helper function to build folder dropdown options
function buildFolderOptions(selectedFolder = "", includeNested = true) {
  let options = '<option value="">Root Level</option>';

  const folders = includeNested
    ? getFolderStructure()
    : apiStructure.filter((item) => item.type === "folder");

  if (includeNested) {
    // For nested structure with indentation
    folders.forEach((folder) => {
      const indent = "  ".repeat(folder.level);
      const selected = folder.path === selectedFolder ? "selected" : "";
      options += `<option value="${folder.path}" ${selected}>${indent}${folder.name}</option>`;
    });
  } else {
    // For root-level only
    folders.forEach((folder) => {
      const selected = folder.name === selectedFolder ? "selected" : "";
      options += `<option value="${folder.name}" ${selected}>${folder.name}</option>`;
    });
  }

  return options;
}

function showCreateEndpoint(folder = "") {
  if (!currentConfig?.canEdit) return;

  showModal(
    "Create New Endpoint",
    `
        <form onsubmit="createEndpoint(event)" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Name</label>
                    <input type="text" name="name" required 
                           class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Method</label>
                    <select name="method" class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                    </select>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Path</label>
                <input type="text" name="path" required placeholder="/api/endpoint"
                       class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Description</label>
                <textarea name="description" rows="3"
                          class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Folder</label>
                    <select name="folder" 
                            class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        ${buildFolderOptions(folder, true)}
                    </select>
                    <p class="text-xs text-gray-400 mt-1">Choose a folder to organize your endpoint</p>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Filename</label>
                    <input type="text" name="filename" required placeholder="endpoint-name"
                           class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <p class="text-xs text-gray-400 mt-1">Used for the JSON file name</p>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Create Endpoint
                </button>
            </div>
        </form>
    `
  );
}

// Create endpoint
async function createEndpoint(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  const result = await apiCall("/api/endpoints", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (result.success) {
    closeModal();
    await loadApiStructure();
    showToast("Endpoint created successfully!", "success");
    // Automatically open the new endpoint for editing
    editEndpoint(result.data.id);
  } else {
    showToast(result.error || "Failed to create endpoint", "error");
  }
}

function showCreateFolder() {
  if (!currentConfig?.canEdit) return;

  showModal(
    "Create New Folder",
    `
        <form onsubmit="createFolder(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2">Folder Name</label>
                <input type="text" name="name" required placeholder="users, auth, etc."
                       class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Parent Folder</label>
                <select name="parent" 
                        class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    ${buildFolderOptions("", false)}
                </select>
                <p class="text-xs text-gray-400 mt-1">Select a parent folder or leave as "Root Level" to create at the top level</p>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Create Folder
                </button>
            </div>
        </form>
    `
  );
}

// Create folder
async function createFolder(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  const result = await apiCall("/api/folders", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (result.success) {
    closeModal();
    await loadApiStructure();
    showToast("Folder created successfully!", "success");
  } else {
    showToast(result.error || "Failed to create folder", "error");
  }
}

// Delete endpoint
async function deleteEndpoint(endpointId) {
  if (!currentConfig?.canEdit) return;

  if (!confirm("Are you sure you want to delete this endpoint?")) return;

  const result = await apiCall(`/api/endpoints/${endpointId}`, {
    method: "DELETE",
  });

  if (result.success) {
    await loadApiStructure();
    showToast("Endpoint deleted successfully!", "success");
    if (currentEndpoint?.id === endpointId) {
      showWelcome();
    }
  } else {
    showToast(result.error || "Failed to delete endpoint", "error");
  }
}

// Test endpoint functionality (reuse from previous implementation)
function testEndpoint(endpointId) {
  const endpoint = allEndpoints.find((e) => e.id === endpointId);
  if (!endpoint) return;

  showModal(
    `Test ${endpoint.name}`,
    `
        <form onsubmit="executeApiTest(event, '${endpointId}')" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2">URL</label>
                <input type="url" name="url" required 
                       value="${
                         currentConfig?.baseUrl || "https://api.example.com"
                       }${endpoint.path}"
                       class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Headers (JSON)</label>
                <textarea name="headers" rows="3" placeholder='{"Authorization": "Bearer token"}'
                          class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">${JSON.stringify(
                            endpoint.parameters?.headers || {},
                            null,
                            2
                          )}</textarea>
            </div>
            
            ${
              endpoint.method !== "GET"
                ? `
                <div>
                    <label class="block text-sm font-medium mb-2">Request Body (JSON)</label>
                    <textarea name="body" rows="4" placeholder="{}"
                              class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">${JSON.stringify(
                                endpoint.requestBody?.example || {},
                                null,
                                2
                              )}</textarea>
                </div>
            `
                : ""
            }
            
            <div id="test-result" class="hidden">
                <label class="block text-sm font-medium mb-2">Response</label>
                <div class="bg-gray-900 border border-gray-600 rounded-md p-4">
                    <div id="response-status" class="mb-2"></div>
                    <pre id="response-body" class="text-sm font-mono overflow-auto max-h-64"></pre>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors">
                    Close
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <span class="submit-text">Send Request</span>
                    <span class="loading-text hidden">Sending...</span>
                </button>
            </div>
        </form>
    `
  );
}

// Execute API test (reuse from previous implementation)
async function executeApiTest(event, endpointId) {
  event.preventDefault();

  const endpoint = allEndpoints.find((e) => e.id === endpointId);
  const formData = new FormData(event.target);

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const submitText = submitBtn.querySelector(".submit-text");
  const loadingText = submitBtn.querySelector(".loading-text");

  // Show loading state
  submitText.classList.add("hidden");
  loadingText.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    let headers = {};
    let body = null;

    if (formData.get("headers")) {
      headers = JSON.parse(formData.get("headers"));
    }

    if (endpoint.method !== "GET" && formData.get("body")) {
      body = JSON.parse(formData.get("body"));
    }

    const result = await apiCall("/api/test-endpoint", {
      method: "POST",
      body: JSON.stringify({
        url: formData.get("url"),
        method: endpoint.method,
        headers,
        body,
      }),
    });

    // Show result
    const resultDiv = document.getElementById("test-result");
    const statusDiv = document.getElementById("response-status");
    const bodyDiv = document.getElementById("response-body");

    resultDiv.classList.remove("hidden");

    if (result.success) {
      const status = result.data.status;
      const statusClass =
        status >= 200 && status < 300
          ? "status-2xx"
          : status >= 400 && status < 500
          ? "status-4xx"
          : "status-5xx";

      statusDiv.innerHTML = `
                <span class="response-status ${statusClass}">${status}</span>
                <span class="text-gray-400 ml-2">${result.data.responseTime}ms</span>
            `;
      bodyDiv.textContent = JSON.stringify(result.data.data, null, 2);
    } else {
      statusDiv.innerHTML =
        '<span class="response-status status-5xx">ERROR</span>';
      bodyDiv.textContent =
        result.error || result.response?.message || "Request failed";
    }
  } catch (error) {
    showToast("Invalid JSON in request", "error");
  }

  // Reset button state
  submitText.classList.remove("hidden");
  loadingText.classList.add("hidden");
  submitBtn.disabled = false;
}

// Utility functions for parameter and response management
function addParameter() {
  // Add a new parameter to the current endpoint
  if (!currentEndpoint.parameters.query) {
    currentEndpoint.parameters.query = [];
  }
  currentEndpoint.parameters.query.push({
    name: "",
    type: "string",
    description: "",
    required: false,
  });
  renderEndpointView();
}

function updateParameter(type, index, field, value) {
  if (
    currentEndpoint.parameters[type] &&
    currentEndpoint.parameters[type][index]
  ) {
    currentEndpoint.parameters[type][index][field] = value;
  }
}

function removeParameter(type, index) {
  if (currentEndpoint.parameters[type]) {
    currentEndpoint.parameters[type].splice(index, 1);
    renderEndpointView();
  }
}

function addResponse() {
  const statusCode = prompt("Enter status code (e.g., 201, 400, 500):");
  if (statusCode && !currentEndpoint.responses[statusCode]) {
    currentEndpoint.responses[statusCode] = {
      description: "Response description",
      contentType: "application/json",
      example: {},
    };
    renderEndpointView();
  }
}

function removeResponse(statusCode) {
  delete currentEndpoint.responses[statusCode];
  renderEndpointView();
}

function updateResponseDescription(statusCode, description) {
  if (currentEndpoint.responses[statusCode]) {
    currentEndpoint.responses[statusCode].description = description;
  }
}

function updateResponseContentType(statusCode, contentType) {
  if (currentEndpoint.responses[statusCode]) {
    currentEndpoint.responses[statusCode].contentType = contentType;
  }
}

function updateResponseExample(statusCode, value) {
  if (currentEndpoint.responses[statusCode]) {
    try {
      currentEndpoint.responses[statusCode].example = JSON.parse(value);
    } catch (e) {
      // Invalid JSON, keep as string for now
    }
  }
}

// Modal functions (reuse from previous implementation)
function showModal(title, content) {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = `
        <div class="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onclick="closeModal()">
            <div class="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-auto slide-in" onclick="event.stopPropagation()">
                <div class="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 class="text-lg font-semibold">${title}</h2>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="p-6">
                    ${content}
                </div>
            </div>
        </div>
    `;
}

function closeModal() {
  document.getElementById("modal-container").innerHTML = "";
}

// Toast notification system
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `px-4 py-3 rounded-md shadow-lg fade-in ${
    type === "success"
      ? "bg-green-600 text-white"
      : type === "error"
      ? "bg-red-600 text-white"
      : "bg-blue-600 text-white"
  }`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }

  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "n":
        if (currentConfig?.canEdit) {
          e.preventDefault();
          showCreateEndpoint();
        }
        break;
      case "s":
        if (isEditing) {
          e.preventDefault();
          saveEndpoint();
        }
        break;
    }
  }
});
