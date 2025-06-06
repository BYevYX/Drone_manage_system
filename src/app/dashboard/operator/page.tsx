// app/dashboard/page.tsx (Operator)
import { Activity, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import StatCard from '../client/StatCard';
// import MissionsList from '@/components/MissionsList';

export default function OperatorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Добро пожаловать, Алексей!
        </h1>
        <p className="mt-1 text-gray-600">
          Панель управления оператора агродронов
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Запланировано миссий"
          value="5"
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          change="+2 на этой неделе"
        />
        <StatCard
          title="Выполнено сегодня"
          value="2"
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          change="+1 вчера"
        />
        {/* <StatCard
          title="Дроны доступны"
          value="3/4"
          icon={<Drone className="h-5 w-5 text-amber-500" />}
          change="1 на обслуживании"
        /> */}
        <StatCard
          title="Предупреждения"
          value="1"
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          change="Новое сегодня"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Ближайшие миссии
            </h2>
            <a
              href="/dashboard/missions"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Смотреть все
            </a>
          </div>
          {/* <MissionsList /> */}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Быстрые действия
            </h2>
          </div>
          <div className="space-y-3">
            <a
              href="/dashboard/missions/new"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {/* <Drone className="h-5 w-5 text-blue-500 mr-3" /> */}
              <span className="text-sm font-medium text-gray-700">
                Новая миссия
              </span>
            </a>
            <a
              href="/dashboard/calendar"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm font-medium text-gray-700">
                Календарь
              </span>
            </a>
            <a
              href="/dashboard/reports"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              {/* <FileText className="h-5 w-5 text-emerald-500 mr-3" /> */}
              <span className="text-sm font-medium text-gray-700">Отчёты</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
