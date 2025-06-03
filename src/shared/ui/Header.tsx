'use client';
import { div } from 'framer-motion/client';
import { UserCircle2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import path from 'path';
import { useState } from 'react';
import Image from 'next/image';
import { useGlobalContext } from '@/src/app/GlobalContext';
import { ArrowRight } from 'lucide-react';

export default function Header() {
  const { dronesList } = useGlobalContext();

  const pathname = usePathname();

  const headerStyles = {
    '/': 'bg-white text-black p-6',
    '/drones': 'bg-white text-black p-3',
    '/signup':
      'backdrop-blur-[0px] from-[white]/0   to-[#a9cdd5]/50  shadow-[#dfdfdf] bg-white/25 p-2 z-10 relative text-black',
    default: 'bg-white text-black shadow-[0_0_15px_1px] shadow-[#dfdfdf] p-3',
  };

  return (
    <header
      // className={`sticky top-0 z-50 ${pathname === '/' || pathname === '/drones' ? 'bg-white text-black' : 'bg-white text-black shadow-[0_0_15px_1px] shadow-[#dfdfdf] '}  ${pathname === '/' ? 'p-6' : 'p-3'} ${pathname === '/signup' ? ' backdrop-blur-[10px] shadow-[#2929293e]  bg-[#282828]/17' : ''}  bg-white`}
      // className={`sticky top-0 z-50 ${
      //   pathname === '/'
      //     ? 'bg-white text-black p-6'
      //     : pathname === '/drones'
      //       ? 'bg-white text-black'
      //       : pathname === '/signup'
      //         ? 'backdrop-blur-[10px] bg-[#282828]/17'
      //         : 'bg-white text-black shadow-[0_0_15px_1px] shadow-[#dfdfdf] p-3'
      // }`}
      className={`sticky top-0 z-50 ${headerStyles[pathname] || headerStyles.default} z-100 bg-gradient-to-r  `}
    >
      {/* <div className="absolute inset-0 bg-white/0 backdrop-blur-[2px] z-0"></div> */}
      <div className="container mx-auto flex justify-between items-center font-nekstmedium z-10 ">
        <div className="flex items-center  space-x-[20px]">
          <Link href="/">
            <button className="text-[32px] font-nekstmedium">ДронАгро</button>
          </Link>
          <div className="flex items-center">
            <div className="relative group ">
              <div className="flex items-center gap-1 px-4  text-[20px] hover:text-gray-300 cursor-pointer">
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
            <div className="flex items-center gap-1 px-2 hover:text-gray-300 cursor-pointer text-[22px]">
              О платформе
              <ChevronDown className="h-4 w-4 " />
            </div>
            <div
              className="absolute left-0 top-full mt-0 w-64
      opacity-0 scale-95 pointer-events-none
      group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
      transition-all duration-300 ease-out
      bg-white border-[#e5e5e5] border-[1px] rounded-lg shadow-[0px_0px_5px_3px] shadow-[#0000002b] z-50 origin-top"
            >
              <Link
                href={`/workflow`}
                className={`block text-[16px] rounded-t-lg  px-4 py-3 hover:bg-[#adadad] transition-colors `}
              >
                Как это работает?
              </Link>
              <Link
                href={`/partnership`}
                className={`block text-[16px]  rounded-b-lg  px-4 py-3 hover:bg-[#adadad] transition-colors `}
              >
                Стать партнером
              </Link>
            </div>
          </div>
          <div className="relative group">
            {/* Родительская кнопка */}
            <div className="flex items-center gap-2  text-[20px] px-4 py-2 text-lg font-nekstmedium hover:text-gray-300 cursor-pointer">
              <Link href={'/drones'} className="flex items-center">
                Дроны
                <ChevronDown className="h-4 w-4 transition-transform transform group-hover:rotate-180" />
              </Link>
            </div>

            {/* Меню с анимацией */}
            <div
              className=" 
      absolute left-0 top-full mt-0 w-64
      opacity-0 scale-95 pointer-events-none
      group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
      transition-all duration-300 ease-out
      bg-white border-[#e5e5e5] border-[1px] rounded-lg shadow-[0px_0px_5px_3px] shadow-[#0000002b] z-50 origin-top
    "
            >
              {dronesList.map((drone, index) => (
                <div className="relative group/drone" key={index}>
                  <Link
                    href={`/drones/${drone.id}`}
                    key={index}
                    className={`block text-[16px]  px-4 py-3 hover:bg-[#adadad] transition-colors ${
                      index === 0 ? 'rounded-t-lg' : ''
                    } ${index + 1 === dronesList.length ? 'rounded-b-lg' : ''}`}
                  >
                    {drone.name}
                  </Link>

                  <div className="absolute top-0 left-full ml-[5px] opacity-0 scale-95 group-hover/drone:opacity-100 group-hover/drone:scale-100 transition-all duration-300 ease-out bg-white p-4 rounded-xl shadow-xl min-w-[30vw] z-50 text-black pointer-events-none group-hover/drone:pointer-events-auto">
                    <h4 className="font-semibold text-[20px] font-nekstregular mb-2">
                      {drone.name}
                    </h4>

                    <p className="text-sm text-neutral-500 leading-relaxed mb-2">
                      {/* краткое описание */}
                      {drone.description}
                    </p>

                    <ul className="text-sm text-neutral-600 list-disc list-inside space-y-1 mb-3 flex items-center justify-between w-full ">
                      <div className="flex flex-wrap ">
                        <li>Объем бака: 30 литров</li>
                        <li>Вес дрона: 27,5кг</li>
                        <li>Грузоподъёмность: 67 кг</li>
                        <li>Время полета: 10-15 мин</li>
                      </div>
                      <div className="flex flex-wrap">
                        <li>Ш. распыления: 5,5-8 м</li>
                        <li>Батарея: 28000 мАч</li>
                        <li>Высота полета: до 30 метров</li>
                      </div>
                    </ul>

                    <div className="w-full h-[200px] rounded-lg overflow-hidden    flex items-center justify-center shadow-xl">
                      {/* <Image
                        src={drone.photo_url || '/img/placeholder.jpg'}
                        fill
                        objectFit="cover"
                        alt={drone.name}
                        className="block w-[30px] h-[100px] overflow-hidden bg-red-50"
                      ></Image> */}
                      <img
                        src={drone.photo_url || '/img/placeholder.jpg'}
                        alt={drone.name}
                        className="w-full  object-cover rounded-md"
                      />
                    </div>
                    <Link href={`/drones/${drone.id}`}>
                      <button className="py-[6px] mt-[10px] w-full px-[10px] bg-green-500 rounded-[10px] text-white text-[20px]">
                        Подробнее
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
              <Link
                href={`/drones`}
                className={`block text-[16px]  px-4 py-3 hover:bg-[#adadad] transition-colors   rounded-b-lg bg-[#f3f3f3]`}
              >
                <div className="flex items-center">
                  <p>Каталог дронов</p>{' '}
                  <ArrowRight className="w-[30px] h-[15px] "></ArrowRight>
                </div>
              </Link>
            </div>
          </div>

          <div className="relative group">
            <div className="flex items-center gap-1 px-2 hover:text-gray-300 cursor-pointer text-[20px]">
              Услуги
              <ChevronDown className="h-4 w-4 " />
            </div>
            <div
              className="absolute left-0 top-full mt-0 w-64
      opacity-0 scale-95 pointer-events-none
      group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
      transition-all duration-300 ease-out
      bg-white border-[#e5e5e5] border-[1px] rounded-lg shadow-[0px_0px_5px_3px] shadow-[#0000002b] z-50 origin-top"
            >
              <Link
                href={`/signup`}
                className={`block text-[16px] rounded-t-lg  px-4 py-3 hover:bg-[#adadad] transition-colors `}
              >
                Зарегистрироваться
              </Link>
            </div>
          </div>
          <Link
            href="/permissions"
            className="px-2 text-[20px] hover:text-gray-300"
          >
            Разрешения
          </Link>
          <Link
            href="/payment"
            className="px-2 text-[20px] hover:text-gray-300"
          >
            Заказчику
          </Link>
          <Link
            href="/contacts"
            className="px-2 text-[20px] hover:text-gray-300"
          >
            Контакты
          </Link>

          {/* TODO: change this on profile when state and middleware be ready */}
          {/* <Link href="/registration" className="pl-4 hover:text-gray-300">
            <UserCircle2 className="h-6 w-6" />
          </Link> */}
        </nav>
        {/* {pathname === '/' && (
          <Link href={'/signup'}>
            <button
              className="px-[20px] text-[20px] border border-black rounded-[20px]
         duration-[0.3s] hover:scale-[1.1] hover:text-[#797979]"
            >
              Регистрация
            </button>
          </Link>
        )} */}
      </div>
    </header>
  );
}
