import React from "react";

const ResponsesSection = ({
  responses,
  isEditing,
  onUpdate,
  onAddResponse,
  onRemoveResponse,
}) => {
  const updateResponseDescription = (statusCode, description) => {
    onUpdate(`responses.${statusCode}.description`, description);
  };

  const updateResponseContentType = (statusCode, contentType) => {
    onUpdate(`responses.${statusCode}.contentType`, contentType);
  };

  const updateResponseExample = (statusCode, value) => {
    onUpdate(`responses.${statusCode}.example`, value);
  };

  const renderResponses = () => {
    return Object.keys(responses).map((statusCode) => {
      const response = responses[statusCode];
      const statusClass = statusCode.startsWith("2")
        ? "status-2xx"
        : statusCode.startsWith("4")
        ? "status-4xx"
        : "status-5xx";

      return (
        <div
          key={statusCode}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 response-item"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className={`response-status ${statusClass}`}>
                {statusCode}
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={response.description}
                  onChange={(e) =>
                    updateResponseDescription(statusCode, e.target.value)
                  }
                  className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              ) : (
                <span className="font-medium">{response.description}</span>
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => onRemoveResponse(statusCode)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Content Type</label>
                <input
                  type="text"
                  value={response.contentType || "application/json"}
                  onChange={(e) =>
                    updateResponseContentType(statusCode, e.target.value)
                  }
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Example Response</label>
                <textarea
                  rows="8"
                  value={
                    typeof response.example === "string"
                      ? response.example
                      : JSON.stringify(response.example || {}, null, 2)
                  }
                  onChange={(e) =>
                    updateResponseExample(statusCode, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-sm"
                />
              </div>
            </div>
          ) : response.example && Object.keys(response.example).length ? (
            <div className="bg-gray-900 rounded p-3 font-mono text-sm overflow-auto">
              <pre>{JSON.stringify(response.example, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No example response</p>
          )}
        </div>
      );
    });
  };

  return <div className="space-y-4">{renderResponses()}</div>;
};

export default ResponsesSection;
