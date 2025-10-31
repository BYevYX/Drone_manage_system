/**
 * Примеры использования UI компонентов
 */

import React, { useState } from 'react';
import { User, Settings, Bell, Search, Heart, Star } from 'lucide-react';
import {
  Modal,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  StatCard,
  Select,
  Badge,
  StatusBadge,
  CountBadge,
  BadgeGroup,
  Tooltip,
  InfoTooltip,
  Alert,
  Toast,
  Banner,
  useNotification,
  NotificationContainer,
} from './index';

// Пример использования Modal
export const ModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Открыть модальное окно
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Пример модального окна"
        size="md"
      >
        <p>Это содержимое модального окна с различными возможностями.</p>
        <p>Модальное окно поддерживает анимации, клавиатурную навигацию и блокировку скролла.</p>
      </Modal>
    </div>
  );
};

// Пример использования Card
export const CardExample: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      {/* Обычная карточка */}
      <Card variant="elevated" hover>
        <CardHeader
          title="Заголовок карточки"
          subtitle="Подзаголовок с дополнительной информацией"
          action={
            <button className="text-blue-500 hover:text-blue-700">
              <Settings size={20} />
            </button>
          }
        />
        <CardContent>
          <p>Основное содержимое карточки. Здесь может быть любая информация.</p>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between">
            <span className="text-gray-500">Обновлено: 2 часа назад</span>
            <button className="text-blue-500 hover:text-blue-700">Подробнее</button>
          </div>
        </CardFooter>
      </Card>

      {/* Статистическая карточка */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Активные дроны"
          value="24"
          change={{ value: 12, type: 'increase' }}
          icon={<User size={24} />}
          color="green"
        />
        <StatCard
          title="Выполненные задачи"
          value="156"
          change={{ value: 8, type: 'increase' }}
          icon={<Star size={24} />}
          color="blue"
        />
        <StatCard
          title="Ошибки"
          value="3"
          change={{ value: 2, type: 'decrease' }}
          icon={<Bell size={24} />}
          color="red"
        />
      </div>
    </div>
  );
};

// Пример использования Select
export const SelectExample: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string | number>('');
  const [multipleValues, setMultipleValues] = useState<(string | number)[]>([]);

  const options = [
    { value: 'drone1', label: 'Дрон Агро-1', icon: <User size={16} /> },
    { value: 'drone2', label: 'Дрон Агро-2', icon: <User size={16} /> },
    { value: 'drone3', label: 'Дрон Агро-3', icon: <User size={16} /> },
    { value: 'drone4', label: 'Дрон Агро-4 (недоступен)', icon: <User size={16} />, disabled: true },
  ];

  return (
    <div className="p-4 space-y-4">
      <Select
        label="Выберите дрон"
        options={options}
        value={selectedValue}
        onChange={setSelectedValue}
        placeholder="Выберите дрон из списка"
        searchable
        clearable
      />

      <Select
        label="Множественный выбор"
        options={options}
        value={multipleValues}
        onChange={setMultipleValues}
        multiple
        searchable
        placeholder="Выберите несколько дронов"
      />
    </div>
  );
};

// Пример использования Badge
export const BadgeExample: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Обычные бейджи</h3>
        <BadgeGroup>
          <Badge variant="default">По умолчанию</Badge>
          <Badge variant="success" icon={<Heart size={14} />}>
            Успех
          </Badge>
          <Badge variant="warning" removable onRemove={() => console.log('Удален')}>
            Предупреждение
          </Badge>
          <Badge variant="error" rounded>
            Ошибка
          </Badge>
        </BadgeGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Статусные бейджи</h3>
        <BadgeGroup>
          <StatusBadge status="active" />
          <StatusBadge status="pending" />
          <StatusBadge status="completed" />
          <StatusBadge status="cancelled" />
        </BadgeGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Числовые бейджи</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell size={24} />
            <CountBadge count={5} variant="error" className="absolute -top-2 -right-2" />
          </div>
          <div className="relative">
            <Search size={24} />
            <CountBadge count={99} variant="primary" className="absolute -top-2 -right-2" />
          </div>
          <div className="relative">
            <User size={24} />
            <CountBadge count={150} max={99} variant="success" className="absolute -top-2 -right-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Пример использования Tooltip
export const TooltipExample: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-4">
        <Tooltip content="Это простая подсказка сверху" position="top">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Наведите для подсказки сверху
          </button>
        </Tooltip>

        <Tooltip content="Подсказка справа с длинным текстом" position="right" maxWidth="300px">
          <button className="px-4 py-2 bg-green-500 text-white rounded">
            Подсказка справа
          </button>
        </Tooltip>

        <Tooltip
          content={
            <div>
              <strong>Расширенная подсказка</strong>
              <p>С HTML содержимым и форматированием</p>
            </div>
          }
          position="bottom"
          trigger="click"
        >
          <button className="px-4 py-2 bg-purple-500 text-white rounded">
            Кликните для подсказки
          </button>
        </Tooltip>

        <InfoTooltip
          content="Информационная подсказка с иконкой вопроса"
          position="left"
        />
      </div>
    </div>
  );
};

// Пример использования Alert и уведомлений
export const AlertExample: React.FC = () => {
  const notification = useNotification();

  const showNotifications = () => {
    notification.success('Операция выполнена успешно!');
    setTimeout(() => {
      notification.warning('Внимание: проверьте настройки');
    }, 1000);
    setTimeout(() => {
      notification.error('Произошла ошибка при обработке');
    }, 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4">
        <Alert variant="info" title="Информация" dismissible>
          Это информационное сообщение с возможностью закрытия.
        </Alert>

        <Alert variant="success" icon={<Heart size={20} />}>
          Операция выполнена успешно! Все дроны готовы к работе.
        </Alert>

        <Alert
          variant="warning"
          title="Предупреждение"
          actions={
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm">
                Исправить
              </button>
              <button className="px-3 py-1 border border-yellow-600 text-yellow-600 rounded text-sm">
                Игнорировать
              </button>
            </div>
          }
        >
          Обнаружены проблемы с подключением к некоторым дронам.
        </Alert>

        <Alert variant="error" title="Критическая ошибка" dismissible>
          Не удалось подключиться к серверу. Проверьте интернет-соединение.
        </Alert>
      </div>

      <div>
        <button
          onClick={showNotifications}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Показать уведомления
        </button>
      </div>

      <Banner
        variant="info"
        title="Системное уведомление"
        sticky
        fullWidth
      >
        Запланировано техническое обслуживание системы на 15:00-16:00.
      </Banner>

      <NotificationContainer
        notifications={notification.notifications}
        onClose={notification.hide}
        position="top-right"
      />
    </div>
  );
};

// Главный компонент с примерами
export const ComponentExamples: React.FC = () => {
  const [activeExample, setActiveExample] = useState('modal');

  const examples = [
    { id: 'modal', label: 'Modal', component: <ModalExample /> },
    { id: 'card', label: 'Card', component: <CardExample /> },
    { id: 'select', label: 'Select', component: <SelectExample /> },
    { id: 'badge', label: 'Badge', component: <BadgeExample /> },
    { id: 'tooltip', label: 'Tooltip', component: <TooltipExample /> },
    { id: 'alert', label: 'Alert', component: <AlertExample /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Примеры UI компонентов ДронАгро
        </h1>

        <div className="flex flex-wrap gap-2 mb-8">
          {examples.map((example) => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeExample === example.id
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {example.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {examples.find((ex) => ex.id === activeExample)?.component}
        </div>
      </div>
    </div>
  );
};

export default ComponentExamples;