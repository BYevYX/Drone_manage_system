'use client';
import { CheckCircle, Home, ShieldCheck, UserPlus2 } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="relative bg-[url(/pages/main/drone_15.jpg)] bg-cover min-h-[100vh] bg-gray-100">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[12px] z-0"></div>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-72px)] relative z-10 p-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-nekstsemibold text-white drop-shadow-xl mb-6 text-center"
        >
          Вход в DroneAgro
        </motion.h1>
        <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl">
          {children}
          <div className="hidden rounded-2xl lg:flex flex-col justify-center bg-gradient-to-br from-[#dceefc] to-[#e5d6d6] w-1/2 p-8 gap-6 font-nekstregular">
            <Link
              href="/"
              className="absolute top-4 right-4 flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-300 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Home size={18} className="text-blue-600" />
              На главную
            </Link>
            <InfoCard
              icon={<ShieldCheck size={32} />}
              title="Защита данных"
              description="Ваши данные надёжно защищены и не передаются третьим лицам."
            />
            <InfoCard
              icon={<CheckCircle size={32} />}
              title="Быстрый вход"
              description="Входите в систему за считанные секунды."
            />
            <InfoCard
              icon={<UserPlus2 size={32} />}
              title="Новый пользователь?"
              description="Зарегистрируйтесь и получите доступ ко всем возможностям платформы."
            />
            <div className="relative p-6 bg-gradient-to-tr from-white via-[#f4f4f4] to-white border border-gray-200 rounded-2xl shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-2">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1">
                    Безопасность данных
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Используем{' '}
                    <span className="font-medium text-black">
                      256-битное шифрование
                    </span>{' '}
                    и современные стандарты безопасности.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-[#313131] bg-white rounded-full p-2 shadow">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-black">{title}</h4>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
    </div>
  );
}
