// src/shared/ui/Header.js
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold">DJI FlightHub</div>
        <nav>
          <Link href="/" className="px-4">
            Главная
          </Link>
          <Link href="/about" className="px-4">
            О нас
          </Link>
          <Link href="/contact" className="px-4">
            Контакты
          </Link>
        </nav>
      </div>
    </header>
  );
}
