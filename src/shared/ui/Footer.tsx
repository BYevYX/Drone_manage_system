// shared/ui/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-[#1e1e1e] text-neutral-300 pt-20 pb-10 mt-0 ">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Бренд */}
        <div>
          <Link
            href="/"
            className="text-3xl font-semibold text-white hover:text-neutral-400 transition-colors duration-200"
          >
            ДронАгро
          </Link>
          <p className="text-[16px] text-neutral-500 font-nekstregular mt-5 leading-relaxed max-w-xs">
            Технологичная платформа для точного сельского хозяйства и
            мониторинга посевов с помощью дронов.
          </p>
        </div>

        {/* Навигация */}
        <div className="font-nekstmedium">
          <h4 className="text-[20px] uppercase font-semibold text-neutral-400 tracking-widest mb-4">
            Навигация
          </h4>
          <ul className="space-y-3 text-[18px]">
            <li>
              <Link
                href="/"
                className="hover:text-white transition-colors duration-200"
              >
                Главная
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className="hover:text-white transition-colors duration-200"
              >
                Услуги
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors duration-200"
              >
                О нас
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-white transition-colors duration-200"
              >
                Контакты
              </Link>
            </li>
          </ul>
        </div>

        {/* Контакты */}
        <div className="font-nekstmedium text-[16px]">
          <h4 className=" uppercase font-semibold text-neutral-400 tracking-widest mb-4 text-[20px]">
            Контакты
          </h4>
          <p className=" text-neutral-500 mb-1 font-nekstregular">
            +7 (999) 123-45-67
          </p>
          <p className=" text-neutral-500 font-nekstregular">
            info@dronagro.ru
          </p>
        </div>
      </div>

      {/* Нижняя часть */}
      <div className="mt-16 border-t border-neutral-800 pt-6 text-center  text-neutral-500 font-nekstregular">
        © {new Date().getFullYear()} ДронАгро. Все права защищены.
      </div>
    </footer>
  );
};

export default Footer;
