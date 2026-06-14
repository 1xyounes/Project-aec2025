import React, { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../state/AppContext';
import { GridCell, Sensor, Depot, PatrolWaypoint, RiskFactor } from '../types';
import { 
  CELL_SIZE, DEFAULT_GRID_ROWS, DEFAULT_GRID_COLS, 
  DEFAULT_SENSOR_RANGE, DEFAULT_MAX_SENSORS, 
  DEFAULT_HIGH_RISK_THRESHOLD, DEFAULT_COVERAGE_TARGET
} from '../constants';
import Button from './Button';
import { CogIcon, PlayIcon, ShieldCheckIcon, FireIcon, UserGroupIcon, ExclamationTriangleIcon, InformationCircleIcon } from './icons'; // RoadIcon was not used, LightningIcon could be used for 'Infrastructure' or a new one

const defaultRiskFactorsList: RiskFactor[] = [
  { id: 'fuelLoad', name: 'Fuel Load (Vegetation)', weight: 0.30, description: 'Amount and type of combustible material.' },
  { id: 'historicalFires', name: 'Historical Fire Hotspots', weight: 0.25, description: 'Frequency and intensity of past fire incidents.' },
  { id: 'humanActivity', name: 'Human Activity & Proximity', weight: 0.20, description: 'Proximity to trails, roads, and areas with human presence.' },
  { id: 'infrastructureProximity', name: 'Infrastructure & Critical Assets', weight: 0.15, description: 'Proximity to power lines, buildings, and other key assets.' },
  { id: 'terrainWindExposure', name: 'Terrain & Wind Exposure', weight: 0.10, description: 'Slope, aspect, and areas prone to high winds affecting spread.' },
];

// Helper function to calculate high-risk coverage
const calculateHighRiskCoverage = (
  grid: GridCell[][],
  sensors: Sensor[],
  sensorRange: number,
  highRiskThreshold: number
): number => {
  if (!grid || grid.length === 0 || sensors.length === 0) return 0;

  const highRiskCells: GridCell[] = [];
  grid.flat().forEach(cell => {
    if (cell.riskScore >= highRiskThreshold && !cell.isObstacle && !cell.isForbidden) {
      highRiskCells.push(cell);
    }
  });

  if (highRiskCells.length === 0) return 100; 

  let coveredHighRiskCells = 0;
  highRiskCells.forEach(hrCell => {
    for (const sensor of sensors) {
      const distance = Math.sqrt(Math.pow(sensor.x - hrCell.x, 2) + Math.pow(sensor.y - hrCell.y, 2));
      if (distance <= sensorRange) {
        coveredHighRiskCells++;
        break; 
      }
    }
  });
  return (coveredHighRiskCells / highRiskCells.length) * 100;
};


const ForestOptimizerSetup: React.FC = () => {
  const { dispatch } = useAppContext();
  
  const [gridRows, setGridRows] = useState<number>(DEFAULT_GRID_ROWS);
  const [gridCols, setGridCols] = useState<number>(DEFAULT_GRID_COLS);
  
  const [grid, setGrid] = useState<GridCell[][]>(() => createInitialGrid(DEFAULT_GRID_ROWS, DEFAULT_GRID_COLS));
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>(defaultRiskFactorsList);
  
  const [sensorPlacementRange, setSensorPlacementRange] = useState<number>(DEFAULT_SENSOR_RANGE);
  const [numSensors, setNumSensors] = useState<number>(DEFAULT_MAX_SENSORS);
  const [highRiskThresholdOptimizer, setHighRiskThresholdOptimizer] = useState<number>(DEFAULT_HIGH_RISK_THRESHOLD);
  const [coverageTargetOptimizer, setCoverageTargetOptimizer] = useState<number>(DEFAULT_COVERAGE_TARGET);

  const [sensorsPlacedDisplay, setSensorsPlacedDisplay] = useState<number>(0);
  const [highRiskCoverageDisplay, setHighRiskCoverageDisplay] = useState<number>(0);
  const [placedSensorsList, setPlacedSensorsList] = useState<Sensor[]>([]);

  const [statusMessage, setStatusMessage] = useState<string>(`Welcome to Project Aegis. Define your forest's risk profile and operational parameters to begin.`);
  const [editingCellType, setEditingCellType] = useState<'obstacle' | 'forbidden' | null>(null);

  function createInitialGrid(rows: number, cols: number): GridCell[][] {
    return Array(rows).fill(null).map((_, y) =>
      Array(cols).fill(null).map((_, x) => ({
        id: `${x}-${y}`, x, y, riskScore: 0, fuelLoad: 0,
        isObstacle: false, isForbidden: false, isSensor: false, isCoveredBySensor: false
      }))
    );
  }

  const handleRiskFactorChange = (id: string, newWeight: number) => {
    setRiskFactors(factors =>
      factors.map(f => (f.id === id ? { ...f, weight: Math.max(0, Math.min(1, newWeight)) } : f))
    );
  };
  
  const generateRiskMap = useCallback(() => {
    setStatusMessage("Generating risk map based on Project Aegis parameters...");
    setPlacedSensorsList([]);
    setSensorsPlacedDisplay(0);
    setHighRiskCoverageDisplay(0);

    const currentGridRows = gridRows; 
    const currentGridCols = gridCols;

    const newSizedGrid = createInitialGrid(currentGridRows, currentGridCols); 
    const newGridWithRisks = newSizedGrid.map(row => row.map(cell => {
      let totalRisk = 0;
      let totalWeight = 0;
      // Thematic cell factors based on Project Aegis narrative
      const cellFactors = {
        fuelLoad: Math.random() * 10, // Max 10
        historicalFires: Math.random(), // 0-1
        humanActivity: Math.random(), // 0-1
        infrastructureProximity: Math.random(), // 0-1 (lower is closer/riskier, so maybe 1-random())
        terrainWindExposure: Math.random(), // 0-1 (higher is riskier)
      };

      riskFactors.forEach(factor => {
        let factorValue = 0; // Normalized 0-1 for consistent weighting
        switch (factor.id) {
          case 'fuelLoad': factorValue = cellFactors.fuelLoad / 10; break;
          case 'historicalFires': factorValue = cellFactors.historicalFires; break;
          case 'humanActivity': factorValue = cellFactors.humanActivity; break;
          case 'infrastructureProximity': factorValue = (1 - cellFactors.infrastructureProximity); break; // Higher risk if closer
          case 'terrainWindExposure': factorValue = cellFactors.terrainWindExposure; break;
        }
        totalRisk += factorValue * factor.weight;
        totalWeight += factor.weight;
      });
      
      const normalizedRisk = totalWeight > 0 ? (totalRisk / totalWeight) : 0;
      const finalRiskScore = Math.min(10, Math.max(0, Math.round(normalizedRisk * 10)));
      const fuelLoadDisplay = Math.min(10, Math.max(0, Math.round(cellFactors.fuelLoad)));

      return { ...cell, riskScore: finalRiskScore, fuelLoad: fuelLoadDisplay, isSensor: false, isCoveredBySensor: false };
    }));
    setGrid(newGridWithRisks);
    setStatusMessage(`Project Aegis Risk Map (${currentGridRows}x${currentGridCols}) generated. Designate zones or place sensors.`);
  }, [gridRows, gridCols, riskFactors]); 

  useEffect(() => {
    dispatch({ type: "SET_OPTIMIZER_RUNNING", payload: true });
    generateRiskMap(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [dispatch, generateRiskMap]);


  const runSensorPlacement = useCallback(() => {
    setStatusMessage("Placing sensors (Aegis 'tripwires')...");
    let placedSensorsCount = 0;
    const currentPlacedSensors: Sensor[] = [];
    const tempGrid = JSON.parse(JSON.stringify(grid)) as GridCell[][]; 

    // Reset sensor and coverage status on the tempGrid
    tempGrid.forEach(row => row.forEach(cell => {
        cell.isSensor = false;
        cell.isCoveredBySensor = false;
    }));

    const sortedCells = tempGrid.flat().filter(cell => !cell.isObstacle && !cell.isForbidden).sort((a, b) => b.riskScore - a.riskScore);

    for (const cell of sortedCells) {
      if (placedSensorsCount >= numSensors) break;
      if (cell.isSensor || cell.riskScore < highRiskThresholdOptimizer) continue;

      let alreadyCoveredByPreviousSensor = false;
      for (const ps of currentPlacedSensors) {
        if (Math.sqrt(Math.pow(ps.x - cell.x, 2) + Math.pow(ps.y - cell.y, 2)) <= sensorPlacementRange) {
          alreadyCoveredByPreviousSensor = true;
          break;
        }
      }
      if (alreadyCoveredByPreviousSensor) continue;

      if (!tempGrid[cell.y][cell.x].isSensor) {
         tempGrid[cell.y][cell.x].isSensor = true;
         currentPlacedSensors.push({ id: `S-${placedSensorsCount + 1}`, x: cell.x, y: cell.y, range: sensorPlacementRange, activeAlert: null });
         placedSensorsCount++;
      }
    }
    
    // Calculate and mark coverage for all cells by the newly placed sensors
    tempGrid.forEach(row => row.forEach(cell => {
        if (!cell.isObstacle && !cell.isForbidden) {
            for (const sensor of currentPlacedSensors) {
                if (Math.sqrt(Math.pow(sensor.x - cell.x, 2) + Math.pow(sensor.y - cell.y, 2)) <= sensorPlacementRange) {
                    cell.isCoveredBySensor = true;
                    break; 
                }
            }
        }
    }));

    setGrid(tempGrid);
    setPlacedSensorsList(currentPlacedSensors);
    setSensorsPlacedDisplay(placedSensorsCount);
    const coverage = calculateHighRiskCoverage(tempGrid, currentPlacedSensors, sensorPlacementRange, highRiskThresholdOptimizer);
    setHighRiskCoverageDisplay(parseFloat(coverage.toFixed(1)));
    setStatusMessage(`${placedSensorsCount} Aegis sensors placed. High-risk coverage: ${coverage.toFixed(1)}%.`);
  }, [grid, numSensors, sensorPlacementRange, highRiskThresholdOptimizer]);

  const handleCellClick = (x: number, y: number) => {
    if (!editingCellType) return;
    const newGrid = grid.map(row => row.map(cell => {
      if (cell.x === x && cell.y === y) {
        if (editingCellType === 'obstacle') return { ...cell, isObstacle: !cell.isObstacle, isForbidden: false, isSensor: false, isCoveredBySensor: false };
        if (editingCellType === 'forbidden') return { ...cell, isForbidden: !cell.isForbidden, isObstacle: false, isSensor: false, isCoveredBySensor: false };
      }
      return cell;
    }));
    setGrid(newGrid);
  };
  
  const finalizeSetup = () => {
    setStatusMessage("Finalizing Project Aegis setup...");
    const finalSensors: Sensor[] = [];
    const finalForbiddenZones: {x: number, y: number}[] = [];
    grid.forEach(row => row.forEach(cell => {
      if (cell.isSensor) {
        finalSensors.push({ id: `S-${finalSensors.length + 1}`, x: cell.x, y: cell.y, range: sensorPlacementRange, activeAlert: null });
      }
      if (cell.isForbidden) {
        finalForbiddenZones.push({ x: cell.x, y: cell.y });
      }
    }));

    const depots: Depot[] = [
      { id: 'Depot1', x: 2, y: Math.floor(gridRows / 2) },
      { id: 'Depot2', x: gridCols - 3, y: Math.floor(gridRows / 2) },
    ];

    const patrolWaypoints: PatrolWaypoint[] = [
      { x: Math.floor(gridCols * 0.25), y: Math.floor(gridRows * 0.25) },
      { x: Math.floor(gridCols * 0.75), y: Math.floor(gridRows * 0.25) },
      { x: Math.floor(gridCols * 0.75), y: Math.floor(gridRows * 0.75) },
      { x: Math.floor(gridCols * 0.25), y: Math.floor(gridRows * 0.75) },
    ];
    
    // Pass the grid from the local state of ForestOptimizerSetup, which includes risk, fuelLoad, and sensor placement marks
    dispatch({ type: "COMPLETE_FOREST_OPTIMIZER_SETUP", payload: { grid, sensors: finalSensors, depots, forbiddenZones: finalForbiddenZones, patrolWaypoints } });
  };

  const getRiskColorClass = (riskScore: number): string => {
    if (riskScore >= 9) return 'bg-red-700';
    if (riskScore >= 7) return 'bg-orange-600'; 
    if (riskScore >= 5) return 'bg-orange-500'; 
    if (riskScore >= 3) return 'bg-yellow-400'; 
    if (riskScore >= 1) return 'bg-green-400 opacity-75'; 
    return 'bg-gray-600 opacity-50'; 
  };


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 p-4 items-center">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-teal-400">Project Aegis: Autonomous Wildfire Defense Initiative</h1>
           <p className="text-gray-300 mt-2 mb-4 text-sm max-w-4xl mx-auto">
            Wildfires are a devastating global threat where rapid response is critical. Project Aegis is an autonomous, two-tiered system reducing detection-to-verification to under 10 minutes. 
            It combines static ground sensors—our "tripwires"—with AI-powered drones from fixed depots for proactive patrols and rapid, on-site verification. 
            This simulation allows you to configure the forest environment and observe this intelligent system in action.
          </p>
          <p className="text-gray-400 mt-1">{statusMessage}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4" style={{maxHeight: 'calc(100vh - 180px)'}}> {/* Adjusted maxHeight for new intro text */}
          {/* Left Column */}
          <div className="w-full md:w-1/3 space-y-4 flex flex-col overflow-y-auto pr-2">
            {/* Grid & Risk Setup */}
            <div className="bg-gray-800 p-4 rounded-md shadow-lg">
              <h2 className="text-lg font-semibold mb-3 text-teal-300">Grid & Risk Setup</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="gridRows" className="block text-sm font-medium text-gray-300">Grid Rows</label>
                  <input type="number" id="gridRows" value={gridRows} onChange={(e) => setGridRows(Math.max(5, parseInt(e.target.value)))} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                  <label htmlFor="gridCols" className="block text-sm font-medium text-gray-300">Grid Columns</label>
                  <input type="number" id="gridCols" value={gridCols} onChange={(e) => setGridCols(Math.max(5, parseInt(e.target.value)))} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-300 mb-1">Risk Layer Weights (0-1):</p>
              {riskFactors.map(factor => (
                <div key={factor.id} className="mb-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor={factor.id} className="text-gray-300 flex items-center">
                      {factor.id === 'fuelLoad' && <FireIcon className="w-4 h-4 mr-1 text-orange-400"/>}
                      {factor.id === 'humanActivity' && <UserGroupIcon className="w-4 h-4 mr-1 text-yellow-400"/>}
                      {factor.id === 'historicalFires' && <ExclamationTriangleIcon className="w-4 h-4 mr-1 text-red-400"/>}
                      {factor.id === 'infrastructureProximity' && <CogIcon className="w-4 h-4 mr-1 text-blue-400"/> /* Placeholder icon */}
                      {factor.id === 'terrainWindExposure' && <InformationCircleIcon className="w-4 h-4 mr-1 text-green-400"/> /* Placeholder icon */}
                      {factor.name}
                    </label>
                    <span className="text-xs text-teal-300">{factor.weight.toFixed(2)}</span>
                  </div>
                  <input type="range" id={factor.id} min="0" max="1" step="0.01" value={factor.weight} onChange={(e) => handleRiskFactorChange(factor.id, parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-teal-500 mt-0.5" />
                </div>
              ))}
              <Button onClick={generateRiskMap} className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700">
                Re-generate Aegis Risk Map
              </Button>
            </div>

            {/* Algorithm Parameters */}
            <div className="bg-gray-800 p-4 rounded-md shadow-lg">
              <h2 className="text-lg font-semibold mb-3 text-teal-300">Aegis Algorithm Parameters</h2>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label htmlFor="sensorRange" className="block text-sm font-medium text-gray-300">Sensor Range (cells)</label>
                  <input type="number" id="sensorRange" value={sensorPlacementRange} onChange={(e) => setSensorPlacementRange(parseInt(e.target.value))} min="1" max="10" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                  <label htmlFor="numSensors" className="block text-sm font-medium text-gray-300">Max Sensors (Tripwires)</label>
                  <input type="number" id="numSensors" value={numSensors} onChange={(e) => setNumSensors(parseInt(e.target.value))} min="1" max={Math.min(50, gridRows*gridCols)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                  <label htmlFor="highRiskThreshold" className="block text-sm font-medium text-gray-300">High-Risk Thresh. (0-10)</label>
                  <input type="number" id="highRiskThreshold" value={highRiskThresholdOptimizer} onChange={(e) => setHighRiskThresholdOptimizer(parseInt(e.target.value))} min="0" max="10" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                  <label htmlFor="coverageTarget" className="block text-sm font-medium text-gray-300">Coverage Target (%)</label>
                  <input type="number" id="coverageTarget" value={coverageTargetOptimizer} onChange={(e) => setCoverageTargetOptimizer(parseInt(e.target.value))} min="0" max="100" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button onClick={() => setEditingCellType(prev => prev === 'obstacle' ? null : 'obstacle')} active={editingCellType === 'obstacle'} className="flex-1 bg-gray-600 hover:bg-gray-500 text-sm">Toggle Obstacle Mode</Button>
                <Button onClick={() => setEditingCellType(prev => prev === 'forbidden' ? null : 'forbidden')} active={editingCellType === 'forbidden'} className="flex-1 bg-red-600 hover:bg-red-500 text-sm">Toggle Forbidden Zone</Button>
              </div>
               {editingCellType && <p className="text-xs text-yellow-400 mt-1 text-center">Click on map cells to toggle '{editingCellType}' status. Click button again to disable.</p>}
            </div>
            
            <div className="mt-auto space-y-4 pt-4">
                <div className="bg-gray-800 p-3 rounded-md shadow-lg text-sm">
                    <h3 className="text-md font-semibold mb-1 text-teal-300 flex items-center"><ShieldCheckIcon className="w-5 h-5 mr-1"/>Understanding Drone Forbidden Zones</h3>
                    <p className="text-gray-400 text-xs">
                        Forbidden Zones (Geofences) are critical for safe autonomous operations. These user-defined areas represent restricted airspace where drones, dispatched from their fixed depots, must not enter or path through (e.g., private land, sensitive habitats, temporary no-fly zones).
                        The Project Aegis AI Dispatcher and pathfinding algorithms consider these zones to ensure all drone missions comply with safety and operational restrictions, crucial for both proactive patrols and emergency responses.
                    </p>
                </div>

                <Button onClick={runSensorPlacement} className="w-full bg-blue-600 hover:bg-blue-700">
                    <CogIcon className="w-5 h-5 mr-2"/> Run Aegis Sensor Placement
                </Button>
                <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-md shadow">
                    <p>Aegis Sensors Placed: <span className="font-semibold text-teal-300">{sensorsPlacedDisplay}</span> / {numSensors}</p>
                    <p>High-Risk Coverage: <span className="font-semibold text-teal-300">{highRiskCoverageDisplay}%</span> / {coverageTargetOptimizer}%</p>
                </div>
                <Button onClick={finalizeSetup} className="w-full text-lg py-2.5 bg-teal-600 hover:bg-teal-700">
                    <PlayIcon className="w-6 h-6 mr-2"/> Start Aegis Simulation
                </Button>
            </div>
          </div>

          {/* Right Column (Map Display Area) */}
          <div className="w-full md:w-2/3 bg-gray-800 p-2 rounded-md shadow-lg flex items-center justify-center overflow-auto aspect-[4/3] md:aspect-auto">
             <div className="grid gap-px bg-gray-900 border border-gray-700" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, width: '100%', height: '100%', aspectRatio: `${gridCols}/${gridRows}` }}>
              {grid.flat().map(cell => {
                let cellStyle = 'flex items-center justify-center text-xs font-mono text-white cursor-default hover:ring-1 hover:ring-teal-400';
                let cellContent = '';

                if (cell.isObstacle) {
                  cellStyle += ' bg-gray-500';
                  cellContent = 'O';
                } else if (cell.isForbidden) {
                  cellStyle += ' bg-red-800 opacity-90';
                  cellContent = 'X';
                } else if (cell.isSensor) {
                  cellStyle += ' bg-blue-500';
                  cellContent = 'S';
                } else {
                  cellStyle += ` ${getRiskColorClass(cell.riskScore)}`;
                   if (placedSensorsList.length > 0 && cell.isCoveredBySensor) {
                     cellStyle += ' bg-cyan-500/30'; // Apply semi-transparent coverage overlay
                   }
                }
                
                if (editingCellType && !cell.isSensor && !cell.isObstacle && !cell.isForbidden) {
                  cellStyle += ' outline-dashed outline-1 outline-yellow-300 cursor-pointer';
                } else if (editingCellType) {
                   cellStyle += ' outline-dashed outline-1 outline-yellow-300 cursor-pointer'; // Allow toggling off for obstacles/forbidden too
                }


                return (
                  <div
                    key={cell.id}
                    onClick={() => editingCellType && handleCellClick(cell.x, cell.y)}
                    title={`(${cell.x},${cell.y}) Risk: ${cell.riskScore}, Fuel: ${cell.fuelLoad}${cell.isCoveredBySensor ? ', Covered' : ''}`}
                    className={cellStyle}
                  >
                    {cellContent}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForestOptimizerSetup;