import React from "react";
import { useApp } from "../App";

const WelcomeView = () => {
  const { state, actions } = useApp();
  const { currentConfig, allEndpoints } = state;

  const showCreateEndpoint = () => {
    if (!currentConfig?.canEdit) return;

    actions.setModal({
      title: "Create New Endpoint",
      content: (
        <CreateEndpointForm
          folderOptions={[]}
          selectedFolder=""
          onSubmit={actions.createEndpoint}
          onCancel={() => actions.setModal(null)}
        />
      ),
    });
  };

  const showCreateFolder = () => {
    if (!currentConfig?.canEdit) return;

    actions.setModal({
      title: "Create New Folder",
      content: (
        <CreateFolderForm
          folderOptions={[]}
          onSubmit={actions.createFolder}
          onCancel={() => actions.setModal(null)}
        />
      ),
    });
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-2xl px-6">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-white"
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
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {currentConfig?.name || "API Documentation"}
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            {currentConfig?.description || "Welcome to your API documentation"}
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Version {currentConfig?.version || "1.0.0"}</span>
            <span>•</span>
            <span>by {currentConfig?.author || "API Team"}</span>
          </div>
        </div>

        <div className="space-y-4">
          {allEndpoints.length === 0 ? (
            <>
              <p className="text-gray-400 mb-6">
                No API endpoints defined yet.
              </p>
              {currentConfig?.canEdit && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={showCreateEndpoint}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Endpoint
                  </button>
                  <button
                    onClick={showCreateFolder}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Create Folder
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-400 mb-6">
                Browse the API endpoints in the sidebar or use the testing
                interface.
              </p>
              <div className="grid gap-4 md:grid-cols-3 text-left">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">📚 Documentation</h3>
                  <p className="text-sm text-gray-400">
                    View detailed API endpoint documentation with examples and
                    schemas.
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🧪 Testing</h3>
                  <p className="text-sm text-gray-400">
                    Test API endpoints directly with custom headers and request
                    bodies.
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">
                    {currentConfig?.canEdit ? "✏️ Editing" : "👁️ View Only"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {currentConfig?.canEdit
                      ? "Create and edit endpoints with full documentation."
                      : "Read-only access. Run locally to edit."}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {currentConfig?.baseUrl &&
          currentConfig.baseUrl !== "https://api.example.com" && (
            <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Base URL</h3>
              <code className="text-blue-400">{currentConfig.baseUrl}</code>
            </div>
          )}
      </div>
    </div>
  );
};

// Simple forms for welcome view (these could be moved to separate files)
const CreateEndpointForm = ({ onSubmit, onCancel }) => {
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
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Root Level</option>
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

const CreateFolderForm = ({ onSubmit, onCancel }) => {
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

export default WelcomeView;
