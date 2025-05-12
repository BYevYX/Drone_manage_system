import React from 'react';
import { ShieldCheck, BadgeCheck, Award, UserCheck } from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

export default function DronePermissionsInfo() {
  return (
    <div className="wrapper relative bg-gradient-to-br from-[#e6e6e6] to-[#cfe9e5]  ">
      <Header></Header>
      {/* <div className="absolute inset-0 bg-black/50 backdrop-blur-[20px] z-0" /> */}
      <div className="relative container mx-auto p-8 md:p-16 z-10 font-nekstregular">
        <h1 className="text-4xl font-bold text-gray-700 mb-6 font-nekstmedium">
          Надёжность и разрешения
        </h1>
        <p className="text-lg  mb-10 text-gray-700 font-nekstregular">
          Компания <span className="font-semibold ">«ДронАгро»</span> официально
          занесена в реестр эксплуатантов <strong>ООО «Консорциум БАС»</strong>.
          Это даёт право использовать агродроны в большинстве регионов России с
          получением разрешений от ОРВД.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-white/60 backdrop-blur-md border border-gray-200 shadow-md rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <ShieldCheck className="text-green-600 mr-3" size={28} />
              <h2 className="text-xl font-semibold text-gray-800">
                Сертификация эксплуатантов БАС
              </h2>
            </div>
            <p className="text-gray-700">
              Получен официальный сертификат эксплуатанта беспилотных
              авиационных систем, позволяющий законно работать во многих
              регионах страны.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-gray-200 shadow-md rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <UserCheck className="text-blue-600 mr-3" size={28} />
              <h2 className="text-xl font-semibold text-gray-800">
                Сертифицированные пилоты
              </h2>
            </div>
            <p className="text-gray-700">
              Наши операторы имеют действующие удостоверения «внешнего пилота» и
              проходят регулярное обучение и переаттестацию.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-gray-200 shadow-md rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <BadgeCheck className="text-indigo-600 mr-3" size={28} />
              <h2 className="text-xl font-semibold text-gray-800">
                Официальные разрешения
              </h2>
            </div>
            <p className="text-gray-700">
              Работаем с получением всех необходимых разрешений от органов
              управления воздушным движением (ОРВД), включая сложные зоны.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-gray-200 shadow-md rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <Award className="text-yellow-600 mr-3" size={28} />
              <h2 className="text-xl font-semibold text-gray-800">
                Опыт и доверие
              </h2>
            </div>
            <p className="text-gray-700">
              Многолетний опыт в агродрон-сфере. Нам доверяют десятки хозяйств,
              региональных агросервисов и фермерских объединений.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl text-gray-800 mb-4">
            Мы работаем <strong>официально, прозрачно и безопасно</strong>.
          </p>
          <p className="text-gray-600">
            Выбирая нас, вы выбираете законность, качество и надёжность.
          </p>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
