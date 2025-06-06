// app/dashboard/page.tsx (Client)
import { Activity, FileText, Map, CheckCircle, Clock } from 'lucide-react';
import StatCard from './StatCard';
import RecentRequests from './RecentRequests';

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Добро пожаловать, Иван!
        </h1>
        <p className="mt-1 text-gray-600">
          Ваша агроплатформа для управления обработкой полей
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Активные заявки"
          value="3"
          icon={<Activity className="h-5 w-5 text-blue-500" />}
          change="+1 с прошлой недели"
        />
        <StatCard
          title="Обработано полей"
          value="12 га"
          icon={<Map className="h-5 w-5 text-green-500" />}
          change="+5 га за месяц"
        />
        <StatCard
          title="Завершённые работы"
          value="8"
          icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
          change="+3 за месяц"
        />
        <StatCard
          title="Среднее время обработки"
          value="2.5 дня"
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          change="-0.5 дня"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Последние заявки
            </h2>
            <a
              href="/dashboard/requests"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Смотреть все
            </a>
          </div>
          <RecentRequests />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Быстрые действия
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/dashboard/new-request"
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="bg-blue-100 p-3 rounded-full mb-2">
                <Map className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Новая заявка
              </span>
            </a>
            <a
              href="/dashboard/fields"
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="bg-green-100 p-3 rounded-full mb-2">
                <Map className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Мои поля
              </span>
            </a>
            <a
              href="/dashboard/reports"
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <div className="bg-emerald-100 p-3 rounded-full mb-2">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Отчёты</span>
            </a>
            <a
              href="/dashboard/support"
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <div className="bg-amber-100 p-3 rounded-full mb-2">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Поддержка
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
