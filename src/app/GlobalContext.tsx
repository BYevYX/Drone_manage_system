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
  | 'GUEST'
  | 'MANAGER'
  | 'CONTRACTOR'
  | 'DRONE_SUPPLIER'
  | 'OPERATOR'
  | 'MATERIAL_SUPPLIER';

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

interface UserInfo {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  surname: string;
  userRole: string;
  userId?: number;
}

interface GlobalContextType {
  dronesList: DroneType[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  requests: Request[];
  userInfo: UserInfo;
  setUserInfo: (userInfo: UserInfo) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const VALID_ROLES: UserRole[] = [
  'GUEST',
  'CONTRACTOR',
  'MANAGER',
  'OPERATOR',
  'DRONE_SUPPLIER',
  'MATERIAL_SUPPLIER',
];

// Функция для нормализации роли
const normalizeRole = (role: string | null): UserRole => {
  if (!role) return 'GUEST';
  const upperRole = role.toUpperCase();
  return VALID_ROLES.includes(upperRole as UserRole)
    ? (upperRole as UserRole)
    : 'GUEST';
};

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [dronesList] = useState<DroneType[]>([
    {
      id: 4,
      manufacturer: 'ADGY',
      name: 'AGDY 40',
      description:
        'Агродрон AgDy 40 — это сельскохозяйственный беспилотник, используемый для осуществления мониторинга урожая, внесения удобрений, стимуляторов роста и средств защиты растений.',
      photo_url: '/header/drones/drone_2.png',
    },
    // {
    //   id: 17,
    //   name: 'AgDy',
    //   manufacturer: 'ADGY',
    //   description:
    //     'Агродрон AgDy — это сельскохозяйственный беспилотник, предназначенный для быстрого и эффективного внесения химических составов в почву. Его использование значительно сокращает финансовые затраты и повышает урожайность.',
    //   photo_url: '/header/drones/drone_1.png',
    // },
    {
      id: 3,
      name: 'DJI Agras T50 ',
      manufacturer: 'DJI Agras',
      description:
        'Agras T50 выполняет широкий спектр задач, включая геодезию, картографирование, а также опрыскивание и разбрасывание средств защиты растений, управление точностью в ваших сельскохозяйственных операциях.',
      photo_url: '/header/drones/drone_3.png',
    },
    {
      id: 6,
      manufacturer: 'JOYANCE',
      name: 'JOYANCE JT30L-606',
      description:
        'Агродрон JOYANCE JT30L-606 – уникальное высокотехнологичное устройство, с помощью которого можно производить опрыскивание культур, внесение средств защиты растений и удобрений, а также посевы',
      photo_url: '/header/drones/drone_4.png',
    },
  ]);

  // по умолчанию 'GUEST' — затем подхватим из localStorage при монтировании
  const [userRole, setUserRoleState] = useState<UserRole>('GUEST');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    surname: '',
    userRole: 'GUEST',
    userId: undefined,
  });

  // Функция для безопасного чтения localStorage
  const getFromLocalStorage = (
    key: string,
    defaultValue: string = '',
  ): string => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.warn(`Ошибка чтения ${key} из localStorage:`, error);
      return defaultValue;
    }
  };

  // Функция для безопасной записи в localStorage
  const setToLocalStorage = (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Ошибка записи ${key} в localStorage:`, error);
    }
  };

  // Инициализация данных пользователя из localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedUserId = getFromLocalStorage('userId');
      const storedRole = getFromLocalStorage('userRole', 'GUEST');

      const storedUser: UserInfo = {
        email: getFromLocalStorage('email'),
        phone: getFromLocalStorage('phone'),
        firstName: getFromLocalStorage('firstName'),
        lastName: getFromLocalStorage('lastName'),
        surname: getFromLocalStorage('surname'),
        userRole: normalizeRole(storedRole),
        userId: storedUserId ? parseInt(storedUserId, 10) : undefined,
      };

      setUserInfo(storedUser);
      setUserRoleState(normalizeRole(storedRole));

      // Логирование для отладки
      if (process.env.NODE_ENV === 'development') {
        console.log(
          'Загружены данные пользователя из localStorage:',
          storedUser,
        );
      }
    } catch (error) {
      console.warn('Ошибка при инициализации данных пользователя:', error);
      const defaultUser: UserInfo = {
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        surname: '',
        userRole: 'GUEST',
        userId: undefined,
      };
      setUserInfo(defaultUser);
      setUserRoleState('GUEST');
    }
  }, []);

  const [requests] = useState<Request[]>([
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

  // Обновленная функция для установки роли пользователя
  const setUserRole = (role: UserRole) => {
    const normalizedRole = normalizeRole(role);
    setUserRoleState(normalizedRole);
    setToLocalStorage('userRole', normalizedRole);

    // Обновляем userInfo тоже
    setUserInfo((prev) => ({
      ...prev,
      userRole: normalizedRole,
    }));

    if (process.env.NODE_ENV === 'development') {
      console.log('Роль пользователя изменена на:', normalizedRole);
    }
  };

  // Обновленная функция для установки информации о пользователе
  const setUserInfoUpdated = (newUserInfo: UserInfo) => {
    const normalizedUserInfo = {
      ...newUserInfo,
      userRole: normalizeRole(newUserInfo.userRole),
    };

    setUserInfo(normalizedUserInfo);
    setUserRoleState(normalizedUserInfo.userRole as UserRole);

    // Сохраняем все данные в localStorage
    setToLocalStorage('email', normalizedUserInfo.email);
    setToLocalStorage('phone', normalizedUserInfo.phone);
    setToLocalStorage('firstName', normalizedUserInfo.firstName);
    setToLocalStorage('lastName', normalizedUserInfo.lastName);
    setToLocalStorage('surname', normalizedUserInfo.surname);
    setToLocalStorage('userRole', normalizedUserInfo.userRole);

    if (normalizedUserInfo.userId) {
      setToLocalStorage('userId', normalizedUserInfo.userId.toString());
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Информация о пользователе обновлена:', normalizedUserInfo);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        dronesList,
        userRole,
        setUserRole,
        requests,
        userInfo,
        setUserInfo: setUserInfoUpdated,
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
