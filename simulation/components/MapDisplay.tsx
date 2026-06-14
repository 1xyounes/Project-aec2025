
import React from 'react';
import { useAppContext } from '../state/AppContext';
import { CELL_SIZE, LOW_BATTERY_THRESHOLD } from '../constants';
import { DroneStatus, AlertLevel } from '../types';
import { SensorIcon, DroneIcon, DepotIcon, FireActiveIcon, AlertIcon } from './icons'; 

const MapDisplay: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { gridData, sensors, drones, depots, alerts, selectedDroneInfoId, selectedFireAlertDetailsId } = state;

  if (!gridData || gridData.length === 0) {
    return <div className="text-center p-8">Loading map data...</div>;
  }
  
  const gridSize = gridData.length;
  const mapWidth = gridSize * CELL_SIZE;
  const mapHeight = gridSize * CELL_SIZE;

  const getDroneColor = (status: DroneStatus, battery: number): string => {
    if (battery < LOW_BATTERY_THRESHOLD) return "fill-red-400"; 
    switch (status) {
      case DroneStatus.Idle: return "fill-green-400";
      case DroneStatus.Patrolling: return "fill-blue-400";
      case DroneStatus.EnRouteToAlert: return "fill-yellow-400";
      case DroneStatus.EnRouteToDepot: return "fill-purple-400";
      case DroneStatus.Verifying: return "fill-orange-400";
      case DroneStatus.Recharging: return "fill-cyan-400";
      default: return "fill-gray-400";
    }
  };

  const getAlertColor = (level: AlertLevel, isFire: boolean): string => {
    if (isFire) return "fill-red-600";
    switch (level) {
      case AlertLevel.Investigating: return "fill-yellow-500";
      case AlertLevel.ConfirmedFire: return "fill-red-600"; 
      case AlertLevel.ResolvedFalseAlarm: return "fill-green-500";
      default: return "fill-gray-500";
    }
  };

  return (
    <svg width="100%" height="100%" viewBox={`-1 -1 ${mapWidth + 2} ${mapHeight + 2}`} className="bg-gray-700 rounded">
      <defs>
        <pattern id="gridPattern" width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
          <path d={`M ${CELL_SIZE} 0 L 0 0 0 ${CELL_SIZE}`} fill="none" stroke="rgba(107, 114, 128, 0.2)" strokeWidth="0.5"/>
        </pattern>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
         <filter id="selectedFireGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feFlood floodColor="yellow" result="flood"/>
            <feComposite in="flood" in2="coloredBlur" operator="in" result="glow"/>
            <feMerge>
                <feMergeNode in="glow"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>
      <rect width={mapWidth} height={mapHeight} fill="url(#gridPattern)" />

      {gridData.flat().map(cell => {
        let cellFill = "transparent";
        if (cell.isObstacle) cellFill = "rgba(100,100,100,0.5)";
        if (cell.isForbidden) cellFill = "rgba(255,0,0,0.2)";
        if (cell.isFire) cellFill = "rgba(255, 69, 0, 0.7)"; 

        return (
          <rect
            key={`cell-${cell.id}`}
            x={cell.x * CELL_SIZE}
            y={cell.y * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={cellFill}
            stroke={cell.isFire ? "rgba(255,0,0,0.8)" : "rgba(107, 114, 128, 0.1)"}
            strokeWidth={cell.isFire ? 1 : 0.5}
          />
        );
      })}
      
      {sensors.map(sensor => (
        <g key={`sensor-group-${sensor.id}`}>
          <circle
            cx={(sensor.x + 0.5) * CELL_SIZE}
            cy={(sensor.y + 0.5) * CELL_SIZE}
            r={sensor.range * CELL_SIZE}
            fill="rgba(0, 255, 255, 0.05)"
            stroke="rgba(0, 200, 200, 0.3)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <SensorIcon 
            x={(sensor.x + 0.25) * CELL_SIZE} 
            y={(sensor.y + 0.25) * CELL_SIZE} 
            width={CELL_SIZE * 0.5} 
            height={CELL_SIZE * 0.5} 
            className="fill-cyan-400 hover:fill-cyan-200 cursor-pointer"
            onClick={() => dispatch({type: 'TRIGGER_ALERT', payload: { alertId: `A-map-${sensor.id}-${Date.now()}`, sensorId: sensor.id, x:sensor.x, y:sensor.y}})}
            aria-label={`Trigger alert for sensor ${sensor.id}`}
          />
        </g>
      ))}

      {depots.map(depot => (
         <DepotIcon 
            key={`depot-${depot.id}`}
            x={(depot.x + 0.1) * CELL_SIZE} 
            y={(depot.y + 0.1) * CELL_SIZE} 
            width={CELL_SIZE * 0.8} 
            height={CELL_SIZE * 0.8}
            className="fill-purple-500"
        />
      ))}

      {drones.map(drone => {
        if (drone.id === selectedDroneInfoId && drone.currentPath && drone.currentPath.length > 0) {
          const pathString = `M ${(drone.x + 0.5) * CELL_SIZE},${(drone.y + 0.5) * CELL_SIZE} ` +
            drone.currentPath.map(p => `L ${(p.x + 0.5) * CELL_SIZE},${(p.y + 0.5) * CELL_SIZE}`).join(' ');
          return (
            <path
              key={`path-${drone.id}`}
              d={pathString}
              fill="none"
              stroke="rgba(255, 255, 0, 0.6)"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          );
        }
        return null;
      })}

      {drones.map(drone => (
        <DroneIcon
          key={`drone-${drone.id}`}
          x={(drone.x + 0.25) * CELL_SIZE} 
          y={(drone.y + 0.25) * CELL_SIZE} 
          width={CELL_SIZE * 0.5} 
          height={CELL_SIZE * 0.5}
          className={`${getDroneColor(drone.status, drone.battery)} cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => dispatch({type: 'SELECT_DRONE_INFO', payload: drone.id})}
          style={{ filter: drone.id === selectedDroneInfoId ? "url(#glow)" : undefined }}
          aria-label={`Select drone ${drone.id}`}
        />
      ))}
      
      {alerts.map(alert => {
        const Icon = alert.isFire ? FireActiveIcon : AlertIcon;
        const isSelectedFire = alert.isFire && alert.id === selectedFireAlertDetailsId;
        return (
          <Icon
            key={`alert-${alert.id}`}
            x={(alert.x + 0.25) * CELL_SIZE} 
            y={(alert.y + 0.25) * CELL_SIZE} 
            width={CELL_SIZE * 0.6} 
            height={CELL_SIZE * 0.6}
            className={`${getAlertColor(alert.level, alert.isFire)} ${alert.isFire ? 'cursor-pointer hover:opacity-75' : ''}`}
            style={{filter: isSelectedFire ? "url(#selectedFireGlow)" : (alert.isFire || alert.level === AlertLevel.Investigating ? "url(#glow)" : undefined) }}
            onClick={alert.isFire ? () => dispatch({type: "SHOW_FIRE_DETAILS", payload: alert.id}) : undefined}
            aria-label={`Alert ${alert.id} at (${alert.x}, ${alert.y}) - Status: ${AlertLevel[alert.level]}${alert.isFire ? ' (FIRE)' : ''}${alert.isFire ? '. Click for details.' : ''}`}
          />
        );
      })}
    </svg>
  );
};

export default MapDisplay;
