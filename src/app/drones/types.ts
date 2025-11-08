// TypeScript interfaces for drone data structure based on API endpoints

export interface SprayingSystem {
  id: number;
  flowRate: number;
  capacity: number;
  width: number;
}

export interface SpreadingSystem {
  id: number;
  flowRate: number;
  capacity: number;
  width: number;
}

export interface Drone {
  droneId: number;
  droneName: string;
  batteryChargeTime: number;
  flightTime: number;
  maxWindSpeed: number;
  maxFlightSpeed: number;
  maxWorkingSpeed: number;
  spraying: SprayingSystem | null;
  spreading: SpreadingSystem | null;
  weight: number;
  liftCapacity: number;
  width: number;
  height: number;
  operatingTemperature: number;
  maxFlightHeight: number;
  rotationSpeed: number;
  imageKey: string | null;
}

export interface DroneListResponse {
  drones: Drone[];
}

export interface CreateDroneRequest {
  droneName: string;
  batteryChargeTime: number;
  flightTime: number;
  maxWindSpeed: number;
  maxFlightSpeed: number;
  maxWorkingSpeed: number;
  spraying: {
    flowRate: number;
    capacity: number;
    width: number;
  } | null;
  spreading: {
    flowRate: number;
    capacity: number;
    width: number;
  } | null;
  weight: number;
  liftCapacity: number;
  width: number;
  height: number;
  operatingTemperature: number;
  maxFlightHeight: number;
  rotationSpeed: number;
  imageKey?: string | null;
}

export interface UpdateDroneRequest extends CreateDroneRequest {
  droneId: number;
}
