'use client';

import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 font-nekstregular">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Лого и описание */}
          <div className="space-y-6">
            <Link
              href="/"
              className="text-3xl font-bold text-white hover:text-green-400 transition"
            >
              Drone<span className="text-green-400">Agro</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Инновационные решения для точного земледелия с использованием
              дронов
            </p>
            <div className="flex space-x-4">
              <SocialIcon
                href="#"
                icon={<Facebook size={24} />}
                // label="Facebook"
              />
              <SocialIcon
                href="#"
                icon={<Instagram size={24} />}
                // label="Instagram"
              />
              <SocialIcon
                href="#"
                icon={<Twitter size={24} />}
                // label="Twitter"
              />
              <SocialIcon
                href="#"
                icon={<Linkedin size={24} />}
                // label="LinkedIn"
              />
            </div>
          </div>

          {/* Навигация */}
          <div className="space-y-4">
            <h3 className="text-lg font-nekstmedium text-white uppercase tracking-wider">
              Навигация
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/" text="Главная" />
              <FooterLink href="/services" text="Услуги" />
              <FooterLink href="/technology" text="Технологии" />
              <FooterLink href="/cases" text="Кейсы" />
            </ul>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h3 className="text-lg font-nekstmedium text-white uppercase tracking-wider">
              Контакты
            </h3>
            <div className="space-y-3">
              <ContactItem
                icon={<Phone size={18} />}
                text="+7 (999) 123-45-67"
              />
              <ContactItem icon={<Mail size={18} />} text="info@agrodrone.ru" />
              <ContactItem
                icon={<MapPin size={18} />}
                text="Москва, ул. Агропромышленная, 15"
              />
            </div>
          </div>

          {/* Подписка */}
          <div className="space-y-4">
            <h3 className="text-lg font-nekstmedium text-white uppercase tracking-wider">
              Новости
            </h3>
            <p className="text-gray-400">Подпишитесь на наши обновления</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Ваш email"
                className="px-4 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-400 w-full"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-lg transition"
              >
                →
              </button>
            </form>
          </div>
        </div>

        {/* Копирайт */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} AgroDrone. Все права защищены.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Политика конфиденциальности
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({
  href,
  icon,
}: {
  href: string;
  icon: React.ReactNode;
}) => (
  <a
    href={href}
    className="text-gray-400 hover:text-green-400 transition transform hover:-translate-y-1"
  >
    {icon}
  </a>
);

const FooterLink = ({ href, text }: { href: string; text: string }) => (
  <li>
    <Link
      href={href}
      className="text-gray-400 hover:text-green-400 transition-colors"
    >
      {text}
    </Link>
  </li>
);

const ContactItem = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="flex items-start space-x-3">
    <span className="text-green-400 mt-0.5">{icon}</span>
    <span className="text-gray-400 hover:text-white transition cursor-pointer">
      {text}
    </span>
  </div>
);

export default Footer;
