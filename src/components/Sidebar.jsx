import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../App";

const Sidebar = () => {
  const { state, actions } = useApp();
  const { currentConfig, apiStructure, allEndpoints } = state;

  const [openFolders, setOpenFolders] = useState(new Set());
  const [sidebarWidth, setSidebarWidth] = useState(256); // 16rem = 256px
  const [isResizing, setIsResizing] = useState(false);

  const sidebarRef = useRef(null);
  const resizerRef = useRef(null);

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseDown = (e) => {
      setIsResizing(true);
      document.body.classList.add("sidebar-resizing");
      e.preventDefault();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = Math.max(200, Math.min(600, e.clientX)); // Min 200px, Max 600px
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove("sidebar-resizing");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const resizer = resizerRef.current;
    if (resizer) {
      resizer.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      if (resizer) {
        resizer.removeEventListener("mousedown", handleMouseDown);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const toggleFolder = (folderPath) => {
    const newOpenFolders = new Set(openFolders);
    if (newOpenFolders.has(folderPath)) {
      newOpenFolders.delete(folderPath);
    } else {
      newOpenFolders.add(folderPath);
    }
    setOpenFolders(newOpenFolders);
  };

  const showCreateFolder = () => {
    if (!currentConfig?.canEdit) return;

    const folderOptions = getFolderOptions();

    actions.setModal({
      title: "Create New Folder",
      content: (
        <CreateFolderForm
          folderOptions={folderOptions}
          onSubmit={actions.createFolder}
          onCancel={() => actions.setModal(null)}
        />
      ),
    });
  };

  const showCreateEndpoint = (folder = "") => {
    if (!currentConfig?.canEdit) return;

    const folderOptions = getFolderOptions(true);

    actions.setModal({
      title: "Create New Endpoint",
      content: (
        <CreateEndpointForm
          folderOptions={folderOptions}
          selectedFolder={folder}
          onSubmit={actions.createEndpoint}
          onCancel={() => actions.setModal(null)}
        />
      ),
    });
  };

  const getFolderOptions = (includeNested = false) => {
    if (!includeNested) {
      return apiStructure
        .filter((item) => item.type === "folder")
        .map((folder) => ({ name: folder.name, path: folder.name }));
    }

    const getAllFolders = (items, currentPath = "") => {
      let folders = [];
      items.forEach((item) => {
        if (item.type === "folder") {
          const folderPath = currentPath
            ? `${currentPath}/${item.name}`
            : item.name;
          folders.push({
            name: item.name,
            path: folderPath,
            level: currentPath.split("/").filter(Boolean).length,
          });
          if (item.children?.length > 0) {
            folders = folders.concat(getAllFolders(item.children, folderPath));
          }
        }
      });
      return folders;
    };

    return getAllFolders(apiStructure);
  };

  const renderItem = (item, level = 0, parentPath = "") => {
    const indent = level * 16;
    const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;

    if (item.type === "folder") {
      const isOpen = openFolders.has(currentPath);

      return (
        <div
          key={currentPath}
          className="folder-item"
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="flex items-center justify-between py-1 px-2 hover:bg-gray-700 rounded">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => toggleFolder(currentPath)}
            >
              <svg
                className={`w-4 h-4 text-gray-400 folder-icon transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showCreateEndpoint(currentPath);
                }}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Add to folder"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
              </button>
            )}
          </div>

          {isOpen && item.children && (
            <div className="folder-content">
              {item.children.map((child) =>
                renderItem(child, level + 1, currentPath)
              )}
            </div>
          )}
        </div>
      );
    } else {
      // Endpoint item
      const endpoint = item.data;
      return (
        <div
          key={endpoint.id}
          className="endpoint-item"
          style={{ marginLeft: `${indent}px` }}
        >
          <div
            className="flex items-center justify-between py-1 px-2 hover:bg-gray-700 rounded cursor-pointer group"
            onClick={() => actions.showEndpoint(endpoint.id)}
          >
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span
                className={`endpoint-method method-${endpoint.method.toLowerCase()}`}
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
                    actions.editEndpoint(endpoint.id);
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
                    e.stopPropagation();
                    actions.deleteEndpoint(endpoint.id);
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

  return (
    <div
      ref={sidebarRef}
      className="bg-gray-800 border-r border-gray-700 flex flex-col relative"
      style={{ width: `${sidebarWidth}px` }}
    >
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
            {currentConfig?.canEdit && (
              <div className="flex space-x-1">
                <button
                  onClick={showCreateFolder}
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
                  onClick={() => showCreateEndpoint()}
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
              </div>
            )}
          </div>

          <div>
            {!apiStructure.length ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                <p>No endpoints yet</p>
                {currentConfig?.canEdit && (
                  <p className="mt-1">Create your first endpoint</p>
                )}
              </div>
            ) : (
              apiStructure.map((item) => renderItem(item))
            )}
          </div>
        </div>
      </nav>

      {/* Resize handle */}
      <div
        ref={resizerRef}
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-500 transition-colors ${
          isResizing ? "bg-blue-500" : ""
        }`}
        title="Drag to resize sidebar"
      />
    </div>
  );
};

// Create Folder Form Component
const CreateFolderForm = ({ folderOptions, onSubmit, onCancel }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const success = await onSubmit(data);
    if (success) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Folder Name</label>
        <input
          type="text"
          name="name"
          required
          placeholder="users, auth, etc."
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Parent Folder</label>
        <select
          name="parent"
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Root Level</option>
          {folderOptions.map((folder) => (
            <option key={folder.path} value={folder.name}>
              {folder.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Select a parent folder or leave as "Root Level" to create at the top
          level
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Folder
        </button>
      </div>
    </form>
  );
};

// Create Endpoint Form Component
const CreateEndpointForm = ({
  folderOptions,
  selectedFolder,
  onSubmit,
  onCancel,
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const success = await onSubmit(data);
    if (success) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Method</label>
          <select
            name="method"
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Path</label>
        <input
          type="text"
          name="path"
          required
          placeholder="/api/endpoint"
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          rows="3"
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Folder</label>
          <select
            name="folder"
            defaultValue={selectedFolder}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Root Level</option>
            {folderOptions.map((folder) => (
              <option key={folder.path} value={folder.path}>
                {"  ".repeat(folder.level)}
                {folder.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Choose a folder to organize your endpoint
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Filename</label>
          <input
            type="text"
            name="filename"
            required
            placeholder="endpoint-name"
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Used for the JSON file name
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Endpoint
        </button>
      </div>
    </form>
  );
};

export default Sidebar;
