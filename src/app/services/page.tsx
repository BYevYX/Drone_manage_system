'use client';

import { motion } from 'framer-motion';
import {
  Plane,
  Settings,
  FlaskConical,
  MessageSquare,
  ArrowRight,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/src/lib/hooks/useAuth';

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  features: string[];
  href: string;
  estimatedTime: string;
  complexity: 'Простая' | 'Средняя' | 'Сложная';
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'drone-services',
    title: 'Заказ дронов-услуг',
    description:
      'Профессиональные услуги дронов с детализированными параметрами полета для сельского хозяйства',
    icon: <Plane className="h-8 w-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    features: [
      'Опрыскивание и обработка полей',
      'Мониторинг и картографирование',
      'Внесение удобрений и семян',
      'Настройка параметров полета',
      'Планирование маршрутов',
    ],
    href: '/services/drone-services',
    estimatedTime: '15-20 мин',
    complexity: 'Средняя',
  },
  {
    id: 'equipment-info',
    title: 'Информация о дронах и оборудовании',
    description:
      'Размещение подробной информации о дронах и техническом оборудовании с характеристиками',
    icon: <Settings className="h-8 w-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    features: [
      'Технические характеристики',
      'Фотографии и документация',
      'Сертификаты и гарантии',
      'Информация о доступности',
      'Ценообразование',
    ],
    href: '/services/equipment-info',
    estimatedTime: '10-15 мин',
    complexity: 'Простая',
  },
  {
    id: 'materials-data',
    title: 'Данные о материалах для обработки',
    description:
      'Добавление информации о материалах для обработки с техническими спецификациями',
    icon: <FlaskConical className="h-8 w-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    features: [
      'Химический состав и свойства',
      'Целевые культуры и вредители',
      'Методы применения',
      'Требования безопасности',
      'Документация и сертификаты',
    ],
    href: '/services/materials-data',
    estimatedTime: '12-18 мин',
    complexity: 'Сложная',
  },
  {
    id: 'feedback',
    title: 'Отзывы и рекомендации',
    description:
      'Подача отзывов, предложений и рекомендаций по развитию платформы дронов-услуг',
    icon: <MessageSquare className="h-8 w-8" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    features: [
      'Отчеты об ошибках',
      'Предложения по улучшению',
      'Запросы новых функций',
      'Общие отзывы',
      'Техническая поддержка',
    ],
    href: '/services/feedback',
    estimatedTime: '5-10 мин',
    complexity: 'Простая',
  },
];

const complexityColors = {
  Простая: 'text-green-600 bg-green-100',
  Средняя: 'text-yellow-600 bg-yellow-100',
  Сложная: 'text-red-600 bg-red-100',
};

export default function ServicesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleServiceClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Navigation will be handled by Link component
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Какие задачи вы хотите выполнить?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Выберите категорию услуг для создания заказа. Наша интерактивная
            система поможет вам шаг за шагом заполнить все необходимые данные.
          </p>

          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto"
            >
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Для создания заказов необходима авторизация
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Service Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {serviceCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(category.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group"
            >
              <div
                className={`relative overflow-hidden rounded-2xl border border-gray-200 ${category.bgColor} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer`}
                onClick={() => handleServiceClick()}
              >
                {/* Card Content */}
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`p-3 rounded-xl ${category.color} bg-white shadow-sm`}
                    >
                      {category.icon}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${complexityColors[category.complexity]}`}
                      >
                        {category.complexity}
                      </span>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock className="h-4 w-4" />
                        {category.estimatedTime}
                      </div>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {category.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.1 + featureIndex * 0.05,
                        }}
                        className="flex items-center gap-3 text-gray-700"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${category.color.replace('text-', 'bg-')}`}
                        />
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <Link
                      href={isAuthenticated ? category.href : '#'}
                      onClick={(e) => {
                        if (!isAuthenticated) {
                          e.preventDefault();
                          handleServiceClick();
                        }
                      }}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${category.color} bg-white hover:bg-gray-50 shadow-sm hover:shadow-md`}
                    >
                      Начать заказ
                      <ArrowRight
                        className={`h-4 w-4 transition-transform duration-200 ${
                          hoveredCard === category.id ? 'translate-x-1' : ''
                        }`}
                      />
                    </Link>

                    <div className="flex items-center gap-1 text-gray-400">
                      <Zap className="h-4 w-4" />
                      <span className="text-xs">Быстрое оформление</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  initial={false}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Преимущества нашей системы заказов
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-100 rounded-full mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Безопасность данных
                </h3>
                <p className="text-gray-600 text-sm">
                  Все данные защищены современными методами шифрования
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-green-100 rounded-full mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Быстрое оформление
                </h3>
                <p className="text-gray-600 text-sm">
                  Интуитивный интерфейс для быстрого создания заказов
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-100 rounded-full mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Сохранение черновиков
                </h3>
                <p className="text-gray-600 text-sm">
                  Возможность сохранить и продолжить заполнение позже
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
