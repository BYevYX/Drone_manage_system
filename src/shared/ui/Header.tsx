'use client';
import { UserCircle2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import path from 'path';

export default function Header() {
  const pathname = usePathname();
  return (
    <header
      className={`sticky top-0 z-50 ${pathname === '/' ? 'bg-white text-black' : 'bg-[#282828] text-white shadow-[0_0_20px_2px] shadow-[#6f6f6fb7]'}  ${pathname === '/' ? 'p-6' : 'p-2'} ${pathname === '/signup' ? ' backdrop-blur-[20px]  bg-[#282828]/20  ' : ''} `}
      // className="bg-[#4b4b4b] sticky text-white shadow-[0_0_20px_2px] shadow-[#6f6f6fb7]"
    >
      <div className="container mx-auto flex justify-between items-center font-nekstmedium ">
        <div className="flex items-center  space-x-[20px]">
          <Link href="/">
            <button className="text-[32px] font-nekstmedium ">ДронАгро</button>
          </Link>
          <div className="flex items-center">
            <div className="relative group ">
              <div className="flex items-center gap-1 px-4 text-[20px] hover:text-gray-300 cursor-pointer">
                RU
                <ChevronDown className="h-4 w-4" />
              </div>
              <div
                className="absolute opacity-0  group-hover:opacity-100 bg-[#54545456] min-w-[150px] rounded-lg shadow-lg backdrop-blur-[10px] duration-[0.3s] scale-y-[0.5] origin-top group-hover:scale-y-[100%]
              pointer-events-none group-hover:pointer-events-auto"
              >
                <button className="rounded-[5px] w-full h-[40px] text-[20px] hover:bg-[#858585] duration-[0.3s]">
                  RU
                </button>
                <button className="rounded-[5px] w-full h-[40px] text-[20px] hover:bg-[#858585] duration-[0.3s]">
                  EN
                </button>
                <button className="rounded-[5px] w-full h-[40px] text-[20px] hover:bg-[#858585] duration-[0.3s]">
                  中国人
                </button>
              </div>
            </div>
          </div>
        </div>
        <nav
          className={`flex items-center gap-4 ${pathname === '/signup' && 'hidden'} `}
        >
          <div className="relative group">
            <div className="flex items-center gap-1 px-4 hover:text-gray-300 cursor-pointer text-[18px]">
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

          <Link href="/about" className="px-4 text-[18px] hover:text-gray-300">
            О нас
          </Link>
          <Link
            href="/contact"
            className="px-4 text-[18px] hover:text-gray-300"
          >
            Контакты
          </Link>
          <Link
            href="/delivery"
            className="px-4 text-[18px] hover:text-gray-300"
          >
            Доставка
          </Link>
          <Link
            href="/payment"
            className="px-4 text-[18px] hover:text-gray-300"
          >
            Оплата
          </Link>

          {/* TODO: change this on profile when state and middleware be ready */}
          {/* <Link href="/registration" className="pl-4 hover:text-gray-300">
            <UserCircle2 className="h-6 w-6" />
          </Link> */}
        </nav>
        {pathname === '/' && (
          <Link href={'/signup'}>
            <button
              className="px-[20px] text-[20px] border border-black rounded-[20px]
         duration-[0.3s] hover:scale-[1.1] hover:text-[#797979]"
            >
              Войти
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
