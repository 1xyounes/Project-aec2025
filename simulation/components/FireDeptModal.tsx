
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FireDeptDetails } from '../types';

interface FireDeptModalProps {
  details: FireDeptDetails;
  onClose: () => void;
}

const FireDeptModal: React.FC<FireDeptModalProps> = ({ details, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Fire Department Dispatch" size="md">
      <div className="space-y-3 text-gray-300">
        <p className="text-xl text-red-400 font-bold">EMERGENCY ALERT ESCALATED!</p>
        <p><strong className="text-teal-300">Alert ID:</strong> {details.alertId}</p>
        <p><strong className="text-teal-300">Location:</strong> {details.location}</p>
        <p><strong className="text-teal-300">Reported Time (Sim):</strong> Tick {details.reportedTime}</p>
        <p><strong className="text-teal-300">Confirmed By:</strong> {details.confirmedBy}</p>
        <p><strong className="text-teal-300">Details:</strong> <em className="italic">{details.details}</em></p>
        
        <div className="mt-6 border-t border-gray-700 pt-4">
          <p className="text-sm text-yellow-400">This simulates a dispatch to emergency services. All relevant data has been logged.</p>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="primary">
            Acknowledge & Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FireDeptModal;
