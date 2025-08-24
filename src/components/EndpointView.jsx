import React, { useState } from "react";
import { useApp } from "../App";
import ParametersSection from "./ParametersSection";
import ResponsesSection from "./ResponsesSection";
import TestEndpointModal from "./TestEndpointModal";

const EndpointView = () => {
  const { state, actions } = useApp();
  const { currentEndpoint, isEditing, currentConfig } = state;

  const [editData, setEditData] = useState(null);
  const [activeField, setActiveField] = useState(null); // Track which field is being edited
  const [fieldValues, setFieldValues] = useState({}); // Store temporary values for individual fields

  React.useEffect(() => {
    if (currentEndpoint && isEditing && !editData) {
      // Initialize editData immediately when entering edit mode
      setEditData({ ...currentEndpoint });
      setFieldValues({}); // Reset field values when entering edit mode
      setActiveField(null); // Reset active field
    } else if (!isEditing && editData) {
      // Reset edit states when exiting edit mode
      setEditData(null);
      setActiveField(null);
      setFieldValues({});
    }
  }, [currentEndpoint, isEditing]);

  if (!currentEndpoint) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">No endpoint selected</p>
      </div>
    );
  }

  const endpoint = isEditing ? editData || currentEndpoint : currentEndpoint;

  // Handle clicking on an editable field
  const handleFieldClick = (fieldPath, currentValue) => {
    if (!isEditing) return;

    setActiveField(fieldPath);
    setFieldValues({
      ...fieldValues,
      [fieldPath]: currentValue,
    });
  };

  // Handle saving a specific field
  const handleFieldSave = (fieldPath) => {
    const value = fieldValues[fieldPath];

    // Validate JSON fields if needed
    if (fieldPath.includes("headers") || fieldPath.includes("example")) {
      try {
        if (typeof value === "string" && value.trim()) {
          JSON.parse(value);
        }
      } catch (error) {
        actions.addToast({
          message: "Invalid JSON format",
          type: "error",
        });
        return;
      }
    }

    updateNestedEditData(fieldPath, value);
    setActiveField(null);
    setFieldValues({
      ...fieldValues,
      [fieldPath]: undefined,
    });
  };

  // Handle canceling field edit
  const handleFieldCancel = (fieldPath) => {
    setActiveField(null);
    setFieldValues({
      ...fieldValues,
      [fieldPath]: undefined,
    });
  };

  // Handle key press for field editing
  const handleFieldKeyPress = (e, fieldPath) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFieldSave(fieldPath);
    } else if (e.key === "Escape") {
      handleFieldCancel(fieldPath);
    }
  };

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
        setActiveField(null);
        setFieldValues({});
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
    setActiveField(null);
    setFieldValues({});
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
      // Initialize editData if it doesn't exist
      const baseData = prev || { ...currentEndpoint };
      const newData = { ...baseData };
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

  // Render an editable field
  const renderEditableField = (
    fieldPath,
    currentValue,
    placeholder = "",
    multiline = false,
    type = "text"
  ) => {
    const isActive = activeField === fieldPath;
    const displayValue = isActive
      ? fieldValues[fieldPath] ?? currentValue
      : currentValue;

    if (!isEditing) {
      return (
        <span className="text-gray-300">
          {currentValue || <span className="text-gray-500">{placeholder}</span>}
        </span>
      );
    }

    if (isActive) {
      const commonProps = {
        value: displayValue || "",
        onChange: (e) =>
          setFieldValues({
            ...fieldValues,
            [fieldPath]: e.target.value,
          }),
        onKeyDown: (e) => handleFieldKeyPress(e, fieldPath),
        className:
          "bg-gray-700 border border-blue-500 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500",
        autoFocus: true,
      };

      if (multiline) {
        return (
          <div className="relative w-full">
            <textarea
              {...commonProps}
              rows={type === "json" ? 6 : 3}
              className={`${commonProps.className} font-mono resize-none`}
            />
            <div className="flex justify-end space-x-1 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFieldSave(fieldPath);
                }}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFieldCancel(fieldPath);
                }}
                className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="relative w-full">
          <input {...commonProps} type={type} />
          <div className="flex justify-end space-x-1 mt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFieldSave(fieldPath);
              }}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFieldCancel(fieldPath);
              }}
              className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      );
    }

    // When in edit mode but field is not active - show clickable field
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleFieldClick(fieldPath, currentValue);
        }}
        className="cursor-pointer hover:bg-gray-700 rounded px-2 py-1 border border-transparent hover:border-gray-600 transition-colors group min-h-[32px] flex items-center"
        title="Click to edit"
      >
        <span className={currentValue ? "text-white" : "text-gray-400"}>
          {currentValue || placeholder}
        </span>
        <svg
          className="w-3 h-3 ml-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
    );
  };

  // Render an editable select field
  const renderEditableSelect = (
    fieldPath,
    currentValue,
    options,
    placeholder = ""
  ) => {
    const isActive = activeField === fieldPath;
    const displayValue = isActive
      ? fieldValues[fieldPath] ?? currentValue
      : currentValue;

    if (!isEditing) {
      return (
        <span className="text-gray-300">
          {currentValue || <span className="text-gray-500">{placeholder}</span>}
        </span>
      );
    }

    if (isActive) {
      return (
        <div className="relative w-full">
          <select
            value={displayValue || ""}
            onChange={(e) => {
              setFieldValues({
                ...fieldValues,
                [fieldPath]: e.target.value,
              });
              // Auto-save select fields since they're discrete choices
              setTimeout(() => handleFieldSave(fieldPath), 0);
            }}
            className="bg-gray-700 border border-blue-500 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleFieldClick(fieldPath, currentValue);
        }}
        className="cursor-pointer hover:bg-gray-700 rounded px-2 py-1 border border-transparent hover:border-gray-600 transition-colors group min-h-[32px] flex items-center"
        title="Click to edit"
      >
        <span className={currentValue ? "text-white" : "text-gray-400"}>
          {currentValue || placeholder}
        </span>
        <svg
          className="w-3 h-3 ml-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
    );
  };

  const methodOptions = [
    { value: "GET", label: "GET" },
    { value: "POST", label: "POST" },
    { value: "PUT", label: "PUT" },
    { value: "PATCH", label: "PATCH" },
    { value: "DELETE", label: "DELETE" },
  ];

  const contentTypeOptions = [
    { value: "application/json", label: "application/json" },
    {
      value: "application/x-www-form-urlencoded",
      label: "application/x-www-form-urlencoded",
    },
    { value: "multipart/form-data", label: "multipart/form-data" },
  ];

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
            <div className="text-2xl font-bold min-w-0 flex-1">
              {renderEditableField("name", endpoint.name, "Click to edit name")}
            </div>
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
              <label className="block text-sm font-medium mb-2">
                HTTP Method
              </label>
              <div>
                {renderEditableSelect(
                  "method",
                  endpoint.method || "GET",
                  methodOptions,
                  "Select method"
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Path</label>
              <div>
                {renderEditableField(
                  "path",
                  endpoint.path,
                  "Click to edit path"
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          {isEditing ? (
            <>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <div>
                {renderEditableField(
                  "description",
                  endpoint.description,
                  "Click to edit description",
                  true
                )}
              </div>
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
                      <label className="block text-sm mb-2">Content Type</label>
                      <div>
                        {renderEditableSelect(
                          "requestBody.contentType",
                          endpoint.requestBody?.contentType ||
                            "application/json",
                          contentTypeOptions,
                          "Select content type"
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Example</label>
                      <div>
                        {renderEditableField(
                          "requestBody.example",
                          typeof endpoint.requestBody?.example === "string"
                            ? endpoint.requestBody.example
                            : JSON.stringify(
                                endpoint.requestBody?.example || {},
                                null,
                                2
                              ),
                          "Click to edit request body example",
                          true,
                          "json"
                        )}
                      </div>
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
