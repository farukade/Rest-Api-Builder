// API Configuration
export const API_CONFIG = {
  BASE_URL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "http://localhost:3000",
  ENDPOINTS: {
    CONFIG: "/api-docs/api/config",
    STRUCTURE: "/api-docs/api/structure",
    ENDPOINTS: "/api-docs/api/endpoints",
    FOLDERS: "/api-docs/api/folders",
    TEST_ENDPOINT: "/api-docs/api/test-endpoint",
  },
};

// API helper function
export async function apiCall(endpoint, options = {}) {
  try {
    const url = API_CONFIG.BASE_URL + endpoint;
    console.log({ url });
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

// Method color classes for Tailwind
export const METHOD_COLORS = {
  GET: "bg-green-900 text-green-300 border-green-700",
  POST: "bg-blue-900 text-blue-300 border-blue-700",
  PUT: "bg-yellow-900 text-yellow-300 border-yellow-700",
  DELETE: "bg-red-900 text-red-300 border-red-700",
  PATCH: "bg-purple-900 text-purple-300 border-purple-700",
};

// Status code color classes for Tailwind
export const STATUS_COLORS = {
  "2xx": "bg-green-900 text-green-300 border-green-700",
  "4xx": "bg-yellow-900 text-yellow-300 border-yellow-700",
  "5xx": "bg-red-900 text-red-300 border-red-700",
};

// Get status color class based on status code
export function getStatusColorClass(statusCode) {
  const code = parseInt(statusCode);
  if (code >= 200 && code < 300) return STATUS_COLORS["2xx"];
  if (code >= 400 && code < 500) return STATUS_COLORS["4xx"];
  return STATUS_COLORS["5xx"];
}
