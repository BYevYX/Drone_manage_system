'use client';

import { Calculator, FileText, MapPin, User } from 'lucide-react';
import React, { useState } from 'react';

interface PlotOwnerData {
  fullName: string;
  phone: string;
  email: string;
  documentType: 'passport' | 'inn' | 'other';
  documentNumber: string;
  address: string;
}

interface PlotParameters {
  area: number;
  perimeter: number;
  coordinates: { lat: number; lng: number }[];
  soilType?: string;
  landCategory?: string;
}

interface CadastralPlotFormProps {
  onSubmit: (data: {
    cadastralNumber?: string;
    plotParameters?: PlotParameters;
    ownerData: PlotOwnerData;
    useCadastralNumber: boolean;
  }) => void;
  onCancel: () => void;
}

const CadastralPlotForm: React.FC<CadastralPlotFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [useCadastralNumber, setUseCadastralNumber] = useState(true);
  const [cadastralNumber, setCadastralNumber] = useState('');
  const [plotParameters, setPlotParameters] = useState<PlotParameters>({
    area: 0,
    perimeter: 0,
    coordinates: [],
  });
  const [ownerData, setOwnerData] = useState<PlotOwnerData>({
    fullName: '',
    phone: '',
    email: '',
    documentType: 'passport',
    documentNumber: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [cadastralData, setCadastralData] = useState<{
    area: number;
    perimeter: number;
    coordinates: { lat: number; lng: number }[];
    soilType: string;
    landCategory: string;
    owner: {
      fullName: string;
      address: string;
    };
  } | null>(null);

  const handleCadastralLookup = async () => {
    if (!cadastralNumber) return;

    setIsLoading(true);
    try {
      // Simulate API call to cadastral service
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock cadastral data
      const mockData = {
        area: 45.7,
        perimeter: 850,
        coordinates: [
          { lat: 55.7558, lng: 37.6173 },
          { lat: 55.7565, lng: 37.619 },
          { lat: 55.757, lng: 37.618 },
          { lat: 55.7563, lng: 37.6163 },
        ],
        soilType: 'Чернозем обыкновенный',
        landCategory: 'Земли сельскохозяйственного назначения',
        owner: {
          fullName: 'Иванов Иван Иванович',
          address: 'г. Москва, ул. Примерная, д. 123',
        },
      };

      setCadastralData(mockData);
      setPlotParameters({
        area: mockData.area,
        perimeter: mockData.perimeter,
        coordinates: mockData.coordinates,
        soilType: mockData.soilType,
        landCategory: mockData.landCategory,
      });

      if (mockData.owner) {
        setOwnerData((prev) => ({
          ...prev,
          fullName: mockData.owner.fullName,
          address: mockData.owner.address,
        }));
      }
    } catch (error) {
      console.error('Ошибка получения кадастровых данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCoordinate = () => {
    setPlotParameters((prev) => ({
      ...prev,
      coordinates: [...prev.coordinates, { lat: 0, lng: 0 }],
    }));
  };

  const updateCoordinate = (
    index: number,
    field: 'lat' | 'lng',
    value: number,
  ) => {
    setPlotParameters((prev) => ({
      ...prev,
      coordinates: prev.coordinates.map((coord, i) =>
        i === index ? { ...coord, [field]: value } : coord,
      ),
    }));
  };

  const removeCoordinate = (index: number) => {
    setPlotParameters((prev) => ({
      ...prev,
      coordinates: prev.coordinates.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      cadastralNumber: useCadastralNumber ? cadastralNumber : undefined,
      plotParameters: !useCadastralNumber ? plotParameters : undefined,
      ownerData,
      useCadastralNumber,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Данные участка и владельца
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Выбор способа задания участка */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Способ задания участка
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="plotMethod"
                checked={useCadastralNumber}
                onChange={() => setUseCadastralNumber(true)}
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">По кадастровому номеру</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="plotMethod"
                checked={!useCadastralNumber}
                onChange={() => setUseCadastralNumber(false)}
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">
                Задать параметры участка вручную
              </span>
            </label>
          </div>
        </div>

        {/* Кадастровый номер */}
        {useCadastralNumber && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Кадастровый номер участка *
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={cadastralNumber}
                  onChange={(e) => setCadastralNumber(e.target.value)}
                  placeholder="XX:XX:XXXXXXX:XX"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={handleCadastralLookup}
                  disabled={!cadastralNumber || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Получить данные
                </button>
              </div>
            </div>

            {cadastralData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">
                  Данные получены из кадастра:
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Площадь:</span>
                    <span className="ml-2 font-medium">
                      {cadastralData.area} га
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Периметр:</span>
                    <span className="ml-2 font-medium">
                      {cadastralData.perimeter} м
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Тип почвы:</span>
                    <span className="ml-2 font-medium">
                      {cadastralData.soilType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Категория земель:</span>
                    <span className="ml-2 font-medium">
                      {cadastralData.landCategory}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Параметры участка */}
        {!useCadastralNumber && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Параметры участка
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Площадь участка (га) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={plotParameters.area}
                  onChange={(e) =>
                    setPlotParameters((prev) => ({
                      ...prev,
                      area: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Периметр (м)
                </label>
                <input
                  type="number"
                  value={plotParameters.perimeter}
                  onChange={(e) =>
                    setPlotParameters((prev) => ({
                      ...prev,
                      perimeter: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Координаты точек на периметре
                </label>
                <button
                  type="button"
                  onClick={addCoordinate}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Добавить точку
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {plotParameters.coordinates.map((coord, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-600 w-12">
                      #{index + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Широта"
                        value={coord.lat}
                        onChange={(e) =>
                          updateCoordinate(
                            index,
                            'lat',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Долгота"
                        value={coord.lng}
                        onChange={(e) =>
                          updateCoordinate(
                            index,
                            'lng',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCoordinate(index)}
                      className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Данные владельца участка */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            Данные владельца участка
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ФИО владельца *
              </label>
              <input
                type="text"
                value={ownerData.fullName}
                onChange={(e) =>
                  setOwnerData((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон *
              </label>
              <input
                type="tel"
                value={ownerData.phone}
                onChange={(e) =>
                  setOwnerData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+7 (999) 123-45-67"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={ownerData.email}
                onChange={(e) =>
                  setOwnerData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип документа
              </label>
              <select
                value={ownerData.documentType}
                onChange={(e) =>
                  setOwnerData((prev) => ({
                    ...prev,
                    documentType: e.target.value as
                      | 'passport'
                      | 'inn'
                      | 'other',
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="passport">Паспорт</option>
                <option value="inn">ИНН</option>
                <option value="other">Другой</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер документа
              </label>
              <input
                type="text"
                value={ownerData.documentNumber}
                onChange={(e) =>
                  setOwnerData((prev) => ({
                    ...prev,
                    documentNumber: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес владельца
              </label>
              <input
                type="text"
                value={ownerData.address}
                onChange={(e) =>
                  setOwnerData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Отмена
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                // Сохранить данные как черновик
                console.log('Сохранение черновика...');
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Сохранить данные о заказе
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Сделать заказ
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CadastralPlotForm;
