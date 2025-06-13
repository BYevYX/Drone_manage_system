'use client';
import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
} from 'lucide-react';
import QRCode from 'react-qr-code'; // npm install react-qr-code
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

export default function ContactsPage() {
  const [formStatus, setFormStatus] = useState(null); // null | 'success' | 'error'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus('error');
      return;
    }
    // Здесь можно добавить отправку на сервер
    setFormStatus('success');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="wrapper bg-gradient-to-br from-[#e6e6e6] to-[#cfe9e5] min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-10 px-4 text-center bg-white/80 backdrop-blur-sm shadow-md rounded-b-3xl max-w-5xl mx-auto mt-8 font-nekstregular">
        <h1 className="text-4xl font-bold mb-4 text-green-700 animate-fadeInDown">
          Свяжитесь с нами
        </h1>
        <p className="text-lg max-w-3xl mx-auto text-gray-700 animate-fadeInUp">
          Для всех вопросов, предложений и сотрудничества используйте удобные
          способы связи ниже или заполните форму обратной связи.
        </p>
      </section>

      {/* Contact Information & Form */}
      <div className="container py-16 px-4 font-nekstregular max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
        {/* Company Info */}
        <div className="md:w-1/2 bg-white shadow-lg rounded-lg p-8 flex flex-col animate-slideInLeft">
          <h3 className="text-3xl mb-6 font-semibold text-green-700 flex items-center gap-3">
            <MapPin size={32} /> Контактная информация
          </h3>
          <p className="text-lg mb-6 text-gray-800">
            Мы всегда рады помочь и ответить на ваши вопросы. Ниже указаны все
            способы связи с нами.
          </p>

          <ContactItem
            icon={<MapPin size={24} />}
            title="Адрес"
            text="12345, Москва, ул. Дронная, 15"
          />
          <ContactItem
            icon={<Phone size={24} />}
            title="Телефон"
            text="+7 800 123 45 67"
            link="tel:+78001234567"
          />
          <ContactItem
            icon={<Mail size={24} />}
            title="Email"
            text="info@droneagro.com"
            link="mailto:info@droneagro.com"
          />

          <div className="mt-8">
            <p className="font-medium text-lg mb-3">Социальные сети</p>
            <div className="flex space-x-6 text-green-700">
              <SocialLink
                href="#"
                icon={<Facebook size={24} />}
                label="Facebook"
              />
              <SocialLink
                href="#"
                icon={<Instagram size={24} />}
                label="Instagram"
              />
              <SocialLink
                href="#"
                icon={<Linkedin size={24} />}
                label="LinkedIn"
              />
            </div>
          </div>

          {/* QR Код для контактов */}
          <div className="mt-10 flex flex-col items-center">
            <p className="mb-2 font-semibold text-gray-700">
              Сканируйте QR-код для быстрого доступа к контактам
            </p>
            <div className="p-4 bg-white rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
              <QRCode
                value={`BEGIN:VCARD
VERSION:3.0
FN:DroneAgro
TEL:+78001234567
EMAIL:info@droneagro.com
ADR:;;ул. Дронная, 15;Москва;;12345;Россия
END:VCARD`}
                size={140}
                fgColor="#22c55e"
                bgColor="#ffffff"
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:w-1/2 bg-white shadow-lg rounded-lg p-8 animate-slideInRight">
          <h3 className="text-3xl font-nekstmedium mb-6 text-green-700 flex items-center gap-3">
            <Mail size={32} /> Обратная связь
          </h3>
          <p className="text-lg mb-6 text-gray-800">
            Заполните форму, и мы свяжемся с вами в ближайшее время.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <InputField
              label="Ваше имя"
              id="name"
              name="name"
              type="text"
              placeholder="Введите ваше имя"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <InputField
              label="Ваш email"
              id="email"
              name="email"
              type="email"
              placeholder="Введите ваш email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <InputField
              label="Сообщение"
              id="message"
              name="message"
              type="textarea"
              placeholder="Введите ваше сообщение"
              value={formData.message}
              onChange={handleInputChange}
              required
            />

            {formStatus === 'error' && (
              <p className="text-red-600 mb-4 font-semibold animate-shake">
                Пожалуйста, заполните все поля корректно.
              </p>
            )}
            {formStatus === 'success' && (
              <p className="text-green-600 mb-4 font-semibold animate-fadeIn">
                Спасибо! Ваше сообщение отправлено.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300 shadow-lg transform hover:scale-105"
            >
              Отправить сообщение
            </button>
          </form>
        </div>
      </div>

      <Footer />

      {/* Анимации */}
      <style jsx>{`
        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20%,
          60% {
            transform: translateX(-8px);
          }
          40%,
          80% {
            transform: translateX(8px);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease forwards;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.7s ease forwards;
        }
        .animate-slideInRight {
          animation: slideInRight 0.7s ease forwards;
        }
        .animate-shake {
          animation: shake 0.4s ease;
        }
        .animate-fadeIn {
          animation: fadeInUp 0.6s ease forwards;
        }
      `}</style>
    </div>
  );
}

// Контактный элемент с иконкой
function ContactItem({ icon, title, text, link }) {
  return (
    <div className="flex items-start gap-4 mb-5">
      <div className="text-green-600 rounded-full bg-green-100 p-3 shadow-md flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-lg mb-1">{title}</p>
        {link ? (
          <a
            href={link}
            className="text-gray-800 hover:text-green-600 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        ) : (
          <p className="text-gray-800">{text}</p>
        )}
      </div>
    </div>
  );
}

// Универсальное поле ввода (input или textarea)
function InputField({
  label,
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  required,
}) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block mb-2 font-medium text-gray-700">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />
      )}
    </div>
  );
}

// Социальная ссылка с иконкой
function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-green-600 transition transform hover:scale-110"
    >
      {icon}
    </a>
  );
}
