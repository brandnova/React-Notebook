import React from 'react';
import { FaTimes } from 'react-icons/fa';

const FullScreenModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-center items-center">
      <div className="bg-white w-full h-full p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default FullScreenModal;