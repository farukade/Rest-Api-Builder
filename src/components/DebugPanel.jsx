import React, { useState } from "react";
import { useApp } from "../App";
import { apiCall, getBasePath } from "../utils/api";

const DebugPanel = () => {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const runApiTest = async () => {
    console.log("Testing API connection...");

    const tests = [
      { name: "Config", endpoint: "/api/config" },
      { name: "Endpoints", endpoint: "/api/endpoints" },
      { name: "Structure", endpoint: "/api/structure" },
      { name: "Health", endpoint: "/health" },
    ];

    const basePath = getBasePath();
    const results = [];

    for (const test of tests) {
      try {
        const result = await apiCall(test.endpoint);
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          fullUrl: window.location.origin + basePath + test.endpoint,
          success: result.success,
          status: result.success ? "OK" : "FAILED",
          error:
            result.error ||
            (result.response ? JSON.stringify(result.response) : null),
          data: result.success ? "Loaded" : null,
        });
      } catch (error) {
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          fullUrl: window.location.origin + basePath + test.endpoint,
          success: false,
          status: "ERROR",
          error: error.message,
          data: null,
        });
      }
    }

    setTestResult(results);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1 bg-gray-700 text-white text-xs rounded shadow-lg hover:bg-gray-600"
          title="Open Debug Panel"
        >
          🐛 Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <h3 className="text-sm font-semibold text-white">Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ×
        </button>
      </div>

      <div className="p-3 text-xs">
        <div className="mb-3">
          <h4 className="text-white font-medium mb-2">Environment Info:</h4>
          <div className="space-y-1 text-gray-300">
            <div>Hostname: {window.location.hostname}</div>
            <div>Port: {window.location.port}</div>
            <div>Pathname: {window.location.pathname}</div>
            <div>Detected Base Path: {getBasePath() || "(none)"}</div>
            <div>Can Edit: {state.currentConfig?.canEdit ? "Yes" : "No"}</div>
            <div>Loading: {state.loading ? "Yes" : "No"}</div>
            <div>Endpoints: {state.allEndpoints?.length || 0}</div>
          </div>
        </div>

        <div className="mb-3">
          <button
            onClick={runApiTest}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Test API Connection
          </button>
        </div>

        {testResult && (
          <div>
            <h4 className="text-white font-medium mb-2">API Test Results:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {testResult.map((test, index) => (
                <div key={index} className="text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        test.success ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    <span className="text-gray-300">{test.name}</span>
                    <span
                      className={`text-xs ${
                        test.success ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>
                  {test.fullUrl && (
                    <div
                      className="ml-4 text-gray-400 truncate"
                      title={test.fullUrl}
                    >
                      → {test.fullUrl}
                    </div>
                  )}
                  {test.error && (
                    <div
                      className="ml-4 text-red-400 text-xs truncate"
                      title={test.error}
                    >
                      Error: {test.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
