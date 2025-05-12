// export { default } from '../pages/home/ui/Home';
'use client';
import Image from 'next/image';
import {
  GraduationCap,
  DollarSign,
  Droplet,
  CloudRain,
  CheckCircle,
} from 'lucide-react';
import { InView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import React from 'react';
import Header from '../shared/ui/Header';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Footer from '../shared/ui/Footer';

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
      <div className="h-[80vh]  w-full bg-[url('/pages/main/drone_7.jpg')] bg-cover bg-[0px_-70px] bg-no-repeat ">
        <div className="w-full h-full bg-black/65">
          {' '}
          <div className="container text-white overflow-hidden h-full">
            <div className="w-full h-full flex flex-wrap items-center ">
              <div className=" ">
                {/* <p className="leading-20 text-[70px] w-[800px] ml-[3px] font-nekstmedium">
                  ДронАгро
                </p> */}
                <div className="flex justify-center items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-[70px] w-[800px] ml-[3px] font-nekstmedium"
                  >
                    ДронАгро
                  </motion.div>
                </div>
                <div className="">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="font-nekstregular mt-[10px] mb-[20px] text-[20px] w-[500px]  "
                  >
                    Платформа для управления процессами с использованием дронов
                    в сельском хозяйстве
                  </motion.div>
                </div>
                <div className="">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="font-nekstregular mt-[10px] mb-[20px] text-[20px] w-[500px]  "
                  >
                    <button className="px-[30px] py-[10px] font-nekstsemibold rounded-[5px] bg-green-500 hover:bg-green-600 cursor-pointer duration-[0.2s] ">
                      ПРОСМОТРЕТЬ УСЛУГИ
                    </button>
                  </motion.div>
                </div>
                {/* <p className="font-nekstregular mt-[10px] mb-[20px] text-[20px] w-[500px]">
                  {' '}
                  Платформа для управления процессами с использованием дронов в
                  сельском хозяйстве
                </p> */}
                {/* <button className="px-[30px] py-[10px] font-nekstsemibold rounded-[5px] bg-green-500 hover:bg-green-600 cursor-pointer duration-[0.2s] ">
                  ПРОСМОТРЕТЬ УСЛУГИ
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="w-full h-[100vh] flex items-center justify-between">
          <div className="">
            {/* <p className="text-green-500 text-[20px] font-semibold">
              Платформа для дронов
            </p> */}
            <motion.div
              ref={ref} // привязываем ref к элементу
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: inView ? 1 : 0, // Когда элемент в поле видимости, opacity будет 1
                y: inView ? 0 : 50, // Когда элемент в поле видимости, он будет на своем месте
              }}
              transition={{ duration: 0.4 }}
              className="text-green-500 text-[20px] font-semibold"
            >
              Платформа для дронов
            </motion.div>
            {/* <p className="font-bold text-[32px]">
              Упростите обработку полей с нами
            </p> */}
            <motion.div
              ref={ref} // привязываем ref к элементу
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: inView ? 1 : 0, // Когда элемент в поле видимости, opacity будет 1
                y: inView ? 0 : 50, // Когда элемент в поле видимости, он будет на своем месте
              }}
              transition={{ duration: 0.5 }}
              className="font-bold text-[32px]"
            >
              Упростите обработку полей с нами
            </motion.div>
            <motion.div
              ref={ref} // привязываем ref к элементу
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: inView ? 1 : 0, // Когда элемент в поле видимости, opacity будет 1
                y: inView ? 0 : 50, // Когда элемент в поле видимости, он будет на своем месте
              }}
              transition={{ duration: 0.9 }}
              className="font-nekstregular w-[500px] text-[#373737]"
            >
              Мы предоставляем услуги по обработке полей с помощью дронов, чтобы
              сделать ваш агробизнес более эффективным.
            </motion.div>
          </div>
          <div className="bg-white w-[400px] h-[500px] relative">
            <motion.div
              ref={ref}
              initial={{
                opacity: 0, // Начальная прозрачность 0 (не видно)
                scale: 1.1, // Начальный масштаб больше, чтобы скрыть края
                backgroundColor: '#ffffff', // Начальный цвет фона (белый)
              }}
              animate={{
                opacity: inView ? 1 : 0, // Конечная прозрачность (полностью видимый, если в области видимости)
                scale: inView ? 1 : 1.1, // Конечный масштаб (нормальный размер, если в области видимости)
                backgroundColor: inView ? '#ffffff00' : '#ffffff', // Фон становится прозрачным
              }}
              transition={{
                duration: 1, // Продолжительность анимации
                ease: 'easeInOut', // Плавная анимация
              }}
              className="overflow-hidden rounded-lg w-full h-full"
            >
              <motion.img
                src="/pages/main/drone_13.jpg" // Здесь ваша картинка
                alt="Sample"
                className="object-cover w-full object-[0px_-100px] bg-red-50 rounded-lg h-full"
              />
            </motion.div>
          </div>
        </div>
      </div>
      <div className="w-full h-[100vh] bg-[#b1b1b139]">
        <div className="container">
          <div className="w-full pt-[100px] px-[20px]">
            <p className="text-green-500 text-[20px] font-semibold">
              Обработка полей дронами
            </p>

            <p className="font-bold text-[32px]">
              Эффективные решения для сельского хозяйства
            </p>

            <div className="w-full flex items-center justify-between mt-[50px] space-x-[20px] min-h-[400px]">
              {/* Первая карточка */}
              <InView triggerOnce>
                {({ inView, ref }) => (
                  <motion.div
                    ref={ref}
                    initial={{
                      opacity: 0,
                      scale: 1.2,
                      backgroundColor: '#ffffff', // Начальный белый фон
                    }}
                    animate={{
                      opacity: inView ? 1 : 0,
                      scale: inView ? 1 : 1.2,
                      backgroundColor: inView ? 'transparent' : '#ffffff', // Становится прозрачным, когда карточка появляется
                    }}
                    transition={{
                      duration: 0.2,
                      ease: 'easeOut',
                    }}
                    className="flex-1 bg-white shadow-[0_0_20px_2px_rgba(0,0,0,0.25)] hover:scale-[1.05] duration-[0.3s] cursor-pointer"
                  >
                    <div className="w-full h-[200px] relative">
                      <Image
                        src="/pages/main/drone_1.jpg"
                        style={{ objectFit: 'cover' }}
                        fill
                        sizes="full"
                        alt="drone"
                      />
                    </div>
                    <div className="w-full h-[150px] bg-white p-[20px]">
                      <div className="flex space-x-[5px] ">
                        <p className="poppins-bold text-[20px]">
                          Орошение полей
                        </p>
                        <Image
                          src="/pages/main/arrow.svg"
                          width={10}
                          height={10}
                          alt="drone"
                        />
                      </div>
                      <p className="text-[#636363] poppins-medium text-[18px]">
                        Эффективное орошение с помощью дронов.
                      </p>
                    </div>
                  </motion.div>
                )}
              </InView>

              {/* Вторая карточка */}
              <InView triggerOnce>
                {({ inView, ref }) => (
                  <motion.div
                    ref={ref}
                    initial={{
                      opacity: 0,
                      scale: 1.2,
                      backgroundColor: '#ffffff',
                    }}
                    animate={{
                      opacity: inView ? 1 : 0,
                      scale: inView ? 1 : 1.2,
                      backgroundColor: inView ? 'transparent' : '#ffffff',
                    }}
                    transition={{
                      duration: 0.3,
                      ease: 'easeOut',
                      delay: 0.1,
                    }}
                    className="flex-1 bg-white shadow-[0_0_20px_2px_rgba(0,0,0,0.25)] hover:scale-[1.05] duration-[0.3s] cursor-pointer"
                  >
                    <div className="w-full h-[200px] relative">
                      <Image
                        src="/pages/main/drone_6.png"
                        style={{ objectFit: 'cover' }}
                        fill
                        sizes="full"
                        alt="drone"
                      />
                    </div>
                    <div className="w-full h-[150px] bg-white p-[20px]">
                      <div className="flex space-x-[5px] ">
                        <p className="poppins-bold text-[20px]">
                          Мониторинг состояния растений
                        </p>
                        <Image
                          src="/pages/main/arrow.svg"
                          width={10}
                          height={10}
                          alt="drone"
                        />
                      </div>
                      <p className="text-[#636363] poppins-medium text-[18px]">
                        Точный мониторинг здоровья ваших растений.
                      </p>
                    </div>
                  </motion.div>
                )}
              </InView>

              {/* Третья карточка */}
              <InView triggerOnce>
                {({ inView, ref }) => (
                  <motion.div
                    ref={ref}
                    initial={{
                      opacity: 0,
                      scale: 1.2,
                      backgroundColor: '#ffffff',
                    }}
                    animate={{
                      opacity: inView ? 1 : 0,
                      scale: inView ? 1 : 1.2,
                      backgroundColor: inView ? 'transparent' : '#ffffff',
                    }}
                    transition={{
                      duration: 0.4,
                      ease: 'easeOut',
                      delay: 0.2,
                    }}
                    className="flex-1 bg-white shadow-[0_0_20px_2px_rgba(0,0,0,0.25)] hover:scale-[1.05] duration-[0.3s] cursor-pointer"
                  >
                    <div className="w-full h-[200px] relative">
                      <Image
                        src="/pages/main/drone_7.jpg"
                        style={{ objectFit: 'cover' }}
                        fill
                        sizes="full"
                        alt="drone"
                      />
                    </div>
                    <div className="w-full h-[150px] bg-white p-[20px]">
                      <div className="flex space-x-[5px] ">
                        <p className="poppins-bold text-[20px]">Обработка</p>
                        <Image
                          src="/pages/main/arrow.svg"
                          width={10}
                          height={10}
                          alt="drone"
                        />
                      </div>
                      <p className="text-[#636363] poppins-medium text-[18px]">
                        Эффективная обработка полей с дронами.
                      </p>
                    </div>
                  </motion.div>
                )}
              </InView>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-[100vh] ">
        <div className="container">
          <div className="w-full pt-[100px] px-[20px]">
            <p className="text-green-500 text-[20px] font-semibold">
              Простота заказа услуг
            </p>

            <p className="font-bold text-[32px]">
              Эффективное управление обработкой полей
            </p>

            <div className="w-full  flex items-center justify-between mt-[50px] space-x-[20px] min-h-[400px]">
              <Link href={'/signup'} className="flex-1">
                {' '}
                <InView triggerOnce>
                  {({ inView, ref }) => (
                    <motion.div
                      ref={ref}
                      initial={{
                        opacity: 0,
                        scale: 1.2,
                        backgroundColor: '#ffffff', // Начальный цвет фона белый
                      }}
                      animate={{
                        opacity: inView ? 1 : 0,
                        scale: inView ? 1 : 1.2,
                        backgroundColor: inView ? 'transparent' : '#ffffff', // Прозрачный при входе в область видимости
                      }}
                      transition={{
                        duration: 0.3,
                        ease: 'easeOut',
                        delay: 0.1,
                      }}
                      className="w-full bg-white shadow-[0_0_20px_2px_rgba(0,0,0,0.25)] hover:bg-gray-300 hover:scale-[1.05] duration-[0.3s] cursor-pointer"
                    >
                      <div className="w-full h-[300px] relative">
                        <Image
                          src="/pages/main/drone_12.jpg"
                          style={{
                            objectFit: 'cover',
                          }}
                          fill
                          sizes="full"
                          alt="drone"
                        />
                      </div>
                      <div className="w-full h-[150px] p-[20px]">
                        <div className="flex space-x-[5px]">
                          <p className="poppins-bold text-[20px]">
                            Регистрация пользователя
                          </p>
                          <Image
                            src="/pages/main/arrow.svg"
                            width={10}
                            height={10}
                            alt="drone"
                          />
                        </div>
                        <p className="text-[#636363] poppins-medium text-[18px]">
                          Присоединяйтесь к нам, зарегистрировавшись на
                          платформе.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </InView>
              </Link>
              <Link href={'/registration'} className="flex-1">
                <InView triggerOnce>
                  {({ inView, ref }) => (
                    <motion.div
                      ref={ref}
                      initial={{
                        opacity: 0,
                        scale: 1.2,
                        backgroundColor: '#ffffff',
                      }}
                      animate={{
                        opacity: inView ? 1 : 0,
                        scale: inView ? 1 : 1.2,
                        backgroundColor: inView ? 'transparent' : '#ffffff',
                      }}
                      transition={{
                        duration: 0.4,
                        ease: 'easeOut',
                        delay: 0.2,
                      }}
                      className="w-full bg-white shadow-[0_0_20px_2px_rgba(0,0,0,0.25)] hover:scale-[1.05] duration-[0.3s] cursor-pointer"
                    >
                      <div className="w-full h-[300px] relative">
                        <Image
                          src="/pages/main/drone_10.jpg"
                          style={{ objectFit: 'cover' }}
                          fill
                          sizes="full"
                          alt="drone"
                        />
                      </div>
                      <div className="w-full h-[150px] bg-white p-[20px]">
                        <div className="flex space-x-[5px] ">
                          <p className="poppins-bold text-[20px]">
                            Заказ услуг
                          </p>
                          <Image
                            src="/pages/main/arrow.svg"
                            width={10}
                            height={10}
                            alt="drone"
                          />
                        </div>
                        <p className="text-[#636363] poppins-medium text-[18px]">
                          Легко заказывайте услуги и управляйте проектами.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </InView>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="py-9 px-4 max-w-[80%] mx-auto text-center">
        <h2 className="text-[30px] font-semibold text-gray-700 mb-10">
          Преимущества работы с нами
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {benefits.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center space-y-4"
            >
              {item.icon}
              <span className="text-gray-100 text-sm">{item.title}</span>
              <p className="text-lg font-nekstregular text-gray-800 max-w-[500px]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
      <div className="w-full flex items-center justify-center h-[400px] bg-gradient-to-r from-[#080808]   to-[#727272]">
        <div className="">
          <p className="text-white font-nekstmedium text-[30px]">
            Ответим на любые вопросы! Звоните! <br></br> Или оставьте заявку и
            мы вам перезвоним!
          </p>
          <div className="flex justify-center mt-[15px]">
            <button className="px-[20px] text-[20px] font-nekstregular py-[5px] bg-green-500 rounded-[20px]">
              Оставить заявку
            </button>
          </div>
        </div>
      </div>
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="text-green-600">Преимущества</span> внесения СЗР{' '}
          <br />и удобрений агродронами
        </h2>
        <hr className="border-t-[2px] w-full border-green-500 my-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
          {[
            {
              title: '+7% прибавки к урожаю',
              description:
                'Отсутствие технологической колеи позволяет существенно увеличить урожайность, сократив потери под колесами наземной техники.',
            },
            {
              title: 'При влажной почве',
              description:
                'БПЛА отлично подходят для работы в условиях повышенной влажности — там, где использование наземной техники невозможно или затруднено.',
            },
            {
              title: 'Сокращение затрат воды',
              description:
                'При использовании агродронов снижается расход воды, используемой для подготовки рабочего раствора СЗР перед применением. Норма вылива составляет от 5л/Га.',
            },
            {
              title: 'Скорость обработки',
              description:
                'Современные БПЛА (DJI Agras T40) способны обрабатывать до 200 Га за смену одним дроном.',
            },
            {
              title: 'Работа в ночное время',
              description:
                'Летающие беспилотники можно использовать в вечернее и ночное время. В это время отсутствуют пчелы, для которых СЗР несут угрозу.',
            },
            {
              title: 'Работа на сложных рельефах',
              description:
                'Беспилотники эффективны в районах со сложным рельефом, например, на фермах с крутыми склонами и удаленными участками. Они снижают трудозатраты и заменяют дорогостоящую пилотируемую авиацию.',
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <CheckCircle className="text-green-500 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-700 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer></Footer>
    </div>
  );
}
