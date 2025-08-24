import { useEffect } from "react";
import { useApp } from "../App";

/**
 * Custom hook for handling keyboard shortcuts
 * Provides the same keyboard shortcuts as the original vanilla JS implementation
 */
export const useKeyboardShortcuts = () => {
  const { state, actions } = useApp();
  const { currentConfig, isEditing } = state;

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC key - Close modal
      if (e.key === "Escape") {
        actions.setModal(null);
        return;
      }

      // Ctrl/Cmd + key combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "n":
            // Ctrl/Cmd + N - Create new endpoint
            if (currentConfig?.canEdit) {
              e.preventDefault();
              showCreateEndpointModal();
            }
            break;

          case "s":
            // Ctrl/Cmd + S - Save endpoint (when editing)
            if (isEditing) {
              e.preventDefault();
              // This would need to be handled by the endpoint view component
              // We can emit a custom event or use the context
              const saveEvent = new CustomEvent("saveEndpoint");
              window.dispatchEvent(saveEvent);
            }
            break;

          case "e":
            // Ctrl/Cmd + E - Edit current endpoint
            if (currentConfig?.canEdit && state.currentEndpoint && !isEditing) {
              e.preventDefault();
              actions.editEndpoint(state.currentEndpoint.id);
            }
            break;

          case "t":
            // Ctrl/Cmd + T - Test current endpoint
            if (state.currentEndpoint) {
              e.preventDefault();
              showTestEndpointModal();
            }
            break;

          case "k":
            // Ctrl/Cmd + K - Quick search/command palette (future feature)
            e.preventDefault();
            // Could implement a command palette here
            console.log("Command palette (not implemented yet)");
            break;

          default:
            break;
        }
      }

      // Alt + key combinations
      if (e.altKey) {
        switch (e.key) {
          case "f":
            // Alt + F - Create new folder
            if (currentConfig?.canEdit) {
              e.preventDefault();
              showCreateFolderModal();
            }
            break;

          case "h":
            // Alt + H - Go to home/welcome
            e.preventDefault();
            actions.setView("welcome");
            break;

          default:
            break;
        }
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [state, actions, currentConfig, isEditing]);

  // Helper functions to show modals
  const showCreateEndpointModal = () => {
    actions.setModal({
      title: "Create New Endpoint",
      content: (
        <div className="text-center py-4">
          <p>Create Endpoint Modal would be rendered here</p>
          <p className="text-sm text-gray-400 mt-2">
            This should use the CreateEndpointForm component
          </p>
        </div>
      ),
    });
  };

  const showCreateFolderModal = () => {
    actions.setModal({
      title: "Create New Folder",
      content: (
        <div className="text-center py-4">
          <p>Create Folder Modal would be rendered here</p>
          <p className="text-sm text-gray-400 mt-2">
            This should use the CreateFolderForm component
          </p>
        </div>
      ),
    });
  };

  const showTestEndpointModal = () => {
    if (state.currentEndpoint) {
      actions.setModal({
        title: `Test ${state.currentEndpoint.name}`,
        content: (
          <div className="text-center py-4">
            <p>Test Endpoint Modal would be rendered here</p>
            <p className="text-sm text-gray-400 mt-2">
              This should use the TestEndpointModal component
            </p>
          </div>
        ),
      });
    }
  };

  // Return available shortcuts for documentation/help
  return {
    shortcuts: [
      { key: "Escape", description: "Close modal or dialog" },
      {
        key: "Ctrl/Cmd + N",
        description: "Create new endpoint",
        requiresEdit: true,
      },
      {
        key: "Ctrl/Cmd + S",
        description: "Save current endpoint",
        requiresEdit: true,
        requiresEditing: true,
      },
      {
        key: "Ctrl/Cmd + E",
        description: "Edit current endpoint",
        requiresEdit: true,
      },
      { key: "Ctrl/Cmd + T", description: "Test current endpoint" },
      { key: "Alt + F", description: "Create new folder", requiresEdit: true },
      { key: "Alt + H", description: "Go to home page" },
    ],
  };
};
