import React, { useEffect } from "react";
import { useApp } from "../App";

const ToastContainer = () => {
  const { state, actions } = useApp();
  const { toasts } = state;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={actions.removeToast} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-600 text-white";
      case "error":
        return "bg-red-600 text-white";
      default:
        return "bg-blue-600 text-white";
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-md shadow-lg fade-in ${getToastStyles()}`}
    >
      {toast.message}
    </div>
  );
};

export default ToastContainer;
