
import React from 'react';

// Basic type for SVG props
type SVGProps = React.SVGProps<SVGSVGElement>;

export const SensorIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4 10a6 6 0 1112 0 6 6 0 01-12 0zm6-8a8 8 0 100 16 8 8 0 000-16zm0 3a1 1 0 100 2 1 1 0 000-2zm0 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
  </svg>
);

export const DroneIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 2.5a.75.75 0 01.75.75v.518A5.966 5.966 0 0115.5 6.559V7.75a.75.75 0 01-1.5 0V6.56A4.466 4.466 0 0010 4.086V10.5h1.75a.75.75 0 010 1.5H10v.086A4.466 4.466 0 0014 13.44V14.5a.75.75 0 01-1.5 0v-1.06a5.966 5.966 0 01-4.75-2.841V10.5H6.25a.75.75 0 010-1.5H8V4.086A4.466 4.466 0 003.5 6.56V7.75a.75.75 0 01-1.5 0V6.559A5.966 5.966 0 016.75 3.768V3.25a.75.75 0 01.75-.75H10zM8.5 10.5V12a1.5 1.5 0 103 0v-1.5H8.5z" />
  </svg>
);

export const DepotIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4 2a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V2zm2 3.5A1.5 1.5 0 017.5 4h5A1.5 1.5 0 0114 5.5v1.854A4.002 4.002 0 0010 6.5a4 4 0 00-4 3.354V5.5zm-2 7A1.5 1.5 0 015.5 11h9a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 0114.5 17h-9A1.5 1.5 0 014 15.5v-3z" clipRule="evenodd" />
  </svg>
);

export const AlertIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h.008c.414 0 .742-.336.742-.75V5zM10 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

export const FireActiveIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10.198 2.51a.75.75 0 00-1.31-.727l-5.25 9.046a.75.75 0 00.513 1.139c1.42.27 2.015 1.319 2.148 2.627.13.195.295.37.49.524a4.708 4.708 0 006.448-2.678 4.71 4.71 0 00-1.666-6.101l-1.363-2.829z" />
      <path d="M14.54 11.239c.1-.03.19-.068.277-.113l.117.225a3.21 3.21 0 01-3.123 4.678 3.21 3.21 0 01-2.001-5.446c.49-.69 1.285-1.113 2.193-1.113.635 0 1.237.234 1.714.656.096.086.182.18.257.283L14.54 11.24z" />
    </svg>
);

export const PlayIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.017l3.75 2.25a.75.75 0 010 1.282l-3.75 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
  </svg>
);

export const StopIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zM7.25 5.5A1.75 1.75 0 005.5 7.25v5.5A1.75 1.75 0 007.25 14.5h5.5A1.75 1.75 0 0014.5 12.75v-5.5A1.75 1.75 0 0012.75 5.5h-5.5z" clipRule="evenodd" />
  </svg>
);

export const BoltIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M11.983 1.904a.75.75 0 00-1.292-.782L4.017 10.5h2.736a.75.75 0 01.727 1.002l-4.25 7.5a.75.75 0 001.292.782L15.983 9.5H13.247a.75.75 0 01-.727-1.002l4.25-7.5a.75.75 0 00-.787-.094zM7.784 12H6.25a.75.75 0 01-.727-1.002L9.25 3.192l.034.06L5.534 10.5H7.75V12zm4.466 0h1.534a.75.75 0 00.727-1.002L10.75 3.192l-.034.06L14.466 10.5H12.25V12z" />
    </svg>
);

export const LightBulbIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M9.044 2.793c.126-.569.878-.775 1.274-.342l.654.717a.999.999 0 001.274-.341c.395-.433 1.147-.227 1.273.342l.655.717a1 1 0 001.472.012l.53-.58A.751.751 0 0117 4.25v2.502c0 .355-.16.689-.427.919l-.497.432a1 1 0 000 1.794l.497.432c.267.23.427.565.427.919v2.501a.75.75 0 01-1.25-.653l-.53-.579a1 1 0 00-1.472.012l-.654.717c-.127.569-.879.775-1.274.341a.999.999 0 00-1.274-.341c-.396.434-1.148.227-1.274-.341l-.654-.717a1 1 0 00-1.472-.012l-.53.579a.75.75 0 01-1.25-.653V13.25c0-.355.16-.689.427-.919l.497-.432a1 1 0 000-1.794l-.497-.432A1.125 1.125 0 013 9.253V6.75a.75.75 0 011.25-.653l.53.58a1 1 0 001.472-.012l.654-.717z" />
    <path d="M10 16.5A1.5 1.5 0 018.5 15V8A1.5 1.5 0 0110 6.5h.008A1.5 1.5 0 0111.5 8v7a1.5 1.5 0 01-1.5 1.5H10z" />
  </svg>
);

export const ExclamationTriangleIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);
export const UserGroupIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.75.75 0 01-.326-.976 9.923 9.923 0 011.666-2.532.75.75 0 01.996.364c.16.425.04.91-.231 1.218A8.423 8.423 0 001.49 15.326zM18.51 15.326a8.423 8.423 0 00-2.099-2.228c-.27-.308-.392-.793-.232-1.218a.75.75 0 01.996-.364 9.923 9.923 0 011.666 2.532.75.75 0 01-.326.976A.755.755 0 0118.51 15.326zM14 8a2 2 0 11-4 0 2 2 0 014 0zM10 10.5c-2.84 0-5.467 1.125-6.887 2.824a.75.75 0 00.187 1.05L4.25 15h11.5l.95-.626a.75.75 0 00.187-1.05C15.467 11.625 12.84 10.5 10 10.5z" />
    </svg>
);
export const RoadIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10.202 2.762A1 1 0 009.25 2h- théoriquement3.5a.75.75 0 000 1.5h2.36l-2.438 6.5a.75.75 0 00.698 1.012h2.13L7.75 18a.75.75 0 001.414.53l3-6A.75.75 0 0011.5 12H9.37l2.438-6.5a.75.75 0 00-.698-1.012h-2.13L12.25 2a.75.75 0 00-.53-.914l-3 1A1 1 0 007.03 2.762l3.172-.001zM8.75 5.5a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5z" clipRule="evenodd" />
    </svg>
);

