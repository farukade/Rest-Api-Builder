import React, { useState } from "react";
import { useApp } from "../App";

const TestEndpointModal = ({ endpoint, baseUrl, onClose }) => {
  const { actions } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    url: `${baseUrl}${endpoint.path}`,
    headers: JSON.stringify(endpoint.parameters?.headers || {}, null, 2),
    body:
      endpoint.method !== "GET"
        ? JSON.stringify(endpoint.requestBody?.example || {}, null, 2)
        : "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let headers = {};
      let body = null;

      if (formData.headers) {
        headers = JSON.parse(formData.headers);
      }

      if (endpoint.method !== "GET" && formData.body) {
        body = JSON.parse(formData.body);
      }

      const testResult = await actions.testEndpoint({
        url: formData.url,
        method: endpoint.method,
        headers,
        body,
      });

      setResult(testResult);
    } catch (error) {
      actions.addToast({ message: "Invalid JSON in request", type: "error" });
    }

    setLoading(false);
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusClass = (status) => {
    if (status >= 200 && status < 300) return "status-2xx";
    if (status >= 400 && status < 500) return "status-4xx";
    return "status-5xx";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">URL</label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => updateFormData("url", e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Headers (JSON)</label>
        <textarea
          rows="3"
          value={formData.headers}
          onChange={(e) => updateFormData("headers", e.target.value)}
          placeholder='{"Authorization": "Bearer token"}'
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {endpoint.method !== "GET" && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Request Body (JSON)
          </label>
          <textarea
            rows="4"
            value={formData.body}
            onChange={(e) => updateFormData("body", e.target.value)}
            placeholder="{}"
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {result && (
        <div>
          <label className="block text-sm font-medium mb-2">Response</label>
          <div className="bg-gray-900 border border-gray-600 rounded-md p-4">
            <div className="mb-2">
              {result.success ? (
                <>
                  <span
                    className={`response-status ${getStatusClass(
                      result.data.status
                    )}`}
                  >
                    {result.data.status}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {result.data.responseTime}ms
                  </span>
                </>
              ) : (
                <span className="response-status status-5xx">ERROR</span>
              )}
            </div>
            <pre className="text-sm font-mono overflow-auto max-h-64">
              {result.success
                ? JSON.stringify(result.data.data, null, 2)
                : result.error || result.response?.message || "Request failed"}
            </pre>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Request"}
        </button>
      </div>
    </form>
  );
};

export default TestEndpointModal;
