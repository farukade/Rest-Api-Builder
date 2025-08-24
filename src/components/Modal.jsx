import React, { useEffect } from "react";
import { useApp } from "../App";

const Modal = () => {
  const { state, actions } = useApp();
  const { modal } = state;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        actions.setModal(null);
      }
    };

    if (modal) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [modal, actions]);

  if (!modal) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      actions.setModal(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-auto slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold">{modal.title}</h2>
          <button
            onClick={() => actions.setModal(null)}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div className="p-6">{modal.content}</div>
      </div>
    </div>
  );
};

export default Modal;
