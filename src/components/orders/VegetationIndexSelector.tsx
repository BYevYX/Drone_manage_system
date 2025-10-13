'use client';

import { Check, Info, Leaf } from 'lucide-react';
import React, { useState } from 'react';

interface VegetationIndex {
  id: string;
  name: string;
  fullName: string;
  description: string;
  bestFor: string[];
  formula?: string;
  range: {
    min: number;
    max: number;
  };
  interpretation: {
    low: string;
    medium: string;
    high: string;
  };
}

interface VegetationIndexSelectorProps {
  onIndexSelect: (indexId: string | null) => void;
  selectedIndex?: string | null;
}

const vegetationIndices: VegetationIndex[] = [
  {
    id: 'ndvi',
    name: 'NDVI',
    fullName: 'Normalized Difference Vegetation Index',
    description:
      'Наиболее популярный индекс для оценки биомассы и здоровья растений',
    bestFor: ['Оценка биомассы', 'Мониторинг роста', 'Выявление стресса'],
    formula: '(NIR - Red) / (NIR + Red)',
    range: { min: -1, max: 1 },
    interpretation: {
      low: '< 0.3 - Слабая или отсутствующая растительность',
      medium: '0.3 - 0.7 - Умеренная растительность',
      high: '> 0.7 - Густая здоровая растительность',
    },
  },
  {
    id: 'evi',
    name: 'EVI',
    fullName: 'Enhanced Vegetation Index',
    description:
      'Улучшенный индекс, менее чувствительный к атмосферным помехам',
    bestFor: [
      'Густая растительность',
      'Тропические культуры',
      'Лесные массивы',
    ],
    formula: '2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)',
    range: { min: -1, max: 1 },
    interpretation: {
      low: '< 0.2 - Слабая растительность',
      medium: '0.2 - 0.5 - Умеренная растительность',
      high: '> 0.5 - Густая растительность',
    },
  },
  {
    id: 'savi',
    name: 'SAVI',
    fullName: 'Soil Adjusted Vegetation Index',
    description: 'Индекс, скорректированный на влияние почвы',
    bestFor: [
      'Разреженная растительность',
      'Молодые посевы',
      'Засушливые зоны',
    ],
    formula: '(NIR - Red) / (NIR + Red + L) * (1 + L)',
    range: { min: -1, max: 1 },
    interpretation: {
      low: '< 0.2 - Открытая почва',
      medium: '0.2 - 0.5 - Разреженная растительность',
      high: '> 0.5 - Густая растительность',
    },
  },
  {
    id: 'gndvi',
    name: 'GNDVI',
    fullName: 'Green Normalized Difference Vegetation Index',
    description: 'Индекс на основе зеленого канала для оценки хлорофилла',
    bestFor: ['Оценка хлорофилла', 'Стресс растений', 'Азотное питание'],
    formula: '(NIR - Green) / (NIR + Green)',
    range: { min: -1, max: 1 },
    interpretation: {
      low: '< 0.3 - Низкое содержание хлорофилла',
      medium: '0.3 - 0.6 - Нормальное содержание',
      high: '> 0.6 - Высокое содержание хлорофилла',
    },
  },
  {
    id: 'ndre',
    name: 'NDRE',
    fullName: 'Normalized Difference Red Edge',
    description: 'Индекс красного края для точной оценки содержания азота',
    bestFor: ['Содержание азота', 'Стадии роста', 'Точное земледелие'],
    formula: '(NIR - RedEdge) / (NIR + RedEdge)',
    range: { min: -1, max: 1 },
    interpretation: {
      low: '< 0.2 - Недостаток азота',
      medium: '0.2 - 0.5 - Нормальное содержание',
      high: '> 0.5 - Избыток азота',
    },
  },
  {
    id: 'cig',
    name: 'CIG',
    fullName: 'Chlorophyll Index Green',
    description: 'Индекс для оценки содержания хлорофилла через зеленый канал',
    bestFor: ['Хлорофилл', 'Фотосинтез', 'Здоровье листьев'],
    range: { min: 0, max: 10 },
    interpretation: {
      low: '< 2 - Низкий хлорофилл',
      medium: '2 - 6 - Нормальный уровень',
      high: '> 6 - Высокий хлорофилл',
    },
  },
];

const VegetationIndexSelector: React.FC<VegetationIndexSelectorProps> = ({
  onIndexSelect,
  selectedIndex,
}) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [useProcessing, setUseProcessing] = useState(false);

  const handleIndexToggle = (indexId: string) => {
    if (selectedIndex === indexId) {
      onIndexSelect(null);
    } else {
      onIndexSelect(indexId);
    }
  };

  const selectedIndexData = vegetationIndices.find(
    (index) => index.id === selectedIndex,
  );

  return (
    <div className="space-y-6">
      {/* Заголовок и переключатель */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Leaf className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Обработка с использованием карт вегетационных индексов
            </h3>
            <p className="text-sm text-gray-600">
              Выберите индекс для анализа состояния растительности
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useProcessing}
            onChange={(e) => {
              setUseProcessing(e.target.checked);
              if (!e.target.checked) {
                onIndexSelect(null);
              }
            }}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Использовать обработку
          </span>
        </label>
      </div>

      {/* Список индексов */}
      {useProcessing && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vegetationIndices.map((index) => (
              <div
                key={index.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedIndex === index.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleIndexToggle(index.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {index.name}
                      </h4>
                      {selectedIndex === index.id && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {index.fullName}
                    </p>

                    <p className="text-sm text-gray-700 mb-3">
                      {index.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {index.bestFor.slice(0, 2).map((use, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {use}
                        </span>
                      ))}
                      {index.bestFor.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{index.bestFor.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetails(
                        showDetails === index.id ? null : index.id,
                      );
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>

                {/* Детальная информация */}
                {showDetails === index.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {index.formula && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-1">
                          Формула:
                        </h5>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {index.formula}
                        </code>
                      </div>
                    )}

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-1">
                        Диапазон значений:
                      </h5>
                      <p className="text-xs text-gray-600">
                        {index.range.min} до {index.range.max}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-1">
                        Интерпретация:
                      </h5>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-200 rounded"></div>
                          {index.interpretation.low}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                          {index.interpretation.medium}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-200 rounded"></div>
                          {index.interpretation.high}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-1">
                        Лучше всего подходит для:
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {index.bestFor.map((use, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Информация о выбранном индексе */}
          {selectedIndexData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">
                Выбран индекс: {selectedIndexData.name}
              </h4>
              <p className="text-sm text-green-700 mb-2">
                {selectedIndexData.description}
              </p>
              <p className="text-xs text-green-600">
                Номер индекса будет внесен в соответствующее поле таблицы
                заказов
              </p>
            </div>
          )}

          {/* Дополнительная информация */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">
              Информация об обработке
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Обработка выполняется с использованием мультиспектральных
                данных
              </li>
              <li>
                • Результаты предоставляются в виде цветных карт и числовых
                значений
              </li>
              <li>
                • Точность анализа зависит от погодных условий и качества съемки
              </li>
              <li>
                • Рекомендуется проводить съемку в ясную погоду без сильного
                ветра
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VegetationIndexSelector;
