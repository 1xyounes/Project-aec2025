
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { 
  AppState, Action, GridCell, Sensor, Drone, Depot, Alert, AlertLevel, DroneStatus,
  PatrolWaypoint, WindDirection, Notification
} from '../types';
import { 
  GRID_SIZE, SENSOR_RANGE, DRONE_SPEED, DRONE_BATTERY_CAPACITY, 
  DRONE_PATROL_CONSUMPTION, DRONE_TRANSIT_CONSUMPTION, DRONE_RECHARGE_RATE, LOW_BATTERY_THRESHOLD,
  WIND_DIRECTIONS_MAP, BASE_FIRE_SPREAD_CHANCE, FUEL_LOAD_SPREAD_FACTOR, WIND_SPEED_SPREAD_FACTOR, MAX_HISTORICAL_DATA_POINTS,
  SIMULATION_TICK_INTERVAL, DEFAULT_ENVIRONMENT_TEMPERATURE, TEMPERATURE_SPREAD_FACTOR
} from '../constants';
import { verifyFireWithAI } from '../services/geminiService';

const initialGridData = (): GridCell[][] =>
  Array(GRID_SIZE).fill(null).map((_, y) =>
    Array(GRID_SIZE).fill(null).map((_, x) => ({
      id: `${x}-${y}`,
      x,
      y,
      riskScore: 0, 
      isObstacle: false,
      isForbidden: false,
      isSensor: false,
      fuelLoad: 0, 
      isFire: false,
    }))
  );

const initialAppState: AppState = {
  gridSize: GRID_SIZE,
  gridData: initialGridData(),
  sensors: [],
  drones: [],
  depots: [],
  alerts: [],
  simulationTime: 0,
  isSimulationRunning: false,
  optimizedGrid: null,
  forbiddenZones: [],
  notifications: [],
  aiDispatcherStatus: "Idle",
  geminiReasoning: "",
  selectedDroneForAlert: null,
  droneVerifyingAlert: null,
  alertToVerify: null,
  showVerificationModal: false,
  showFireDeptModal: false,
  fireDeptDetails: null,
  forestSetupComplete: false,
  patrolWaypoints: [],
  chatInstance: null,
  windSpeed: 1, 
  windDirection: WindDirection.NONE,
  environmentTemperature: DEFAULT_ENVIRONMENT_TEMPERATURE,
  historicalAlertData: [],
  selectedDroneInfoId: null,
  selectedFireAlertDetailsId: null,
  isOptimizerRunning: false,
  isAiVerificationEnabled: true,
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action>, ai: GoogleGenAI | null } | undefined>(undefined);

// --- Utility Functions for Reducer ---
const findPathBFS = (start: {x:number, y:number}, end: {x:number, y:number}, grid: GridCell[][], forbiddenZones: {x:number, y:number}[]): {x:number, y:number}[] => {
  const queue: {x: number, y: number, path: {x:number, y:number}[]}[] = [{ ...start, path: [] }];
  const visited = new Set<string>();
  visited.add(`${start.x}-${start.y}`);
  
  const numRows = grid.length;
  const numCols = numRows > 0 ? grid[0].length : 0;

  if (numRows === 0 || numCols === 0) return [];

  const isCellValid = (x: number, y: number) => {
    return x >= 0 && x < numCols && y >= 0 && y < numRows &&
           !grid[y][x].isObstacle &&
           !forbiddenZones.some(fz => fz.x === x && fz.y === y);
  };

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    if (current.x === end.x && current.y === end.y) {
      return [...current.path, {x: current.x, y: current.y}];
    }

    const neighbors = [
      { x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 },
    ];

    for (const neighbor of neighbors) {
      if (isCellValid(neighbor.x, neighbor.y) && !visited.has(`${neighbor.x}-${neighbor.y}`)) {
        visited.add(`${neighbor.x}-${neighbor.y}`);
        queue.push({ ...neighbor, path: [...current.path, {x: current.x, y: current.y}] });
      }
    }
  }
  return []; 
};

const calculateDistance = (p1: {x:number,y:number}, p2: {x:number,y:number}) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};
// --- End Utility Functions ---


