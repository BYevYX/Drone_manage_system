export type DroneStatus =
  | 'available'
  | 'in-flight'
  | 'maintenance'
  | 'charging'
  | 'offline'
  | 'reserved';

export type DroneType =
  | 'multirotor'
  | 'fixed-wing'
  | 'hybrid'
  | 'helicopter'
  | 'vtol';

export type CameraType =
  | 'rgb'
  | 'thermal'
  | 'multispectral'
  | 'hyperspectral'
  | 'lidar'
  | 'none';

export interface DroneSpecifications {
  weight: number; // kg
  dimensions: {
    length: number; // cm
    width: number; // cm
    height: number; // cm
    wingspan?: number; // cm (for fixed-wing)
  };
  batteryCapacity: number; // mAh
  flightTime: number; // minutes
  maxSpeed: number; // km/h
  maxAltitude: number; // meters
  payloadCapacity: number; // kg
  operatingTemperature: {
    min: number; // °C
    max: number; // °C
  };
  windResistance: number; // km/h
  range: number; // km
  chargingTime: number; // minutes
  ipRating?: string; // e.g., "IP43"
}

export interface CameraCapabilities {
  type: CameraType;
  resolution: {
    photo: string; // e.g., "20MP"
    video: string; // e.g., "4K@60fps"
  };
  sensor: string;
  lens: {
    focalLength: string; // e.g., "24-70mm"
    aperture: string; // e.g., "f/2.8-f/11"
  };
  gimbal: {
    axes: number; // 2 or 3
    stabilization: boolean;
    tiltRange: {
      min: number; // degrees
      max: number; // degrees
    };
  };
  features: string[]; // e.g., ["HDR", "RAW", "Zoom"]
}

export interface MaintenanceRecord {
  id: string;
  droneId: string;
  type: 'routine' | 'repair' | 'upgrade' | 'inspection';
  description: string;
  performedBy: string;
  date: string;
  cost?: number;
  partsReplaced?: string[];
  nextMaintenanceDate?: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  attachments?: string[]; // file URLs
}

export interface FlightLog {
  id: string;
  droneId: string;
  pilotId: string;
  pilotName: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  location: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  purpose: string;
  maxAltitude: number; // meters
  distance: number; // km
  batteryUsed: number; // percentage
  weatherConditions: {
    temperature: number; // °C
    humidity: number; // percentage
    windSpeed: number; // km/h
    visibility: string;
  };
  issues?: string[];
  notes?: string;
}

export interface Drone {
  id: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  type: DroneType;
  status: DroneStatus;
  registrationNumber?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  totalFlightTime: number; // hours
  totalFlights: number;
  specifications: DroneSpecifications;
  cameraCapabilities?: CameraCapabilities;
  currentLocation?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  assignedOperator?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  maintenanceRecords: MaintenanceRecord[];
  flightLogs: FlightLog[];
  images: string[];
  documents: string[]; // URLs to manuals, certificates, etc.
  certifications: string[];
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
    coverage: number; // amount
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
  notes?: string;
}

export interface DroneFormData {
  serialNumber: string;
  model: string;
  manufacturer: string;
  type: DroneType;
  registrationNumber?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  specifications: DroneSpecifications;
  cameraCapabilities?: CameraCapabilities;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
    coverage: number;
  };
  images?: File[];
  documents?: File[];
  certifications?: string[];
  tags?: string[];
  notes?: string;
}

export interface DroneFilters {
  status?: DroneStatus[];
  type?: DroneType[];
  manufacturer?: string[];
  model?: string[];
  assignedOperator?: string[];
  location?: string;
  maintenanceDue?: boolean;
  search?: string;
  tags?: string[];
}

export interface DroneSortOptions {
  field:
    | 'model'
    | 'manufacturer'
    | 'status'
    | 'totalFlightTime'
    | 'lastMaintenanceDate'
    | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface DroneStats {
  total: number;
  available: number;
  inFlight: number;
  maintenance: number;
  charging: number;
  offline: number;
  reserved: number;
  totalFlightHours: number;
  averageFlightTime: number;
  maintenanceDue: number;
}

export interface BulkDroneOperation {
  type:
    | 'status-change'
    | 'assign-operator'
    | 'schedule-maintenance'
    | 'add-tags'
    | 'export';
  droneIds: string[];
  data?: unknown;
}

export interface DroneImportData {
  serialNumber: string;
  model: string;
  manufacturer: string;
  type: string;
  registrationNumber?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  weight?: number;
  batteryCapacity?: number;
  flightTime?: number;
  maxSpeed?: number;
  maxAltitude?: number;
  payloadCapacity?: number;
  tags?: string;
  notes?: string;
}

export interface DroneAuditLog {
  id: string;
  droneId: string;
  action:
    | 'created'
    | 'updated'
    | 'deleted'
    | 'status-changed'
    | 'assigned'
    | 'maintenance-scheduled';
  performedBy: string;
  performedAt: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  description: string;
  ipAddress?: string;
  userAgent?: string;
}
