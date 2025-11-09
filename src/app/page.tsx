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
import { InView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import React from 'react';
import Header from '../shared/ui/Header';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Footer from '../shared/ui/Footer';
import { ReviewsSection } from './reviews/components/ReviewsSection';

const benefits = [
  {
    icon: <GraduationCap className="w-12 h-12 text-red-500" />,
    title: '1',
    text: 'Нет необходимости находить, учить и контролировать людей, мы это сделаем за Вас.',
  },
  {
    icon: <DollarSign className="w-12 h-12 text-green-500" />,
    title: '2',
    text: 'Позволяем значительно сократить объемы воды и затраты на спецтехнику, повысить выручку за счет отсутствия колеи.',
  },
  {
    icon: <Droplet className="w-12 h-12 text-blue-500" />,
    title: '3',
    text: 'Повышаем эффективность действия препарата за счет омывания культуры. Капли прилипают с обеих сторон листа при одной обработке.',
  },
  {
    icon: <CloudRain className="w-12 h-12 text-gray-700" />,
    title: '4',
    text: 'Производим обработки на влажных почвах, по росе, при тумане, сразу после дождя.',
  },
];
export default function page() {
  const { ref, inView } = useInView({
    triggerOnce: true, // Анимация сработает только один раз, когда элемент впервые попадет в видимую часть экрана
    threshold: 0.1, // Элемент должен быть на 50% видимым, чтобы анимация начала работать
  });
  return (
    <div className="wrapper">
      <Header></Header>

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
            <div className="h-40 md:h-40 flex items-center justify-center w-full mb-4">
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
                    'Интеллектуальная платформа для агробизнеса',
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="font-nekstregular text-xl md:text-2xl text-center max-w-2xl mx-auto mb-8 text-white/90"
            >
              Платформа для автоматизации сельскохозяйственных процессов с
              использованием БПЛА
            </motion.div>

            {/* Кнопки */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.8,
                ease: 'easeOut',
              }}
              className="flex flex-col sm:flex-row gap-4 items-center mb-16"
            >
              <Link href={'/services'}>
                <button className="px-8 py-3 font-nekstsemibold rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  ПРОСМОТРЕТЬ УСЛУГИ
                </button>
              </Link>

              <Link href={'/signup'}>
                <button className="px-8 py-3 font-nekstsemibold rounded-lg bg-transparent border-2 border-white/30 hover:border-white/60 cursor-pointer transition-all duration-300 hover:bg-white/10 backdrop-blur-sm">
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
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Автоматизация сельскохозяйственных процессов с помощью БПЛА
              </p>
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
                  <ul className="space-y-4 text-[16px] ">
                    {[
                      'Автоматическое планирование маршрутов',
                      'Реальный мониторинг выполнения работ',
                      'Интеграция с картографическими сервисами',
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
              {[
                {
                  title: 'Орошение полей',
                  description: 'Точное внесение жидких удобрений и СЗР',
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
                    'Сокращение расходов на топливо, персонал и технику до 40%',
                },
                {
                  icon: <Clock className="w-8 h-8 text-blue-500" />,
                  title: 'Экономия времени',
                  description:
                    'Обработка полей в 3-5 раз быстрее традиционных методов',
                },
                {
                  icon: <CheckCircle className="w-8 h-8 text-purple-500" />,
                  title: 'Точность обработки',
                  description: 'Погрешность внесения препаратов не более 2-3%',
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

                <button className="px-8 py-3 font-nekstsemibold rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-all">
                  ЗАКАЗАТЬ ЗВОНОК
                </button>
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
