// Base API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  surname?: string;
  userRole: 'CLIENT' | 'OPERATOR' | 'ADMIN' | 'CONTRACTOR';
  contractor?: ContractorInfo;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface ContractorInfo {
  companyName: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  contactPerson: string;
  website?: string;
  description?: string;
  certifications: string[];
  serviceAreas: string[];
  specializations: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

// Authentication Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  surname?: string;
  userRole: User['userRole'];
  contractor?: Partial<ContractorInfo>;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user?: User;
}

// Order Management Types
export interface Order {
  id: string;
  userId: string;
  typeProcessId: string;
  status:
    | 'DRAFT'
    | 'PENDING'
    | 'APPROVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'REJECTED';
  dataStart: string;
  dataEnd?: string;
  materialsProvided: boolean;
  totalCost?: number;
  currency: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description?: string;
  notes?: string;
  fields: OrderField[];
  selectedDrones: OrderDrone[];
  selectedMaterials: OrderMaterial[];
  assignedOperator?: User;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  weatherRequirements?: WeatherRequirements;
  qualityMetrics?: QualityMetrics;
  statusHistory: OrderStatusHistory[];
}

export interface OrderField {
  id: string;
  orderId: string;
  fieldId: string;
  field: Field;
  area: number; // hectares
  cropType?: string;
  growthStage?: string;
  lastTreatmentDate?: string;
  soilType?: string;
  irrigationType?: string;
  notes?: string;
}

export interface OrderDrone {
  id: string;
  orderId: string;
  droneId: string;
  drone: Drone;
  assignedOperatorId?: string;
  flightParameters: FlightParameters;
  estimatedFlightTime: number; // minutes
  actualFlightTime?: number; // minutes
  batteryUsage?: number; // percentage
  status: 'ASSIGNED' | 'IN_FLIGHT' | 'COMPLETED' | 'FAILED';
}

export interface OrderMaterial {
  id: string;
  orderId: string;
  materialId: string;
  material: Material;
  quantity: number;
  unit: string;
  applicationRate: number;
  cost: number;
  suppliedBy: 'CLIENT' | 'CONTRACTOR';
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: Order['status'];
  changedBy: string;
  changedAt: string;
  comment?: string;
  attachments?: string[];
}

export interface WeatherRequirements {
  maxWindSpeed: number; // km/h
  minTemperature: number; // °C
  maxTemperature: number; // °C
  maxHumidity: number; // percentage
  minVisibility: number; // km
  allowedConditions: string[];
}

export interface QualityMetrics {
  coverage: number; // percentage
  accuracy: number; // percentage
  uniformity: number; // percentage
  efficiency: number; // percentage
  customerSatisfaction?: number; // 1-5 rating
}

export interface FlightParameters {
  altitude: number; // meters
  speed: number; // km/h
  overlap: number; // percentage
  sideOverlap: number; // percentage
  resolution: number; // cm/pixel
  flightPattern: 'GRID' | 'CIRCULAR' | 'LINEAR' | 'CUSTOM';
  waypoints?: Waypoint[];
  returnToHome: boolean;
  emergencyLanding?: Coordinate;
}

