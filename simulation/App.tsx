
import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './state/AppContext';
import ForestOptimizerSetup from './components/ForestOptimizerSetup';
import MapDisplay from './components/MapDisplay';
import ControlPanel from './components/ControlPanel';
import VerificationModal from './components/VerificationModal';
import FireDeptModal from './components/FireDeptModal';
import DroneInfoModal from './components/DroneInfoModal';
import NotificationsArea from './components/NotificationsArea';
import { initializeChat } from './services/geminiService'; // For potential future chat features

const AppContent: React.FC = () => {
  const { state, dispatch, ai } = useAppContext();

  useEffect(() => {
    if (ai && !state.chatInstance) {
      // Example system instruction - can be adapted for other AI tasks
      const systemInstruction = "You are a helpful assistant for the Project Aegis wildfire simulation. Provide concise information when queried.";
      initializeChat(ai, systemInstruction).then(chat => {
        dispatch({ type: "INITIALIZE_CHAT", payload: chat });
      }).catch(error => console.error("Failed to initialize chat:", error));
    }
  }, [ai, state.chatInstance, dispatch]);

  if (!state.forestSetupComplete || state.isOptimizerRunning) {
    return <ForestOptimizerSetup />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 p-4 text-center shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-teal-400">Project Aegis: Wildfire Simulation</h1>
      </header>
      
      <main className="flex flex-1 overflow-hidden p-2 sm:p-4 gap-2 sm:gap-4">
        <div className="flex-grow-[3] flex flex-col items-center justify-center bg-gray-800 shadow-xl rounded-lg p-2 overflow-hidden relative">
          <MapDisplay />
          <NotificationsArea />
        </div>
        <aside className="flex-grow-[1] bg-gray-800 shadow-xl rounded-lg p-1 sm:p-4 overflow-y-auto">
          <ControlPanel />
        </aside>
      </main>

      {state.showVerificationModal && state.alertToVerify && state.droneVerifyingAlert && (
        <VerificationModal
          alert={state.alertToVerify}
          droneId={state.droneVerifyingAlert}
          onVerify={(isActualFire) => {
            dispatch({
              type: "HANDLE_VERIFICATION_RESULT",
              payload: {
                alertId: state.alertToVerify!.id,
                isActualFire,
                confirmedByAI: false, // Manual verification
              },
            });
            if(isActualFire) {
                const confirmedAlert = {...state.alertToVerify!, isFire: true, confirmedByAI: false};
                dispatch({type: "ESCALATE_ALERT_TO_FIRE_DEPT", payload: confirmedAlert });
            }
          }}
          onClose={() => dispatch({ type: "CLOSE_VERIFICATION_MODAL" })}
        />
      )}

      {state.showFireDeptModal && state.fireDeptDetails && (
        <FireDeptModal
          details={state.fireDeptDetails}
          onClose={() => dispatch({ type: "CLOSE_FIRE_DEPT_MODAL" })}
        />
      )}
      {state.selectedDroneInfoId && (
        <DroneInfoModal 
            drone={state.drones.find(d => d.id === state.selectedDroneInfoId) ?? null}
            onClose={() => dispatch({type: 'SELECT_DRONE_INFO', payload: null})}
        />
      )}
       <footer className="bg-gray-800 p-2 text-center text-xs text-gray-500">
        Project Aegis v2.0 - Gemini API Integration Demo. API Key Status: {process.env.API_KEY ? 'Loaded' : 'Not Loaded (AI features may be limited)'}
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
