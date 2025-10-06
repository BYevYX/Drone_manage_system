'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Drone type definition with comprehensive specifications
 */
export interface DroneType {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly photo_url: string;
  readonly manufacturer: string;
  readonly specifications?: {
    readonly maxFlightTime?: number; // minutes
    readonly maxPayload?: number; // kg
    readonly maxSpeed?: number; // km/h
    readonly operatingRange?: number; // km
  };
}

/**
 * User role enumeration
 */
export type UserRole = 'client' | 'supplier' | 'operator' | 'admin';

/**
 * Request status enumeration
 */
export type RequestStatus = 'new' | 'in_progress' | 'completed' | 'rejected';

/**
 * Service request interface with enhanced type safety
 */
export interface ServiceRequest {
  readonly id: number;
  readonly date: string;
  readonly field: string;
  readonly crop: string;
  readonly type: string;
  readonly area: number;
  readonly status: RequestStatus;
  readonly priority?: 'low' | 'medium' | 'high' | 'urgent';
  readonly estimatedCost?: number;
  readonly details?: {
    readonly chemicals?: string;
    readonly dosage?: string;
    readonly droneType?: string;
    readonly operatorNotes?: string;
    readonly weatherConditions?: string;
    readonly completedAt?: string;
  };
}

/**
 * Global context interface with improved type definitions
 */
interface GlobalContextType {
  readonly dronesList: readonly DroneType[];
  readonly userRole: UserRole;
  readonly requests: readonly ServiceRequest[];
  readonly setUserRole: (role: UserRole) => void;
  readonly updateRequest: (
    id: number,
    updates: Partial<ServiceRequest>,
  ) => void;
  readonly addRequest: (request: Omit<ServiceRequest, 'id'>) => void;
  readonly getDroneById: (id: number) => DroneType | undefined;
  readonly getRequestsByStatus: (
    status: RequestStatus,
  ) => readonly ServiceRequest[];
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

/**
 * Initial drones data with enhanced specifications
 */
const INITIAL_DRONES: readonly DroneType[] = [
  {
    id: 0,
    manufacturer: 'ADGY',
    name: 'AGDY 40',
    description:
      'Агродрон AgDy 40 — это сельскохозяйственный беспилотник, используемый для осуществления мониторинга урожая, внесения удобрений, стимуляторов роста и средств защиты растений.',
    photo_url: '/header/drones/drone_2.png',
    specifications: {
      maxFlightTime: 40,
      maxPayload: 40,
      maxSpeed: 15,
      operatingRange: 5,
    },
  },
  {
    id: 1,
    name: 'AgDy',
    manufacturer: 'ADGY',
    description:
      'Агродрон AgDy — это сельскохозяйственный беспилотник, предназначенный для быстрого и эффективного внесения химических составов в почву. Его использование значительно сокращает финансовые затраты и повышает урожайность.',
    photo_url: '/header/drones/drone_1.png',
    specifications: {
      maxFlightTime: 35,
      maxPayload: 30,
      maxSpeed: 12,
      operatingRange: 4,
    },
  },
  {
    id: 2,
    name: 'DJI Agras T50',
    manufacturer: 'DJI Agras',
    description:
      'Agras T50 выполняет широкий спектр задач, включая геодезию, картографирование, а также опрыскивание и разбрасывание средств защиты растений, управление точностью в ваших сельскохозяйственных операциях.',
    photo_url: '/header/drones/drone_3.png',
    specifications: {
      maxFlightTime: 55,
      maxPayload: 50,
      maxSpeed: 22,
      operatingRange: 7,
    },
  },
  {
    id: 3,
    manufacturer: 'JOYANCE',
    name: 'JOYANCE JT30L-606',
    description:
      'Агродрон JOYANCE JT30L-606 – уникальное высокотехнологичное устройство, с помощью которого можно производить опрыскивание культур, внесение средств защиты растений и удобрений, а также посевы',
    photo_url: '/header/drones/drone_4.png',
    specifications: {
      maxFlightTime: 30,
      maxPayload: 30,
      maxSpeed: 18,
      operatingRange: 5,
    },
  },
  {
    id: 4,
    manufacturer: 'Topxgun',
    name: 'Topxgun FP600',
    description:
      'Беспилотник Topxgun FP600 сельскохозяйственный дрон, модель: 3WWDZ-50B',
    photo_url: '/header/drones/drone_5.jpg',
    specifications: {
      maxFlightTime: 25,
      maxPayload: 25,
      maxSpeed: 16,
      operatingRange: 3,
    },
  },
] as const;

/**
 * Initial requests data with enhanced structure
 */
const INITIAL_REQUESTS: readonly ServiceRequest[] = [
  {
    id: 1,
    date: '2025-02-15',
    field: 'Поле №3 (Южное)',
    crop: 'Пшеница озимая',
    type: 'Опрыскивание',
    area: 45,
    status: 'completed',
    priority: 'medium',
    estimatedCost: 15000,
    details: {
      chemicals: 'Гербицид "Агрохит"',
      dosage: '1.2 л/га',
      droneType: 'DJI Agras T40',
      weatherConditions: 'Ясно, ветер 3 м/с',
      completedAt: '2025-02-15T14:30:00Z',
    },
  },
  {
    id: 2,
    date: '2025-02-10',
    field: 'Поле №1 (Северное)',
    crop: 'Кукуруза',
    type: 'Внесение удобрений',
    area: 32,
    status: 'in_progress',
    priority: 'high',
    estimatedCost: 12800,
    details: {
      chemicals: 'NPK 15-15-15',
      dosage: '80 кг/га',
      droneType: 'DJI Agras T30',
      weatherConditions: 'Переменная облачность',
    },
  },
  {
    id: 3,
    date: '2025-02-05',
    field: 'Поле №2 (Центральное)',
    crop: 'Подсолнечник',
    type: 'Картографирование',
    area: 28,
    status: 'new',
    priority: 'low',
    estimatedCost: 8400,
  },
] as const;

/**
 * Enhanced Global Context Provider with optimized performance
 */
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [requests, setRequests] = useState<ServiceRequest[]>([
    ...INITIAL_REQUESTS,
  ]);

