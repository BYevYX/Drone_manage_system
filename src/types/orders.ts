export type OrderCategory =
  | 'drone-services'
  | 'equipment-info'
  | 'materials-data'
  | 'feedback';

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export interface BaseOrder {
  id: string;
  category: OrderCategory;
  status: OrderStatus;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isDraft: boolean;
  estimatedCost?: number;
  actualCost?: number;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate?: string;
  assignedOperator?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    rating: number;
  };
  statusHistory?: {
    status: OrderStatus;
    timestamp: string;
    comment: string;
  }[];
  location?: {
    address: string;
    coordinates: { lat: number; lng: number };
    fieldType: string;
    cropType?: string;
  };
}

// Drone Services Order Types
export interface FlightParameters {
  area: number; // hectares
  altitude: number; // meters
  speed: number; // km/h
  overlap: number; // percentage
  resolution: number; // cm/pixel
  weatherConditions: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  duration: number; // minutes
}

export interface DroneServiceOrder extends BaseOrder {
  category: 'drone-services';
  serviceType:
    | 'spraying'
    | 'monitoring'
    | 'mapping'
    | 'fertilizing'
    | 'seeding';
  droneModel: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    fieldType: string;
    cropType?: string;
  };
  flightParameters: FlightParameters;
  scheduledDate: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  specialRequirements?: string;
  estimatedCost?: number;
  materials?: {
    type: string;
    quantity: number;
    unit: string;
  }[];
}

// Equipment Information Order Types
export interface TechnicalSpecifications {
  weight: number; // kg
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  batteryLife: number; // minutes
  maxSpeed: number; // km/h
  maxAltitude: number; // meters
  payloadCapacity: number; // kg
  operatingTemperature: {
    min: number;
    max: number;
  };
  connectivity: string[];
  sensors: string[];
}

export interface EquipmentInfoOrder extends BaseOrder {
  category: 'equipment-info';
  equipmentType:
    | 'drone'
    | 'sensor'
    | 'camera'
    | 'battery'
    | 'controller'
    | 'accessory';
  manufacturer: string;
  model: string;
  specifications: TechnicalSpecifications;
  condition: 'new' | 'used' | 'refurbished';
  availability: 'available' | 'reserved' | 'maintenance';
  price?: number;
  currency: string;
  images: string[];
  documentation: string[];
  certifications: string[];
  warranty: {
    duration: number; // months
    type: string;
    coverage: string[];
  };
}

// Materials Data Order Types
export interface MaterialSpecifications {
  chemicalComposition: string;
  concentration: number; // percentage
  ph: number;
  density: number; // g/ml
  viscosity?: number;
  storageTemperature: {
    min: number;
    max: number;
  };
  shelfLife: number; // months
  applicationRate: {
    min: number;
    max: number;
    unit: string;
  };
  safetyRating: string;
  environmentalImpact: string;
}

export interface MaterialsDataOrder extends BaseOrder {
  category: 'materials-data';
  materialType:
    | 'pesticide'
    | 'fertilizer'
    | 'herbicide'
    | 'fungicide'
    | 'growth-regulator'
    | 'other';
  productName: string;
  manufacturer: string;
  activeIngredients: string[];
  specifications: MaterialSpecifications;
  targetCrops: string[];
  targetPests?: string[];
  applicationMethod: string[];
  restrictions: string[];
  certifications: string[];
  msdsSheet?: string;
  registrationNumber?: string;
  packaging: {
    sizes: number[];
    unit: string;
    type: string;
  };
}

// Feedback Order Types
export interface FeedbackOrder extends BaseOrder {
  category: 'feedback';
  feedbackType:
    | 'bug-report'
    | 'feature-request'
    | 'improvement'
    | 'general'
    | 'complaint';
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  details: string;
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  browserInfo?: string;
  deviceInfo?: string;
  screenshots?: string[];
  contactPreference: 'email' | 'phone' | 'platform';
  followUpRequired: boolean;
  category_tags: string[];
}

export type Order =
  | DroneServiceOrder
  | EquipmentInfoOrder
  | MaterialsDataOrder
  | FeedbackOrder;

// Form Step Types
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
  isValid: boolean;
  fields: string[];
}

export interface OrderFormState {
  currentStep: number;
  steps: FormStep[];
  data: Partial<Order>;
  errors: Record<string, string>;
  isDirty: boolean;
  isSubmitting: boolean;
}

// API Types
export interface CreateOrderRequest {
  category: OrderCategory;
  data: Partial<Order>;
  isDraft?: boolean;
}

export interface UpdateOrderRequest {
  id: string;
  data: Partial<Order>;
  isDraft?: boolean;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderFilters {
  category?: OrderCategory;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
