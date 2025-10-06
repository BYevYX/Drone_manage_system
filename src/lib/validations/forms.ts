import { z } from 'zod';

// Common validation schemas
export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Неверный формат телефона');

export const emailSchema = z.string().email('Неверный формат email');

// Order validation schemas
export const createOrderSchema = z.object({
  typeProcessId: z.string().min(1, 'Выберите тип услуги'),
  dataStart: z.string().min(1, 'Укажите дату начала'),
  dataEnd: z.string().optional(),
  materialsProvided: z.boolean(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  description: z.string().optional(),
  notes: z.string().optional(),
  fieldIds: z.array(z.string()).min(1, 'Выберите хотя бы одно поле'),
  droneRequirements: z
    .array(
      z.object({
        droneId: z.string().optional(),
        capabilities: z.array(z.string()),
        flightParameters: z.object({
          altitude: z
            .number()
            .min(1)
            .max(500, 'Высота не может превышать 500 метров'),
          speed: z
            .number()
            .min(1)
            .max(100, 'Скорость не может превышать 100 км/ч'),
          overlap: z
            .number()
            .min(0)
            .max(100, 'Перекрытие должно быть от 0 до 100%'),
          sideOverlap: z
            .number()
            .min(0)
            .max(100, 'Боковое перекрытие должно быть от 0 до 100%'),
          resolution: z
            .number()
            .min(0.1)
            .max(50, 'Разрешение должно быть от 0.1 до 50 см/пиксель'),
          flightPattern: z.enum(['GRID', 'CIRCULAR', 'LINEAR', 'CUSTOM']),
          returnToHome: z.boolean(),
          emergencyLanding: coordinateSchema.optional(),
        }),
      }),
    )
    .optional(),
  materialRequirements: z
    .array(
      z.object({
        materialId: z.string().optional(),
        materialType: z.string().min(1, 'Укажите тип материала'),
        quantity: z.number().min(0.1, 'Количество должно быть больше 0'),
        unit: z.string().min(1, 'Укажите единицу измерения'),
        applicationRate: z
          .number()
          .min(0, 'Норма расхода не может быть отрицательной'),
      }),
    )
    .optional(),
  weatherRequirements: z
    .object({
      maxWindSpeed: z
        .number()
        .min(0)
        .max(50, 'Максимальная скорость ветра не может превышать 50 км/ч'),
      minTemperature: z.number().min(-50).max(50),
      maxTemperature: z.number().min(-50).max(50),
      maxHumidity: z.number().min(0).max(100),
      minVisibility: z.number().min(0).max(50),
      allowedConditions: z.array(z.string()),
    })
    .optional(),
});

export const updateOrderSchema = createOrderSchema.partial().extend({
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
});

// Field validation schemas
export const createFieldSchema = z.object({
  name: z
    .string()
    .min(1, 'Название поля обязательно')
    .max(100, 'Название не может превышать 100 символов'),
  description: z
    .string()
    .max(500, 'Описание не может превышать 500 символов')
    .optional(),
  area: z
    .number()
    .min(0.01, 'Площадь должна быть больше 0')
    .max(10000, 'Площадь не может превышать 10000 га'),
  coordinates: z
    .array(coordinateSchema)
    .min(3, 'Необходимо минимум 3 точки для определения границ'),
  address: z
    .string()
    .min(1, 'Адрес обязателен')
    .max(200, 'Адрес не может превышать 200 символов'),
  cropType: z
    .string()
    .max(50, 'Тип культуры не может превышать 50 символов')
    .optional(),
  soilType: z
    .string()
    .max(50, 'Тип почвы не может превышать 50 символов')
    .optional(),
  irrigationType: z
    .string()
    .max(50, 'Тип орошения не может превышать 50 символов')
    .optional(),
  accessPoints: z
    .array(
      z.object({
        name: z.string().min(1, 'Название точки доступа обязательно'),
        coordinate: coordinateSchema,
        type: z.enum(['VEHICLE', 'PEDESTRIAN', 'DRONE_LANDING']),
        description: z.string().optional(),
      }),
    )
    .optional(),
  obstacles: z
    .array(
      z.object({
        name: z.string().min(1, 'Название препятствия обязательно'),
        type: z.enum([
          'BUILDING',
          'TREE',
          'POWER_LINE',
          'WATER',
          'ROAD',
          'OTHER',
        ]),
        coordinates: z
          .array(coordinateSchema)
          .min(1, 'Необходимо указать координаты препятствия'),
        height: z
          .number()
          .min(0)
          .max(1000, 'Высота не может превышать 1000 метров')
          .optional(),
        description: z.string().optional(),
        isTemporary: z.boolean(),
      }),
    )
    .optional(),
  tags: z
    .array(z.string().max(30, 'Тег не может превышать 30 символов'))
    .optional(),
  notes: z
    .string()
    .max(1000, 'Примечания не могут превышать 1000 символов')
    .optional(),
});

export const updateFieldSchema = createFieldSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Drone validation schemas
export const createDroneSchema = z.object({
  serialNumber: z
    .string()
    .min(1, 'Серийный номер обязателен')
    .max(50, 'Серийный номер не может превышать 50 символов'),
  model: z
    .string()
    .min(1, 'Модель обязательна')
    .max(50, 'Модель не может превышать 50 символов'),
  manufacturer: z
    .string()
    .min(1, 'Производитель обязателен')
    .max(50, 'Производитель не может превышать 50 символов'),
  type: z.enum(['MULTIROTOR', 'FIXED_WING', 'HYBRID', 'HELICOPTER']),
  registrationNumber: z
    .string()
    .max(20, 'Регистрационный номер не может превышать 20 символов')
    .optional(),
  purchaseDate: z.string().min(1, 'Дата покупки обязательна'),
  warrantyExpiry: z.string().optional(),
  specifications: z.object({
    weight: z
      .number()
      .min(0.1, 'Вес должен быть больше 0')
      .max(1000, 'Вес не может превышать 1000 кг'),
    dimensions: z.object({
      length: z
        .number()
        .min(1, 'Длина должна быть больше 0')
        .max(1000, 'Длина не может превышать 1000 см'),
      width: z
        .number()
        .min(1, 'Ширина должна быть больше 0')
        .max(1000, 'Ширина не может превышать 1000 см'),
      height: z
        .number()
        .min(1, 'Высота должна быть больше 0')
        .max(1000, 'Высота не может превышать 1000 см'),
      wingspan: z
        .number()
        .min(0)
        .max(2000, 'Размах крыльев не может превышать 2000 см')
        .optional(),
    }),
    batteryCapacity: z
      .number()
      .min(100, 'Емкость батареи должна быть больше 100 мАч')
      .max(100000, 'Емкость батареи не может превышать 100000 мАч'),
    flightTime: z
      .number()
      .min(1, 'Время полета должно быть больше 1 минуты')
      .max(1440, 'Время полета не может превышать 1440 минут'),
    maxSpeed: z
      .number()
      .min(1, 'Максимальная скорость должна быть больше 1 км/ч')
      .max(300, 'Максимальная скорость не может превышать 300 км/ч'),
    maxAltitude: z
      .number()
      .min(1, 'Максимальная высота должна быть больше 1 метра')
      .max(10000, 'Максимальная высота не может превышать 10000 метров'),
    payloadCapacity: z
      .number()
      .min(0, 'Грузоподъемность не может быть отрицательной')
      .max(1000, 'Грузоподъемность не может превышать 1000 кг'),
    operatingTemperature: z.object({
      min: z
        .number()
        .min(-50, 'Минимальная температура не может быть ниже -50°C')
        .max(50, 'Минимальная температура не может быть выше 50°C'),
      max: z
        .number()
        .min(-50, 'Максимальная температура не может быть ниже -50°C')
        .max(50, 'Максимальная температура не может быть выше 50°C'),
    }),
    windResistance: z
      .number()
      .min(0, 'Устойчивость к ветру не может быть отрицательной')
      .max(100, 'Устойчивость к ветру не может превышать 100 км/ч'),
    range: z
      .number()
      .min(0.1, 'Дальность должна быть больше 0.1 км')
      .max(1000, 'Дальность не может превышать 1000 км'),
    chargingTime: z
      .number()
      .min(1, 'Время зарядки должно быть больше 1 минуты')
      .max(1440, 'Время зарядки не может превышать 1440 минут'),
    ipRating: z
      .string()
      .max(10, 'IP рейтинг не может превышать 10 символов')
      .optional(),
    noiseLevel: z
      .number()
      .min(0, 'Уровень шума не может быть отрицательным')
      .max(200, 'Уровень шума не может превышать 200 дБ')
      .optional(),
  }),
  capabilities: z.object({
    cameras: z.array(
      z.object({
        type: z.enum([
          'RGB',
          'THERMAL',
          'MULTISPECTRAL',
          'HYPERSPECTRAL',
          'LIDAR',
        ]),
        resolution: z.string().min(1, 'Разрешение обязательно'),
        sensor: z.string().min(1, 'Сенсор обязателен'),
        lens: z.string().min(1, 'Объектив обязателен'),
        gimbalAxes: z
          .number()
          .min(0)
          .max(3, 'Количество осей подвеса не может превышать 3'),
        features: z.array(z.string()),
      }),
    ),
    sensors: z.array(
      z.object({
        type: z.string().min(1, 'Тип сенсора обязателен'),
        model: z.string().min(1, 'Модель сенсора обязательна'),
        accuracy: z.string().min(1, 'Точность обязательна'),
        range: z.string().min(1, 'Диапазон обязателен'),
        features: z.array(z.string()),
      }),
    ),
    spraySystem: z
      .object({
        tankCapacity: z
          .number()
          .min(0.1, 'Объем бака должен быть больше 0.1 литра')
          .max(1000, 'Объем бака не может превышать 1000 литров'),
        flowRate: z.object({
          min: z
            .number()
            .min(0.1, 'Минимальный расход должен быть больше 0.1 л/мин'),
          max: z
            .number()
            .min(0.1, 'Максимальный расход должен быть больше 0.1 л/мин'),
        }),
        nozzleTypes: z.array(z.string().min(1, 'Тип форсунки обязателен')),
        pressureRange: z.object({
          min: z
            .number()
            .min(0.1, 'Минимальное давление должно быть больше 0.1 бар'),
          max: z
            .number()
            .min(0.1, 'Максимальное давление должно быть больше 0.1 бар'),
        }),
        sprayWidth: z
          .number()
          .min(0.1, 'Ширина распыления должна быть больше 0.1 метра')
          .max(50, 'Ширина распыления не может превышать 50 метров'),
        dropletSize: z.string().min(1, 'Размер капель обязателен'),
      })
      .optional(),
    navigationSystems: z.array(
      z.string().min(1, 'Навигационная система обязательна'),
    ),
    communicationSystems: z.array(
      z.string().min(1, 'Система связи обязательна'),
    ),
    autonomyLevel: z.enum(['MANUAL', 'ASSISTED', 'AUTONOMOUS']),
    maxOperatingRadius: z
      .number()
      .min(0.1, 'Максимальный радиус работы должен быть больше 0.1 км')
      .max(1000, 'Максимальный радиус работы не может превышать 1000 км'),
    precisionLevel: z
      .number()
      .min(0.1, 'Уровень точности должен быть больше 0.1 см')
      .max(1000, 'Уровень точности не может превышать 1000 см'),
  }),
  homeBase: coordinateSchema.optional(),
  assignedOperatorId: z.string().optional(),
  insuranceInfo: z
    .object({
      provider: z.string().min(1, 'Страховая компания обязательна'),
      policyNumber: z.string().min(1, 'Номер полиса обязателен'),
      expiryDate: z.string().min(1, 'Дата окончания обязательна'),
      coverage: z.number().min(0, 'Сумма покрытия не может быть отрицательной'),
      deductible: z.number().min(0, 'Франшиза не может быть отрицательной'),
      coverageTypes: z.array(z.string().min(1, 'Тип покрытия обязателен')),
    })
    .optional(),
  tags: z
    .array(z.string().max(30, 'Тег не может превышать 30 символов'))
    .optional(),
  notes: z
    .string()
    .max(1000, 'Примечания не могут превышать 1000 символов')
    .optional(),
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
  batteryLevel: z
    .number()
    .min(0)
    .max(100, 'Уровень батареи должен быть от 0 до 100%')
    .optional(),
  fuelLevel: z
    .number()
    .min(0)
    .max(100, 'Уровень топлива должен быть от 0 до 100%')
    .optional(),
  isActive: z.boolean().optional(),
});

// Material validation schemas
export const createMaterialSchema = z.object({
  name: z
    .string()
    .min(1, 'Название материала обязательно')
    .max(100, 'Название не может превышать 100 символов'),
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
    .min(1, 'Производитель обязателен')
    .max(100, 'Производитель не может превышать 100 символов'),
  activeIngredients: z
    .array(
      z.object({
        name: z.string().min(1, 'Название активного вещества обязательно'),
        concentration: z
          .number()
          .min(0)
          .max(100, 'Концентрация должна быть от 0 до 100%'),
        casNumber: z.string().optional(),
        function: z.string().min(1, 'Функция обязательна'),
      }),
    )
    .min(1, 'Необходимо указать хотя бы одно активное вещество'),
  specifications: z.object({
    physicalState: z.enum(['LIQUID', 'SOLID', 'GAS', 'POWDER', 'GRANULAR']),
    density: z
      .number()
      .min(0, 'Плотность не может быть отрицательной')
      .optional(),
    ph: z.number().min(0).max(14, 'pH должен быть от 0 до 14').optional(),
    viscosity: z
      .number()
      .min(0, 'Вязкость не может быть отрицательной')
      .optional(),
    solubility: z.string().optional(),
    storageTemperature: z.object({
      min: z
        .number()
        .min(-50, 'Минимальная температура хранения не может быть ниже -50°C')
        .max(100, 'Минимальная температура хранения не может быть выше 100°C'),
      max: z
        .number()
        .min(-50, 'Максимальная температура хранения не может быть ниже -50°C')
        .max(100, 'Максимальная температура хранения не может быть выше 100°C'),
    }),
    shelfLife: z
      .number()
      .min(1, 'Срок годности должен быть больше 1 месяца')
      .max(120, 'Срок годности не может превышать 120 месяцев'),
    applicationRate: z.object({
      min: z
        .number()
        .min(0, 'Минимальная норма расхода не может быть отрицательной'),
      max: z
        .number()
        .min(0, 'Максимальная норма расхода не может быть отрицательной'),
      unit: z.string().min(1, 'Единица измерения обязательна'),
      perHectare: z.boolean(),
    }),
    mixingRatio: z.string().optional(),
    compatibleMaterials: z.array(z.string()),
    incompatibleMaterials: z.array(z.string()),
    safetyRating: z.string().min(1, 'Рейтинг безопасности обязателен'),
    environmentalImpact: z
      .string()
      .min(1, 'Воздействие на окружающую среду обязательно'),
    reentryInterval: z
      .number()
      .min(0, 'Интервал повторного входа не может быть отрицательным')
      .max(8760, 'Интервал повторного входа не может превышать 8760 часов'),
    harvestInterval: z
      .number()
      .min(0, 'Интервал до сбора урожая не может быть отрицательным')
      .max(365, 'Интервал до сбора урожая не может превышать 365 дней'),
  }),
  targetCrops: z
    .array(z.string().min(1, 'Целевая культура обязательна'))
    .min(1, 'Необходимо указать хотя бы одну целевую культуру'),
  targetPests: z.array(z.string()).optional(),
  applicationMethods: z
    .array(z.string().min(1, 'Метод применения обязателен'))
    .min(1, 'Необходимо указать хотя бы один метод применения'),
  restrictions: z.array(z.string()),
  certifications: z.array(z.string()),
  registrationNumber: z.string().optional(),
  packaging: z.object({
    sizes: z
      .array(
        z.object({
          size: z.number().min(0.1, 'Размер упаковки должен быть больше 0.1'),
          unit: z.string().min(1, 'Единица измерения обязательна'),
          price: z.number().min(0, 'Цена не может быть отрицательной'),
          currency: z.string().min(1, 'Валюта обязательна'),
          minimumOrder: z
            .number()
            .min(1, 'Минимальный заказ должен быть больше 0'),
        }),
      )
      .min(1, 'Необходимо указать хотя бы один размер упаковки'),
    containerType: z.string().min(1, 'Тип контейнера обязателен'),
    recyclable: z.boolean(),
    hazardousShipping: z.boolean(),
  }),
  pricing: z.object({
    basePrice: z.number().min(0, 'Базовая цена не может быть отрицательной'),
    currency: z.string().min(1, 'Валюта обязательна'),
    unit: z.string().min(1, 'Единица измерения обязательна'),
    bulkDiscounts: z.array(
      z.object({
        minimumQuantity: z
          .number()
          .min(1, 'Минимальное количество должно быть больше 0'),
        discountPercentage: z
          .number()
          .min(0)
          .max(100, 'Скидка должна быть от 0 до 100%'),
      }),
    ),
    seasonalPricing: z
      .array(
        z.object({
          startDate: z.string().min(1, 'Дата начала обязательна'),
          endDate: z.string().min(1, 'Дата окончания обязательна'),
          priceMultiplier: z
            .number()
            .min(0.1, 'Множитель цены должен быть больше 0.1')
            .max(10, 'Множитель цены не может превышать 10'),
        }),
      )
      .optional(),
  }),
  supplierId: z.string().optional(),
  tags: z
    .array(z.string().max(30, 'Тег не может превышать 30 символов'))
    .optional(),
  notes: z
    .string()
    .max(1000, 'Примечания не могут превышать 1000 символов')
    .optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial().extend({
  availability: z
    .enum(['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK', 'DISCONTINUED'])
    .optional(),
  isActive: z.boolean().optional(),
});

// Review validation schemas
export const createReviewSchema = z.object({
  orderId: z.string().min(1, 'ID заказа обязателен'),
  revieweeId: z.string().min(1, 'ID получателя отзыва обязателен'),
  rating: z
    .number()
    .min(1, 'Рейтинг должен быть от 1 до 5')
    .max(5, 'Рейтинг должен быть от 1 до 5'),
  title: z
    .string()
    .min(1, 'Заголовок отзыва обязателен')
    .max(100, 'Заголовок не может превышать 100 символов'),
  comment: z
    .string()
    .min(10, 'Комментарий должен содержать минимум 10 символов')
    .max(1000, 'Комментарий не может превышать 1000 символов'),
  aspects: z.array(
    z.object({
      aspect: z.enum([
        'QUALITY',
        'TIMELINESS',
        'COMMUNICATION',
        'PROFESSIONALISM',
        'VALUE',
      ]),
      rating: z
        .number()
        .min(1, 'Рейтинг аспекта должен быть от 1 до 5')
        .max(5, 'Рейтинг аспекта должен быть от 1 до 5'),
    }),
  ),
  isPublic: z.boolean(),
});

export const updateReviewSchema = createReviewSchema.partial();

// User profile validation schemas
export const updateUserProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Имя обязательно')
    .max(50, 'Имя не может превышать 50 символов')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Фамилия обязательна')
    .max(50, 'Фамилия не может превышать 50 символов')
    .optional(),
  surname: z
    .string()
    .max(50, 'Отчество не может превышать 50 символов')
    .optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url('Неверный формат URL аватара').optional(),
  contractor: z
    .object({
      companyName: z
        .string()
        .min(1, 'Название компании обязательно')
        .max(100, 'Название компании не может превышать 100 символов'),
      registrationNumber: z
        .string()
        .min(1, 'Регистрационный номер обязателен')
        .max(50, 'Регистрационный номер не может превышать 50 символов'),
      taxId: z
        .string()
        .min(1, 'ИНН обязателен')
        .max(20, 'ИНН не может превышать 20 символов'),
      address: z
        .string()
        .min(1, 'Адрес обязателен')
        .max(200, 'Адрес не может превышать 200 символов'),
      contactPerson: z
        .string()
        .min(1, 'Контактное лицо обязательно')
        .max(100, 'Контактное лицо не может превышать 100 символов'),
      website: z.string().url('Неверный формат URL сайта').optional(),
      description: z
        .string()
        .max(500, 'Описание не может превышать 500 символов')
        .optional(),
      certifications: z.array(
        z.string().max(100, 'Сертификация не может превышать 100 символов'),
      ),
      serviceAreas: z.array(
        z
          .string()
          .max(100, 'Область обслуживания не может превышать 100 символов'),
      ),
      specializations: z.array(
        z.string().max(100, 'Специализация не может превышать 100 символов'),
      ),
    })
    .optional(),
});

// Search and filter validation schemas
export const searchFiltersSchema = z.object({
  search: z
    .string()
    .max(100, 'Поисковый запрос не может превышать 100 символов')
    .optional(),
  page: z.number().min(1, 'Номер страницы должен быть больше 0').optional(),
  limit: z
    .number()
    .min(1, 'Лимит должен быть больше 0')
    .max(100, 'Лимит не может превышать 100')
    .optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const dateRangeSchema = z
  .object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'Дата начала должна быть раньше даты окончания',
      path: ['dateTo'],
    },
  );

// File upload validation schemas
export const fileUploadSchema = z
  .object({
    file: z.instanceof(File, { message: 'Файл обязателен' }),
    maxSize: z.number().optional(),
    allowedTypes: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.maxSize && data.file.size > data.maxSize) {
        return false;
      }
      return true;
    },
    {
      message: 'Размер файла превышает допустимый лимит',
      path: ['file'],
    },
  )
  .refine(
    (data) => {
      if (data.allowedTypes && !data.allowedTypes.includes(data.file.type)) {
        return false;
      }
      return true;
    },
    {
      message: 'Недопустимый тип файла',
      path: ['file'],
    },
  );

