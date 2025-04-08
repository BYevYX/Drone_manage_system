import Image from 'next/image';

import droneImage from '@/public/Drone.jpg';

// TODO: add Image

export default function MainContent() {
  return (
    <main className="container mx-auto p-4">
      

      <Image src={droneImage} alt="Drone Image" className="w-full h-auto" />
    </main>
  );
}
