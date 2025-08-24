import React from "react";

const LoadingView = () => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full"></div>
      <p className="mt-2 text-gray-400">Loading...</p>
    </div>
  );
};

export default LoadingView;
