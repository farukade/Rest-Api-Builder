import React, { createContext, useContext, useReducer, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import Modal from "./components/Modal";
import ToastContainer from "./components/ToastContainer";
import DebugPanel from "./components/DebugPanel";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { apiCall } from "./utils/api";

// App Context
const AppContext = createContext();

// Initial state
const initialState = {
  currentConfig: null,
  allEndpoints: [],
  apiStructure: [],
  currentEndpoint: null,
  isEditing: false,
  currentView: "welcome",
  modal: null,
  toasts: [],
  loading: true,
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case "SET_CONFIG":
      return { ...state, currentConfig: action.payload };
    case "SET_ENDPOINTS":
      return { ...state, allEndpoints: action.payload };
    case "SET_API_STRUCTURE":
      return { ...state, apiStructure: action.payload };
    case "SET_CURRENT_ENDPOINT":
      return {
        ...state,
        currentEndpoint: action.payload,
        currentView: "endpoint",
      };
    case "SET_EDITING":
      return { ...state, isEditing: action.payload };
    case "SET_VIEW":
      return { ...state, currentView: action.payload };
    case "SET_MODAL":
      return { ...state, modal: action.payload };
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.payload] };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// App Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setConfig: (config) => dispatch({ type: "SET_CONFIG", payload: config }),
    setEndpoints: (endpoints) =>
      dispatch({ type: "SET_ENDPOINTS", payload: endpoints }),
    setApiStructure: (structure) =>
      dispatch({ type: "SET_API_STRUCTURE", payload: structure }),
    setCurrentEndpoint: (endpoint) =>
      dispatch({ type: "SET_CURRENT_ENDPOINT", payload: endpoint }),
    setEditing: (editing) =>
      dispatch({ type: "SET_EDITING", payload: editing }),
    setView: (view) => dispatch({ type: "SET_VIEW", payload: view }),
    setModal: (modal) => dispatch({ type: "SET_MODAL", payload: modal }),
    addToast: (toast) =>
      dispatch({ type: "ADD_TOAST", payload: { ...toast, id: Date.now() } }),
    removeToast: (id) => dispatch({ type: "REMOVE_TOAST", payload: id }),
    setLoading: (loading) =>
      dispatch({ type: "SET_LOADING", payload: loading }),
  };

  const loadConfig = async () => {
    const result = await apiCall("/api/config");
    if (result.success) {
      actions.setConfig(result.data);
    }
  };

  const loadApiStructure = async () => {
    try {
      const [structureResult, endpointsResult] = await Promise.all([
        apiCall("/api/structure"),
        apiCall("/api/endpoints"),
      ]);

      if (structureResult.success) {
        actions.setApiStructure(structureResult.data);
      } else {
        console.error("Failed to load API structure:", structureResult.error);
        actions.addToast({
          message: `Failed to load API structure: ${structureResult.error}`,
          type: "error",
        });
      }

      if (endpointsResult.success) {
        actions.setEndpoints(endpointsResult.data);
      } else {
        console.error("Failed to load endpoints:", endpointsResult.error);
        actions.addToast({
          message: `Failed to load endpoints: ${endpointsResult.error}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error loading API data:", error);
      actions.addToast({
        message: `Error loading API data: ${error.message}`,
        type: "error",
      });
    } finally {
      actions.setLoading(false);
    }
  };

  const showEndpoint = async (endpointId) => {
    const result = await apiCall(`/api/endpoints/${endpointId}`);
    if (result.success) {
      actions.setCurrentEndpoint(result.data);
      actions.setEditing(false);
    } else {
      actions.addToast({ message: "Failed to load endpoint", type: "error" });
    }
  };

  const editEndpoint = async (endpointId) => {
    if (!state.currentConfig?.canEdit) return;

    // If we already have the endpoint loaded and it's the same one, just enable editing
    if (state.currentEndpoint?.id === endpointId) {
      actions.setEditing(true);
      return;
    }

    // Otherwise, load the endpoint data first
    try {
      const result = await apiCall(`/api/endpoints/${endpointId}`);
      if (result.success && result.data) {
        actions.setCurrentEndpoint(result.data);
        actions.setEditing(true);
      } else {
        console.error("Failed to load endpoint for editing:", result.error);
        actions.addToast({
          message: result.error || "Failed to load endpoint for editing",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error loading endpoint for editing:", error);
      actions.addToast({
        message: `Error loading endpoint: ${error.message}`,
        type: "error",
      });
    }
  };

  const deleteEndpoint = async (endpointId) => {
    if (!state.currentConfig?.canEdit) return;

    if (!confirm("Are you sure you want to delete this endpoint?")) return;

    const result = await apiCall(`/api/endpoints/${endpointId}`, {
      method: "DELETE",
    });

    if (result.success) {
      await loadApiStructure();
      actions.addToast({
        message: "Endpoint deleted successfully!",
        type: "success",
      });
      if (state.currentEndpoint?.id === endpointId) {
        actions.setView("welcome");
      }
    } else {
      actions.addToast({
        message: result.error || "Failed to delete endpoint",
        type: "error",
      });
    }
  };

  const saveEndpoint = async (updatedEndpoint) => {
    try {
      const result = await apiCall(`/api/endpoints/${updatedEndpoint.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedEndpoint),
      });

      if (result.success && result.data) {
        actions.setCurrentEndpoint(result.data);
        actions.setEditing(false);
        actions.addToast({
          message: "Endpoint saved successfully!",
          type: "success",
        });
        await loadApiStructure();
        return true;
      } else {
        console.error("Failed to save endpoint:", result.error);
        actions.addToast({
          message: result.error || "Failed to save endpoint",
          type: "error",
        });
        return false;
      }
    } catch (error) {
      console.error("Error saving endpoint:", error);
      actions.addToast({
        message: `Error saving endpoint: ${error.message}`,
        type: "error",
      });
      return false;
    }
  };

  const createEndpoint = async (data) => {
    const result = await apiCall("/api/endpoints", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (result.success) {
      actions.setModal(null);
      await loadApiStructure();
      actions.addToast({
        message: "Endpoint created successfully!",
        type: "success",
      });
      // Automatically open the new endpoint for editing
      editEndpoint(result.data.id);
      return true;
    } else {
      actions.addToast({
        message: result.error || "Failed to create endpoint",
        type: "error",
      });
      return false;
    }
  };

  const createFolder = async (data) => {
    const result = await apiCall("/api/folders", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (result.success) {
      actions.setModal(null);
      await loadApiStructure();
      actions.addToast({
        message: "Folder created successfully!",
        type: "success",
      });
      return true;
    } else {
      actions.addToast({
        message: result.error || "Failed to create folder",
        type: "error",
      });
      return false;
    }
  };

  const testEndpoint = async (testData) => {
    const result = await apiCall("/api/test-endpoint", {
      method: "POST",
      body: JSON.stringify(testData),
    });

    return result;
  };

  useEffect(() => {
    loadConfig().then(() => {
      loadApiStructure();
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        actions: {
          ...actions,
          loadConfig,
          loadApiStructure,
          showEndpoint,
          editEndpoint,
          deleteEndpoint,
          saveEndpoint,
          createEndpoint,
          createFolder,
          testEndpoint,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

// Main App Component
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

// Separate component to use hooks inside the provider
function AppContent() {
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <MainContent />
        </div>
      </div>
      <Modal />
      <ToastContainer />
      {/* Only show debug panel in development */}
      {process.env.NODE_ENV !== "production" && <DebugPanel />}
    </>
  );
}

export default App;