  /**
   * Update a specific request with partial data
   */
  const updateRequest = useCallback(
    (id: number, updates: Partial<ServiceRequest>) => {
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, ...updates } : request,
        ),
      );
    },
    [],
  );

  /**
   * Add a new request
   */
  const addRequest = useCallback(
    (newRequest: Omit<ServiceRequest, 'id'>) => {
      const id = Math.max(...requests.map((r) => r.id), 0) + 1;
      setRequests((prevRequests) => [...prevRequests, { ...newRequest, id }]);
    },
    [requests],
  );

  /**
   * Get drone by ID with memoization
   */
  const getDroneById = useCallback((id: number): DroneType | undefined => {
    return INITIAL_DRONES.find((drone) => drone.id === id);
  }, []);

  /**
   * Get requests filtered by status
   */
  const getRequestsByStatus = useCallback(
    (status: RequestStatus): readonly ServiceRequest[] => {
      return requests.filter((request) => request.status === status);
    },
    [requests],
  );

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const contextValue = useMemo(
    (): GlobalContextType => ({
      dronesList: INITIAL_DRONES,
      userRole,
      requests,
      setUserRole,
      updateRequest,
      addRequest,
      getDroneById,
      getRequestsByStatus,
    }),
    [
      userRole,
      requests,
      updateRequest,
      addRequest,
      getDroneById,
      getRequestsByStatus,
    ],
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

/**
 * Custom hook to use the global context with proper error handling
 */
export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error(
      'useGlobalContext must be used within a GlobalProvider. ' +
        'Make sure to wrap your component tree with <GlobalProvider>.',
    );
  }
  return context;
};

/**
 * Legacy alias for backward compatibility
 * @deprecated Use GlobalProvider instead
 */
export const RoleProvider = GlobalProvider;
