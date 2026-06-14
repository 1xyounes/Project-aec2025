
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Alert } from '../types';
import { MOCK_FIRE_IMAGE_URL, MOCK_NO_FIRE_IMAGE_URL } from '../constants'; // For mock images

interface VerificationModalProps {
  alert: Alert;
  droneId: string;
  onVerify: (isActualFire: boolean) => void;
  onClose: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ alert, droneId, onVerify, onClose }) => {
  // Use a mock image. In a real scenario, this would be live or recent footage.
  // For simulation, we can alternate or base it on something. Here, just one type.
  const mockImageUrl = alert.x < 10 ? MOCK_FIRE_IMAGE_URL : MOCK_NO_FIRE_IMAGE_URL; // Simple logic for varied images

  return (
    <Modal isOpen={true} onClose={onClose} title={`Verification for Alert ${alert.id}`} size="lg">
      <div className="space-y-4">
        <p>Drone <span className="font-semibold text-teal-300">{droneId}</span> has reached location ({alert.x}, {alert.y}).</p>
        
        {alert.confirmedByAI !== undefined && (
            <div className={`p-3 rounded-md ${alert.isFire ? 'bg-red-700' : 'bg-green-700'}`}>
                <h4 className="font-semibold text-lg">AI Assessment: {alert.isFire ? "Likely Fire" : "Likely False Alarm"}</h4>
                <p className="text-sm">Confidence: {(alert.aiConfidence ?? 0) * 100}%</p>
                <p className="text-sm italic">Reasoning: {alert.aiReasoning || "No detailed reasoning provided."}</p>
            </div>
        )}

        <div className="bg-gray-700 p-2 rounded flex items-center justify-center">
          <img 
            src={mockImageUrl} 
            alt="Simulated drone footage" 
            className="max-w-full max-h-64 rounded shadow" 
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Drone+Feed+Error')}
          />
        </div>
        
        <p className="text-center font-semibold">Based on the image (and AI assessment if provided), is this a real fire?</p>
        
        <div className="flex justify-around mt-6">
          <Button onClick={() => onVerify(true)} variant="danger" className="w-2/5">
            Confirm Fire
          </Button>
          <Button onClick={() => onVerify(false)} variant="secondary" className="w-2/5">
            False Alarm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VerificationModal;
