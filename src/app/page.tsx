// export { default } from '../pages/home/ui/Home';
'use client';
import Image from 'next/image';

import React from 'react';

export default function page() {
  return (
    <div className="wrapper">
      <div className="h-[80vh]  w-full bg-[url('/pages/main/main_bg.jpeg')] bg-scroll bg-cover bg-center bg-no-repeat ">
        <div className="w-full h-full bg-black/65">
          {' '}
          <div className="container text-white overflow-hidden h-full">
            <div className="w-full h-full flex flex-wrap items-center ">
              <div className=" ">
                <p className="font-sans font-extrabold leading-20 text-[70px] w-[800px]">
                  Miem drone manage System
                </p>
                <p className="font-sans mt-[10px] mb-[20px]">
                  {' '}
                  Платформа для управления агродронами
                </p>
                <button className="px-[30px] py-[10px] font-bold rounded-[5px] bg-green-500 hover:bg-green-600 cursor-pointer duration-[0.2s] ">
                  VIEW SERVICES
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
