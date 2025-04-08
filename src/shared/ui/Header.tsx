'use client';
import { UserCircle2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import path from 'path';

export default function Header() {
  const pathname = usePathname();
  return (
    <header
      className={`sticky top-0 z-50 ${pathname === '/' ? 'bg-white text-black' : 'bg-gray-800 text-white'}  ${pathname === '/' ? 'p-8' : 'p-4'} `}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-[25px] font-bold">Miem Drone Manage System</div>
        <nav className="flex items-center gap-4">
          <Link href="/" className="px-4 hover:text-gray-300 text-[#000000]">
            Главная
          </Link>

          <div className="relative group">
            <div className="flex items-center gap-1 px-4 hover:text-gray-300 cursor-pointer">
              Дроны
              <ChevronDown className="h-4 w-4" />
            </div>
            <div className="absolute hidden group-hover:block bg-gray-700 min-w-[200px] rounded-lg shadow-lg">
              <Link
                href="/drones/mavic"
                className="block px-4 py-3 hover:bg-gray-600 rounded-t-lg"
              >
                Mavic Series
              </Link>
              <Link
                href="/drones/phantom"
                className="block px-4 py-3 hover:bg-gray-600"
              >
                Phantom Series
              </Link>
              <Link
                href="/drones/inspire"
                className="block px-4 py-3 hover:bg-gray-600 rounded-b-lg"
              >
                Inspire Series
              </Link>
            </div>
          </div>

          <Link href="/about" className="px-4 hover:text-gray-300">
            О нас
          </Link>
          <Link href="/contact" className="px-4 hover:text-gray-300">
            Контакты
          </Link>
          <Link href="/delivery" className="px-4 hover:text-gray-300">
            Доставка
          </Link>
          <Link href="/payment" className="px-4 hover:text-gray-300">
            Оплата
          </Link>

          {/* TODO: change this on profile when state and middleware be ready */}
          <Link href="/registration" className="pl-4 hover:text-gray-300">
            <UserCircle2 className="h-6 w-6" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
