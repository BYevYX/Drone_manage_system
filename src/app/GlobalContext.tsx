'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type DroneType = {
  id: number;
  name: string;
  description: string;
  photo_url: string;
  manufacturer: string;
};
type UserRole =
  | 'guest'
  | 'manager'
  | 'contractor'
  | 'drone_supplier'
  | 'material_supplier';

interface Request {
  id: number;
  date: string;
  field: string;
  crop: string;
  type: string;
  area: number;
  status: 'new' | 'in_progress' | 'completed' | 'rejected';
  details?: {
    chemicals?: string;
    dosage?: string;
    droneType?: string;
    operatorNotes?: string;
  };
}

interface GlobalContextType {
  dronesList: DroneType[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  requests: Request[];
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const VALID_ROLES: UserRole[] = [
  'guest',
  'contractor',
  'manager',
  'drone_supplier',
  'material_supplier',
];

const isValidRole = (v: string | null): v is UserRole => {
  return typeof v === 'string' && VALID_ROLES.includes(v as UserRole);
};

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [dronesList, setDronesList] = useState<DroneType[]>([
    {
      id: 0,
      manufacturer: 'ADGY',
      name: 'AGDY 40',
      description:
        'Агродрон AgDy 40 — это сельскохозяйственный беспилотник, используемый для осуществления мониторинга урожая, внесения удобрений, стимуляторов роста и средств защиты растений.',
      photo_url: '/header/drones/drone_2.png',
    },
    {
      id: 1,
      name: 'AgDy',
      manufacturer: 'ADGY',
      description:
        'Агродрон AgDy — это сельскохозяйственный беспилотник, предназначенный для быстрого и эффективного внесения химических составов в почву. Его использование значительно сокращает финансовые затраты и повышает урожайность.',
      photo_url: '/header/drones/drone_1.png',
    },
    {
      id: 2,
      name: 'DJI Agras T50 ',
      manufacturer: 'DJI Agras',
      description:
        'Agras T50 выполняет широкий спектр задач, включая геодезию, картографирование, а также опрыскивание и разбрасывание средств защиты растений, управление точностью в ваших сельскохозяйственных операциях.',
      photo_url: '/header/drones/drone_3.png',
    },
    {
      id: 3,
      manufacturer: 'JOYANCE',
      name: 'JOYANCE JT30L-606',
      description:
        'Агродрон JOYANCE JT30L-606 – уникальное высокотехнологичное устройство, с помощью которого можно производить опрыскивание культур, внесение средств защиты растений и удобрений, а также посевы',
      photo_url: '/header/drones/drone_4.png',
    },
    {
      id: 4,
      manufacturer: 'Topxgun',
      name: 'Topxgun FP600',
      description:
        'Беспилотник Topxgun FP600 сельскохозяйственный дрон,модель: 3WWDZ-50B',
      photo_url: '/header/drones/drone_5.jpg',
    },
  ]);

  // по умолчанию 'guest' — затем подхватим из localStorage при монтировании
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [userInfo, setUserInfo] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    surname: '',
    userRole: '',
  });

  useEffect(() => {
    try {
      const storedUser = {
        email: localStorage.getItem('email') || '',
        phone: localStorage.getItem('phone') || '',
        firstName: localStorage.getItem('firstName') || '',
        lastName: localStorage.getItem('lastName') || '',
        surname: localStorage.getItem('surname') || '',
        userRole: (localStorage.getItem('userRole') || 'guest').toLowerCase(),
      };

      // простая валидация роли
      const validRoles = [
        'manager',
        'contractor',
        'drone_supplier',
        'material_supplier',
        'guest',
      ];

      if (!validRoles.includes(storedUser.userRole)) {
        storedUser.userRole = 'guest';
      }

      setUserInfo(storedUser);
    } catch (e) {
      console.warn('Ошибка при чтении localStorage:', e);
      setUserInfo((prev) => ({ ...prev, userRole: 'guest' }));
    }
  }, []);

  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      date: '2025-02-15',
      field: 'Поле №3 (Южное)',
      crop: 'Пшеница озимая',
      type: 'Опрыскивание',
      area: 45,
      status: 'completed',
      details: {
        chemicals: 'Гербицид "Агрохит"',
        dosage: '1.2 л/га',
        droneType: 'DJI Agras T40',
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
      details: {
        chemicals: 'NPK 15-15-15',
        dosage: '80 кг/га',
        droneType: 'DJI Agras T30',
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
    },
  ]);

  // обёртка для установки роли — сохраняет в state и localStorage
  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    try {
      localStorage.setItem('userRole', role);
    } catch (e) {
      // localStorage может быть недоступен — молча игнорируем
      // при необходимости можно логировать
    }
  };

  // при монтировании читаем роль из localStorage (если есть и валидна)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userRole');
      if (isValidRole(stored)) {
        setUserRoleState(stored);
      }
    } catch (e) {
      // ignore localStorage read errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        dronesList,
        userRole,
        setUserRole,
        requests,
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
