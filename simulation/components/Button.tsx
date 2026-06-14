
import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  active?: boolean; // For toggle-like buttons
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', active = false, ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 flex items-center justify-center";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-400";
      break;
    case 'secondary':
      variantStyle = "bg-gray-600 hover:bg-gray-500 text-gray-100 focus:ring-gray-400";
      break;
    case 'danger':
      variantStyle = "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400";
      break;
    default:
      variantStyle = "bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-400";
  }

  if (props.disabled) {
    variantStyle = "bg-gray-400 text-gray-700 cursor-not-allowed";
  } else if (active) {
    // Example active style, could be specific to variant too
    variantStyle = `${variantStyle.split(' ')[0]} ring-2 ring-offset-2 ring-offset-gray-800 ring-yellow-400`; // Use the base color of the variant
  }


  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