export const CogIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

export const AdjustmentsHorizontalIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M3 5.75A.75.75 0 013.75 5h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5.75zM3 10a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10zm0 4.25a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />
    </svg>
);

export const ChartPieIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10 3.75a.75.75 0 00-7.498 6.094 1.502 1.502 0 002.046 1.499C5.02 11.216 5 11.104 5 11A5 5 0 0110 6v-.75a.75.75 0 00-.75-.75H6.538a.75.75 0 010-1.5h2.712A.75.75 0 0010 3.75z" />
        <path d="M10 6.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM1.75 10a8.25 8.25 0 1116.5 0 8.25 8.25 0 01-16.5 0z" />
    </svg>
);

export const SunIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 4.343a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm-9.192 9.192a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM4.343 4.343a.75.75 0 011.06 0l1.061 1.06a.75.75 0 11-1.06 1.06L4.343 5.404a.75.75 0 010-1.061zM13.435 14.495a.75.75 0 011.06 0l1.06 1.061a.75.75 0 11-1.06 1.06L13.435 15.556a.75.75 0 010-1.061zM18 9.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM2 9.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75z"/>
    </svg>
);
export const ArrowPathIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.204 4.558l-1.36 1.358a.75.75 0 11-1.06-1.06l1.378-1.378A5.5 5.5 0 0110.02 5.5H12a.75.75 0 000-1.5H9.98a7 7 0 100 12h.02a7 7 0 006.29-10.876l1.36-1.358a.75.75 0 10-1.06-1.06l-1.377 1.378z" clipRule="evenodd" />
        <path d="M12.25 9.25a.75.75 0 00-1.5 0V11a.75.75 0 001.5 0V9.25z" />
    </svg>
);

export const InformationCircleIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

export const CheckCircleIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export const XCircleIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

export const ShieldCheckIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 1.028a.75.75 0 01.606.342l3.25 5.25a.75.75 0 01-.334 1.037 4.503 4.503 0 00-7.044 0 .75.75 0 01-.334-1.037l3.25-5.25A.75.75 0 0110 1.028zM3.829 9.382A.75.75 0 013 8.75V5.59c0-.399.206-.76.53-.976l3.25-2.25A2.25 2.25 0 0110 1.75a2.25 2.25 0 012.72 1.614l3.25 2.25c.324.216.53.577.53.976V8.75a.75.75 0 01-.828.732 6.002 6.002 0 01-10.343 0A.75.75 0 013.829 9.382zM6.5 10.5a.75.75 0 00-1.5 0v3.25A2.75 2.75 0 007.75 16.5h4.5A2.75 2.75 0 0015 13.75V10.5a.75.75 0 00-1.5 0v3.25a1.25 1.25 0 01-1.25 1.25h-4.5A1.25 1.25 0 016.5 13.75V10.5z" clipRule="evenodd" />
    <path d="M9.03 12.28a.75.75 0 10-1.06-1.06l-1.5 1.5a.75.75 0 001.06 1.06l1.5-1.5zm3.737-1.06a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 101.06-1.06l-1.5-1.5z" />
  </svg>
);

export const FireIcon: React.FC<SVGProps> = (props) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.198 2.51a.75.75 0 00-1.31-.727l-5.25 9.046a.75.75 0 00.513 1.139c1.42.27 2.015 1.319 2.148 2.627.13.195.295.37.49.524a4.708 4.708 0 006.448-2.678 4.71 4.71 0 00-1.666-6.101l-1.363-2.829z" />
    <path d="M14.54 11.239c.1-.03.19-.068.277-.113l.117.225a3.21 3.21 0 01-3.123 4.678 3.21 3.21 0 01-2.001-5.446c.49-.69 1.285-1.113 2.193-1.113.635 0 1.237.234 1.714.656.096.086.182.18.257.283L14.54 11.24z" />
  </svg>
);

export const TemperatureIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.373c.797.155 1.539.429 2.228.812c.688.383 1.29.878 1.772 1.472a.75.75 0 01-1.121.986A4.544 4.544 0 0013 7.75a4.512 4.512 0 00-2-1.09V11a3 3 0 11-2 0V6.66a4.512 4.512 0 00-2 1.09 4.544 4.544 0 00-.879.894a.75.75 0 01-1.121-.986c.481-.594 1.084-1.089 1.772-1.472A6.01 6.01 0 019 5.373V4a1 1 0 011-1zm0 14a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
    <path d="M10 11a1.5 1.5 0 00-1.5 1.5v1a1.5 1.5 0 103 0v-1A1.5 1.5 0 0010 11z" />
  </svg>
);
// Note: FireIcon was already present. If a distinct icon for "Live Fire Intel" section header is needed, it can be aliased or a new one created.
// Using the existing FireIcon for the intel section header as well for now.
// Example: export { FireIcon as FireIntelIcon } from './icons'; and use FireIntelIcon in ControlPanel.tsx
// For this change, I'll assume FireIcon used in ControlPanel's dashboard is acceptable, or the one named FireIntelIcon (which is same as FireActiveIcon) is used.
// The TemperatureIcon is the new addition.
// Added a more distinct TemperatureIcon.