export interface Waypoint {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed?: number;
  action?: 'HOVER' | 'SPRAY' | 'PHOTO' | 'VIDEO';
  duration?: number; // seconds
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

// Field Management Types
export interface Field {
  id: string;
  userId: string;
  name: string;
  description?: string;
  area: number; // hectares
  coordinates: Coordinate[];
  center: Coordinate;
  address: string;
  cropType?: string;
  soilType?: string;
  irrigationType?: string;
  lastTreatmentDate?: string;
  growthStage?: string;
  elevation?: number; // meters
  slope?: number; // degrees
  drainageType?: string;
  accessPoints: AccessPoint[];
  obstacles: Obstacle[];
  weatherStation?: string;
  images: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  tags: string[];
  notes?: string;
}

export interface AccessPoint {
  id: string;
  name: string;
  coordinate: Coordinate;
  type: 'VEHICLE' | 'PEDESTRIAN' | 'DRONE_LANDING';
  description?: string;
}

export interface Obstacle {
  id: string;
  name: string;
  type: 'BUILDING' | 'TREE' | 'POWER_LINE' | 'WATER' | 'ROAD' | 'OTHER';
  coordinates: Coordinate[];
  height?: number; // meters
  description?: string;
  isTemporary: boolean;
}

// Drone Management Types
export interface Drone {
  id: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  type: 'MULTIROTOR' | 'FIXED_WING' | 'HYBRID' | 'HELICOPTER';
  status:
    | 'AVAILABLE'
    | 'IN_FLIGHT'
    | 'MAINTENANCE'
    | 'CHARGING'
    | 'OFFLINE'
    | 'RESERVED';
  registrationNumber?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  totalFlightTime: number; // hours
  totalFlights: number;
  specifications: DroneSpecifications;
  capabilities: DroneCapabilities;
  currentLocation?: Coordinate;
  homeBase?: Coordinate;
  assignedOperatorId?: string;
  assignedOperator?: User;
  batteryLevel?: number; // percentage
  fuelLevel?: number; // percentage (for fuel-powered drones)
  maintenanceRecords: MaintenanceRecord[];
  flightLogs: FlightLog[];
  images: string[];
  documents: string[];
  certifications: string[];
  insuranceInfo?: InsuranceInfo;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  notes?: string;
  isActive: boolean;
}

export interface DroneSpecifications {
  weight: number; // kg
  dimensions: {
    length: number; // cm
    width: number; // cm
    height: number; // cm
    wingspan?: number; // cm
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
  ipRating?: string;
  noiseLevel?: number; // dB
}

export interface DroneCapabilities {
  cameras: CameraCapability[];
  sensors: SensorCapability[];
  spraySystem?: SpraySystemCapability;
  navigationSystems: string[];
  communicationSystems: string[];
  autonomyLevel: 'MANUAL' | 'ASSISTED' | 'AUTONOMOUS';
  maxOperatingRadius: number; // km
  precisionLevel: number; // cm
}

export interface CameraCapability {
  type: 'RGB' | 'THERMAL' | 'MULTISPECTRAL' | 'HYPERSPECTRAL' | 'LIDAR';
  resolution: string;
  sensor: string;
  lens: string;
  gimbalAxes: number;
  features: string[];
}

export interface SensorCapability {
  type: string;
  model: string;
  accuracy: string;
  range: string;
  features: string[];
}

export interface SpraySystemCapability {
  tankCapacity: number; // liters
  flowRate: {
    min: number; // L/min
    max: number; // L/min
  };
  nozzleTypes: string[];
  pressureRange: {
    min: number; // bar
    max: number; // bar
  };
  sprayWidth: number; // meters
  dropletSize: string;
}

export interface MaintenanceRecord {
  id: string;
  droneId: string;
  type: 'ROUTINE' | 'REPAIR' | 'UPGRADE' | 'INSPECTION' | 'CALIBRATION';
  description: string;
  performedBy: string;
  performedAt: string;
  cost?: number;
  partsReplaced: string[];
  nextMaintenanceDate?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'CANCELLED';
  attachments: string[];
  notes?: string;
}

export interface FlightLog {
  id: string;
  droneId: string;
  orderId?: string;
  pilotId: string;
  pilotName: string;
  startTime: string;
  endTime?: string;
  duration?: number; // minutes
  location: {
    name: string;
    coordinates: Coordinate;
  };
  purpose: string;
  maxAltitude: number; // meters
  distance: number; // km
  batteryUsed: number; // percentage
  fuelUsed?: number; // liters
  weatherConditions: WeatherConditions;
  flightPath: Coordinate[];
  issues: string[];
  notes?: string;
  attachments: string[];
  status: 'COMPLETED' | 'ABORTED' | 'EMERGENCY_LANDING';
}

export interface WeatherConditions {
  temperature: number; // °C
  humidity: number; // percentage
  windSpeed: number; // km/h
  windDirection: number; // degrees
  pressure: number; // hPa
  visibility: number; // km
  conditions: string[];
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  expiryDate: string;
  coverage: number; // amount
  deductible: number;
  coverageTypes: string[];
}

// Material Management Types
export interface Material {
  id: string;
  name: string;
  type:
    | 'PESTICIDE'
    | 'FERTILIZER'
    | 'HERBICIDE'
    | 'FUNGICIDE'
    | 'GROWTH_REGULATOR'
    | 'SEED'
    | 'OTHER';
  manufacturer: string;
  activeIngredients: ActiveIngredient[];
  specifications: MaterialSpecifications;
  targetCrops: string[];
  targetPests?: string[];
  applicationMethods: string[];
  restrictions: string[];
  certifications: string[];
  registrationNumber?: string;
  msdsSheet?: string;
  packaging: PackagingInfo;
  pricing: PricingInfo;
  availability: 'AVAILABLE' | 'LIMITED' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  supplierId?: string;
  supplier?: User;
  images: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  tags: string[];
  notes?: string;
}

export interface ActiveIngredient {
  name: string;
  concentration: number; // percentage
  casNumber?: string;
  function: string;
}

export interface MaterialSpecifications {
  physicalState: 'LIQUID' | 'SOLID' | 'GAS' | 'POWDER' | 'GRANULAR';
  density?: number; // g/ml
  ph?: number;
  viscosity?: number; // cP
  solubility?: string;
  storageTemperature: {
    min: number; // °C
    max: number; // °C
  };
  shelfLife: number; // months
  applicationRate: {
    min: number;
    max: number;
    unit: string;
    perHectare: boolean;
  };
  mixingRatio?: string;
  compatibleMaterials: string[];
  incompatibleMaterials: string[];
  safetyRating: string;
  environmentalImpact: string;
  reentryInterval: number; // hours
  harvestInterval: number; // days
}

export interface PackagingInfo {
  sizes: PackageSize[];
  containerType: string;
  recyclable: boolean;
  hazardousShipping: boolean;
}

export interface PackageSize {
  size: number;
  unit: string;
  price: number;
  currency: string;
  minimumOrder: number;
}

export interface PricingInfo {
  basePrice: number;
  currency: string;
  unit: string;
  bulkDiscounts: BulkDiscount[];
  seasonalPricing?: SeasonalPricing[];
}

export interface BulkDiscount {
  minimumQuantity: number;
  discountPercentage: number;
}

export interface SeasonalPricing {
  startDate: string;
  endDate: string;
  priceMultiplier: number;
}

// Processing Types
export interface ProcessingType {
  id: string;
  name: string;
  description: string;
  category:
    | 'SPRAYING'
    | 'MONITORING'
    | 'MAPPING'
    | 'SEEDING'
    | 'FERTILIZING'
    | 'ANALYSIS'
    | 'OTHER';
  requiredEquipment: string[];
  estimatedDuration: number; // minutes per hectare
  basePrice: number;
  currency: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  weatherDependency: 'LOW' | 'MEDIUM' | 'HIGH';
  seasonality: string[];
  qualityStandards: QualityStandard[];
  safetyRequirements: string[];
  certificationRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QualityStandard {
  metric: string;
  minimumValue: number;
  unit: string;
  description: string;
}

// Review and Rating Types
export interface Review {
  id: string;
  orderId: string;
  order?: Order;
  reviewerId: string;
  reviewer: User;
  revieweeId: string;
  reviewee: User;
  rating: number; // 1-5
  title: string;
  comment: string;
  aspects: ReviewAspect[];
  images: string[];
  isVerified: boolean;
  isPublic: boolean;
  response?: ReviewResponse;
  helpfulVotes: number;
  reportCount: number;
  status: 'ACTIVE' | 'HIDDEN' | 'REPORTED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAspect {
  aspect:
    | 'QUALITY'
    | 'TIMELINESS'
    | 'COMMUNICATION'
    | 'PROFESSIONALISM'
    | 'VALUE';
  rating: number; // 1-5
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  responderId: string;
  responder: User;
  message: string;
  createdAt: string;
  updatedAt: string;
}

// Recommended Services
export interface RecommendedDrone {
  id: string;
  typeId: string;
  processingType: ProcessingType;
  droneId: string;
  drone: Drone;
  suitabilityScore: number; // 0-100
  reasons: string[];
  estimatedCost: number;
  estimatedDuration: number; // minutes
  availability: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types for CRUD Operations
export interface CreateOrderRequest {
  typeProcessId: string;
  dataStart: string;
  dataEnd?: string;
  materialsProvided: boolean;
  priority: Order['priority'];
  description?: string;
  notes?: string;
  fieldIds: string[];
  droneRequirements?: DroneRequirement[];
  materialRequirements?: MaterialRequirement[];
  weatherRequirements?: WeatherRequirements;
}

export interface DroneRequirement {
  droneId?: string;
  capabilities: string[];
  flightParameters: FlightParameters;
}

export interface MaterialRequirement {
  materialId?: string;
  materialType: string;
  quantity: number;
  unit: string;
  applicationRate: number;
}

export interface UpdateOrderRequest {
  typeProcessId?: string;
  status?: Order['status'];
  dataStart?: string;
  dataEnd?: string;
  materialsProvided?: boolean;
  priority?: Order['priority'];
  description?: string;
  notes?: string;
}

export interface CreateFieldRequest {
  name: string;
  description?: string;
  area: number;
  coordinates: Coordinate[];
  address: string;
  cropType?: string;
  soilType?: string;
  irrigationType?: string;
  accessPoints?: Omit<AccessPoint, 'id'>[];
  obstacles?: Omit<Obstacle, 'id'>[];
  tags?: string[];
  notes?: string;
}

export interface UpdateFieldRequest {
  name?: string;
  description?: string;
  area?: number;
  coordinates?: Coordinate[];
  address?: string;
  cropType?: string;
  soilType?: string;
  irrigationType?: string;
  tags?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface CreateDroneRequest {
  serialNumber: string;
  model: string;
  manufacturer: string;
  type: Drone['type'];
  registrationNumber?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  specifications: DroneSpecifications;
  capabilities: DroneCapabilities;
  homeBase?: Coordinate;
  assignedOperatorId?: string;
  insuranceInfo?: InsuranceInfo;
  tags?: string[];
  notes?: string;
}

export interface UpdateDroneRequest {
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  type?: Drone['type'];
  status?: Drone['status'];
  registrationNumber?: string;
  warrantyExpiry?: string;
  specifications?: Partial<DroneSpecifications>;
  capabilities?: Partial<DroneCapabilities>;
  currentLocation?: Coordinate;
  homeBase?: Coordinate;
  assignedOperatorId?: string;
  batteryLevel?: number;
  fuelLevel?: number;
  insuranceInfo?: InsuranceInfo;
  tags?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface CreateMaterialRequest {
  name: string;
  type: Material['type'];
  manufacturer: string;
  activeIngredients: ActiveIngredient[];
  specifications: MaterialSpecifications;
  targetCrops: string[];
  targetPests?: string[];
  applicationMethods: string[];
  restrictions: string[];
  certifications: string[];
  registrationNumber?: string;
  packaging: PackagingInfo;
  pricing: PricingInfo;
  supplierId?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateMaterialRequest {
  name?: string;
  type?: Material['type'];
  manufacturer?: string;
  activeIngredients?: ActiveIngredient[];
  specifications?: Partial<MaterialSpecifications>;
  targetCrops?: string[];
  targetPests?: string[];
  applicationMethods?: string[];
  restrictions?: string[];
  certifications?: string[];
  registrationNumber?: string;
  packaging?: PackagingInfo;
  pricing?: PricingInfo;
  availability?: Material['availability'];
  supplierId?: string;
  tags?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface CreateReviewRequest {
  orderId: string;
  revieweeId: string;
  rating: number;
  title: string;
  comment: string;
  aspects: ReviewAspect[];
  isPublic: boolean;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
  aspects?: ReviewAspect[];
  isPublic?: boolean;
}

// Filter and Search Types
export interface OrderFilters {
  status?: Order['status'][];
  typeProcessId?: string[];
  userId?: string;
  assignedOperatorId?: string;
  priority?: Order['priority'][];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  tags?: string[];
}

export interface FieldFilters {
  userId?: string;
  cropType?: string[];
  soilType?: string[];
  areaMin?: number;
  areaMax?: number;
  isActive?: boolean;
  search?: string;
  tags?: string[];
}

export interface DroneFilters {
  status?: Drone['status'][];
  type?: Drone['type'][];
  manufacturer?: string[];
  model?: string[];
  assignedOperatorId?: string;
  isActive?: boolean;
  maintenanceDue?: boolean;
  search?: string;
  tags?: string[];
}

export interface MaterialFilters {
  type?: Material['type'][];
  manufacturer?: string[];
  targetCrops?: string[];
  availability?: Material['availability'][];
  supplierId?: string;
  isActive?: boolean;
  search?: string;
  tags?: string[];
}

export interface ReviewFilters {
  orderId?: string;
  reviewerId?: string;
  revieweeId?: string;
  rating?: number[];
  status?: Review['status'][];
  isVerified?: boolean;
  isPublic?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Sort Options
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Email Verification
export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
  verificationSent: boolean;
}

// User Profile Update
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  surname?: string;
  phone?: string;
  avatar?: string;
  contractor?: Partial<ContractorInfo>;
}

// Statistics and Analytics
export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalFlightHours: number;
  averageRating: number;
  totalFields: number;
  totalDrones: number;
  availableDrones: number;
  maintenanceDue: number;
}

export interface OrderStats {
  totalOrders: number;
  ordersByStatus: Record<Order['status'], number>;
  ordersByType: Record<string, number>;
  ordersByMonth: Array<{ month: string; count: number; revenue: number }>;
  averageOrderValue: number;
  averageCompletionTime: number;
}

export interface DroneStats {
  totalDrones: number;
  dronesByStatus: Record<Drone['status'], number>;
  dronesByType: Record<Drone['type'], number>;
  totalFlightHours: number;
  averageFlightTime: number;
  utilizationRate: number;
  maintenanceCosts: number;
}

// Real-time Updates
export interface RealTimeUpdate {
  type:
    | 'ORDER_STATUS'
    | 'DRONE_STATUS'
    | 'FLIGHT_UPDATE'
    | 'WEATHER_ALERT'
    | 'MAINTENANCE_ALERT';
  entityId: string;
  data: unknown;
  timestamp: string;
  userId?: string;
}

// File Upload
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  title: string;
  message: string;
  data?: unknown;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}
