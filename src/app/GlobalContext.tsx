'use client';
import { createContext, useContext, useEffect, useState } from 'react';
// import axios from "axios";
type DroneType = {
  id: number;
  name: string;
  description: string;
  photo_url: string;
  manufacturer: string;
};
type UserRole = 'client' | 'operator' | 'manager' | 'supplier';
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
  userRole: string;
  setUserRole: (role: UserRole) => void;
  requests: Request[];
}
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

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
  const [userRole, setUserRole] = useState<UserRole>('client');
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

  const changeRole = (role: UserRole) => {
    setUserRole(role);
  };

  return (
    <GlobalContext.Provider
      value={{
        dronesList,
        userRole,
        setUserRole: changeRole,
        requests,
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
