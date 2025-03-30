import Image from 'next/image';

import droneImage from '@/public/Drone.jpg';

// TODO: add Image

export default function MainContent() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        Лучшая система управления дронами
      </h1>
      <p className="mb-4">
        Miem Drone Manage System — это оптимальное решение для управления
        работой ваших дронов и команды профессионалов. Теперь вы можете создать
        большой флот беспилотников и эффективно управлять им благодаря
        уникальному решению.
      </p>
      <Image src={droneImage} alt="Drone Image" className="w-full h-auto" />
    </main>
  );
}
