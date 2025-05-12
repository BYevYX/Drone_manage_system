'use client';

import React from 'react';
import { useGlobalContext } from '../../GlobalContext';
import Header from '@/src/shared/ui/Header';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/src/shared/ui/Footer';

interface Drone {
  id: number;
  name: string;
  description: string;
  photo_url: string;
  manufacturer: string;
}

const DronePage = ({ params }: { params: { id: string } }) => {
  const { dronesList } = useGlobalContext();

  const drone = dronesList.find((el) => Number(el.id) === Number(params.id));

  if (!drone) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">
        Дрон не найден
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-[#f5f6f8] wrapper">
      <Header />
      <div className="w-full  mx-auto px-[50px] py-10">
        <div className="w-full  grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-md p-6">
          {/* Фото */}
          <div className="flex items-center justify-center min-h-[50vh]">
            <img
              src={drone.photo_url}
              alt={drone.name}
              className="max-h-[400px] w-auto object-contain rounded-lg"
            />
          </div>

          {/* Текстовая инфа */}
          <div className="w-full flex items-center">
            <div className="flex   flex-col justify-between">
              <div className="">
                <p className="text-sm text-gray-500 uppercase tracking-wide">
                  Производитель:{' '}
                  <span className="text-gray-800 font-medium">
                    {drone.manufacturer}
                  </span>
                </p>
                <h1 className="text-3xl font-bold text-gray-800 mt-2">
                  {drone.name}
                </h1>
                <p className="text-base text-gray-700 mt-4 leading-relaxed">
                  {drone.description}
                </p>
              </div>

              {/* Кнопка */}
              <div className="mt-8">
                <a
                  href="/drones"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                >
                  <ArrowLeft size={20} />
                  Назад к списку дронов
                </a>
              </div>
              <div className=""></div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
      <div className=" w-full container  ">
        <h2 className="text-2xl font-semibold mb-4">Описание</h2>
        <p className=" text-gray-700 text-[16px] ">
          Сельскохозяйственный агродрон — это мультироторное устройство, которое
          совмещает в себе высокие технологии и многофункциональность с
          простотой управления. Дрон оснащен разбрасывателем, работающим с
          жидкими удобрениями в гранулах, семенами и кормами. Его используют для
          мониторинга урожая, внесения удобрений, стимуляторов роста и средств
          защиты растений. Автоматизация этих процессов позволяет увеличить
          скорость и площадь обработки.<br></br> <br></br>Агродрон AgDy с
          легкостью обрабатывает даже труднодоступные места в лесистой и горной
          местности. Для сбора данных посевов и сельскохозяйственных угодий
          прибор использует сложные датчики и камеры. Автоматический контроль
          высоты позволяет системе самостоятельно обходить все наземные
          препятствия. Корпус защищен от попадания пыли и влаги, благодаря чему
          дрон может работать даже в плохих погодных условиях.<br></br>{' '}
          <br></br> Один логистический цикл занимает примерно 10-12 минут. В
          него входит полет, заправка дрона и замена батареи. Для одного полета
          используется одна батарея. За каждый цикл дрон проходит порядка 2-3
          Га.{' '}
        </p>
        <div className="mt-10 w-full ">
          <h2 className="text-2xl font-semibold mb-4">Характеристики</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700 text-sm uppercase">
                  <th className="p-3 border-b border-gray-300 w-1/3">
                    Показатель
                  </th>
                  <th className="p-3 border-b border-gray-300">Значение</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 text-sm">
                {[
                  ['Объем бака', '30 литров'],
                  ['Вес дрона', '27,5 кг'],
                  ['Подъемный вес', '67 кг'],
                  ['Производительность', '12–15 гектар/час'],
                  ['Время полета', '10–15 мин'],
                  ['Ширина распыления', '5,5–8 м'],
                  ['Скорость распыления', '0–8 м/с'],
                  ['Форсунки', '12 форсунок высокого давления'],
                  ['Батарея', '3 шт смарт батарея 14S 28000 мАч'],
                  ['Радиус полета', '1000–1500 м'],
                  ['Позиционирование', 'работа от спутников и от RTK'],
                  [
                    'Точность позиционирования',
                    'с RTK — до 5 см, без — 50–60 см',
                  ],
                  ['Поток распыления', '3,5–4 л/мин'],
                  ['Зарядка от батареи', '10–12 минут'],
                  ['Высота полета', 'до 30 м'],
                  ['Датчик рельефа', 'в полной версии'],
                  ['Рабочая температура, влажность', '0–70 °C, до 90%'],
                  ['Сопротивление ветру', '10 м/с'],
                  ['Нисходящий поток воздуха', '4–15 м/с'],
                  ['Размер в раскрытом виде', '2,1 х 1,85 х 0,8 м'],
                  ['Размер в сложенном виде', '1,2 х 0,9 х 0,8 м'],
                ].map(([label, value], index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-3 border-b border-gray-200 font-medium">
                      {label}
                    </td>
                    <td className="p-3 border-b border-gray-200">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Дополнительные функции и возможности
          </h2>
          <ul className="space-y-1">
            {[
              'Три основных режима работы: ручной режим, режим точек А-Б, автоматический режим.',
              'Интеллектуальное распыление.',
              'Избегание препятствий в ходе обработки участков.',
              'Противостояние порывам ветра до 10 м/с.',
              'Запоминание точки прерывания.',
              'Хранение данных в облаке.',
              'Регулярные обновления ПО.',
              'Динамическая калибровка расходомера.',
              'Отображение данных о зарядке в режиме реального времени.',
              'Работа с Google Картами.',
              'Отметка точек на карте с помощью дрона.',
              'Сохранение истории.',
              'Командное управление заданиями.',
            ].map((el) => (
              <li className="relative pl-4 before:content-['—']  before:mr-[10px] text-gray-700 text-[16px]">
                {el}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default DronePage;
