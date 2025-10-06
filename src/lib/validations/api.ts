import { z } from 'zod';

// Base validation schemas
export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// User and Authentication Schemas
export const contractorInfoSchema = z.object({
  companyName: z.string().min(2).max(100),
  registrationNumber: z.string().min(5).max(50),
  taxId: z.string().min(5).max(50),
  address: z.string().min(10).max(500),
  contactPerson: z.string().min(2).max(100),
  website: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  certifications: z.array(z.string()).default([]),
  serviceAreas: z.array(z.string()).default([]),
  specializations: z.array(z.string()).default([]),
});

export const registerSchema = z.object({
  email: z.string().email('Введите корректный email'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Введите корректный номер телефона'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать строчные, заглавные буквы и цифры',
    ),
  firstName: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50),
  lastName: z
    .string()
    .min(2, 'Фамилия должна содержать минимум 2 символа')
    .max(50),
  surname: z.string().max(50).optional(),
  userRole: z.enum(['CLIENT', 'OPERATOR', 'ADMIN', 'CONTRACTOR']),
  contractor: contractorInfoSchema.optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Введите корректный email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Токен обязателен'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать строчные, заглавные буквы и цифры',
    ),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  surname: z.string().max(50).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  avatar: z.string().url().optional(),
  contractor: contractorInfoSchema.partial().optional(),
});

// Weather and Flight Parameter Schemas
export const weatherRequirementsSchema = z.object({
  maxWindSpeed: z.number().min(0).max(100),
  minTemperature: z.number().min(-50).max(60),
  maxTemperature: z.number().min(-50).max(60),
  maxHumidity: z.number().min(0).max(100),
  minVisibility: z.number().min(0).max(50),
  allowedConditions: z.array(z.string()),
});

export const waypointSchema = z.object({
  id: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().min(0).max(10000),
  speed: z.number().min(0).max(200).optional(),
  action: z.enum(['HOVER', 'SPRAY', 'PHOTO', 'VIDEO']).optional(),
  duration: z.number().min(0).max(3600).optional(),
});

export const flightParametersSchema = z.object({
  altitude: z.number().min(1).max(500, 'Максимальная высота 500м'),
  speed: z.number().min(1).max(100, 'Максимальная скорость 100 км/ч'),
  overlap: z.number().min(0).max(100, 'Перекрытие от 0 до 100%'),
  sideOverlap: z.number().min(0).max(100, 'Боковое перекрытие от 0 до 100%'),
  resolution: z.number().min(0.1).max(50, 'Разрешение от 0.1 до 50 см/пиксель'),
  flightPattern: z.enum(['GRID', 'CIRCULAR', 'LINEAR', 'CUSTOM']),
  waypoints: z.array(waypointSchema).optional(),
  returnToHome: z.boolean().default(true),
  emergencyLanding: coordinateSchema.optional(),
});

// Field Management Schemas
export const accessPointSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  coordinate: coordinateSchema,
  type: z.enum(['VEHICLE', 'PEDESTRIAN', 'DRONE_LANDING']),
  description: z.string().max(500).optional(),
});

export const obstacleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  type: z.enum(['BUILDING', 'TREE', 'POWER_LINE', 'WATER', 'ROAD', 'OTHER']),
  coordinates: z.array(coordinateSchema).min(1),
  height: z.number().min(0).max(1000).optional(),
  description: z.string().max(500).optional(),
  isTemporary: z.boolean().default(false),
});

