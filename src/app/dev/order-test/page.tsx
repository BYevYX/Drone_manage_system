'use client';

import { useState } from 'react';
import { ArrowLeft, Settings, TestTube } from 'lucide-react';
import Link from 'next/link';

import ServiceSelectionWizard from '@/src/components/services/ServiceSelectionWizard';
import CadastralPlotForm from '@/src/components/orders/CadastralPlotForm';
import VegetationIndexSelector from '@/src/components/orders/VegetationIndexSelector';

type TestMode = 'wizard' | 'cadastral' | 'vegetation';

export default function OrderTestPage() {
  const [testMode, setTestMode] = useState<TestMode>('wizard');
  const [selectedVegetationIndex, setSelectedVegetationIndex] = useState<string | null>(null);

  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Страница недоступна
          </h1>
          <p className="text-gray-600 mb-6">
            Эта страница доступна только в режиме разработки
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Development Header */}
      <div className="bg-yellow-500 text-black py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            <span className="font-medium">Тестирование функциональности заказов</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1 bg-black/10 rounded hover:bg-black/20 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Test Mode Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Выберите компонент для тестирования
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTestMode('wizard')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                testMode === 'wizard'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Мастер создания заказа
              </h3>
              <p className="text-sm text-gray-600">
                Полный процесс создания заказа с выбором услуг, дронов, материалов и параметров
              </p>
            </button>

            <button
              onClick={() => setTestMode('cadastral')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                testMode === 'cadastral'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Кадастровые данные
              </h3>
              <p className="text-sm text-gray-600">
                Форма ввода кадастрового номера, параметров участка и данных владельца
              </p>
            </button>

            <button
              onClick={() => setTestMode('vegetation')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                testMode === 'vegetation'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Вегетационные индексы
              </h3>
              <p className="text-sm text-gray-600">
                Выбор и настройка обработки с использованием карт вегетационных индексов
              </p>
            </button>
          </div>
        </div>

        {/* Test Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {testMode === 'wizard' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Мастер создания заказа
              </h3>
              <ServiceSelectionWizard
                onComplete={(orderData) => {
                  console.log('Order completed:', orderData);
                  alert('Заказ создан! Проверьте консоль для деталей.');
                }}
                onCancel={() => {
                  console.log('Order cancelled');
                  alert('Создание заказа отменено');
                }}
              />
            </div>
          )}

          {testMode === 'cadastral' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Форма кадастровых данных
              </h3>
              <CadastralPlotForm
                onSubmit={(data) => {
                  console.log('Cadastral data submitted:', data);
                  alert('Данные участка сохранены! Проверьте консоль для деталей.');
                }}
                onCancel={() => {
                  console.log('Cadastral form cancelled');
                  alert('Ввод данных отменен');
                }}
              />
            </div>
          )}

          {testMode === 'vegetation' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Выбор вегетационных индексов
              </h3>
              <VegetationIndexSelector
                onIndexSelect={(indexId) => {
                  setSelectedVegetationIndex(indexId);
                  console.log('Vegetation index selected:', indexId);
                }}
                selectedIndex={selectedVegetationIndex}
              />
              
              {selectedVegetationIndex && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">
                    Результат тестирования:
                  </h4>
                  <p className="text-green-700">
                    Выбран индекс: <strong>{selectedVegetationIndex.toUpperCase()}</strong>
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Номер индекса будет внесен в таблицу заказов
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Development Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">
            Информация для разработчиков
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Эта страница доступна только в режиме разработки (NODE_ENV=development)</li>
            <li>• Все действия логируются в консоль браузера</li>
            <li>• Для обхода аутентификации установите NEXT_PUBLIC_BYPASS_AUTH=true</li>
            <li>• API вызовы могут быть заглушены для тестирования UI</li>
          </ul>
        </div>
      </div>
    </div>
  );
}