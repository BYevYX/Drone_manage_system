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

interface GlobalContextType {
  dronesList: DroneType[];
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

  return (
    <GlobalContext.Provider
      value={{
        dronesList,
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
