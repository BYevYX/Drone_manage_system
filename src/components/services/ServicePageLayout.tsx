'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, FileText, Phone } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import Footer from '@/src/shared/ui/Footer';
import Header from '@/src/shared/ui/Header';

interface ServiceFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TechnicalSpec {
  parameter: string;
  value: string;
  unit?: string;
}

interface WorkExample {
  title: string;
  description: string;
  area: string;
  duration: string;
  result: string;
  image?: string;
}

interface PricingTier {
  name: string;
  price: string;
  unit: string;
  features: string[];
  popular?: boolean;
}

interface ServicePageProps {
  title: string;
  subtitle: string;
  description: string;
  heroImage?: string;
  features: ServiceFeature[];
  technicalSpecs: TechnicalSpec[];
  workExamples: WorkExample[];
  pricing: PricingTier[];
  benefits: string[];
  serviceType: string;
}

/**
 * Service page layout component with optimized performance
 * Provides comprehensive service information with interactive elements
 */
export default function ServicePageLayout({
  title,
  subtitle,
  description,
  heroImage,
  features,
  technicalSpecs,
  workExamples,
  pricing,
  benefits,
  serviceType,
}: ServicePageProps) {
  const [selectedExample, setSelectedExample] = useState(0);

  /**
   * Handle service order with proper error handling
   */
  const handleOrderService = useCallback(() => {
    try {
      // Use Next.js router for better performance instead of window.location
      const url = `/services/drone-services?service=${encodeURIComponent(serviceType)}`;
      window.location.href = url;
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Ошибка при переходе к заказу услуги');
    }
  }, [serviceType]);

  /**
   * Handle consultation request
   */
  const handleConsultation = useCallback(() => {
    toast.success(
      'Заявка на консультацию отправлена! Мы свяжемся с вами в течение часа.',
      {
        duration: 4000,
        icon: '📞',
      },
    );
  }, []);

  /**
   * Handle work example selection
   */
  const handleExampleSelect = useCallback(
    (index: number) => {
      if (index >= 0 && index < workExamples.length) {
        setSelectedExample(index);
      }
    },
    [workExamples.length],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к услугам
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
              <p className="text-xl mb-6 text-blue-100">{subtitle}</p>
              <p className="text-lg mb-8 text-white/90">{description}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleOrderService}
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Заказать услугу
                </button>
                <button
                  onClick={handleConsultation}
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Получить консультацию
                </button>
              </div>
            </div>

            {heroImage && (
              <div className="relative">
                <img
                  src={heroImage}
                  alt={title}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Преимущества услуги
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Современные технологии и профессиональный подход для достижения
              лучших результатов
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Технические характеристики
            </h2>
            <p className="text-lg text-gray-600">
              Подробная информация о параметрах и возможностях оборудования
            </p>
          </motion.div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {technicalSpecs.map((spec, index) => (
                <div
                  key={index}
                  className="p-6 border-b border-r border-gray-200 last:border-r-0"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {spec.parameter}
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {spec.value}
                    {spec.unit && (
                      <span className="text-sm text-gray-500 ml-1">
                        {spec.unit}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Work Examples */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Примеры выполненных работ
            </h2>
            <p className="text-lg text-gray-600">
              Реальные кейсы и результаты наших проектов
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {workExamples.map((example, index) => (
                <button
                  key={`example-${index}`}
                  onClick={() => handleExampleSelect(index)}
                  className={`w-full text-left p-6 rounded-lg border-2 transition-colors ${
                    selectedExample === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-pressed={selectedExample === index}
                  aria-label={`Выбрать пример работы: ${example.title}`}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {example.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{example.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Площадь:</span>
                      <p className="font-semibold">{example.area}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Время:</span>
                      <p className="font-semibold">{example.duration}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Результат:</span>
                      <p className="font-semibold text-green-600">
                        {example.result}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
              {workExamples[selectedExample]?.image ? (
                <img
                  src={workExamples[selectedExample].image}
                  alt={workExamples[selectedExample].title}
                  className="rounded-lg shadow-lg max-w-full h-auto"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Image loading error:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4" />
                  <p>Изображение проекта</p>
                  <p className="text-sm mt-2">
                    {workExamples[selectedExample]?.title}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Стоимость услуг
            </h2>
            <p className="text-lg text-gray-600">
              Прозрачные цены без скрытых платежей
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pricing.map((tier, index) => (
              <motion.div
                key={`pricing-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-lg shadow-lg p-8 relative ${
                  tier.popular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Популярный
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {tier.name}
                  </h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {tier.price}
                    <span className="text-sm text-gray-500 ml-1">
                      {tier.unit}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li
                      key={`feature-${index}-${featureIndex}`}
                      className="flex items-center"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleOrderService}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    tier.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Выбрать план
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Почему выбирают нас
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={`benefit-${index}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center p-4 bg-green-50 rounded-lg"
              >
                <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0" />
                <span className="text-gray-900">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Готовы начать работу?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Свяжитесь с нами для получения персонального предложения
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleOrderService}
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Заказать услугу
              </button>
              <Link
                href="/contacts"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Связаться с нами
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
