// export { default } from '../pages/home/ui/Home';
'use client';
import Image from 'next/image';

import React from 'react';
import Header from '../shared/ui/Header';

export default function page() {
  return (
    <div className="wrapper">
      <Header></Header>
      <div className="h-[80vh]  w-full bg-[url('/pages/main/main_bg.jpeg')] bg-scroll bg-cover bg-center bg-no-repeat ">
        <div className="w-full h-full bg-black/65">
          {' '}
          <div className="container text-white overflow-hidden h-full">
            <div className="w-full h-full flex flex-wrap items-center ">
              <div className=" ">
                <p className="leading-20 text-[70px] w-[800px] ml-[3px] font-poppinsmedium">
                  ДронАгро
                </p>
                <p className="font-nekstregular mt-[10px] mb-[20px] text-[20px] w-[500px]">
                  {' '}
                  Платформа для управления процессами с использованием дронов в
                  сельском хозяйстве
                </p>
                <button className="px-[30px] py-[10px] font-nekstsemibold rounded-[5px] bg-green-500 hover:bg-green-600 cursor-pointer duration-[0.2s] ">
                  ПОСМОТРЕТЬ УСЛУГИ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="w-full h-[100vh] flex items-center justify-between">
          <div className="">
            <p className="text-green-500 text-[20px] font-semibold">
              Платформа для дронов
            </p>
            <p className="font-bold text-[32px]">
              Упростите обработку полей с нами
            </p>
            <p className="font-nekstregular w-[500px] text-[#373737]">
              Мы предоставляем услуги по обработке полей с помощью дронов, чтобы
              сделать ваш агробизнес более эффективным.
            </p>
          </div>
          <div className="bg-red-50 w-[400px] h-[500px] relative">
            <Image
              src="/pages/main/drone_3.jpg"
              alt="drone_3"
              fill
              sizes="full"
              style={{ objectFit: 'cover' }}
            ></Image>
          </div>
        </div>
      </div>
      <div className="w-full h-[100vh] bg-[#b1b1b139]">
        <div className="container">
          <div className="w-full pt-[100px] px-[20px]">
            <p className="text-green-500 text-[20px] font-semibold">
              Обработка полей дронами
            </p>
            <p className="font-bold text-[32px]">
              Эффективные решения для сельского хозяйства
            </p>
            <div className="w-full flex items-center justify-between mt-[50px] space-x-[20px] min-h-[400px]">
              <div className="flex-1 bg-white shadow-[0_0_20px_2px_rgba(0,0,0,0.25)] hover:scale-[1.05] duration-[0.3s] cursor-pointer">
                <div className="w-full h-[200px] relative ">
                  <Image
                    src="/pages/main/drone_1.jpg"
                    style={{ objectFit: 'cover' }}
                    fill
                    sizes="full"
                    alt="drone"
                  ></Image>
                </div>
                <div className="w-full h-[150px] bg-white p-[20px]">
                  <div className="flex space-x-[5px] ">
                    <p className="poppins-bold text-[20px]">Орошение полей</p>
                    <Image
                      src="/pages/main/arrow.svg"
                      width={10}
                      height={10}
                      alt="drone"
                    ></Image>
                  </div>
                  <p className="text-[#636363] poppins-medium text-[18px]">
                    Эффективное орошение с помощью дронов.
                  </p>
                </div>
              </div>
              <div className="flex-1 hover:scale-[1.05] duration-[0.3s] bg-white shadow-[0_0_20px_2px_rgba(0,0,0,0.25)] cursor-pointer">
                <div className="w-full h-[200px] relative">
                  <Image
                    src="/pages/main/drone_6.png"
                    style={{ objectFit: 'cover' }}
                    fill
                    sizes="full"
                    alt="drone"
                  ></Image>
                </div>
                <div className="w-full h-[150px] bg-white p-[20px]">
                  <div className="flex space-x-[5px] ">
                    <p className="poppins-bold text-[20px]">
                      Мониторинг состояния растений
                    </p>
                    <Image
                      src="/pages/main/arrow.svg"
                      width={10}
                      height={10}
                      alt="drone"
                    ></Image>
                  </div>
                  <p className="text-[#636363] poppins-medium text-[18px]">
                    Точный мониторинг здоровья ваших растений.
                  </p>
                </div>
              </div>
              <div className="flex-1 hover:scale-[1.05] duration-[0.3s] bg-white shadow-[0_0_20px_2px_rgba(0,0,0,0.25)] cursor-pointer">
                <div className="w-full h-[200px] relative">
                  <Image
                    src="/pages/main/drone_7.jpg"
                    style={{ objectFit: 'cover' }}
                    fill
                    sizes="full"
                    alt="drone"
                  ></Image>
                </div>
                <div className="w-full h-[150px] bg-white p-[20px]">
                  <div className="flex space-x-[5px] ">
                    <p className="poppins-bold text-[20px]">Обработка</p>
                    <Image
                      src="/pages/main/arrow.svg"
                      width={10}
                      height={10}
                      alt="drone"
                    ></Image>
                  </div>
                  <p className="text-[#636363] poppins-medium text-[18px]">
                    Эффективное обработка полей с дронами.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
