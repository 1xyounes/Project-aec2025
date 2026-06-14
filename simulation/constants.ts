import { WindDirection } from './types';

export const DEFAULT_GRID_ROWS = 15;
export const DEFAULT_GRID_COLS = 20;
export const CELL_SIZE = 28; // Pixel size of each cell in the UI
export const DEFAULT_SENSOR_RANGE = 3; // Default range for optimizer and new sensors
export const DEFAULT_MAX_SENSORS = 10; // Default max sensors for optimizer
export const DEFAULT_HIGH_RISK_THRESHOLD = 7; // Default for optimizer sensor placement
export const DEFAULT_COVERAGE_TARGET = 90; // Default coverage target in %

// Added exports for GRID_SIZE and SENSOR_RANGE
export const GRID_SIZE = DEFAULT_GRID_ROWS; // AppContext uses GRID_SIZE for initial square grid
export const SENSOR_RANGE = DEFAULT_SENSOR_RANGE; // AppContext imports SENSOR_RANGE

export const DRONE_SPEED = 0.5; // Grid units per simulation tick
export const DRONE_BATTERY_CAPACITY = 500; // Arbitrary units
export const DRONE_PATROL_CONSUMPTION = 0.2; // Battery consumed per tick while patrolling
export const DRONE_TRANSIT_CONSUMPTION = 0.5; // Battery consumed per tick while en route
export const DRONE_RECHARGE_RATE = 2; // Battery recharged per tick at depot
export const LOW_BATTERY_THRESHOLD = DRONE_BATTERY_CAPACITY * 0.2;

export const SIMULATION_TICK_INTERVAL = 200; // Milliseconds

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const GEMINI_VISION_MODEL = "gemini-2.5-flash-preview-04-17"; // This model supports vision

export const WIND_DIRECTIONS_MAP: Record<WindDirection, { dx: number; dy: number }> = {
  [WindDirection.NONE]: { dx: 0, dy: 0 },
  [WindDirection.N]: { dx: 0, dy: -1 },
  [WindDirection.NE]: { dx: 1, dy: -1 },
  [WindDirection.E]: { dx: 1, dy: 0 },
  [WindDirection.SE]: { dx: 1, dy: 1 },
  [WindDirection.S]: { dx: 0, dy: 1 },
  [WindDirection.SW]: { dx: -1, dy: 1 },
  [WindDirection.W]: { dx: -1, dy: 0 },
  [WindDirection.NW]: { dx: -1, dy: -1 },
};

export const DEFAULT_ENVIRONMENT_TEMPERATURE = 25; // Celsius
export const BASE_FIRE_SPREAD_CHANCE = 0.05; // Base chance per tick for a neighbor cell
export const FUEL_LOAD_SPREAD_FACTOR = 0.02; // Multiplier for fuel load (0-10) -> up to 0.2 added chance
export const WIND_SPEED_SPREAD_FACTOR = 0.03; // Multiplier for wind speed (0-5) -> up to 0.15 added chance if aligned
export const TEMPERATURE_SPREAD_FACTOR = 0.005; // Additive chance per degree Celsius above 20°C

// For AI Verification mock image. In a real app, this would come from the drone.
// Using picsum.photos with specific seeds to get somewhat consistent images for "fire" vs "no fire"
export const MOCK_FIRE_IMAGE_URL = 'https://picsum.photos/seed/project-aegis-fire/400/300';
export const MOCK_NO_FIRE_IMAGE_URL = 'https://picsum.photos/seed/project-aegis-forest/400/300';

export const MAX_HISTORICAL_DATA_POINTS = 50; // For alert chart