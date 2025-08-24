import React, { useState } from "react";
import { useApp } from "../App";
import ParametersSection from "./ParametersSection";
import ResponsesSection from "./ResponsesSection";
import TestEndpointModal from "./TestEndpointModal";

const EndpointView = () => {
  const { state, actions } = useApp();
  const { currentEndpoint, isEditing, currentConfig } = state;

  const [editData, setEditData] = useState(null);

  React.useEffect(() => {
    if (currentEndpoint && isEditing) {
      setEditData({ ...currentEndpoint });
    }
  }, [currentEndpoint, isEditing]);

  if (!currentEndpoint) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">No endpoint selected</p>
      </div>
    );
  }

  const endpoint = isEditing ? editData : currentEndpoint;

  const handleSave = async () => {
    try {
      // Validate JSON fields
      if (editData.parameters?.headers) {
        JSON.parse(
          typeof editData.parameters.headers === "string"
            ? editData.parameters.headers
            : JSON.stringify(editData.parameters.headers)
        );
      }

      if (editData.requestBody?.example) {
        JSON.parse(
          typeof editData.requestBody.example === "string"
            ? editData.requestBody.example
            : JSON.stringify(editData.requestBody.example)
        );
      }

      // Validate response examples
      for (const statusCode of Object.keys(editData.responses)) {
        const example = editData.responses[statusCode].example;
        if (example) {
          JSON.parse(
            typeof example === "string" ? example : JSON.stringify(example)
          );
        }
      }

      const success = await actions.saveEndpoint(editData);
      if (success) {
        setEditData(null);
      }
    } catch (error) {
      actions.addToast({
        message: "Invalid JSON in one of the fields",
        type: "error",
      });
    }
  };

  const handleCancel = () => {
    actions.setEditing(false);
    setEditData(null);
  };

  const handleTestEndpoint = () => {
    actions.setModal({
      title: `Test ${endpoint.name}`,
      content: (
        <TestEndpointModal
          endpoint={endpoint}
          baseUrl={currentConfig?.baseUrl || "https://api.example.com"}
          onClose={() => actions.setModal(null)}
        />
      ),
    });
  };

  const updateEditData = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedEditData = (path, value) => {
    setEditData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => actions.setView("welcome")}
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
              className={`endpoint-method method-${
                endpoint.method?.toLowerCase() || "get"
              }`}
            >
              {endpoint.method}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editData?.name || ""}
                onChange={(e) => updateEditData("name", e.target.value)}
                className="text-2xl font-bold bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none"
              />
            ) : (
              <h1 className="text-2xl font-bold">{endpoint.name}</h1>
            )}
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                {currentConfig?.canEdit && (
                  <button
                    onClick={() => actions.editEndpoint(endpoint.id)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={handleTestEndpoint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Test API
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mb-4">
          <code className="text-lg text-blue-400">
            {currentConfig?.baseUrl || "https://api.example.com"}
            {endpoint.path}
          </code>
        </div>

        {isEditing && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                HTTP Method
              </label>
              <select
                value={editData?.method || "GET"}
                onChange={(e) => updateEditData("method", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Path</label>
              <input
                type="text"
                value={editData?.path || ""}
                onChange={(e) => updateEditData("path", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
              />
            </div>
          </div>
        )}

        <div>
          {isEditing ? (
            <>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                rows="2"
                value={editData?.description || ""}
                onChange={(e) => updateEditData("description", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
              />
            </>
          ) : (
            endpoint.description && (
              <p className="text-gray-400">{endpoint.description}</p>
            )
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid lg:grid-cols-2 gap-6 p-6">
          {/* Request Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Request</h3>

            <ParametersSection
              parameters={endpoint.parameters}
              isEditing={isEditing}
              onUpdate={updateNestedEditData}
            />

            {endpoint.method !== "GET" && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-3">Request Body</h4>
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Content Type</label>
                      <select
                        value={
                          editData?.requestBody?.contentType ||
                          "application/json"
                        }
                        onChange={(e) =>
                          updateNestedEditData(
                            "requestBody.contentType",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                      >
                        <option value="application/json">
                          application/json
                        </option>
                        <option value="application/x-www-form-urlencoded">
                          application/x-www-form-urlencoded
                        </option>
                        <option value="multipart/form-data">
                          multipart/form-data
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Example</label>
                      <textarea
                        rows="6"
                        value={
                          typeof editData?.requestBody?.example === "string"
                            ? editData.requestBody.example
                            : JSON.stringify(
                                editData?.requestBody?.example || {},
                                null,
                                2
                              )
                        }
                        onChange={(e) =>
                          updateNestedEditData(
                            "requestBody.example",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-sm"
                      />
                    </div>
                  </div>
                ) : endpoint.requestBody?.example &&
                  Object.keys(endpoint.requestBody.example).length ? (
                  <div className="bg-gray-900 rounded p-3 font-mono text-sm overflow-auto">
                    <pre>
                      {JSON.stringify(endpoint.requestBody.example, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No request body example
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Response Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Response</h3>

            <ResponsesSection
              responses={endpoint.responses}
              isEditing={isEditing}
              onUpdate={updateNestedEditData}
              onAddResponse={(statusCode) => {
                updateNestedEditData(`responses.${statusCode}`, {
                  description: "Response description",
                  contentType: "application/json",
                  example: {},
                });
              }}
              onRemoveResponse={(statusCode) => {
                setEditData((prev) => {
                  const newData = { ...prev };
                  delete newData.responses[statusCode];
                  return newData;
                });
              }}
            />

            {isEditing && (
              <button
                onClick={() => {
                  const statusCode = prompt(
                    "Enter status code (e.g., 201, 400, 500):"
                  );
                  if (statusCode && !editData.responses[statusCode]) {
                    updateNestedEditData(`responses.${statusCode}`, {
                      description: "Response description",
                      contentType: "application/json",
                      example: {},
                    });
                  }
                }}
                className="w-full py-2 border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded transition-colors"
              >
                + Add Response Status
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndpointView;
