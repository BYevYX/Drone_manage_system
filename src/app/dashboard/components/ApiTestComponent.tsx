'use client';

import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { apiClient } from '../../services/api';

interface ApiTestResult {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  data?: unknown;
}

export default function ApiTestComponent() {
  const [tests, setTests] = useState<ApiTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runApiTests = async () => {
    setIsRunning(true);
    const testResults: ApiTestResult[] = [];

    // Test endpoints
    const endpoints = [
      {
        name: 'Orders',
        test: () => apiClient.getOrders(),
      },
      {
        name: 'Drones',
        test: () => apiClient.getDrones(),
      },
      {
        name: 'Materials',
        test: () => apiClient.getMaterials(),
      },
      {
        name: 'Fields',
        test: () => apiClient.getFields(),
      },
      {
        name: 'Users',
        test: () => apiClient.getUsers(),
      },
    ];

    for (const endpoint of endpoints) {
      const result: ApiTestResult = {
        endpoint: endpoint.name,
        status: 'loading',
        message: 'Тестирование...',
      };

      testResults.push(result);
      setTests([...testResults]);

      try {
        const data = await endpoint.test();
        result.status = 'success';
        result.message = `Успешно загружено ${Array.isArray(data) ? data.length : 1} записей`;
        result.data = data;
      } catch (error) {
        result.status = 'error';
        result.message = (error as Error).message;
      }

      setTests([...testResults]);
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runApiTests();
  }, []);

  const getStatusIcon = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Тест подключения к API</h3>
        <button
          onClick={runApiTests}
          disabled={isRunning}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Тестирование...' : 'Повторить тест'}
        </button>
      </div>

      <div className="space-y-3">
        {tests.map((test, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="font-medium">{test.endpoint}</div>
                <div className="text-sm text-gray-600">{test.message}</div>
                {test.data && test.status === 'success' && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Показать данные
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Нажмите &quot;Повторить тест&quot; для проверки API
        </div>
      )}
    </div>
  );
}