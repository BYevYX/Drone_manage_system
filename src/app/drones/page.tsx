'use client';
import DroneCard from './comp';

import { useGlobalContext } from '../GlobalContext';
import Header from '@/src/shared/ui/Header';
import { ChevronDown } from 'lucide-react';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const typePribor = ['Другое', 'Агродрон', 'Камера', 'Аккумулятор', 'Фильтр'];
const manufacturers = ['ADGY', 'DJL Agras', 'JOYANCE', 'Topxgun'];

const DronesPage = () => {
  const { dronesList } = useGlobalContext();
  const [filters, setFilters] = useState({
    isOpen: true,
    manufacturer: {
      isOpen: true,
      info: [],
    },
    type: {
      isOpen: true,
      info: '',
    },
  });

  return (
    <div className="wrapper">
      <Header></Header>

      <div className="mx-auto bg-[#b1b1b139]  px-[50px] border-t-[1px] border-[#d6d6d6]   overflow-hidden pb-[20px] max-h-[200px] ">
        {/* {dronesList.map((drone) => (
          <DroneCard key={drone.id} drone={drone} />
        ))} */}
        <div className=" font-nekstregular text-[20px] overflow-hidden">
          <div className="text-[#525e68]">
            <div className="flex items-center mt-[10px] space-x-[3px]">
              <Link href={'/'}>
                <button className="text-[16px] hover:text-red-500 ">
                  Главная
                </button>
              </Link>
              <p className="text-[16px]">|</p>
              <Link href={'/drones'}>
                <button className="text-[16px] hover:text-red-500 ">
                  Каталог
                </button>
              </Link>
            </div>
            <p className="text-[32px] text-black ">Дроны / агродроны</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center ">
              <div className="">
                <SlidersHorizontal className="w-[20px] h-[20px] text-gray-600" />
              </div>
              <div className="ml-[5px]">Фильтры</div>
              <label className="ml-[10px] inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={filters.isOpen}
                  onChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      isOpen: prev.isOpen ? false : true,
                    }))
                  }
                />
                <div
                  className="
      w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500
      rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full
      peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
      after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full
      after:h-5 after:w-5 after:transition-all
      relative
    "
                ></div>
              </label>
            </div>
            <div className="text-[20px] font-nekstregular">
              <p>Сортировка</p>
              <div className="flex items-center justify-center">
                <div className="text-[#525e68] text-[16px]">По умолчанию </div>
                <ChevronDown className="h-4 w-4 " />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[50px] w-full border-t-[1px] border-[#d6d6d6] mt-[50px]">
        <div className="flex ">
          <div
            className={`filters space-y-[10px] ${filters.isOpen ? 'opacity-100 max-w-[1000px]' : 'opacity-0 max-w-0'} duration-[0.3s]`}
          >
            <div className="">
              <button
                className="flex items-center relative"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    manufacturer: {
                      ...prev.manufacturer,
                      isOpen: prev.manufacturer.isOpen ? false : true,
                    },
                  }))
                }
              >
                <ChevronDown className="h-6 w-6" />
                <p className="font-nekstregular  text-[18px] mb-[5px]">
                  Производитель
                </p>
              </button>
              <div
                className={`duration-[0.3s]  ${filters.manufacturer.isOpen ? 'opacity-100  max-h-[1000px]' : 'opacity-0  max-h-[0px]'}`}
              >
                {manufacturers.map((el) => (
                  <div className="flex items-center space-x-[5px]">
                    <label className="ml-[10px] inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        onChange={() => {
                          setFilters((prev) => {
                            const alreadySelected =
                              prev.manufacturer.info.includes(el);
                            return {
                              ...prev,
                              manufacturer: {
                                ...prev.manufacturer,
                                info: alreadySelected
                                  ? prev.manufacturer.info.filter(
                                      (item) => item !== el,
                                    ) // убираем
                                  : [...prev.manufacturer.info, el], // добавляем
                              },
                            };
                          });
                        }}
                      />
                      <div
                        className="
      w-5 h-5 bg-gray-300 rounded-[5px]
      peer-checked:bg-[#aeb2bd] 
      relative transition-colors
      after:content-['✔'] after:absolute after:inset-0 after:flex after:items-center after:justify-center 
      after:text-white after:text-[13px] after:opacity-0 peer-checked:after:opacity-100
    "
                      ></div>
                    </label>

                    <p className="font-nekstregular">{el}</p>
                    <div className="w-[18px] h-[18px] bg-gray-300 rounded-[5px] flex items-center justify-center font-nekstregular text-[14px]">
                      2
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="">
              <button
                className="flex items-center relative"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    type: {
                      ...prev.type,
                      isOpen: prev.type.isOpen ? false : true,
                    },
                  }))
                }
              >
                <ChevronDown className="h-6 w-6" />
                <p className="font-nekstregular  text-[18px] w-full mb-[5px]">
                  Тип устройства
                </p>
              </button>
              <div
                className={`duration-[0.3s]  ${filters.type.isOpen ? 'opacity-100  max-h-[1000px]' : 'opacity-0  max-h-[0px]'}`}
              >
                {typePribor.map((el) => (
                  <div className="flex items-center space-x-[5px]">
                    <label className="ml-[10px] inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div
                        className="
      w-5 h-5 bg-gray-300 rounded-[5px]
      peer-checked:bg-[#aeb2bd] 
      relative transition-colors
      after:content-['✔'] after:absolute after:inset-0 after:flex after:items-center after:justify-center 
      after:text-white after:text-[13px] after:opacity-0 peer-checked:after:opacity-100
    "
                      ></div>
                    </label>

                    <p className="font-nekstregular">{el}</p>
                    <div className="w-[18px] h-[18px] bg-gray-300 rounded-[5px] flex items-center justify-center font-nekstregular text-[14px]">
                      2
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pl-[100px] w-full grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
            {dronesList
              .filter(
                (el) =>
                  filters.manufacturer.info.length === 0 ||
                  filters.manufacturer.info.includes(el.manufacturer),
              )

              .map((drone, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-[#e0e0e0]"
                >
                  <Link
                    href={`/drones/${drone.id}`}
                    className="inline-block mt-4 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    <img
                      src={drone.photo_url}
                      alt="Название дрона"
                      className="w-full h-40 object-contain"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {drone.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                        {drone.description}
                      </p>

                      {/* Сюда вставишь свою ссылку */}
                      <Link
                        href={`/drones/${drone.id}`}
                        className="inline-block mt-4 text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Подробнее →
                      </Link>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DronesPage;
