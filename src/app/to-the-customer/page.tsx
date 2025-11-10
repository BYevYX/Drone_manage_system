import {
  CheckCircle,
  ChevronDown,
  Shield,
  Truck,
  Clock,
  Phone,
  FileText,
  MapPin,
  CreditCard,
} from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';
import Link from 'next/link';

export default function ForCustomersPage() {
  return (
    // добавил text-black на корневой контейнер
    <div className="wrapper font-nekstregular text-black">
      <Header></Header>
      {/* Hero Section */}
      <div className="text-center mb-16 pt-[50px] ">
        <h1 className="text-4xl font-bold text-black mb-4">
          Информация для заказчиков
        </h1>
        <p className="text-xl text-black max-w-3xl mx-auto">
          Полный цикл услуг от профессиональной команды с гарантией качества и
          прозрачными условиями сотрудничества
        </p>
      </div>

      {/* How It Works (закомментировано — при желании можно раскомментировать) */}
      {/* <div className="mb-20">
        <h2 className="text-2xl font-bold text-black mb-8 text-center">
          Как заказать услуги агродронов
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: <FileText className="w-8 h-8 text-blue-500" />,
              title: '1. Оставьте заявку',
              description: 'Через сайт, по телефону или при личном визитом',
            },
            {
              icon: <MapPin className="w-8 h-8 text-green-500" />,
              title: '2. Выезд специалиста',
              description: 'Осмотр полей и составление технического задания',
            },
            {
              icon: <CreditCard className="w-8 h-8 text-purple-500" />,
              title: '3. Заключение договора',
              description: 'Фиксируем сроки, объемы и стоимость работ',
            },
            {
              icon: <Truck className="w-8 h-8 text-orange-500" />,
              title: '4. Выполнение работ',
              description: 'Обработка с онлайн-мониторингом процесса',
            },
          ].map((step, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center"
            >
              <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-black">{step.title}</h3>
              <p className="text-black">{step.description}</p>
            </div>
          ))}
        </div>
      </div> */}

      {/* Benefits */}
      {/* <div className="mb-20">
        <h2 className="text-2xl font-bold text-black mb-8 text-center">
          Почему выбирают нас
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Shield className="w-6 h-6 text-green-500" />,
              title: 'Полная юридическая поддержка',
              description:
                'Все разрешения на полеты, страховка и документооборот',
            },
            {
              icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
              title: 'Контроль качества',
              description:
                'Фото/видео отчеты и дата-аналитика по каждой обработке',
            },
            {
              icon: <Clock className="w-6 h-6 text-purple-500" />,
              title: 'Работаем в вашем ритме',
              description: 'Готовы к срочным выездам в критические периоды',
            },
          ].map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">{benefit.icon}</div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold mb-2 text-black">
                    {benefit.title}
                  </h3>
                  <p className="text-black">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Services Details */}
      {/* <div className="mb-20">
        <h2 className="text-2xl font-bold text-black mb-8 text-center">
          Наши услуги
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-600">
                Стандартные услуги
              </h3>
              <ul className="space-y-3 text-black">
                {[
                  'Опрыскивание СЗР с нормированием расхода',
                  'Листовая подкормка удобрениями',
                  'Десикация перед уборкой',
                  'Обработка садовых культур',
                  'Картография полей (NDVI аналитика)',
                ].map((service, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5 mr-2" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">
                Премиум услуги
              </h3>
              <ul className="space-y-3 text-black">
                {[
                  'Комплексный агросопровождение',
                  'Мониторинг в реальном времени',
                  'Прогнозирование урожайности',
                  'Точное земледелие с ИИ-аналитикой',
                  'Экспресс-лаборатория проб растений',
                ].map((service, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div> */}

      {/* Pricing */}
      <div className="mb-20 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          Стоимость услуг
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              plan: 'Разовое применение',
              price: 'от 1 500 ₽/га',
              features: [
                'Однократная обработка',
                'Базовый отчет',
                'Выезд специалиста',
              ],
            },
            {
              plan: 'Сезонный пакет',
              price: 'от 3 800 ₽/га',
              features: [
                '3-5 обработок за сезон',
                'Расширенная аналитика',
                'Приоритетное обслуживание',
                'Скидка 15%',
              ],
              popular: true,
            },
            {
              plan: 'Годовой контракт',
              price: 'Индивидуально',
              features: [
                'Полный цикл работ',
                'Персональный менеджер',
                'Круглосуточная поддержка',
                'AI-прогнозирование',
              ],
            },
          ].map((pricing, index) => (
            <div
              key={index}
              className={`bg-white p-6 rounded-xl shadow-sm border ${pricing.popular ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-200'}`}
            >
              {pricing.popular && (
                <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                  Популярный выбор
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2 text-black">
                {pricing.plan}
              </h3>
              <p className="text-2xl font-bold mb-4 text-black">
                {pricing.price}
              </p>
              <ul className="space-y-2 text-black">
                {pricing.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={'/contacts'}>
                <button
                  className={`mt-6 w-full py-2 px-4 rounded-lg font-medium ${pricing.popular ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
                >
                  Оставить заявку
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
