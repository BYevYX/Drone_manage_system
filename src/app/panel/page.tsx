'use client';
import { useState } from 'react';
import Header from '@/src/shared/ui/Header';
import { OrderCard } from './OrderCard';

import Image from 'next/image';

const ordersData = [
  {
    id: 1,
    title: 'Заказ дрона',
    price: 20000,
    status: 'Новый',
    date: '2025-04-10',
  },
  {
    id: 2,
    title: 'Проверка оборудования',
    price: 5000,
    status: 'В процессе',
    date: '2025-04-08',
  },
  {
    id: 3,
    title: 'Монтаж камеры',
    price: 12000,
    status: 'Завершён',
    date: '2025-04-01',
  },
];

const statuses = ['Новый', 'В процессе', 'Завершён'];

export default function OrdersPanel() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 50000]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    statusOrder: {
      isOpen: false,
      status: '',
    },
  });

  const filteredOrders = ordersData.filter((order) => {
    return (
      order.title.toLowerCase().includes(search.toLowerCase()) &&
      (filters.statusOrder.status
        ? order.status === filters.statusOrder.status
        : true) &&
      order.price >= filters.priceRange[0] &&
      order.price <= filters.priceRange[1]
    );
  });

  return (
    <div className="wrapper">
      <Header></Header>
      <div className="flex min-h-screen bg-[#0D0D0D] text-white">
        {/* Sidebar */}
        <aside className="w-80 p-6 border-r border-[#202020] bg-[#111111]">
          <h2 className="text-2xl font-bold mb-6">Фильтры</h2>
          {/* Поиск */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Поиск заказов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 bg-[#1A1A1A] rounded-[15px] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Статус заказа */}
          <div className="">
            <p className="text-gray-400 mb-2">Статус заказа</p>
            {/* <div className="flex justify-between w-full gap-[3px]">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setSelectedStatus(selectedStatus === status ? '' : status)
                  }
                  className={`flex-1 py-[7px] rounded-[20px] mb-2 ${selectedStatus === status ? 'bg-purple-600' : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'}`}
                >
                  {status}
                </button>
              ))}
            </div> */}
            <button
              className="w-full relative bg-[#262626] h-[40px] rounded-[15px] flex"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  statusOrder: {
                    ...prev.statusOrder,
                    isOpen: prev.statusOrder.isOpen ? false : true,
                  },
                }))
              }
            >
              <div className="w-[80%] h-full pl-[10px]">
                <div className="flex items-center w-full h-full">
                  <p className="text-[#8d8d8d] font-nekstlight text-[18px]">
                    {!filters.statusOrder.status
                      ? 'Все'
                      : filters.statusOrder.status}
                  </p>
                </div>
              </div>
              <div className="w-[20%] h-full pr-[10px]">
                <div className="flex items-center justify-center  h-full ">
                  <Image
                    src={'/pages/main/arrow.svg'}
                    height={8}
                    width={8}
                    alt="arrow"
                    className={`invert rotate-[${filters.statusOrder.isOpen ? '-90' : '90'}deg] duration-[0.5s]`}
                  ></Image>
                </div>
              </div>
            </button>
            {/* {filters.statusOrder.isOpen && (
              <div className="bg-[#1e1e1e] p-[5px] w-full min-h-[50px] rounded-[15px] duration-[0.3s] transition-all ">
                <div className="w-full gap-[3px]">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          statusOrder: {
                            ...prev.statusOrder,
                            status:
                              prev.statusOrder.status === status ? '' : status,
                          },
                        }))
                      }
                      className={`block w-full py-[7px] rounded-[10px] mb-2 ${filters.statusOrder.status === status ? 'bg-purple-600' : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'} font-nekstregular `}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )} */}
            <div
              className={`bg-[#1e1e1e] px-[10px] py-[7px] w-full min-h-[10px] rounded-[15px] duration-[0.5s] transition-all origin-top  ${filters.statusOrder.isOpen ? 'max-h-[500px] opacity-100 pointer-events-auto ' : 'max-h-0 opacity-0 pointer-events-none '}  `}
            >
              <div
                className={` w-full gap-[3px] flex items-center justify-center `}
              >
                <div className="w-full flex flex-wrap gap-[5px]">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          statusOrder: {
                            ...prev.statusOrder,
                            status:
                              prev.statusOrder.status === status ? '' : status,
                          },
                        }))
                      }
                      className={`block w-full py-[7px] rounded-[10px] ${filters.statusOrder.status === status ? 'bg-purple-600' : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'} font-nekstregular duration-[0.3s] `}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Диапазон цены */}
          <div className="mt-[10px] mb-[15px]">
            <p className="text-gray-400 mb-2">Цена</p>
            <div className="flex gap-[5px]">
              <div className="w-[50%] rounded-[20px] items-center h-[40px] bg-[#262626] flex">
                <input
                  type="number"
                  className="px-[10px] rounded-[20px] w-[70%] h-[40px] font-nekstlight "
                  placeholder="От"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: [
                        e.target.value === '' ? 0 : Number(e.target.value),
                        prev.priceRange[1],
                      ],
                    }))
                  }
                />
                <div className="w-[30%]  pr-[10px] flex items-center h-full  font-nekstlight text-[#9f9f9f] text-[14px]">
                  RUB
                </div>
              </div>
              <div className="w-[50%] rounded-[20px] items-center h-[40px] bg-[#262626] flex">
                <input
                  type="number"
                  className="px-[10px] rounded-[20px] w-[70%] h-[40px] font-nekstlight "
                  placeholder="До"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: [
                        prev.priceRange[0],
                        e.target.value === ''
                          ? 1000000
                          : Number(e.target.value),
                      ],
                    }))
                  }
                />
                <div className="w-[30%]  pr-[10px] flex items-center h-full  font-nekstlight text-[#9f9f9f] text-[14px] ">
                  RUB
                </div>
              </div>
            </div>
          </div>

          {/* Кнопка сброса фильтров */}
          <button
            onClick={() => {
              setSearch('');
              setSelectedStatus('');
              setSelectedPriceRange([0, 50000]);
            }}
            className="w-full py-2 bg-purple-600 rounded-[20px] hover:bg-purple-800 transition duration-300"
          >
            Сбросить фильтры
          </button>
        </aside>

        {/* Orders */}
        <main className="flex-1 p-8 space-y-6">
          <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

          {filteredOrders.length === 0 && (
            <p className="text-gray-500">Заказы не найдены...</p>
          )}

          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedOrderId === order.id}
              onToggle={() =>
                setExpandedOrderId(
                  expandedOrderId === order.id ? null : order.id,
                )
              }
            />
          ))}
        </main>
      </div>
    </div>
  );
}
