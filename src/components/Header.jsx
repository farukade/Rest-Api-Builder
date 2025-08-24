import React from "react";
import { useApp } from "../App";

const Header = () => {
  const { state } = useApp();
  const { currentConfig, currentEndpoint, isEditing, currentView } = state;

  const getPageTitle = () => {
    if (currentView === "welcome") {
      return currentConfig?.name || "API Documentation";
    }
    if (currentEndpoint) {
      return isEditing
        ? `Editing: ${currentEndpoint.name}`
        : currentEndpoint.name;
    }
    return "API Documentation";
  };

  const getEditIndicator = () => {
    if (currentConfig?.canEdit) {
      return <span className="text-green-400">✏️ Edit Mode</span>;
    } else {
      return <span className="text-yellow-400">👁️ View Only</span>;
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">{getEditIndicator()}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
