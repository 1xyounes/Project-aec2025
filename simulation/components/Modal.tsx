
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  let sizeClasses = "max-w-md"; // Default md
  if (size === 'sm') sizeClasses = "max-w-sm";
  if (size === 'lg') sizeClasses = "max-w-lg";
  if (size === 'xl') sizeClasses = "max-w-xl";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`bg-gray-800 p-6 rounded-lg shadow-xl w-full ${sizeClasses} text-gray-100`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-teal-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