// Export all schemas
export const validationSchemas = {
  // Order schemas
  createOrder: createOrderSchema,
  updateOrder: updateOrderSchema,

  // Field schemas
  createField: createFieldSchema,
  updateField: updateFieldSchema,

  // Drone schemas
  createDrone: createDroneSchema,
  updateDrone: updateDroneSchema,

  // Material schemas
  createMaterial: createMaterialSchema,
  updateMaterial: updateMaterialSchema,

  // Review schemas
  createReview: createReviewSchema,
  updateReview: updateReviewSchema,

  // User schemas
  updateUserProfile: updateUserProfileSchema,

  // Common schemas
  coordinate: coordinateSchema,
  phone: phoneSchema,
  email: emailSchema,
  searchFilters: searchFiltersSchema,
  dateRange: dateRangeSchema,
  fileUpload: fileUploadSchema,
};

// Type exports for TypeScript
export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
export type UpdateOrderFormData = z.infer<typeof updateOrderSchema>;
export type CreateFieldFormData = z.infer<typeof createFieldSchema>;
export type UpdateFieldFormData = z.infer<typeof updateFieldSchema>;
export type CreateDroneFormData = z.infer<typeof createDroneSchema>;
export type UpdateDroneFormData = z.infer<typeof updateDroneSchema>;
export type CreateMaterialFormData = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialFormData = z.infer<typeof updateMaterialSchema>;
export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>;
export type UpdateUserProfileFormData = z.infer<typeof updateUserProfileSchema>;
export type SearchFiltersFormData = z.infer<typeof searchFiltersSchema>;
export type DateRangeFormData = z.infer<typeof dateRangeSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
