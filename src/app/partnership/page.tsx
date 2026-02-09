'use client';
import React, { useState } from 'react';
import {
  Handshake,
  BarChart2,
  Globe,
  Zap,
  Shield,
  Users,
  User,
  ChevronDown,
  ChevronUp,
  Rocket,
  Award,
  BadgeCheck,
  Clock,
  MapPin,
  Mail,
  Phone,
  Calendar,
  UserCheck,
} from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';
import Link from 'next/link';

export default function BecomePartner() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Какие требования к партнёрам?',
      answer:
        'Мы ищем компании с опытом в сельском хозяйстве или IT-решениях для агросектора, готовые развивать направление агродронов.',
      icon: <UserCheck className="text-blue-500 mr-2" size={20} />,
    },
    {
      question: 'Какие инвестиции нужны для старта?',
      answer:
        'Стартовый пакет начинается от 1,5 млн рублей, включая оборудование, обучение и маркетинговую поддержку.',
      icon: <BarChart2 className="text-green-500 mr-2" size={20} />,
    },
    {
      question: 'Как быстро можно выйти на окупаемость?',
      answer:
        'При активной работе большинство партнёров выходят на окупаемость за 6-12 месяцев.',
      icon: <Clock className="text-yellow-500 mr-2" size={20} />,
    },
    {
      question: 'Есть ли эксклюзив по регионам?',
      answer:
        'Да, мы предоставляем эксклюзивные права для партнёров в определённых регионах при выполнении плановых показателей.',
      icon: <MapPin className="text-red-500 mr-2" size={20} />,
    },
  ];

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const partners = [
    { name: 'Московская область', projects: 42 },
    { name: 'Краснодарский край', projects: 38 },
    { name: 'Ростовская область', projects: 29 },
    { name: 'Татарстан', projects: 25 },
    { name: 'Ставрополье', projects: 18 },
    { name: 'Алтайский край', projects: 15 },
    { name: 'Башкортостан', projects: 12 },
    { name: 'Белгородская область', projects: 10 },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-[url(/pages/main/drone_7.jpg)] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20 backdrop-blur-[10px]"></div>
        <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-sm">
            <Rocket className="text-blue-600 mr-2" size={18} />
            <span className="font-nekstmedium text-gray-800">
              Партнёрская программа
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl  text-white mb-6 font-nekstmedium">
            Станьте <span className="text-blue-300">партнёром</span> ДронАгро
          </h1>
          <p className="text-[20px] text-white/90 max-w-3xl mx-auto mb-8 font-nekstregular">
            Присоединяйтесь к лидерам агродроностроя! Расширьте свой бизнес с
            помощью наших технологий и получите эксклюзивные преимущества.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="#contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2 font-nekstmedium text-[18px]"
            >
              Оставить заявку <Handshake size={20} />
            </Link>
            <Link
              href="#benefits"
              className="bg-white/90 hover:bg-white text-gray-800 px-8 py-3 rounded-lg font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2 font-nekstmedium text-[18px]"
            >
              Узнать больше <ChevronDown size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-nekstregular">
        {/* Benefits Section */}
        <section id="benefits" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Почему стоит стать нашим партнёром?
            </h2>
            <p
              className="text-lg text-gray-600 max-w-3xl mx-auto font-normal
            "
            >
              6 ключевых преимуществ для развития вашего бизнеса
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Handshake className="text-green-600" size={28} />,
                title: 'Выгодные условия',
                desc: 'Специальные партнёрские цены, маркетинговая поддержка и индивидуальные условия сотрудничества.',
              },
              {
                icon: <BarChart2 className="text-blue-600" size={28} />,
                title: 'Рост доходов',
                desc: 'Добавьте перспективное направление в свой бизнес.',
              },
              {
                icon: <Globe className="text-indigo-600" size={28} />,
                title: 'Расширение географии',
                desc: 'Выходите на новые рынки с нашей поддержкой и готовыми решениями.',
              },
              {
                icon: <Zap className="text-yellow-600" size={28} />,
                title: 'Быстрый старт',
                desc: 'Полный пакет для запуска: обучение, оборудование, ПО и юридическое сопровождение.',
              },
              {
                icon: <Shield className="text-red-600" size={28} />,
                title: 'Гарантии и поддержка',
                desc: 'Техническая поддержка 24/7, гарантийное обслуживание и постоянные обновления.',
              },
              {
                icon: <Users className="text-purple-600" size={28} />,
                title: 'Сообщество профессионалов',
                desc: 'Доступ к закрытому сообществу партнёров, обмен опытом и совместные проекты.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 hover:border-blue-100 group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Award className="text-yellow-300 mr-2" size={18} />
              <span>Наши достижения</span>
            </div>
            <h2 className="text-3xl font-bold mb-8">ДронАгро в цифрах</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[
                { value: '150+', label: 'Партнёров' },
                { value: '40+', label: 'Регионов' },
                { value: '500+', label: 'Проектов' },
                { value: '95%', label: 'Довольных клиентов' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 p-4 rounded-lg backdrop-blur-sm"
                >
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm opacity-90">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Наши партнёры уже работают в:
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-200 text-center"
              >
                <BadgeCheck className="mx-auto text-blue-500 mb-2" size={24} />
                <p className="font-medium text-gray-800 mb-1">{partner.name}</p>
                <p className="text-sm text-gray-500">
                  {partner.projects}+ проектов
                </p>
              </div>
            ))}
          </div>
          <div className="text-[24px] mt-[20px] font-nekstmedium flex items-center justify-center text-gray-600 max-w-3xl mx-auto">
            Присоединяйтесь к успешным компаниям по всей России!
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20  rounded-2xl p-8 shadow-msd w-full">
          <div className="mx-auto w-full">
            <div className="text-center mb-12 w-full">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Частые вопросы
              </h2>
              <p className="text-lg text-gray-600">
                Всё, что вам нужно знать о партнёрстве
              </p>
            </div>

            <div className="space-y-4 w-full">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-blue-200"
                >
                  <button
                    className={`w-full flex items-center p-6 text-left hover:bg-gray-50 transition-colors ${
                      activeIndex === index ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => toggleAccordion(index)}
                  >
                    <div className="flex-shrink-0">{faq.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">
                      {faq.question}
                    </h3>
                    <div className="ml-auto">
                      {activeIndex === index ? (
                        <ChevronUp className="text-gray-500" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-500" size={20} />
                      )}
                    </div>
                  </button>

                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      activeIndex === index ? 'max-h-40 pb-6' : 'max-h-0'
                    }`}
                  >
                    <div className="pl-9 text-gray-600">{faq.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="contact"
          className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-gray-200"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-sm">
              <Mail className="text-blue-600 mr-2" size={18} />
              <span className="font-medium text-gray-800 font-nekstregular">
                Свяжитесь с нами
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Готовы начать сотрудничество?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Оставьте заявку и наш менеджер свяжется с вами для обсуждения
              деталей партнёрства.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contacts"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2 font-nekstmedium"
              >
                Оставить заявку <Handshake size={20} />
              </Link>
              <Link
                href="/signup"
                className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-3 rounded-lg font-medium border border-gray-300 transition-all hover:shadow-lg flex items-center justify-center gap-2 font-nekstmedium"
              >
                <User width={22} height={22} /> Зарегистрироваться
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
