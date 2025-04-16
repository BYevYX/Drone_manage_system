// export { default } from '../pages/home/ui/Home';
'use client';
import Image from 'next/image';
import { InView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import React from 'react';
import Header from '../shared/ui/Header';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

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
    </div>
  );
}
