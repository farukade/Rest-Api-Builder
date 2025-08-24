import React from "react";

const ParametersSection = ({ parameters, isEditing, onUpdate }) => {
  const addParameter = () => {
    const currentQuery = parameters.query || [];
    const newQuery = [
      ...currentQuery,
      {
        name: "",
        type: "string",
        description: "",
        required: false,
      },
    ];
    onUpdate("parameters.query", newQuery);
  };

  const updateParameter = (index, field, value) => {
    const currentQuery = parameters.query || [];
    const newQuery = [...currentQuery];
    newQuery[index] = { ...newQuery[index], [field]: value };
    onUpdate("parameters.query", newQuery);
  };

  const removeParameter = (index) => {
    const currentQuery = parameters.query || [];
    const newQuery = currentQuery.filter((_, i) => i !== index);
    onUpdate("parameters.query", newQuery);
  };

  const renderParameters = () => {
    let content = [];

    // Query parameters
    if (parameters.query && parameters.query.length > 0) {
      content.push(
        <div key="query" className="mb-4">
          <h5 className="text-sm font-medium text-gray-300 mb-2">
            Query Parameters
          </h5>
          {parameters.query.map((param, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 mb-2 ${
                isEditing ? "parameter-item" : ""
              }`}
            >
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={param.name}
                    placeholder="name"
                    onChange={(e) =>
                      updateParameter(index, "name", e.target.value)
                    }
                    className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                  <select
                    value={param.type}
                    onChange={(e) =>
                      updateParameter(index, "type", e.target.value)
                    }
                    className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  >
                    <option value="string">string</option>
                    <option value="integer">integer</option>
                    <option value="boolean">boolean</option>
                  </select>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={param.required}
                      onChange={(e) =>
                        updateParameter(index, "required", e.target.checked)
                      }
                      className="mr-1"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => removeParameter(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </>
              ) : (
                <>
                  <code className="text-blue-400">{param.name}</code>
                  <span className="text-gray-500">({param.type})</span>
                  {param.required && <span className="text-red-400">*</span>}
                  {param.description && (
                    <span className="text-gray-400">- {param.description}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Headers
    if (parameters.headers && Object.keys(parameters.headers).length > 0) {
      content.push(
        <div key="headers">
          <h5 className="text-sm font-medium text-gray-300 mb-2">Headers</h5>
          {isEditing ? (
            <textarea
              rows="3"
              value={
                typeof parameters.headers === "string"
                  ? parameters.headers
                  : JSON.stringify(parameters.headers, null, 2)
              }
              onChange={(e) => onUpdate("parameters.headers", e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-sm"
            />
          ) : (
            <div className="bg-gray-900 rounded p-3 font-mono text-sm">
              <pre>{JSON.stringify(parameters.headers, null, 2)}</pre>
            </div>
          )}
        </div>
      );
    }

    return content.length > 0 ? (
      content
    ) : (
      <p className="text-gray-500 text-sm">No parameters defined</p>
    );
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Parameters</h4>
        {isEditing && (
          <button
            onClick={addParameter}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + Add Parameter
          </button>
        )}
      </div>
      <div>{renderParameters()}</div>
    </div>
  );
};

export default ParametersSection;