export const createFieldSchema = z.object({
  name: z
    .string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100),
  description: z.string().max(1000).optional(),
  area: z.number().min(0.01, 'Площадь должна быть больше 0').max(10000),
  coordinates: z
    .array(coordinateSchema)
    .min(3, 'Необходимо минимум 3 точки для определения поля'),
  address: z
    .string()
    .min(10, 'Адрес должен содержать минимум 10 символов')
    .max(500),
  cropType: z.string().max(100).optional(),
  soilType: z.string().max(100).optional(),
  irrigationType: z.string().max(100).optional(),
  accessPoints: z.array(accessPointSchema).optional(),
  obstacles: z.array(obstacleSchema).optional(),
  tags: z.array(z.string().max(50)).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateFieldSchema = createFieldSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const fieldFiltersSchema = z.object({
  userId: z.string().optional(),
  cropType: z.array(z.string()).optional(),
  soilType: z.array(z.string()).optional(),
  areaMin: z.number().min(0).optional(),
  areaMax: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

// Drone Management Schemas
export const droneSpecificationsSchema = z.object({
  weight: z.number().min(0.1).max(1000, 'Вес должен быть от 0.1 до 1000 кг'),
  dimensions: z.object({
    length: z.number().min(1).max(1000),
    width: z.number().min(1).max(1000),
    height: z.number().min(1).max(1000),
    wingspan: z.number().min(1).max(1000).optional(),
  }),
  batteryCapacity: z
    .number()
    .min(100)
    .max(100000, 'Емкость батареи от 100 до 100000 мАч'),
  flightTime: z.number().min(1).max(1440, 'Время полета от 1 до 1440 минут'),
  maxSpeed: z
    .number()
    .min(1)
    .max(300, 'Максимальная скорость от 1 до 300 км/ч'),
  maxAltitude: z
    .number()
    .min(1)
    .max(10000, 'Максимальная высота от 1 до 10000 м'),
  payloadCapacity: z
    .number()
    .min(0)
    .max(1000, 'Грузоподъемность от 0 до 1000 кг'),
  operatingTemperature: z.object({
    min: z.number().min(-50).max(50),
    max: z.number().min(-50).max(80),
  }),
  windResistance: z
    .number()
    .min(0)
    .max(200, 'Устойчивость к ветру от 0 до 200 км/ч'),
  range: z.number().min(0.1).max(1000, 'Дальность от 0.1 до 1000 км'),
  chargingTime: z.number().min(1).max(1440, 'Время зарядки от 1 до 1440 минут'),
  ipRating: z.string().max(10).optional(),
  noiseLevel: z.number().min(0).max(200).optional(),
});

export const cameraCapabilitySchema = z.object({
  type: z.enum(['RGB', 'THERMAL', 'MULTISPECTRAL', 'HYPERSPECTRAL', 'LIDAR']),
  resolution: z.string().min(1).max(50),
  sensor: z.string().min(1).max(100),
  lens: z.string().min(1).max(100),
  gimbalAxes: z.number().int().min(0).max(3),
  features: z.array(z.string().max(50)),
});

export const sensorCapabilitySchema = z.object({
  type: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  accuracy: z.string().min(1).max(100),
  range: z.string().min(1).max(100),
  features: z.array(z.string().max(50)),
});

export const spraySystemCapabilitySchema = z.object({
  tankCapacity: z.number().min(0.1).max(1000),
  flowRate: z.object({
    min: z.number().min(0.1).max(100),
    max: z.number().min(0.1).max(100),
  }),
  nozzleTypes: z.array(z.string().max(50)),
  pressureRange: z.object({
    min: z.number().min(0.1).max(50),
    max: z.number().min(0.1).max(50),
  }),
  sprayWidth: z.number().min(0.1).max(100),
  dropletSize: z.string().max(50),
});

export const droneCapabilitiesSchema = z.object({
  cameras: z.array(cameraCapabilitySchema),
  sensors: z.array(sensorCapabilitySchema),
  spraySystem: spraySystemCapabilitySchema.optional(),
  navigationSystems: z.array(z.string().max(50)),
  communicationSystems: z.array(z.string().max(50)),
  autonomyLevel: z.enum(['MANUAL', 'ASSISTED', 'AUTONOMOUS']),
  maxOperatingRadius: z.number().min(0.1).max(1000),
  precisionLevel: z.number().min(0.1).max(100),
});

export const insuranceInfoSchema = z.object({
  provider: z.string().min(2).max(100),
  policyNumber: z.string().min(5).max(50),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  coverage: z.number().min(1000).max(10000000),
  deductible: z.number().min(0).max(100000),
  coverageTypes: z.array(z.string().max(50)),
});

export const createDroneSchema = z.object({
  serialNumber: z
    .string()
    .min(3, 'Серийный номер должен содержать минимум 3 символа')
    .max(50),
  model: z
    .string()
    .min(2, 'Модель должна содержать минимум 2 символа')
    .max(100),
  manufacturer: z
    .string()
    .min(2, 'Производитель должен содержать минимум 2 символа')
    .max(100),
  type: z.enum(['MULTIROTOR', 'FIXED_WING', 'HYBRID', 'HELICOPTER']),
  registrationNumber: z.string().max(50).optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  warrantyExpiry: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  specifications: droneSpecificationsSchema,
  capabilities: droneCapabilitiesSchema,
  homeBase: coordinateSchema.optional(),
  assignedOperatorId: z.string().optional(),
  insuranceInfo: insuranceInfoSchema.optional(),
  tags: z.array(z.string().max(50)).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateDroneSchema = createDroneSchema.partial().extend({
  status: z
    .enum([
      'AVAILABLE',
      'IN_FLIGHT',
      'MAINTENANCE',
      'CHARGING',
      'OFFLINE',
      'RESERVED',
    ])
    .optional(),
  currentLocation: coordinateSchema.optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  fuelLevel: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export const droneFiltersSchema = z.object({
  status: z
    .array(
      z.enum([
        'AVAILABLE',
        'IN_FLIGHT',
        'MAINTENANCE',
        'CHARGING',
        'OFFLINE',
        'RESERVED',
      ]),
    )
    .optional(),
  type: z
    .array(z.enum(['MULTIROTOR', 'FIXED_WING', 'HYBRID', 'HELICOPTER']))
    .optional(),
  manufacturer: z.array(z.string()).optional(),
  model: z.array(z.string()).optional(),
  assignedOperatorId: z.string().optional(),
  isActive: z.boolean().optional(),
  maintenanceDue: z.boolean().optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

// Material Management Schemas
export const activeIngredientSchema = z.object({
  name: z.string().min(1).max(100),
  concentration: z.number().min(0).max(100),
  casNumber: z.string().max(20).optional(),
  function: z.string().min(1).max(100),
});

export const packageSizeSchema = z.object({
  size: z.number().min(0.01).max(10000),
  unit: z.string().min(1).max(20),
  price: z.number().min(0).max(1000000),
  currency: z.string().length(3),
  minimumOrder: z.number().int().min(1).max(10000),
});

export const bulkDiscountSchema = z.object({
  minimumQuantity: z.number().min(1).max(100000),
  discountPercentage: z.number().min(0).max(100),
});

export const seasonalPricingSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priceMultiplier: z.number().min(0.1).max(10),
});

export const materialSpecificationsSchema = z.object({
  physicalState: z.enum(['LIQUID', 'SOLID', 'GAS', 'POWDER', 'GRANULAR']),
  density: z.number().min(0.1).max(20).optional(),
  ph: z.number().min(0).max(14).optional(),
  viscosity: z.number().min(0).max(10000).optional(),
  solubility: z.string().max(100).optional(),
  storageTemperature: z.object({
    min: z.number().min(-50).max(50),
    max: z.number().min(-50).max(80),
  }),
  shelfLife: z.number().int().min(1).max(240),
  applicationRate: z.object({
    min: z.number().min(0.001).max(1000),
    max: z.number().min(0.001).max(1000),
    unit: z.string().min(1).max(20),
    perHectare: z.boolean(),
  }),
  mixingRatio: z.string().max(100).optional(),
  compatibleMaterials: z.array(z.string().max(100)),
  incompatibleMaterials: z.array(z.string().max(100)),
  safetyRating: z.string().min(1).max(50),
  environmentalImpact: z.string().min(1).max(500),
  reentryInterval: z.number().min(0).max(8760),
  harvestInterval: z.number().min(0).max(365),
});

export const packagingInfoSchema = z.object({
  sizes: z.array(packageSizeSchema).min(1),
  containerType: z.string().min(1).max(100),
  recyclable: z.boolean(),
  hazardousShipping: z.boolean(),
});

export const pricingInfoSchema = z.object({
  basePrice: z.number().min(0).max(1000000),
  currency: z.string().length(3),
  unit: z.string().min(1).max(20),
  bulkDiscounts: z.array(bulkDiscountSchema),
  seasonalPricing: z.array(seasonalPricingSchema).optional(),
});

export const createMaterialSchema = z.object({
  name: z
    .string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(200),
  type: z.enum([
    'PESTICIDE',
    'FERTILIZER',
    'HERBICIDE',
    'FUNGICIDE',
    'GROWTH_REGULATOR',
    'SEED',
    'OTHER',
  ]),
  manufacturer: z
    .string()
    .min(2, 'Производитель должен содержать минимум 2 символа')
    .max(100),
  activeIngredients: z.array(activeIngredientSchema).min(1),
  specifications: materialSpecificationsSchema,
  targetCrops: z.array(z.string().max(50)).min(1),
  targetPests: z.array(z.string().max(50)).optional(),
  applicationMethods: z.array(z.string().max(50)).min(1),
  restrictions: z.array(z.string().max(200)),
  certifications: z.array(z.string().max(100)),
  registrationNumber: z.string().max(50).optional(),
  packaging: packagingInfoSchema,
  pricing: pricingInfoSchema,
  supplierId: z.string().optional(),
  tags: z.array(z.string().max(50)).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial().extend({
  availability: z
    .enum(['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK', 'DISCONTINUED'])
    .optional(),
  isActive: z.boolean().optional(),
});

export const materialFiltersSchema = z.object({
  type: z
    .array(
      z.enum([
        'PESTICIDE',
        'FERTILIZER',
        'HERBICIDE',
        'FUNGICIDE',
        'GROWTH_REGULATOR',
        'SEED',
        'OTHER',
      ]),
    )
    .optional(),
  manufacturer: z.array(z.string()).optional(),
  targetCrops: z.array(z.string()).optional(),
  availability: z
    .array(z.enum(['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK', 'DISCONTINUED']))
    .optional(),
  supplierId: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

// Order Management Schemas
export const droneRequirementSchema = z.object({
  droneId: z.string().optional(),
  capabilities: z.array(z.string().max(50)),
  flightParameters: flightParametersSchema,
});

export const materialRequirementSchema = z.object({
  materialId: z.string().optional(),
  materialType: z.string().min(1).max(50),
  quantity: z.number().min(0.001).max(100000),
  unit: z.string().min(1).max(20),
  applicationRate: z.number().min(0.001).max(1000),
});

export const createOrderSchema = z.object({
  typeProcessId: z.string().min(1, 'Тип процесса обязателен'),
  dataStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Некорректная дата начала'),
  dataEnd: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      'Некорректная дата окончания',
    )
    .optional(),
  materialsProvided: z.boolean(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  description: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  fieldIds: z.array(z.string()).min(1, 'Необходимо выбрать минимум одно поле'),
  droneRequirements: z.array(droneRequirementSchema).optional(),
  materialRequirements: z.array(materialRequirementSchema).optional(),
  weatherRequirements: weatherRequirementsSchema.optional(),
});

export const updateOrderSchema = z.object({
  typeProcessId: z.string().optional(),
  status: z
    .enum([
      'DRAFT',
      'PENDING',
      'APPROVED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'REJECTED',
    ])
    .optional(),
  dataStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    .optional(),
  dataEnd: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    .optional(),
  materialsProvided: z.boolean().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  description: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
});

export const orderFiltersSchema = z.object({
  status: z
    .array(
      z.enum([
        'DRAFT',
        'PENDING',
        'APPROVED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'REJECTED',
      ]),
    )
    .optional(),
  typeProcessId: z.array(z.string()).optional(),
  userId: z.string().optional(),
  assignedOperatorId: z.string().optional(),
  priority: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])).optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

// Processing Type Schemas
export const qualityStandardSchema = z.object({
  metric: z.string().min(1).max(100),
  minimumValue: z.number().min(0).max(1000000),
  unit: z.string().min(1).max(20),
  description: z.string().min(1).max(500),
});

export const createProcessingTypeSchema = z.object({
  name: z
    .string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(1000),
  category: z.enum([
    'SPRAYING',
    'MONITORING',
    'MAPPING',
    'SEEDING',
    'FERTILIZING',
    'ANALYSIS',
    'OTHER',
  ]),
  requiredEquipment: z.array(z.string().max(100)).min(1),
  estimatedDuration: z.number().min(1).max(1440),
  basePrice: z.number().min(0).max(1000000),
  currency: z.string().length(3),
  complexity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  weatherDependency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  seasonality: z.array(z.string().max(20)),
  qualityStandards: z.array(qualityStandardSchema),
  safetyRequirements: z.array(z.string().max(200)),
  certificationRequired: z.boolean(),
});

export const updateProcessingTypeSchema = createProcessingTypeSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

// Review and Rating Schemas
export const reviewAspectSchema = z.object({
  aspect: z.enum([
    'QUALITY',
    'TIMELINESS',
    'COMMUNICATION',
    'PROFESSIONALISM',
    'VALUE',
  ]),
  rating: z.number().int().min(1).max(5),
});

export const createReviewSchema = z.object({
  orderId: z.string().min(1, 'ID заказа обязателен'),
  revieweeId: z.string().min(1, 'ID оцениваемого обязателен'),
  rating: z
    .number()
    .int()
    .min(1, 'Минимальная оценка 1')
    .max(5, 'Максимальная оценка 5'),
  title: z
    .string()
    .min(5, 'Заголовок должен содержать минимум 5 символов')
    .max(200),
  comment: z
    .string()
    .min(10, 'Комментарий должен содержать минимум 10 символов')
    .max(2000),
  aspects: z
    .array(reviewAspectSchema)
    .min(1, 'Необходимо оценить минимум один аспект'),
  isPublic: z.boolean().default(true),
});

export const updateReviewSchema = createReviewSchema.partial();

export const reviewFiltersSchema = z.object({
  orderId: z.string().optional(),
  reviewerId: z.string().optional(),
  revieweeId: z.string().optional(),
  rating: z.array(z.number().int().min(1).max(5)).optional(),
  status: z
    .array(z.enum(['ACTIVE', 'HIDDEN', 'REPORTED', 'DELETED']))
    .optional(),
  isVerified: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  search: z.string().max(100).optional(),
});

// Maintenance and Flight Log Schemas
export const createMaintenanceRecordSchema = z.object({
  droneId: z.string().min(1, 'ID дрона обязателен'),
  type: z.enum(['ROUTINE', 'REPAIR', 'UPGRADE', 'INSPECTION', 'CALIBRATION']),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(1000),
  performedBy: z.string().min(1, 'Исполнитель обязателен').max(100),
  performedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
  cost: z.number().min(0).max(1000000).optional(),
  partsReplaced: z.array(z.string().max(100)),
  nextMaintenanceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'SCHEDULED', 'CANCELLED']),
  attachments: z.array(z.string().url()),
  notes: z.string().max(2000).optional(),
});

export const weatherConditionsSchema = z.object({
  temperature: z.number().min(-50).max(60),
  humidity: z.number().min(0).max(100),
  windSpeed: z.number().min(0).max(200),
  windDirection: z.number().min(0).max(360),
  pressure: z.number().min(800).max(1200),
  visibility: z.number().min(0).max(50),
  conditions: z.array(z.string().max(50)),
});

export const createFlightLogSchema = z.object({
  droneId: z.string().min(1, 'ID дрона обязателен'),
  orderId: z.string().optional(),
  pilotId: z.string().min(1, 'ID пилота обязателен'),
  pilotName: z
    .string()
    .min(2, 'Имя пилота должно содержать минимум 2 символа')
    .max(100),
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
  endTime: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    .optional(),
  duration: z.number().min(1).max(1440).optional(),
  location: z.object({
    name: z.string().min(1).max(200),
    coordinates: coordinateSchema,
  }),
  purpose: z
    .string()
    .min(5, 'Цель полета должна содержать минимум 5 символов')
    .max(500),
  maxAltitude: z.number().min(0).max(10000),
  distance: z.number().min(0).max(10000),
  batteryUsed: z.number().min(0).max(100),
  fuelUsed: z.number().min(0).max(1000).optional(),
  weatherConditions: weatherConditionsSchema,
  flightPath: z.array(coordinateSchema),
  issues: z.array(z.string().max(500)),
  notes: z.string().max(2000).optional(),
  attachments: z.array(z.string().url()),
  status: z.enum(['COMPLETED', 'ABORTED', 'EMERGENCY_LANDING']),
});

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'Размер файла не должен превышать 10MB',
  ),
  category: z.enum(['DOCUMENT', 'IMAGE', 'VIDEO', 'OTHER']).optional(),
});

// Notification Schema
export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  data: z.record(z.unknown()).optional(),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    .optional(),
});

// Export all form data types
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export type CreateFieldFormData = z.infer<typeof createFieldSchema>;
export type UpdateFieldFormData = z.infer<typeof updateFieldSchema>;
export type FieldFiltersFormData = z.infer<typeof fieldFiltersSchema>;

export type CreateDroneFormData = z.infer<typeof createDroneSchema>;
export type UpdateDroneFormData = z.infer<typeof updateDroneSchema>;
export type DroneFiltersFormData = z.infer<typeof droneFiltersSchema>;

export type CreateMaterialFormData = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialFormData = z.infer<typeof updateMaterialSchema>;
export type MaterialFiltersFormData = z.infer<typeof materialFiltersSchema>;

export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
export type UpdateOrderFormData = z.infer<typeof updateOrderSchema>;
export type OrderFiltersFormData = z.infer<typeof orderFiltersSchema>;

export type CreateProcessingTypeFormData = z.infer<
  typeof createProcessingTypeSchema
>;
export type UpdateProcessingTypeFormData = z.infer<
  typeof updateProcessingTypeSchema
>;

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>;
export type ReviewFiltersFormData = z.infer<typeof reviewFiltersSchema>;

export type CreateMaintenanceRecordFormData = z.infer<
  typeof createMaintenanceRecordSchema
>;
export type CreateFlightLogFormData = z.infer<typeof createFlightLogSchema>;

export type PaginationFormData = z.infer<typeof paginationSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type CreateNotificationFormData = z.infer<
  typeof createNotificationSchema
>;
