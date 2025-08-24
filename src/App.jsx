import React, { useState, useEffect } from "react";
import { apiCall, API_CONFIG, METHOD_COLORS } from "./utils/api";

function App() {
  // Global state
  const [currentConfig, setCurrentConfig] = useState(null);
  const [allEndpoints, setAllEndpoints] = useState([]);
  const [apiStructure, setApiStructure] = useState([]);
  const [currentEndpoint, setCurrentEndpoint] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentView, setCurrentView] = useState("welcome");
  const [modalContent, setModalContent] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Load initial data
  useEffect(() => {
    loadConfig();
    loadApiStructure();
  }, []);

  // Load configuration
  const loadConfig = async () => {
    const result = await apiCall(API_CONFIG.ENDPOINTS.CONFIG);
    if (result.success) {
      setCurrentConfig(result.data);
    }
  };

  // Load API structure
  const loadApiStructure = async () => {
    const [structureResult, endpointsResult] = await Promise.all([
      apiCall(API_CONFIG.ENDPOINTS.STRUCTURE),
      apiCall(API_CONFIG.ENDPOINTS.ENDPOINTS),
    ]);

    if (structureResult.success) {
      setApiStructure(structureResult.data);
    }

    if (endpointsResult.success) {
      setAllEndpoints(endpointsResult.data);
    }
  };

  // Show welcome view
  const showWelcome = () => {
    setCurrentView("welcome");
    setCurrentEndpoint(null);
    setIsEditing(false);
  };

  // Show endpoint
  const showEndpoint = async (endpointId) => {
    const result = await apiCall(
      `${API_CONFIG.ENDPOINTS.ENDPOINTS}/${endpointId}`
    );
    if (result.success) {
      setCurrentEndpoint(result.data);
      setCurrentView("endpoint");
      setIsEditing(false);
    } else {
      showToast("Failed to load endpoint", "error");
    }
  };

  // Edit endpoint
  const editEndpoint = async (endpointId) => {
    if (!currentConfig?.canEdit) return;

    const result = await apiCall(
      `${API_CONFIG.ENDPOINTS.ENDPOINTS}/${endpointId}`
    );
    if (result.success) {
      setCurrentEndpoint(result.data);
      setCurrentView("endpoint");
      setIsEditing(true);
    } else {
      showToast("Failed to load endpoint", "error");
    }
  };

  // Show toast notification
  const showToast = (message, type = "info") => {
    const toast = {
      id: Date.now(),
      message,
      type,
    };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 3000);
  };

  // Show modal
  const showModal = (title, content) => {
    setModalContent({ title, content });
  };

  // Close modal
  const closeModal = () => {
    setModalContent(null);
  };

  // Toggle folder in sidebar
  const toggleFolder = (element) => {
    // This will be implemented when we add folder functionality
  };

  // Render sidebar navigation
  const renderApiStructure = () => {
    if (!apiStructure.length) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          <p>No endpoints yet</p>
          {currentConfig?.canEdit && (
            <p className="mt-1">Create your first endpoint</p>
          )}
        </div>
      );
    }

    const renderItem = (item, level = 0) => {
      const indent = level * 16;

      if (item.type === "folder") {
        return (
          <div
            key={item.path}
            className="folder-item"
            style={{ marginLeft: `${indent}px` }}
          >
            <div className="flex items-center justify-between py-1 px-2 hover:bg-gray-700 rounded">
              <div className="flex items-center space-x-2 cursor-pointer">
                <svg
                  className="w-4 h-4 text-gray-400 transform transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  ></path>
                </svg>
                <span className="text-sm text-gray-300">{item.name}</span>
              </div>
              {currentConfig?.canEdit && (
                <svg
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
              )}
            </div>
            <div className="folder-content hidden">
              {item.children?.map((child) => renderItem(child, level + 1))}
            </div>
          </div>
        );
      } else {
        // Endpoint item
        const endpoint = item.data;
        const methodColorClass =
          METHOD_COLORS[endpoint.method] || METHOD_COLORS.GET;

        return (
          <div
            key={endpoint.id}
            className="endpoint-item"
            style={{ marginLeft: `${indent}px` }}
          >
            <div
              className="flex items-center justify-between py-1 px-2 hover:bg-gray-700 rounded cursor-pointer group"
              onClick={() => showEndpoint(endpoint.id)}
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <span
                  className={`font-mono text-xs font-semibold py-1 px-2 rounded uppercase min-w-[60px] text-center ${methodColorClass}`}
                >
                  {endpoint.method}
                </span>
                <span className="text-sm text-gray-300 truncate">
                  {endpoint.name}
                </span>
              </div>
              {currentConfig?.canEdit && (
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      editEndpoint(endpoint.id);
                    }}
                    className="p-1 text-gray-400 hover:text-white"
                    title="Edit"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); /* deleteEndpoint(endpoint.id) */
                    }}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="Delete"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
    };

    return <div>{apiStructure.map((item) => renderItem(item))}</div>;
  };

  // Render welcome screen
  const renderWelcome = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-2xl px-6">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {currentConfig?.name || "API Documentation"}
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            {currentConfig?.description || "Welcome to your API documentation"}
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Version {currentConfig?.version || "1.0.0"}</span>
            <span>•</span>
            <span>by {currentConfig?.author || "API Team"}</span>
          </div>
        </div>

        <div className="space-y-4">
          {allEndpoints.length === 0 ? (
            <>
              <p className="text-gray-400 mb-6">
                No API endpoints defined yet.
              </p>
              {currentConfig?.canEdit && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      /* showCreateEndpoint() */
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Endpoint
                  </button>
                  <button
                    onClick={() => {
                      /* showCreateFolder() */
                    }}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Create Folder
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-400 mb-6">
                Browse the API endpoints in the sidebar or use the testing
                interface.
              </p>
              <div className="grid gap-4 md:grid-cols-3 text-left">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">📚 Documentation</h3>
                  <p className="text-sm text-gray-400">
                    View detailed API endpoint documentation with examples and
                    schemas.
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🧪 Testing</h3>
                  <p className="text-sm text-gray-400">
                    Test API endpoints directly with custom headers and request
                    bodies.
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">
                    {currentConfig?.canEdit ? "✏️ Editing" : "👀 View Only"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {currentConfig?.canEdit
                      ? "Create and edit endpoints with full documentation."
                      : "Read-only access. Run locally to edit."}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {currentConfig?.baseUrl &&
          currentConfig.baseUrl !== "https://api.example.com" && (
            <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Base URL</h3>
              <code className="text-blue-400">{currentConfig.baseUrl}</code>
            </div>
          )}
      </div>
    </div>
  );

  // Render main content
  const renderMainContent = () => {
    if (currentView === "welcome") {
      return renderWelcome();
    }

    if (currentView === "endpoint" && currentEndpoint) {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={showWelcome}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  ></path>
                </svg>
              </button>
              <span
                className={`font-mono text-xs font-semibold py-1 px-2 rounded uppercase ${
                  METHOD_COLORS[currentEndpoint.method]
                }`}
              >
                {currentEndpoint.method}
              </span>
              <h1 className="text-2xl font-bold">{currentEndpoint.name}</h1>
            </div>
            <div className="flex space-x-2">
              {!isEditing && currentConfig?.canEdit && (
                <button
                  onClick={() => editEndpoint(currentEndpoint.id)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => {
                  /* testEndpoint */
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Test API
              </button>
            </div>
          </div>

          <div className="mb-4">
            <code className="text-lg text-blue-400">
              {currentConfig?.baseUrl || "https://api.example.com"}
              {currentEndpoint.path}
            </code>
          </div>

          {currentEndpoint.description && (
            <p className="text-gray-400 mb-6">{currentEndpoint.description}</p>
          )}

          <div className="text-center py-8 text-gray-400">
            <p>Endpoint details view will be implemented in the next step</p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full"></div>
        <p className="mt-2 text-gray-400">Loading...</p>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-lg font-semibold">
              {currentConfig?.name || "API Documentation"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {currentConfig?.description || "Loading..."}
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  API Endpoints
                </h3>
                <div className="flex space-x-1">
                  {currentConfig?.canEdit && (
                    <>
                      <button
                        onClick={() => {
                          /* showCreateFolder */
                        }}
                        title="New Folder"
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          ></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          /* showCreateEndpoint */
                        }}
                        title="New Endpoint"
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          ></path>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div>{renderApiStructure()}</div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {currentView === "welcome"
                  ? currentConfig?.name || "API Documentation"
                  : isEditing
                  ? `Editing: ${currentEndpoint?.name}`
                  : currentEndpoint?.name || "API Documentation"}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  {currentConfig?.canEdit ? (
                    <span className="text-green-400">✏️ Edit Mode</span>
                  ) : (
                    <span className="text-yellow-400">👀 View Only</span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto">{renderMainContent()}</main>
        </div>
      </div>

      {/* Modal */}
      {modalContent && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-auto animate-in slide-in-from-bottom-2 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold">{modalContent.title}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="p-6">{modalContent.content}</div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-md shadow-lg animate-in slide-in-from-right-4 duration-300 ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
