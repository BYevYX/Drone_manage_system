export type MaterialCategory =
  | 'consumables'
  | 'replacement-parts'
  | 'batteries'
  | 'sensors'
  | 'chemicals'
  | 'tools'
  | 'accessories'
  | 'safety-equipment';

export type MaterialStatus =
  | 'in-stock'
  | 'low-stock'
  | 'out-of-stock'
  | 'on-order'
  | 'discontinued'
  | 'expired';

export type StockMovementType =
  | 'purchase'
  | 'usage'
  | 'return'
  | 'adjustment'
  | 'transfer'
  | 'disposal'
  | 'expired';

export type UnitOfMeasurement =
  | 'pieces'
  | 'liters'
  | 'kilograms'
  | 'grams'
  | 'milliliters'
  | 'meters'
  | 'centimeters'
  | 'hours'
  | 'cycles';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  website?: string;
  rating: number; // 1-5
  paymentTerms: string;
  deliveryTime: number; // days
  minimumOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialSpecifications {
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  compatibility: string[]; // Compatible drone models
  operatingConditions?: {
    temperature: {
      min: number;
      max: number;
    };
    humidity: {
      min: number;
      max: number;
    };
  };
  shelfLife?: number; // months
  storageRequirements?: string[];
  safetyInformation?: {
    hazardClass?: string;
    msdsSheet?: string;
    handlingInstructions: string[];
    disposalInstructions: string[];
  };
  certifications?: string[];
  technicalSpecs?: Record<string, string | number>;
}

export interface StockMovement {
  id: string;
  materialId: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reason: string;
  performedBy: string;
  performedAt: string;
  referenceNumber?: string; // PO number, work order, etc.
  supplier?: {
    id: string;
    name: string;
  };
  location?: {
    from?: string;
    to?: string;
  };
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface ReorderRule {
  id: string;
  materialId: string;
  minQuantity: number;
  maxQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  leadTime: number; // days
  isActive: boolean;
  preferredSupplier?: {
    id: string;
    name: string;
  };
  seasonalAdjustment?: {
    factor: number;
    startMonth: number;
    endMonth: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: MaterialCategory;
  status: MaterialStatus;
  manufacturer: string;
  model?: string;
  partNumber?: string;
  barcode?: string;
  qrCode?: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  unitOfMeasurement: UnitOfMeasurement;
  unitCost: number;
  totalValue: number;
  location: {
    warehouse: string;
    zone: string;
    shelf: string;
    bin: string;
  };
  specifications: MaterialSpecifications;
  suppliers: {
    id: string;
    name: string;
    partNumber?: string;
    unitCost: number;
    leadTime: number;
    minimumOrder: number;
    isPrimary: boolean;
  }[];
  reorderRule?: ReorderRule;
  stockMovements: StockMovement[];
  images: string[];
  documents: string[]; // URLs to datasheets, manuals, etc.
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastStockUpdate: string;
  expiryDate?: string;
  batchNumbers?: string[];
}

export interface MaterialFormData {
  sku: string;
  name: string;
  description: string;
  category: MaterialCategory;
  manufacturer: string;
  model?: string;
  partNumber?: string;
  barcode?: string;
  currentStock: number;
  unitOfMeasurement: UnitOfMeasurement;
  unitCost: number;
  location: {
    warehouse: string;
    zone: string;
    shelf: string;
    bin: string;
  };
  specifications: MaterialSpecifications;
  suppliers: {
    id: string;
    partNumber?: string;
    unitCost: number;
    leadTime: number;
    minimumOrder: number;
    isPrimary: boolean;
  }[];
  reorderRule?: {
    minQuantity: number;
    maxQuantity: number;
    reorderPoint: number;
    reorderQuantity: number;
    leadTime: number;
    preferredSupplierId?: string;
  };
  images?: File[];
  documents?: File[];
  tags?: string[];
  notes?: string;
  expiryDate?: string;
  batchNumbers?: string[];
}

export interface MaterialFilters {
  category?: MaterialCategory[];
  status?: MaterialStatus[];
  manufacturer?: string[];
  supplier?: string[];
  location?: {
    warehouse?: string;
    zone?: string;
  };
  stockLevel?: 'all' | 'low-stock' | 'out-of-stock' | 'in-stock';
  expiryStatus?: 'all' | 'expiring-soon' | 'expired';
  search?: string;
  tags?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface MaterialSortOptions {
  field:
    | 'name'
    | 'sku'
    | 'category'
    | 'currentStock'
    | 'unitCost'
    | 'totalValue'
    | 'lastStockUpdate'
    | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface InventoryStats {
  totalMaterials: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  expiredItems: number;
  reorderSuggestions: number;
  topCategories: {
    category: MaterialCategory;
    count: number;
    value: number;
  }[];
  stockMovementTrend: {
    date: string;
    purchases: number;
    usage: number;
    adjustments: number;
  }[];
}

export interface BulkMaterialOperation {
  type:
    | 'stock-adjustment'
    | 'location-change'
    | 'supplier-update'
    | 'price-update'
    | 'status-change'
    | 'add-tags'
    | 'export';
  materialIds: string[];
  data?: unknown;
}

export interface MaterialImportData {
  sku: string;
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  model?: string;
  partNumber?: string;
  barcode?: string;
  currentStock: number;
  unitOfMeasurement: string;
  unitCost: number;
  warehouse: string;
  zone: string;
  shelf: string;
  bin: string;
  supplierName?: string;
  supplierPartNumber?: string;
  supplierUnitCost?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  tags?: string;
  notes?: string;
  expiryDate?: string;
}

export interface ReorderSuggestion {
  id: string;
  materialId: string;
  materialName: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  preferredSupplier?: {
    id: string;
    name: string;
    unitCost: number;
    leadTime: number;
  };
  estimatedCost: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  createdAt: string;
  isProcessed: boolean;
}

export interface StockAlert {
  id: string;
  type:
    | 'low-stock'
    | 'out-of-stock'
    | 'expiring-soon'
    | 'expired'
    | 'reorder-needed';
  materialId: string;
  materialName: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  data?: {
    currentStock?: number;
    threshold?: number;
    expiryDate?: string;
    daysUntilExpiry?: number;
  };
}

export interface InventoryAuditLog {
  id: string;
  materialId?: string;
  action:
    | 'material-created'
    | 'material-updated'
    | 'material-deleted'
    | 'stock-movement'
    | 'reorder-rule-updated'
    | 'bulk-operation';
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
  affectedItems?: number;
}
