// components/DroneCard.tsx
import Link from 'next/link';

interface Drone {
  id: number;
  name: string;
  description: string;
  photo_url: string;
}

const DroneCard = ({ drone }: { drone: Drone }) => (
  <div className="border p-4 rounded-lg shadow-md hover:shadow-xl transition-all">
    <img
      src={drone.photo_url}
      alt={drone.name}
      className="w-full h-48 object-cover rounded-lg"
    />
    <h2 className="text-xl font-semibold mt-4">{drone.name}</h2>
    <Link href={`/drones/${drone.id}`}>подробнее</Link>
  </div>
);

export default DroneCard;
