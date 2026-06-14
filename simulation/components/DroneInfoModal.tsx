
import React from 'react';
import Modal from './Modal';
import { Drone } from '../types';
import Button from './Button';
import { DRONE_BATTERY_CAPACITY } from '../constants';

interface DroneInfoModalProps {
  drone: Drone | null;
  onClose: () => void;
}

const DroneInfoModal: React.FC<DroneInfoModalProps> = ({ drone, onClose }) => {
  if (!drone) return null;

  const batteryPercentage = (drone.battery / DRONE_BATTERY_CAPACITY) * 100;
  let batteryBarColor = 'bg-green-500';
  if (batteryPercentage < 20) {
    batteryBarColor = 'bg-red-500';
  } else if (batteryPercentage < 50) {
    batteryBarColor = 'bg-yellow-500';
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Drone Details - ${drone.id}`} size="sm">
      <div className="space-y-2 text-sm text-gray-300">
        <p><strong className="text-teal-300">ID:</strong> {drone.id}</p>
        <p><strong className="text-teal-300">Status:</strong> <span className={`font-semibold ${
            drone.status === 'IDLE' ? 'text-green-400' :
            drone.status === 'PATROLLING' ? 'text-blue-400' :
            drone.status === 'EN_ROUTE_TO_ALERT' ? 'text-yellow-400' :
            drone.status === 'EN_ROUTE_TO_DEPOT' ? 'text-purple-400' :
            drone.status === 'VERIFYING' ? 'text-orange-400' :
            drone.status === 'RECHARGING' ? 'text-cyan-400' :
            'text-gray-400'
        }`}>{drone.status}</span></p>
        
        <div>
            <strong className="text-teal-300">Battery:</strong> {drone.battery.toFixed(1)} / {DRONE_BATTERY_CAPACITY} ({batteryPercentage.toFixed(1)}%)
            <div className="w-full bg-gray-600 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                <div 
                    className={`h-2.5 rounded-full ${batteryBarColor}`} 
                    style={{ width: `${batteryPercentage}%` }}
                    aria-valuenow={batteryPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                    aria-label="Drone battery level"
                ></div>
            </div>
        </div>

        <p><strong className="text-teal-300">Location:</strong> ({drone.x.toFixed(1)}, {drone.y.toFixed(1)})</p>
        <p><strong className="text-teal-300">Depot:</strong> {drone.depotId}</p>
        {drone.target && (
          <p><strong className="text-teal-300">Target:</strong> ({drone.target.x.toFixed(1)}, {drone.target.y.toFixed(1)})</p>
        )}
        {drone.assignedAlertId && (
            <p><strong className="text-teal-300">Assigned Alert:</strong> {drone.assignedAlertId}</p>
        )}
        <p><strong className="text-teal-300">Path Length:</strong> {drone.currentPath.length} steps</p>
        {drone.patrolWaypoints.length > 0 && (
             <p><strong className="text-teal-300">Patrol Waypoints:</strong> {drone.patrolWaypoints.map(wp => `(${wp.x},${wp.y})`).join(', ')}</p>
        )}
        <p><strong className="text-teal-300">Navigation Mode:</strong> {drone.navigationMode || "GPS"}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="secondary">Close</Button>
      </div>
    </Modal>
  );
};

export default DroneInfoModal;
