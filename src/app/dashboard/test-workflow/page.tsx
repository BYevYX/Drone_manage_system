'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, Play, RefreshCw, User, Users } from 'lucide-react';
import React, { useState } from 'react';

import { type Order } from '../../services/api';
import OrderStatusTracker from '../components/OrderStatusTracker';
import ReportingWorkflow from '../components/ReportingWorkflow';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  role: 'manager' | 'operator';
  status: 'pending' | 'active' | 'completed';
  component?: React.ReactNode;
}

export default function TestWorkflowPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [mockOrder] = useState<Order>({
    id: 'test-order-001',
    customerId: 'customer-001',
    status: 'new',
    type: 'Опрыскивание',
    description: 'Тестовый заказ для демонстрации полного цикла работы',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedCost: 15000,
    assignedOperatorId: undefined,
    assignedSupplierId: undefined,
  });

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'create-order',
      title: 'Создание заказа',
      description: 'Менеджер создает новый заказ в системе',
      role: 'manager',
      status: 'completed',
    },
    {
      id: 'review-order',
      title: 'Обработка заказа',
      description: 'Менеджер проверяет и утверждает заказ',
      role: 'manager',
      status: 'completed',
    },
    {
      id: 'assign-resources',
      title: 'Назначение ресурсов',
      description: 'Менеджер назначает оператора и поставщика',
      role: 'manager',
      status: 'active',
    },
    {
      id: 'plan-execution',
      title: 'Планирование выполнения',
      description: 'Менеджер составляет план выполнения работ',
      role: 'manager',
      status: 'pending',
    },
    {
      id: 'operator-review',
      title: 'Получение задачи',
      description: 'Оператор получает и принимает задачу',
      role: 'operator',
      status: 'pending',
    },
    {
      id: 'execute-order',
      title: 'Выполнение работ',
      description: 'Оператор выполняет полевые работы',
      role: 'operator',
      status: 'pending',
    },
    {
      id: 'create-report',
      title: 'Создание отчета',
      description: 'Оператор заполняет отчет о выполненных работах',
      role: 'operator',
      status: 'pending',
    },
    {
      id: 'complete-order',
      title: 'Завершение заказа',
      description: 'Заказ помечается как выполненный',
      role: 'operator',
      status: 'pending',
    },
  ]);

  const [showReporting, setShowReporting] = useState(false);

  const completeStep = (stepIndex: number) => {
    setWorkflowSteps((prev) =>
      prev.map((step, index) => {
        if (index === stepIndex) {
          return { ...step, status: 'completed' };
        }
        if (index === stepIndex + 1) {
          return { ...step, status: 'active' };
        }
        return step;
      }),
    );

    if (stepIndex < workflowSteps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (step.status === 'active') {
      return <Play className="w-5 h-5 text-blue-600" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getStepColor = (step: WorkflowStep) => {
    if (step.status === 'completed') {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    if (step.status === 'active') {
      return 'bg-blue-100 border-blue-300 text-blue-800';
    }
    return 'bg-gray-100 border-gray-300 text-gray-600';
  };

  const getRoleIcon = (role: 'manager' | 'operator') => {
    return role === 'manager' ? (
      <Users className="w-4 h-4" />
    ) : (
      <User className="w-4 h-4" />
    );
  };

  const getRoleColor = (role: 'manager' | 'operator') => {
    return role === 'manager'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-emerald-100 text-emerald-800';
  };

  const handleReportComplete = () => {
    setShowReporting(false);
    completeStep(workflowSteps.length - 1);
    alert('Заказ успешно завершен! Полный цикл работы выполнен.');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Тестирование полного цикла заказа
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Демонстрация полного пути заказа от создания менеджером до выполнения
          оператором. Этот интерфейс показывает все этапы работы с заказом в
          системе управления дронами.
        </p>
      </div>

      {/* Workflow Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Прогресс выполнения заказа
        </h2>

        <div className="space-y-4">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 ${getStepColor(step)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStepIcon(step)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{step.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getRoleColor(step.role)}`}
                      >
                        {getRoleIcon(step.role)}
                        <span className="ml-1">
                          {step.role === 'manager' ? 'Менеджер' : 'Оператор'}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm opacity-75">{step.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {step.status === 'active' && (
                    <>
                      {step.id === 'create-report' ? (
                        <button
                          onClick={() => setShowReporting(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Создать отчет
                        </button>
                      ) : (
                        <button
                          onClick={() => completeStep(index)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Выполнить
                        </button>
                      )}
                    </>
                  )}

                  {step.status === 'completed' && (
                    <span className="text-sm text-green-600 font-medium">
                      Завершено
                    </span>
                  )}

                  {step.status === 'pending' && (
                    <span className="text-sm text-gray-500">Ожидание</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Order Status Tracker */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Отслеживание статуса заказа
        </h2>
        <OrderStatusTracker orderId={mockOrder.id} userRole="manager" />
      </div>

      {/* Current Step Details */}
      {currentStep < workflowSteps.length && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Текущий этап: {workflowSteps[currentStep]?.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Описание</h3>
              <p className="text-gray-700">
                {workflowSteps[currentStep]?.description}
              </p>

              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Ответственный
                </h4>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getRoleColor(workflowSteps[currentStep]?.role || 'manager')}`}
                  >
                    {getRoleIcon(workflowSteps[currentStep]?.role || 'manager')}
                    <span className="ml-1">
                      {workflowSteps[currentStep]?.role === 'manager'
                        ? 'Менеджер'
                        : 'Оператор'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Действия</h3>
              <div className="space-y-2">
                {workflowSteps[currentStep]?.role === 'manager' && (
                  <div className="text-sm text-gray-600">
                    • Проверить детали заказа
                    <br />
                    • Назначить исполнителей
                    <br />• Утвердить план работ
                  </div>
                )}

                {workflowSteps[currentStep]?.role === 'operator' && (
                  <div className="text-sm text-gray-600">
                    • Принять задачу в работу
                    <br />
                    • Выполнить полевые работы
                    <br />• Заполнить отчет о выполнении
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Завершено этапов</p>
              <p className="text-2xl font-bold text-green-600">
                {workflowSteps.filter((s) => s.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">В работе</p>
              <p className="text-2xl font-bold text-blue-600">
                {workflowSteps.filter((s) => s.status === 'active').length}
              </p>
            </div>
            <Play className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ожидает</p>
              <p className="text-2xl font-bold text-gray-600">
                {workflowSteps.filter((s) => s.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Прогресс</p>
              <p className="text-2xl font-bold text-indigo-600">
                {Math.round(
                  (workflowSteps.filter((s) => s.status === 'completed')
                    .length /
                    workflowSteps.length) *
                    100,
                )}
                %
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Reporting Workflow Modal */}
      {showReporting && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

            <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <ReportingWorkflow
                order={mockOrder}
                onComplete={handleReportComplete}
                onCancel={() => setShowReporting(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={() => {
            setCurrentStep(0);
            setWorkflowSteps((prev) =>
              prev.map((step, index) => ({
                ...step,
                status: index === 0 ? 'active' : 'pending',
              })),
            );
          }}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Сбросить демонстрацию
        </button>
      </div>
    </div>
  );
}
