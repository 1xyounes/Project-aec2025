import React, { useState, useMemo } from 'react';
import { useAppContext, findPathBFS, calculateDistance } from '../state/AppContext';
import { getOptimalDroneViaGemini } from '../services/geminiService';
import Button from './Button';
import { DroneStatus, WindDirection, Sensor, Alert, AlertLevel, GridCell } from '../types';
import { PlayIcon, StopIcon, BoltIcon, ExclamationTriangleIcon, LightBulbIcon, AdjustmentsHorizontalIcon, ChartPieIcon, SunIcon, ArrowPathIcon, FireIcon as FireIntelIcon, TemperatureIcon } from './icons'; // Renamed FireIcon to FireIntelIcon to avoid conflict
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LOW_BATTERY_THRESHOLD, DEFAULT_ENVIRONMENT_TEMPERATURE } from '../constants';


const ControlPanel: React.FC = () => {
  const { state, dispatch, ai } = useAppContext();
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'controls' | 'dashboard'>('controls');

  const handleStartSimulation = () => dispatch({ type: "START_SIMULATION" });
  const handleStopSimulation = () => dispatch({ type: "STOP_SIMULATION" });
  const handleToggleAiVerification = (e: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: "TOGGLE_AI_VERIFICATION", payload: e.target.checked });


  const handleTriggerAlert = async () => {
    if (!selectedSensor) {
      dispatch({type: 'ADD_NOTIFICATION', payload: {id: Date.now().toString(), message: 'Please select a sensor first.', type: 'warning', timestamp: Date.now()}});
      return;
    }
    const sensor = state.sensors.find(s => s.id === selectedSensor);
    if (!sensor) return;

    const newAlertId = `A-manual-${Date.now()}`; 
    const alertToProcess: Alert = { 
        id: newAlertId, 
        sensorId: sensor.id, 
        x: sensor.x, y: sensor.y, 
        timestamp: state.simulationTime, 
        level: AlertLevel.Investigating, 
        isFire: false, 
        isSpreading: false, 
        fireSpreadCells: new Set()
    };
    
    dispatch({ type: "TRIGGER_ALERT", payload: { alertId: newAlertId, sensorId: sensor.id, x: sensor.x, y: sensor.y } });

    if (ai) {
        dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: "Querying Gemini for optimal drone..." });
        try {
            const { droneId, reasoning } = await getOptimalDroneViaGemini(ai, alertToProcess, state.drones, state.depots, state.forbiddenZones);
            dispatch({ type: "SET_GEMINI_REASONING", payload: reasoning });

            if (droneId) {
                const drone = state.drones.find(d => d.id === droneId);
                if (drone) {
                    const path = findPathBFS({ x: drone.x, y: drone.y }, { x: alertToProcess.x, y: alertToProcess.y }, state.gridData, state.forbiddenZones);
                    if (path.length > 0) {
                        dispatch({ type: "ASSIGN_DRONE_TO_ALERT", payload: { droneId, alertId: alertToProcess.id, path } });
                        dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Gemini selected ${droneId}. En route to ${alertToProcess.id}.` });
                    } else {
                         dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Gemini selected ${droneId}, but no path found to ${alertToProcess.id}.` });
                         dispatch({ type: "ADD_NOTIFICATION", payload: {id: `${Date.now()}-no-path`, message: `No path for ${droneId} to alert ${alertToProcess.id}. Drone remains idle.`, type: 'warning', timestamp: Date.now()} });
                    }
                } else {
                     dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Gemini selected ${droneId}, but drone not found in state.` });
                }
            } else {
                dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Gemini could not select a drone for ${alertToProcess.id}. ${reasoning}` });
            }
        } catch (error) {
            console.error("Error dispatching drone via Gemini:", error);
            dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Error querying Gemini for ${alertToProcess.id}. Using fallback.` });
            // Fallback logic
            const availableDrones = state.drones.filter(d => (d.status === DroneStatus.Idle || d.status === DroneStatus.Patrolling) && d.battery > LOW_BATTERY_THRESHOLD);
            if (availableDrones.length > 0) {
                availableDrones.sort((a,b) => calculateDistance({x:a.x, y:a.y}, {x:alertToProcess.x, y:alertToProcess.y}) - calculateDistance({x:b.x, y:b.y}, {x:alertToProcess.x, y:alertToProcess.y}));
                const bestDrone = availableDrones[0];
                const path = findPathBFS({x: bestDrone.x, y: bestDrone.y}, {x: alertToProcess.x, y: alertToProcess.y}, state.gridData, state.forbiddenZones);
                if (path.length > 0) {
                    dispatch({ type: "ASSIGN_DRONE_TO_ALERT", payload: { droneId: bestDrone.id, alertId: alertToProcess.id, path } });
                    dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Fallback: Assigned ${bestDrone.id} to ${alertToProcess.id}.` });
                } else {
                     dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Fallback: ${bestDrone.id} closest to ${alertToProcess.id}, but no path.` });
                }
            } else {
                 dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Fallback: No drones available for ${alertToProcess.id}.` });
            }
        }
    } else { // Fallback if AI not available
        dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: "AI not available. Using fallback for dispatch." });
         const availableDrones = state.drones.filter(d => (d.status === DroneStatus.Idle || d.status === DroneStatus.Patrolling) && d.battery > LOW_BATTERY_THRESHOLD);
            if (availableDrones.length > 0) {
                availableDrones.sort((a,b) => calculateDistance({x:a.x, y:a.y}, {x:alertToProcess.x, y:alertToProcess.y}) - calculateDistance({x:b.x, y:b.y}, {x:alertToProcess.x, y:alertToProcess.y}));
                const bestDrone = availableDrones[0];
                const path = findPathBFS({x: bestDrone.x, y: bestDrone.y}, {x: alertToProcess.x, y: alertToProcess.y}, state.gridData, state.forbiddenZones);
                if (path.length > 0) {
                    dispatch({ type: "ASSIGN_DRONE_TO_ALERT", payload: { droneId: bestDrone.id, alertId: alertToProcess.id, path } });
                    dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Fallback (No AI): Assigned ${bestDrone.id} to ${alertToProcess.id}.` });
                } else {
                     dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Fallback (No AI): ${bestDrone.id} closest to ${alertToProcess.id}, but no path.` });
                }
            } else {
                 dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Fallback (No AI): No drones available for ${alertToProcess.id}.` });
            }
    }
  };
  
  const handleRandomAlert = () => {
    if (state.sensors.length === 0) {
        dispatch({type: 'ADD_NOTIFICATION', payload: {id: Date.now().toString(), message: 'No sensors available to trigger random alert.', type: 'warning', timestamp: Date.now()}});
        return;
    }
    const randomSensorIndex = Math.floor(Math.random() * state.sensors.length);
    const sensor = state.sensors[randomSensorIndex];
    setSelectedSensor(sensor.id); 

    const randomAlertId = `A-random-${Date.now()}`;
    dispatch({ type: "TRIGGER_ALERT", payload: { alertId: randomAlertId, sensorId: sensor.id, x: sensor.x, y: sensor.y } });
    
    dispatch({type: 'ADD_NOTIFICATION', payload: {id: `${Date.now()}-rand-alert`, message: `Random alert ${randomAlertId} on S${sensor.id.split('-')[1]}. Auto-dispatching...`, type: 'info', timestamp: Date.now()}});
    
    const availableDrones = state.drones.filter(d => (d.status === DroneStatus.Idle || d.status === DroneStatus.Patrolling) && d.battery > LOW_BATTERY_THRESHOLD);
    if (availableDrones.length > 0) {
        availableDrones.sort((a,b) => calculateDistance({x:a.x, y:a.y}, {x:sensor.x, y:sensor.y}) - calculateDistance({x:b.x, y:b.y}, {x:sensor.x, y:sensor.y}));
        const bestDrone = availableDrones[0];
        const path = findPathBFS({x: bestDrone.x, y: bestDrone.y}, {x: sensor.x, y: sensor.y}, state.gridData, state.forbiddenZones);
        if (path.length > 0) {
            dispatch({ type: "ASSIGN_DRONE_TO_ALERT", payload: { droneId: bestDrone.id, alertId: randomAlertId, path } });
            dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Auto-dispatch (random): ${bestDrone.id} to ${randomAlertId}.` });
        } else {
             dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Auto-dispatch (random): ${bestDrone.id} to ${randomAlertId} - NO PATH.` });
        }
    } else {
         dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `Auto-dispatch (random): No drones for ${randomAlertId}.` });
    }
  };


  const handleWindSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_WIND_SPEED", payload: parseInt(e.target.value) });
  };

  const handleWindDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: "SET_WIND_DIRECTION", payload: e.target.value as WindDirection });
  };
  
  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_ENVIRONMENT_TEMPERATURE", payload: parseInt(e.target.value) });
  };

  const droneStatusData = useMemo(() => {
    const counts = state.drones.reduce((acc, drone) => {
      acc[drone.status] = (acc[drone.status] || 0) + 1;
      return acc;
    }, {} as Record<DroneStatus, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [state.drones]);

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D'];

  const selectedFireAlert = useMemo(() => {
    if (!state.selectedFireAlertDetailsId) return null;
    return state.alerts.find(a => a.id === state.selectedFireAlertDetailsId && a.isFire);
  }, [state.selectedFireAlertDetailsId, state.alerts]);

  const getAverageFuelLoadOfFire = (alert: Alert | null | undefined): number => {
    if (!alert || alert.fireSpreadCells.size === 0) return 0;
    let totalFuel = 0;
    alert.fireSpreadCells.forEach(cellId => {
        const [x,y] = cellId.split('-').map(Number);
        if(state.gridData[y] && state.gridData[y][x]){
            totalFuel += state.gridData[y][x].fuelLoad;
        }
    });
    return totalFuel / alert.fireSpreadCells.size;
  }


  return (
    <div className="p-1 sm:p-4 bg-gray-800 text-gray-200 h-full flex flex-col">
      <div className="flex border-b border-gray-700 mb-4">
        <button 
            onClick={() => setActiveTab('controls')}
            className={`py-2 px-4 font-medium flex items-center ${activeTab === 'controls' ? 'border-b-2 border-teal-400 text-teal-400' : 'text-gray-400 hover:text-teal-300'}`}
        >
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" /> Controls
        </button>
        <button 
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-4 font-medium flex items-center ${activeTab === 'dashboard' ? 'border-b-2 border-teal-400 text-teal-400' : 'text-gray-400 hover:text-teal-300'}`}
        >
            <ChartPieIcon className="w-5 h-5 mr-2" /> Dashboard
        </button>
      </div>

      {activeTab === 'controls' && (
        <div className="space-y-4 overflow-y-auto pr-1 flex-grow">
          <div className="flex space-x-2">
            {!state.isSimulationRunning ? (
              <Button onClick={handleStartSimulation} disabled={!state.forestSetupComplete || state.isOptimizerRunning} className="bg-green-600 hover:bg-green-700 flex-1">
                <PlayIcon className="w-5 h-5 mr-2" /> Start Sim
              </Button>
            ) : (
              <Button onClick={handleStopSimulation} className="bg-red-600 hover:bg-red-700 flex-1">
                <StopIcon className="w-5 h-5 mr-2" /> Stop Sim
              </Button>
            )}
             <Button onClick={() => dispatch({type: 'START_SIMULATION_SETUP'})} className="bg-indigo-600 hover:bg-indigo-700 flex-1">
                <ArrowPathIcon className="w-5 h-5 mr-2" /> Reset Setup
            </Button>
          </div>
          <p className="text-sm">Time: {state.simulationTime}</p>
          
          <div className="bg-gray-700 p-3 rounded-md shadow">
            <h3 className="text-lg font-semibold mb-2 text-teal-400 flex items-center"><ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-400"/>Alert Management</h3>
            <select 
              value={selectedSensor || ""} 
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md mb-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="" disabled>Select a sensor to trigger alert</option>
              {state.sensors.map((s: Sensor) => <option key={s.id} value={s.id}>{s.id} at ({s.x},{s.y})</option>)}
            </select>
            <div className="flex space-x-2">
                 <Button onClick={handleTriggerAlert} disabled={!selectedSensor || (!ai && !process.env.API_KEY)} className="bg-yellow-600 hover:bg-yellow-700 flex-1">
                    <BoltIcon className="w-5 h-5 mr-2"/> Trigger on Selected
                </Button>
                <Button onClick={handleRandomAlert} className="bg-orange-500 hover:bg-orange-600 flex-1">
                    <BoltIcon className="w-5 h-5 mr-2"/> Trigger Random
                </Button>
            </div>
           
            <div className="mt-3">
                 <label htmlFor="aiVerificationToggle" className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        id="aiVerificationToggle"
                        checked={state.isAiVerificationEnabled}
                        onChange={handleToggleAiVerification}
                        className="form-checkbox h-5 w-5 text-teal-500 bg-gray-600 border-gray-500 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm">Enable AI Verification</span>
                 </label>
            </div>
          </div>

          <div className="bg-gray-700 p-3 rounded-md shadow">
            <h3 className="text-lg font-semibold mb-2 text-teal-400 flex items-center"><LightBulbIcon className="w-5 h-5 mr-2 text-yellow-300"/>AI Dispatcher</h3>
            <p className="text-sm font-mono bg-gray-600 p-2 rounded break-words min-h-[40px]">{state.aiDispatcherStatus}</p>
            {state.geminiReasoning && (
              <>
                <h4 className="text-sm font-semibold mt-2 mb-1 text-teal-300">Gemini Reasoning:</h4>
                <p className="text-xs italic bg-gray-600 p-2 rounded break-words">{state.geminiReasoning}</p>
              </>
            )}
          </div>

          <div className="bg-gray-700 p-3 rounded-md shadow">
            <h3 className="text-lg font-semibold mb-2 text-teal-400 flex items-center"><SunIcon className="w-5 h-5 mr-2 text-yellow-400"/>Environmental Controls</h3>
            <div>
              <label htmlFor="windSpeed" className="block text-sm font-medium">Wind Speed: {state.windSpeed}</label>
              <input
                type="range"
                id="windSpeed"
                min="0" max="5" step="1"
                value={state.windSpeed}
                onChange={handleWindSpeedChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
            <div className="mt-2">
              <label htmlFor="windDirection" className="block text-sm font-medium">Wind Direction</label>
              <select
                id="windDirection"
                value={state.windDirection}
                onChange={handleWindDirectionChange}
                className="w-full p-2 bg-gray-600 border-gray-500 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                {Object.values(WindDirection).map(dir => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>
            <div className="mt-2">
              <label htmlFor="temperature" className="block text-sm font-medium">Environment Temp: {state.environmentTemperature}°C</label>
              <input
                type="range"
                id="temperature"
                min="0" max="50" step="1"
                value={state.environmentTemperature}
                onChange={handleTemperatureChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-4 overflow-y-auto pr-1 flex-grow">
          <div className="bg-gray-700 p-3 rounded-md shadow">
            <h3 className="text-lg font-semibold mb-2 text-teal-400 flex items-center"><ChartPieIcon className="w-5 h-5 mr-2"/>Drone Status</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={droneStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {droneStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ outline: "none", backgroundColor: "#374151", border: "1px solid #4B5563", borderRadius: "0.25rem" }}/>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-gray-700 p-3 rounded-md shadow">
             <h3 className="text-lg font-semibold mb-2 text-teal-400 flex items-center"><ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-400"/>Alerts Overview</h3>
             <p className="text-sm">Active Alerts (Investigating/Fire): <span className="font-bold text-yellow-300">{state.alerts.filter(a => a.level === AlertLevel.Investigating || a.level === AlertLevel.ConfirmedFire).length}</span></p>
             <p className="text-sm">Confirmed Fires: <span className="font-bold text-red-400">{state.alerts.filter(a => a.level === AlertLevel.ConfirmedFire).length}</span></p>
             <p className="text-sm">Total Drones: <span className="font-bold text-teal-300">{state.drones.length}</span></p>
          </div>
          {selectedFireAlert && (
            <div className="bg-gray-700 p-3 rounded-md shadow border-2 border-red-500">
                <h3 className="text-lg font-semibold mb-2 text-red-400 flex items-center"><FireIntelIcon className="w-5 h-5 mr-2"/>Live Fire Intel: {selectedFireAlert.id}</h3>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                    <p>Coords: <span className="font-mono">({selectedFireAlert.x}, {selectedFireAlert.y})</span></p>
                    <p>Detected: <span className="font-mono">Tick {selectedFireAlert.timestamp}</span></p>
                    <p>Wind: <span className="font-mono">{state.windSpeed} ({state.windDirection})</span></p>
                    <p>Temp: <span className="font-mono">{state.environmentTemperature}°C</span></p>
                    <p>Size: <span className="font-mono">{selectedFireAlert.fireSpreadCells.size} cells</span></p>
                    <p>Avg Fuel: <span className="font-mono">{getAverageFuelLoadOfFire(selectedFireAlert).toFixed(1)}</span></p>
                </div>
            </div>
          )}
          {!selectedFireAlert && state.selectedFireAlertDetailsId && (
             <div className="bg-gray-700 p-3 rounded-md shadow">
                <p className="text-sm text-yellow-400">Selected fire alert <span className="font-mono">{state.selectedFireAlertDetailsId}</span> is no longer active or not found.</p>
             </div>
          )}
           {!state.selectedFireAlertDetailsId && (
             <div className="bg-gray-700 p-3 rounded-md shadow">
                <p className="text-sm text-gray-400">Click on an active fire on the map to see live details here.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ControlPanel;