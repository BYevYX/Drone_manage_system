// export { default } from '../pages/home/ui/Home';
'use client';
import Image from 'next/image';
import TypingEffect from 'react-typed.ts';

import {
  GraduationCap,
  DollarSign,
  Droplet,
  CloudRain,
  CheckCircle,
  Library,
  ChevronDown,
  BarChart2,
  Shield,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react';
import Snowfall from 'react-snowfall';
import { InView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import React from 'react';
import Header from '../shared/ui/Header';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Footer from '../shared/ui/Footer';
import { ReviewsSection } from './reviews/components/ReviewsSection';

export default function page() {
  const { ref, inView } = useInView({
    triggerOnce: true, // Анимация сработает только один раз, когда элемент впервые попадет в видимую часть экрана
    threshold: 0.1, // Элемент должен быть на 50% видимым, чтобы анимация начала работать
  });
  return (
    <div className="wrapper">
      <Header></Header>
      <Snowfall
        snowflakeCount={100} // количество снежинок
        color="rgba(255, 255, 255, 0.7)"
        radius={[1, 5]} // размер снежинок
        speed={[0.5, 1.5]} // скорость падения
        style={{
          // position: '',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />

      <div className="relative h-[650px] w-full flex items-center justify-center overflow-hidden">
        {/* Фон с блюром */}
        <div className="absolute inset-0">
          {/* Контейнер для блюра */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-[url(/pages/main/drone_12.jpg)] bg-cover bg-center"
              style={{
                filter: 'blur(10px)',
                transform: 'scale(1.05)', // Компенсируем размытие краев
              }}
            />
          </div>

          {/* Затемнение и градиент */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>

        {/* Контент с фиксированной высотой */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-white px-4">
          {/* Фиксированный контейнер для текста */}
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
            {/* Анимированная иконка */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                type: 'spring',
                stiffness: 100,
              }}
              className="mb-8"
            ></motion.div>

            {/* Контейнер с фиксированной высотой для typing effect */}
            <div className="h-25 md:h-25 flex items-center justify-center w-full mb-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-4xl md:text-6xl font-nekstmedium text-center w-full leading-tight"
              >
                <TypingEffect
                  strings={[
                    'ДронАгро',
                    'Инновационная платформа для агробизнеса',
                    'Будущее сельского хозяйства уже здесь!',
                  ]}
                  typeSpeed={50}
                  backSpeed={30}
                  loop
                  showCursor
                  cursorChar="|"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-300 "
                  // wrapperClassName="inline-block" // Добавляем для стабильности
                />
              </motion.div>
            </div>

            {/* Подзаголовок */}
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="font-nekstregular text-xl md:text-2xl text-center max-w-2xl mx-auto mb-8 text-white/90"
            >
              Платформа для автоматизации сельскохозяйственных процессов с
              использованием БПЛА
            </motion.div> */}

            {/* Кнопки */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.8,
                ease: 'easeOut',
              }}
              className="flex flex-col sm:flex-row gap-4 items-center mt-10 mb-16"
            >
              <div className="btn-wrapper">
                <div className="btn-wrapper">
                  <Link href="/services">
                    <button className="services-btn ">
                      <div className="dots_border"></div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="sparkle"
                      >
                        <path
                          className="path"
                          stroke-linejoin="round"
                          stroke-linecap="round"
                          stroke="black"
                          fill="black"
                          d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z"
                        ></path>
                        <path
                          className="path"
                          stroke-linejoin="round"
                          stroke-linecap="round"
                          stroke="black"
                          fill="black"
                          d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z"
                        ></path>
                        <path
                          className="path"
                          stroke-linejoin="round"
                          stroke-linecap="round"
                          stroke="black"
                          fill="black"
                          d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z"
                        ></path>
                      </svg>
                      <span className="text_button text-[17px] font-nekstsemibold ">
                        ПРОСМОТРЕТЬ УСЛУГИ
                      </span>
                    </button>
                  </Link>
                </div>
              </div>

              <Link href="/signup">
                <button className="signup-btn text-[17px] font-nekstmedium">
                  ЗАРЕГИСТРИРОВАТЬСЯ
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Анимированная стрелка вниз */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              delay: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-10"
          >
            <ChevronDown className="w-8 h-8 text-white/80" />
          </motion.div>
        </div>
      </div>
      <>
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-nekstmedium text-gray-900 mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">
                  Инновационная платформа
                </span>{' '}
                для агробизнеса
              </h2>
              {/* <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Автоматизация сельскохозяйственных процессов с помощью БПЛА
              </p> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-nekstmedium text-gray-800 mb-6">
                    Упростите обработку полей с нами
                  </h3>
                  <p className="text-lg text-gray-600 mb-8 font-nekstregular">
                    Мы предоставляем комплексные решения для автоматизации
                    вашего агробизнеса с использованием современных дронов и
                    технологий анализа данных.
                  </p>
                  <ul className="space-y-4 font-nekstregular text-[16px] ">
                    {[
                      'Автоматическое планирование маршрутов',
                      'Упрощение управления полями и заявками',
                      'Подробная аналитика и отчетность',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative h-96 rounded-2xl overflow-hidden shadow-xl"
              >
                <Image
                  src="/pages/main/drone_13.jpg"
                  alt="Дрон в работе"
                  fill
                  className="object-cover"
                  quality={100}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-nekstmedium text-gray-900 mb-4">
                Наши <span className="text-green-600">услуги</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-nekstregular">
                Полный спектр услуг для вашего сельхозпредприятия
              </p>
            </div>

            <div className="grid grid-cols-1 font-nekstregular md:grid-cols-3 gap-8 ">
              {[
                {
                  title: 'Орошение полей',
                  description:
                    'Точное внесение жидких удобрений и средств защиты растений',
                  image: '/pages/main/drone_1.jpg',
                  icon: <Droplet className="w-8 h-8 text-blue-500" />,
                },
                {
                  title: 'Мониторинг посевов',
                  description:
                    'Анализ состояния растений с помощью мультиспектральных камер',
                  image: '/pages/main/drone_6.png',
                  icon: <BarChart2 className="w-8 h-8 text-green-500" />,
                },
                {
                  title: 'Обработка полей',
                  description:
                    'Эффективная защита растений с минимальными затратами',
                  image: '/pages/main/drone_7.jpg',
                  icon: <Shield className="w-8 h-8 text-purple-500" />,
                },
              ].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="relative h-60">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {service.icon}
                      </div>
                      <h3 className="text-xl font-nekstmedium text-gray-800">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <Link
                      href="#"
                      className="inline-flex items-center text-green-600 font-medium"
                    >
                      Подробнее <ChevronRight className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-br from-green-600 to-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-nekstmedium mb-4">
                Как это работает?
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Простой процесс заказа и выполнения работ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Регистрация',
                  description: 'Создайте аккаунт на платформе',
                },
                {
                  step: '02',
                  title: 'Заявка',
                  description: 'Оформите заказ на необходимые услуги',
                },
                {
                  step: '03',
                  title: 'Планирование',
                  description: 'Наши специалисты разработают оптимальный план',
                },
                {
                  step: '04',
                  title: 'Выполнение',
                  description: 'Дроны выполнят работы с максимальной точностью',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
                >
                  <div className="text-4xl font-nekstmedium text-green-300 mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-nekstmedium mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/80">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-nekstmedium text-gray-900 mb-4">
                Преимущества работы с нами
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Почему сельхозпредприятия выбирают нашу платформу
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <DollarSign className="w-8 h-8 text-green-500" />,
                  title: 'Экономия средств',
                  description:
                    'Сокращение расходов на топливо, персонал и технику',
                },
                {
                  icon: <Clock className="w-8 h-8 text-blue-500" />,
                  title: 'Экономия времени',
                  description: 'Обработка полей быстрее традиционных методов',
                },
                {
                  icon: <CheckCircle className="w-8 h-8 text-purple-500" />,
                  title: 'Точность обработки',
                  description:
                    'Обеспечивается высокая точность внесения препаратов с незначительным отклонением.',
                },
                {
                  icon: <CloudRain className="w-8 h-8 text-yellow-500" />,
                  title: 'Работа в любую погоду',
                  description:
                    'Возможность обработки при высокой влажности почвы',
                },
                {
                  icon: <MapPin className="w-8 h-8 text-red-500" />,
                  title: 'Сложный рельеф',
                  description:
                    'Эффективная работа на участках с перепадами высот',
                },
                {
                  icon: <BarChart2 className="w-8 h-8 text-indigo-500" />,
                  title: 'Аналитика',
                  description:
                    'Детальные отчеты и рекомендации по улучшению урожайности',
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-nekstmedium text-gray-800 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#3a3a3a] text-white rounded-t-[40px]">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-nekstmedium mb-6">
                Готовы оптимизировать ваше сельхозпроизводство?
              </h2>
              <p className="text-xl text-white/90 mb-8 ">
                Оставьте заявку и наш специалист свяжется с вами для
                консультации
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={'/contacts'}>
                  {' '}
                  <button className="px-8 py-3 font-nekstsemibold rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all shadow-lg">
                    ОСТАВИТЬ ЗАЯВКУ
                  </button>
                </Link>

                <Link
                  href={'/contacts'}
                  className="px-8 py-3 font-nekstsemibold rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-all"
                >
                  ЗАКАЗАТЬ ЗВОНОК
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <ReviewsSection />

        <Footer />
      </>
    </div>
  );
}