const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "START_SIMULATION_SETUP":
      return { ...initialAppState, chatInstance: state.chatInstance, environmentTemperature: state.environmentTemperature, windSpeed: state.windSpeed, windDirection: state.windDirection }; 
    case "COMPLETE_FOREST_OPTIMIZER_SETUP": {
      const { grid, sensors, depots, forbiddenZones, patrolWaypoints } = action.payload;
      const filteredPatrolWaypoints = patrolWaypoints.length > 0 ? patrolWaypoints.filter(wp => !forbiddenZones.some(fz => fz.x === wp.x && fz.y === wp.y)) : [];
      const initialDrones: Drone[] = depots.map((depot, index) => ({
        id: `D${index + 1}`,
        depotId: depot.id,
        x: depot.x,
        y: depot.y,
        status: DroneStatus.Idle,
        battery: DRONE_BATTERY_CAPACITY,
        target: null,
        currentPath: [],
        patrolWaypoints: filteredPatrolWaypoints,
        currentWaypointIndex: filteredPatrolWaypoints.length > 0 ? index % filteredPatrolWaypoints.length : 0,
        assignedAlertId: null,
        navigationMode: "GPS",
      }));
      return {
        ...state,
        optimizedGrid: grid,
        gridData: grid, 
        gridSize: grid.length, 
        sensors,
        depots,
        drones: initialDrones,
        forbiddenZones,
        patrolWaypoints,
        forestSetupComplete: true,
        isOptimizerRunning: false,
        notifications: [{id: Date.now().toString(), message: "Forest optimization complete. Ready for simulation.", type: "success", timestamp: Date.now()}],
      };
    }
    case "START_SIMULATION":
      if (!state.forestSetupComplete) {
        return {...state, notifications: [...state.notifications, {id: Date.now().toString(), message: "Please complete forest setup first.", type: "warning", timestamp: Date.now()}]};
      }
      return { ...state, isSimulationRunning: true, simulationTime: 0, historicalAlertData: [{time: 0, count: 0}] };
    case "STOP_SIMULATION":
      return { ...state, isSimulationRunning: false };
    case "TOGGLE_AI_VERIFICATION":
      return { ...state, isAiVerificationEnabled: action.payload };
    case "UPDATE_SIMULATION_TICK": {
      if (!state.isSimulationRunning) return state;
      
      let newAlerts = [...state.alerts];
      let newGridData = state.gridData.map(row => row.map(cell => ({...cell, isFire: state.alerts.some(a => a.fireSpreadCells.has(cell.id) && a.isFire) })));
      const tickNotifications: Notification[] = [];

      let nextDroneVerifyingAlert: string | null = state.droneVerifyingAlert;
      let nextAlertToVerify: Alert | null = state.alertToVerify;
      let nextShowVerificationModal: boolean = state.showVerificationModal;

      // --- Fire Spreading ---
      state.alerts.filter(alert => alert.isFire && alert.isSpreading).forEach(alert => {
        const newlySpreadCells: string[] = [];
        alert.fireSpreadCells.forEach(cellId => {
          const [cx, cy] = cellId.split('-').map(Number);
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx;
              const ny = cy + dy;

              if (nx >= 0 && nx < state.gridSize && ny >= 0 && ny < state.gridSize) {
                const neighborCell = newGridData[ny][nx];
                if (!neighborCell.isFire && !neighborCell.isObstacle && !neighborCell.isForbidden && !alert.fireSpreadCells.has(neighborCell.id)) {
                  let spreadChance = BASE_FIRE_SPREAD_CHANCE;
                  spreadChance += (neighborCell.fuelLoad / 10) * FUEL_LOAD_SPREAD_FACTOR;

                  const windMod = WIND_DIRECTIONS_MAP[state.windDirection];
                  if (state.windSpeed > 0 && Math.sign(dx) === Math.sign(windMod.dx) && Math.sign(dy) === Math.sign(windMod.dy)) {
                    if ( (windMod.dx !== 0 && dx === windMod.dx) || (windMod.dy !== 0 && dy === windMod.dy) ) {
                        spreadChance += (state.windSpeed / 5) * WIND_SPEED_SPREAD_FACTOR;
                    }
                  }
                  
                  if (state.environmentTemperature > 20) {
                    spreadChance += (state.environmentTemperature - 20) * TEMPERATURE_SPREAD_FACTOR;
                  }
                  spreadChance = Math.min(1, Math.max(0, spreadChance)); // Clamp chance between 0 and 1

                  if (Math.random() < spreadChance) {
                    newlySpreadCells.push(neighborCell.id);
                    newGridData[ny][nx].isFire = true; 
                  }
                }
              }
            }
          }
        });
        if (newlySpreadCells.length > 0) {
            const alertIndex = newAlerts.findIndex(a => a.id === alert.id);
            if(alertIndex !== -1) {
                const updatedAlert = {...newAlerts[alertIndex]};
                updatedAlert.fireSpreadCells = new Set([...updatedAlert.fireSpreadCells, ...newlySpreadCells]);
                newAlerts[alertIndex] = updatedAlert;
            }
        }
      });
      
      // --- Drone Logic ---
      const updatedDrones = state.drones.map(drone => {
        let newDrone = { ...drone };
        newDrone.battery = Math.max(0, newDrone.battery);
        newDrone.navigationMode = "GPS"; // Default to GPS, override below if needed

        if (newDrone.status === DroneStatus.Idle && newDrone.patrolWaypoints.length > 0 && newDrone.battery > LOW_BATTERY_THRESHOLD * 1.5 ) {
            const nextPatrolTarget = newDrone.patrolWaypoints[newDrone.currentWaypointIndex];
            if (nextPatrolTarget) {
                const pathToPatrol = findPathBFS({ x: newDrone.x, y: newDrone.y }, nextPatrolTarget, state.gridData, state.forbiddenZones);
                if (pathToPatrol.length > 0) {
                    newDrone.status = DroneStatus.Patrolling;
                    newDrone.target = nextPatrolTarget;
                    newDrone.currentPath = pathToPatrol;
                }
            }
        }
        else if (newDrone.status === DroneStatus.EnRouteToAlert || newDrone.status === DroneStatus.EnRouteToDepot) {
          if (newDrone.currentPath.length > 0) {
            const nextStep = newDrone.currentPath[0];
            if (state.forbiddenZones.some(fz => fz.x === nextStep.x && fz.y === nextStep.y)) {
                newDrone.status = DroneStatus.Idle; 
                newDrone.currentPath = [];
                newDrone.target = null;
                tickNotifications.push({id: `${Date.now()}-fz-halt-${newDrone.id}`, message: `Drone ${newDrone.id} halted: path obstructed.`, type: 'warning', timestamp: Date.now()});
            } else {
                newDrone.x = nextStep.x;
                newDrone.y = nextStep.y;
                newDrone.currentPath.shift();
                newDrone.battery -= DRONE_TRANSIT_CONSUMPTION;
            }
          } else { 
            if (newDrone.status === DroneStatus.EnRouteToAlert && newDrone.assignedAlertId) {
                const alertForVerification = newAlerts.find(a => a.id === newDrone.assignedAlertId);
                if (alertForVerification) {
                    newDrone.status = DroneStatus.Verifying;
                    if (alertForVerification.isFire) { // If already known to be fire (e.g. AI confirmed)
                        newDrone.navigationMode = "SLAM (Simulated)";
                    }
                    nextDroneVerifyingAlert = newDrone.id;
                    nextAlertToVerify = alertForVerification;
                    nextShowVerificationModal = !state.isAiVerificationEnabled; 
                } else {
                    newDrone.status = DroneStatus.Idle;
                    newDrone.assignedAlertId = null;
                }
            } else if (newDrone.status === DroneStatus.EnRouteToDepot) {
                newDrone.status = DroneStatus.Recharging;
            }
            newDrone.target = null;
          }
        } else if (newDrone.status === DroneStatus.Patrolling && newDrone.patrolWaypoints.length > 0) {
          if (newDrone.currentPath.length > 0) { 
             const nextStep = newDrone.currentPath[0];
             if (state.forbiddenZones.some(fz => fz.x === nextStep.x && fz.y === nextStep.y)) {
                newDrone.status = DroneStatus.Idle; newDrone.currentPath = []; newDrone.target = null;
             } else {
                newDrone.x = nextStep.x;
                newDrone.y = nextStep.y;
                newDrone.currentPath.shift();
                newDrone.battery -= DRONE_PATROL_CONSUMPTION;
             }
          } else { 
            const currentWaypointTarget = newDrone.patrolWaypoints[newDrone.currentWaypointIndex];
            if (newDrone.x === currentWaypointTarget.x && newDrone.y === currentWaypointTarget.y) { 
              newDrone.currentWaypointIndex = (newDrone.currentWaypointIndex + 1) % newDrone.patrolWaypoints.length;
            }
            const nextPatrolTarget = newDrone.patrolWaypoints[newDrone.currentWaypointIndex];
            newDrone.target = nextPatrolTarget;
            newDrone.currentPath = findPathBFS({x: newDrone.x, y: newDrone.y}, nextPatrolTarget, state.gridData, state.forbiddenZones);
            if (newDrone.currentPath.length === 0 && calculateDistance({x: newDrone.x, y: newDrone.y}, nextPatrolTarget) > 0.1) { 
                newDrone.status = DroneStatus.Idle; 
            }
          }
        } else if (newDrone.status === DroneStatus.Verifying) {
            const alertBeingVerified = newAlerts.find(a => a.id === newDrone.assignedAlertId);
            if (alertBeingVerified?.isFire) {
                newDrone.navigationMode = "SLAM (Simulated)";
            }
             // Stays in Verifying status until HANDLE_VERIFICATION_RESULT or CLOSE_VERIFICATION_MODAL changes it
        }


        if (newDrone.status === DroneStatus.Recharging) {
          newDrone.battery = Math.min(DRONE_BATTERY_CAPACITY, newDrone.battery + DRONE_RECHARGE_RATE);
          if (newDrone.battery >= DRONE_BATTERY_CAPACITY) {
            newDrone.status = DroneStatus.Idle;
          }
        } else if (newDrone.battery <= 0) {
            newDrone.status = DroneStatus.Idle; 
        } else if (newDrone.battery < LOW_BATTERY_THRESHOLD && newDrone.status !== DroneStatus.EnRouteToDepot) {
            const depot = state.depots.find(d => d.id === newDrone.depotId);
            if (depot) {
              const pathToDepot = findPathBFS({x: newDrone.x, y: newDrone.y}, {x: depot.x, y: depot.y}, state.gridData, state.forbiddenZones);
              if (pathToDepot.length > 0) {
                newDrone.status = DroneStatus.EnRouteToDepot;
                newDrone.target = { x: depot.x, y: depot.y };
                newDrone.currentPath = pathToDepot;
                newDrone.assignedAlertId = null; 
              } else {
                newDrone.status = DroneStatus.Idle; 
              }
            }
        }
        return newDrone;
      });

      const currentActiveAlerts = newAlerts.filter(a => a.level === AlertLevel.Investigating || a.level === AlertLevel.ConfirmedFire).length;
      let newHistoricalData = [...state.historicalAlertData, {time: state.simulationTime + 1, count: currentActiveAlerts}];
      if (newHistoricalData.length > MAX_HISTORICAL_DATA_POINTS) {
        newHistoricalData.shift();
      }

      const mergedNotifications: Notification[] = [...tickNotifications, ...state.notifications];
      const finalNotifications: Notification[] = mergedNotifications.slice(0, Math.min(mergedNotifications.length, 5));


      return {
        ...state,
        simulationTime: state.simulationTime + 1,
        drones: updatedDrones,
        alerts: newAlerts,
        gridData: newGridData,
        historicalAlertData: newHistoricalData,
        notifications: finalNotifications,
        droneVerifyingAlert: nextDroneVerifyingAlert,
        alertToVerify: nextAlertToVerify,
        showVerificationModal: nextShowVerificationModal,
      };
    }
    case "TRIGGER_ALERT": {
      const { alertId, sensorId, x, y } = action.payload; 
      const newAlert: Alert = {
        id: alertId, 
        sensorId,
        x, y,
        timestamp: state.simulationTime,
        level: AlertLevel.Investigating,
        isFire: false,
        isSpreading: false,
        fireSpreadCells: new Set(),
      };
      return {
        ...state,
        alerts: [...state.alerts, newAlert],
      };
    }
    case "SET_AI_DISPATCHER_STATUS":
      return { ...state, aiDispatcherStatus: action.payload };
    case "SET_GEMINI_REASONING":
      return { ...state, geminiReasoning: action.payload };
    case "ASSIGN_DRONE_TO_ALERT": {
      const { droneId, alertId, path } = action.payload;
      const alert = state.alerts.find(a => a.id === alertId);
      if (!alert) { 
          return {...state, drones: state.drones.map(d => d.id === droneId ? {...d, status: DroneStatus.Idle, target: null, currentPath: [], assignedAlertId: null} : d)};
      }
      return {
        ...state,
        drones: state.drones.map(d =>
          d.id === droneId
            ? { ...d, status: DroneStatus.EnRouteToAlert, target: { x: alert.x, y: alert.y }, currentPath: path, assignedAlertId: alertId, navigationMode: "GPS" }
            : d
        ),
        selectedDroneForAlert: droneId,
      };
    }
    case "DRONE_REACHES_DEPOT": { 
        const dronePayload = action.payload; 
        return {
            ...state,
            drones: state.drones.map(d => d.id === dronePayload.id ? {...d, status: DroneStatus.Recharging, target: null, currentPath: [], navigationMode: "GPS"} : d)
        };
    }
    case "UPDATE_DRONE_STATE": {
        return {
            ...state,
            drones: state.drones.map(d => d.id === action.payload.id ? {...d, ...action.payload} : d)
        }
    }
    case "SHOW_VERIFICATION_MODAL": 
      return { ...state, alertToVerify: action.payload.alert, droneVerifyingAlert: action.payload.droneId, showVerificationModal: true };
    case "HANDLE_VERIFICATION_RESULT": {
      const { alertId, isActualFire, confirmedByAI, aiConfidence, aiReasoning } = action.payload;
      const alertIndex = state.alerts.findIndex(a => a.id === alertId);
      if (alertIndex === -1) return state;

      const updatedAlerts = [...state.alerts];
      const alert = { ...updatedAlerts[alertIndex] };
      alert.isFire = isActualFire;
      alert.confirmedByAI = confirmedByAI;
      alert.aiConfidence = aiConfidence;
      alert.aiReasoning = aiReasoning;

      let newGridData = state.gridData;
      let updatedDrones = state.drones;

      if (isActualFire) {
        alert.level = AlertLevel.ConfirmedFire;
        alert.isSpreading = true; 
        alert.fireSpreadCells = new Set([`${alert.x}-${alert.y}`]); 
        
        newGridData = state.gridData.map((row, y) => 
            row.map((cell, x) => 
                (x === alert.x && y === alert.y) ? {...cell, isFire: true} : cell
            )
        );
        updatedAlerts[alertIndex] = alert;

        // Update drone that verified
        updatedDrones = state.drones.map(d => {
            if (d.id === state.droneVerifyingAlert) {
                return { ...d, status: DroneStatus.Idle, assignedAlertId: null, navigationMode: "GPS" };
            }
            return d;
        });

        return {
          ...state,
          alerts: updatedAlerts,
          gridData: newGridData, 
          drones: updatedDrones,
          showVerificationModal: false,
          droneVerifyingAlert: null,
          alertToVerify: null,
        };
      } else {
        alert.level = AlertLevel.ResolvedFalseAlarm;
        updatedAlerts[alertIndex] = alert;
        updatedDrones = state.drones.map(d => d.id === state.droneVerifyingAlert || d.assignedAlertId === alertId ? { ...d, status: DroneStatus.Idle, assignedAlertId: null, navigationMode: "GPS" } : d)

        return {
          ...state,
          alerts: updatedAlerts,
          gridData: newGridData, 
          drones: updatedDrones,
          showVerificationModal: false,
          droneVerifyingAlert: null,
          alertToVerify: null,
        };
      }
    }
    case "ESCALATE_ALERT_TO_FIRE_DEPT": {
        const alert = action.payload;
        const reportedTimeValue = typeof alert.timestamp === 'number' && alert.timestamp < 1000000000 ? `Tick ${alert.timestamp}` : new Date(alert.timestamp).toLocaleTimeString();

        return {
            ...state,
            showFireDeptModal: true,
            fireDeptDetails: { 
                alertId: alert.id,
                location: `(${alert.x}, ${alert.y})`,
                reportedTime: reportedTimeValue, 
                confirmedBy: alert.confirmedByAI ? `AI (Confidence: ${alert.aiConfidence?.toFixed(2)})` : "Manual User Input",
                details: alert.aiReasoning || "Drone visual confirmed fire."
            },
        }
    }
    case "CLOSE_VERIFICATION_MODAL":
      return { 
        ...state, 
        showVerificationModal: false, 
        drones: state.drones.map(d => d.id === state.droneVerifyingAlert ? {...d, status: DroneStatus.Idle, assignedAlertId: null, navigationMode: "GPS"} : d),
        droneVerifyingAlert: null, 
        alertToVerify: null 
    };
    case "CLOSE_FIRE_DEPT_MODAL":
      return { ...state, showFireDeptModal: false, fireDeptDetails: null };
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.payload, ...state.notifications.slice(0, 4)] };
    case "REMOVE_NOTIFICATION":
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case "SET_WIND_SPEED":
      return { ...state, windSpeed: action.payload };
    case "SET_WIND_DIRECTION":
      return { ...state, windDirection: action.payload };
    case "SET_ENVIRONMENT_TEMPERATURE":
      return { ...state, environmentTemperature: action.payload };
    case "SELECT_DRONE_INFO":
      return { ...state, selectedDroneInfoId: action.payload };
    case "SHOW_FIRE_DETAILS":
      return { ...state, selectedFireAlertDetailsId: action.payload };
    case "INITIALIZE_CHAT":
      return { ...state, chatInstance: action.payload };
    case "SET_OPTIMIZER_RUNNING":
      return {...state, isOptimizerRunning: action.payload };
    default:
      return state;
  }
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const aiRef = React.useRef<GoogleGenAI | null>(null);
  
  React.useEffect(() => {
    if (!aiRef.current && process.env.API_KEY) {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else if (!process.env.API_KEY && !localStorage.getItem('geminiApiKeyWarnedProvider')) { 
        console.warn("Gemini API Key not found in process.env.API_KEY (AppProvider). AI features will be disabled. This warning will not repeat for this session.");
        localStorage.setItem('geminiApiKeyWarnedProvider', 'true'); 
    }
  }, []);


  React.useEffect(() => {
    if (state.isSimulationRunning) {
      const timerId = setInterval(() => {
        dispatch({ type: "UPDATE_SIMULATION_TICK" });
      }, SIMULATION_TICK_INTERVAL); 
      return () => clearInterval(timerId);
    }
  }, [state.isSimulationRunning]);

  React.useEffect(() => {
    const performAiVerification = async () => {
        if (aiRef.current && state.isAiVerificationEnabled && state.droneVerifyingAlert && state.alertToVerify && !state.showVerificationModal) { 
            const alert = state.alertToVerify;
            dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `AI Verifying Alert ${alert.id}...` });
            try {
                // Mock logic for determining if the scene is likely fire for the image
                const isLikelyFireSceneForMock = (alert.x + alert.y + alert.timestamp) % 3 !== 0; // Slightly more varied mock
                
                const verificationResult = await verifyFireWithAI(aiRef.current, isLikelyFireSceneForMock);
                
                dispatch({
                    type: "HANDLE_VERIFICATION_RESULT",
                    payload: {
                        alertId: alert.id,
                        isActualFire: verificationResult.is_fire,
                        confirmedByAI: true,
                        aiConfidence: verificationResult.confidence,
                        aiReasoning: verificationResult.reasoning,
                    },
                });
                 dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `AI Verification for ${alert.id} complete.` });
                 if (verificationResult.is_fire) {
                    const confirmedAlertForEscalation: Alert = { 
                        ...alert, 
                        isFire: true, 
                        level: AlertLevel.ConfirmedFire, 
                        confirmedByAI: true, 
                        aiConfidence: verificationResult.confidence, 
                        aiReasoning: verificationResult.reasoning,
                        fireSpreadCells: new Set([`${alert.x}-${alert.y}`]), // Initial fire cell
                        isSpreading: true, 
                    };
                    dispatch({ type: "ESCALATE_ALERT_TO_FIRE_DEPT", payload: confirmedAlertForEscalation });
                 }

            } catch (error) {
                console.error("AI Verification failed:", error);
                dispatch({ type: "SET_AI_DISPATCHER_STATUS", payload: `AI Verification for ${alert.id} failed. Manual verification needed.` });
                if (state.alertToVerify && state.droneVerifyingAlert) { 
                     dispatch({ type: "SHOW_VERIFICATION_MODAL", payload: { alert: state.alertToVerify, droneId: state.droneVerifyingAlert } });
                }
            }
        }
    };
    
    if (state.isAiVerificationEnabled && state.droneVerifyingAlert && state.alertToVerify && !state.showVerificationModal) {
       performAiVerification();
    }
  }, [state.droneVerifyingAlert, state.alertToVerify, state.isAiVerificationEnabled, state.showVerificationModal, dispatch]);


  return (
    <AppContext.Provider value={{ state, dispatch, ai: aiRef.current }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export { findPathBFS, calculateDistance };