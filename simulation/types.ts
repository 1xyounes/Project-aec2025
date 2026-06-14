import { Chat } from "@google/genai";

export interface GridCell {
  id: string;
  x: number;
  y: number;
  riskScore: number;
  isObstacle: boolean;
  isForbidden: boolean;
  isSensor: boolean;
  fuelLoad: number; // Added from optimizer, 0-10
  isFire?: boolean; // For visual representation of fire spread
  isFirePath?: boolean; // For visualizing potential fire path if needed
  isCoveredBySensor?: boolean; // For visualizing sensor coverage in setup
}

export interface Sensor {
  id: string;
  x: number;
  y: number;
  range: number;
  activeAlert: string | null;
}

export enum DroneStatus {
  Idle = "IDLE",
  Patrolling = "PATROLLING",
  EnRouteToAlert = "EN_ROUTE_TO_ALERT",
  EnRouteToDepot = "EN_ROUTE_TO_DEPOT",
  Verifying = "VERIFYING",
  Recharging = "RECHARGING",
}

export interface Drone {
  id: string;
  depotId: string;
  x: number;
  y: number;
  status: DroneStatus;
  battery: number; // 0-100
  target: { x: number; y: number } | null;
  currentPath: { x: number; y: number }[];
  patrolWaypoints: { x: number; y: number }[];
  currentWaypointIndex: number;
  assignedAlertId: string | null;
  navigationMode?: "GPS" | "SLAM (Simulated)";
}

export interface Depot {
  id: string;
  x: number;
  y: number;
}

export enum AlertLevel {
  Investigating = 1,
  ConfirmedFire = 2,
  ResolvedFalseAlarm = 3,
}

export interface Alert {
  id: string;
  sensorId: string;
  x: number;
  y: number;
  timestamp: number; // Simulation tick of initial detection
  level: AlertLevel;
  isFire: boolean; // True if confirmed as actual fire
  confirmedByAI?: boolean;
  aiConfidence?: number;
  aiReasoning?: string;
  fireSpreadCells: Set<string>; // Set of GridCell IDs that are on fire for this alert
  isSpreading: boolean; // If this fire is actively spreading
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: number;
}

export interface FireDeptDetails {
  alertId: string;
  location: string;
  reportedTime: string; // Could be tick number or formatted time
  confirmedBy: string;
  details: string;
}

export interface PatrolWaypoint {
  x: number;
  y: number;
}

export enum WindDirection {
  NONE = "None",
  N = "N",
  NE = "NE",
  E = "E",
  SE = "SE",
  S = "S",
  SW = "SW",
  W = "W",
  NW = "NW",
}

export interface AIVerificationResult {
  is_fire: boolean;
  confidence: number;
  reasoning: string;
}

export interface HistoricalAlertData {
  time: number; // simulation tick or timestamp
  count: number; // number of active alerts
}

// State managed by useReducer
export interface AppState {
  gridSize: number;
  gridData: GridCell[][];
  sensors: Sensor[];
  drones: Drone[];
  depots: Depot[];
  alerts: Alert[];
  simulationTime: number;
  isSimulationRunning: boolean;
  optimizedGrid: GridCell[][] | null; // Grid from optimizer with fuelLoad etc.
  forbiddenZones: { x: number; y: number }[]; // From optimizer
  notifications: Notification[];
  aiDispatcherStatus: string;
  geminiReasoning: string;
  selectedDroneForAlert: string | null; // ID of drone chosen by AI/heuristic
  droneVerifyingAlert: string | null; // ID of drone currently in VERIFYING state
  alertToVerify: Alert | null;
  showVerificationModal: boolean;
  showFireDeptModal: boolean;
  fireDeptDetails: FireDeptDetails | null;
  forestSetupComplete: boolean;
  patrolWaypoints: PatrolWaypoint[];
  chatInstance: Chat | null;
  windSpeed: number; // 0-5 for example
  windDirection: WindDirection;
  environmentTemperature: number; // Global environment temperature in Celsius
  historicalAlertData: HistoricalAlertData[];
  selectedDroneInfoId: string | null; // For DroneInfoModal
  selectedFireAlertDetailsId: string | null; // For showing live fire intel
  isOptimizerRunning: boolean;
  isAiVerificationEnabled: boolean;
}

// Actions for reducer
export type Action =
  | { type: "START_SIMULATION_SETUP" }
  | { type: "COMPLETE_FOREST_OPTIMIZER_SETUP"; payload: { grid: GridCell[][]; sensors: Sensor[]; depots: Depot[]; forbiddenZones: {x:number; y:number}[]; patrolWaypoints: PatrolWaypoint[] } }
  | { type: "START_SIMULATION" }
  | { type: "STOP_SIMULATION" }
  | { type: "TOGGLE_AI_VERIFICATION"; payload: boolean }
  | { type: "UPDATE_SIMULATION_TICK" }
  | { type: "TRIGGER_ALERT"; payload: { alertId: string; sensorId: string; x: number; y: number } }
  | { type: "SET_AI_DISPATCHER_STATUS"; payload: string }
  | { type: "SET_GEMINI_REASONING"; payload: string }
  | { type: "ASSIGN_DRONE_TO_ALERT"; payload: { droneId: string; alertId: string; path: { x: number; y: number }[] } }
  | { type: "DRONE_REACHES_DEPOT"; payload: Drone } 
  | { type: "UPDATE_DRONE_STATE"; payload: Partial<Drone> & { id: string } }
  | { type: "SHOW_VERIFICATION_MODAL"; payload: { alert: Alert; droneId: string } }
  | { type: "HANDLE_VERIFICATION_RESULT"; payload: { alertId: string; isActualFire: boolean; confirmedByAI?: boolean; aiConfidence?: number; aiReasoning?: string } }
  | { type: "ESCALATE_ALERT_TO_FIRE_DEPT"; payload: Alert }
  | { type: "CLOSE_VERIFICATION_MODAL" }
  | { type: "CLOSE_FIRE_DEPT_MODAL" }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "SET_WIND_SPEED"; payload: number }
  | { type: "SET_WIND_DIRECTION"; payload: WindDirection }
  | { type: "SET_ENVIRONMENT_TEMPERATURE"; payload: number }
  | { type: "SELECT_DRONE_INFO"; payload: string | null }
  | { type: "SHOW_FIRE_DETAILS"; payload: string | null } // alertId or null
  | { type: "INITIALIZE_CHAT"; payload: Chat }
  | { type: "SET_OPTIMIZER_RUNNING"; payload: boolean };

export interface RiskFactor {
  id: string;
  name: string;
  weight: number; // 0-1
  description: string;
}