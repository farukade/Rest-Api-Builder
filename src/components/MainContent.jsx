import React from "react";
import { useApp } from "../App";
import WelcomeView from "./WelcomeView";
import EndpointView from "./EndpointView";
import LoadingView from "./LoadingView";

const MainContent = () => {
  const { state } = useApp();
  const { currentView, loading } = state;

  if (loading) {
    return <LoadingView />;
  }

  const renderView = () => {
    switch (currentView) {
      case "welcome":
        return <WelcomeView />;
      case "endpoint":
        return <EndpointView />;
      default:
        return <WelcomeView />;
    }
  };

  return <main className="flex-1 overflow-auto">{renderView()}</main>;
};

export default MainContent;
