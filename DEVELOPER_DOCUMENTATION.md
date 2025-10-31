
# 🚁 ДронАгро - Документация разработчика

## 📋 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Архитектура и технологии](#архитектура-и-технологии)
3. [Структура проекта](#структура-проекта)
4. [Установка и настройка](#установка-и-настройка)
5. [Разработка](#разработка)
6. [Развертывание](#развертывание)
7. [API и сервисы](#api-и-сервисы)
8. [Инфраструктура](#инфраструктура)
9. [Лучшие практики](#лучшие-практики)

---

## 🎯 Обзор проекта

**ДронАгро** — это инновационная веб-платформа для автоматизации сельскохозяйственных процессов с использованием беспилотных летательных аппаратов (БПЛА). Система предоставляет комплексные решения для точного земледелия, включая планирование полетов, мониторинг посевов, управление заявками и аналитику.

### 🌟 Ключевые возможности

- **Управление дронами**: Планирование маршрутов и мониторинг полетов в реальном времени
- **Мультиролевая система**: Поддержка различных типов пользователей (подрядчики, операторы, менеджеры, поставщики)
- **Интерактивные карты**: Визуализация полей и маршрутов с использованием Leaflet
- **Аналитика и отчетность**: Детальная статистика и графики выполненных работ
- **Адаптивный интерфейс**: Современный UI с поддержкой мобильных устройств
- **Интеграция с внешними сервисами**: S3 для хранения файлов, CDN для оптимизации загрузки

---

## 🏗️ Архитектура и технологии

### Технологический стек

#### Frontend
- **Framework**: [`Next.js 15.2.4`](https://nextjs.org/) с App Router
- **Language**: [`TypeScript 5`](https://www.typescriptlang.org/)
- **Styling**: [`Tailwind CSS 4.1.3`](https://tailwindcss.com/)
- **UI Components**: [`Lucide React`](https://lucide.dev/), [`Shadcn/ui`](https://ui.shadcn.com/)
- **Animations**: [`Framer Motion 12.6.3`](https://www.framer.com/motion/)
- **Charts**: [`Recharts 2.15.3`](https://recharts.org/), [`Chart.js 4.4.9`](https://www.chartjs.org/)
- **Maps**: [`React Leaflet 5.0.0`](https://react-leaflet.js.org/)
- **HTTP Client**: [`Axios 1.10.0`](https://axios-http.com/)

#### Development Tools
- **Linting**: [`ESLint 9.29.0`](https://eslint.org/) с конфигурацией Next.js
- **Code Formatting**: [`Prettier 3.5.3`](https://prettier.io/)
- **Build Tool**: [`Turbopack`](https://turbo.build/pack) (экспериментальный)

#### Infrastructure
- **Containerization**: [`Docker`](https://www.docker.com/) с multi-stage builds
- **Node.js**: Version 21 (Alpine Linux)
- **Package Manager**: [`npm`](https://www.npmjs.com/)
- **Storage**: AWS S3 для статических файлов
- **CDN**: CloudFront для оптимизации доставки контента

### Архитектурные принципы

#### Feature-Sliced Design (FSD)
Проект следует методологии FSD для организации кода:

```
src/
├── app/           # Слой приложения (App Router, глобальные провайдеры)
├── pages/         # Слой страниц (композиция виджетов)
├── features/      # Слой фичей (бизнес-логика)
├── shared/        # Слой общих компонентов (UI-kit, утилиты)
```

#### Компонентная архитектура
- **Атомарный дизайн**: Компоненты разделены на атомы, молекулы и организмы
- **Композиция над наследованием**: Использование React Composition API
- **Типизация**: Строгая типизация с TypeScript для всех компонентов

---

## 📁 Структура проекта

```
drone_manage_system/
├── 📁 public/                    # Статические файлы
│   ├── 📁 fonts/                # Шрифты (Nekst, Poppins)
│   ├── 📁 pages/                # Изображения для страниц
│   └── 📁 header/               # Ресурсы для хедера
├── 📁 src/
│   ├── 📁 app/                  # Next.js App Router
│   │   ├── 📄 layout.tsx        # Корневой лейаут
│   │   ├── 📄 page.tsx          # Главная страница
│   │   ├── 📄 GlobalContext.tsx # Глобальное состояние
│   │   ├── 📁 (auth)/           # Группа маршрутов аутентификации
│   │   │   ├── 📁 login/        # Страница входа
│   │   │   └── 📁 signup/       # Страница регистрации
│   │   ├── 📁 dashboard/        # Панель управления
│   │   │   ├── 📄 layout.tsx    # Лейаут дашборда
│   │   │   ├── 📁 contractor/   # Интерфейс подрядчика
│   │   │   ├── 📁 manager/      # Интерфейс менеджера
│   │   │   └── 📁 operator/     # Интерфейс оператора
│   │   └── 📁 [other-routes]/   # Другие страницы
│   ├── 📁 features/             # Бизнес-логика (FSD)
│   │   └── 📁 home/
│   │       └── 📁 ui/
│   ├── 📁 shared/               # Общие компоненты (FSD)
│   │   └── 📁 ui/
│   │       ├── 📄 Header.tsx    # Главный хедер
│   │       └── 📄 Footer.tsx    # Футер
│   └── 📁 pages/                # Композиция страниц (FSD)
├── 📄 package.json              # Зависимости проекта
├── 📄 next.config.ts            # Конфигурация Next.js
├── 📄 tailwind.config.ts        # Конфигурация Tailwind
├── 📄 tsconfig.json             # Конфигурация TypeScript
├── 📄 Dockerfile                # Docker образ
├── 📄 docker-compose.yml        # Docker Compose
└── 📄 .gitignore                # Git ignore правила
```

### Ключевые файлы и их назначение

#### [`src/app/GlobalContext.tsx`](src/app/GlobalContext.tsx)
Глобальное состояние приложения с использованием React Context API:
- Управление ролями пользователей
- Хранение данных о дронах
- Управление заявками
- Синхронизация с localStorage

#### [`src/app/dashboard/layout.tsx`](src/app/dashboard/layout.tsx)
Основной лейаут панели управления:
- Адаптивная боковая панель
- Система уведомлений
- Роль-специфичные меню
- Анимации с Framer Motion

#### [`src/shared/ui/Header.tsx`](src/shared/ui/Header.tsx)
Главный навигационный компонент:
- Мега-меню с услугами
- Каталог дронов с превью
- Профиль пользователя
- Адаптивная навигация

---

## ⚙️ Установка и настройка

### Системные требования

- **Node.js**: 18.0.0 или выше (рекомендуется 21.x)
- **npm**: 9.0.0 или выше
- **Docker**: 20.10.0 или выше (для контейнеризации)
- **Git**: для клонирования репозитория

### Локальная разработка

#### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd drone_manage_system
```

#### 2. Установка зависимостей
```bash
npm install
```

#### 3. Настройка переменных окружения
Создайте файл `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://51.250.43.77:8080
NEXT_PUBLIC_API_VERSION=v1

# AWS S3 Configuration
NEXT_PUBLIC_S3_BUCKET=your-bucket-name
NEXT_PUBLIC_S3_REGION=us-east-1
NEXT_PUBLIC_CDN_URL=https://your-cdn-domain.com

# Application Settings
NEXT_PUBLIC_APP_NAME=ДронАгро
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_TELEMETRY_DISABLED=1
```

#### 4. Запуск в режиме разработки
```bash
# С Turbopack (рекомендуется)
npm run dev

# Стандартный режим
npm run dev:standard
```

Приложение будет доступно по адресу: [`http://localhost:3000`](http://localhost:3000)

### Сборка для продакшена

```bash
# Сборка приложения
npm run build

# Запуск продакшен сервера
npm start
```

---

## 🐳 Развертывание

### Docker

#### Локальная сборка
```bash
# Сборка образа
docker build -t drone-agro:latest .

# Запуск контейнера
docker run -p 3000:3000 drone-agro:latest
```

#### Docker Compose
```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down
```

### Конфигурация Docker

#### [`Dockerfile`](Dockerfile)
Multi-stage сборка для оптимизации размера образа:
- **Stage 1**: Установка зависимостей с кешированием
- **Stage 2**: Сборка приложения
- **Stage 3**: Продакшен runtime с минимальными зависимостями

Особенности:
- Использование Alpine Linux для минимального размера
- Кеширование npm пакетов
- Поддержка прокси для корпоративных сетей
- Health check для мониторинга

#### [`docker-compose.yml`](docker-compose.yml)
Конфигурация для локальной разработки:
- Автоматический перезапуск контейнеров
- Проброс переменных окружения
- Health check мониторинг
- Поддержка .env файлов

### Продакшен развертывание

#### Vercel (рекомендуется)
```bash
# Установка Vercel CLI
npm i -g vercel

# Развертывание
vercel --prod
```

#### AWS/DigitalOcean
```bash
# Сборка Docker образа
docker build -t drone-agro:prod .

# Загрузка в registry
docker tag drone-agro:prod your-registry/drone-agro:prod
docker push your-registry/drone-agro:prod
```

---

## 🔌 API и сервисы

### Архитектура API

Приложение взаимодействует с RESTful API, развернутым по адресу `http://51.250.43.77:8080`.

#### Основные эндпоинты

##### Аутентификация
```typescript
// Вход в систему
POST /v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Получение профиля пользователя
GET /v1/me
Headers: { Authorization: "Bearer <token>" }
```

##### Управление заявками
```typescript
// Получение списка заявок
GET /v1/requests?status=active&limit=10

// Создание новой заявки
POST /v1/requests
{
  "fieldId": "field_123",
  "serviceType": "spraying",
  "scheduledDate": "2024-06-15T10:00:00Z"
}
```

### HTTP клиент

Используется [`Axios`](https://axios-http.com/) для всех HTTP запросов:

```typescript
// src/shared/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Управление состоянием

#### Global Context
Централизованное управление состоянием через React Context:

```typescript
interface GlobalContextType {
  dronesList: DroneType[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  requests: Request[];
}
```

#### Типы пользователей
```typescript
type UserRole = 
  | 'guest'
  | 'manager'
  | 'contractor' 
  | 'drone_supplier'
  | 'material_supplier';
```

---

## 🏗️ Инфраструктура

### AWS S3 интеграция

Для хранения статических файлов (изображения дронов, отчеты, карты) используется Amazon S3:

```typescript
// Конфигурация S3
const S3_CONFIG = {
  bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
  region: process.env.NEXT_PUBLIC_S3_REGION,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
};

// Загрузка файла
const uploadToS3 = async (file: File, path: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);
  
  return await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
};
```

### CDN (CloudFront)

Для оптимизации доставки статического контента используется AWS CloudFront:

- **Кеширование**: Автоматическое кеширование изображений и статических файлов
- **Сжатие**: Gzip/Brotli сжатие для уменьшения размера файлов
- **Географическое распределение**: Edge locations для быстрой доставки контента
- **Инвалидация**: Автоматическая очистка кеша при обновлении файлов

```typescript
// Конфигурация CDN
const CDN_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL,
  imageOptimization: true,
  cacheControl: 'public, max-age=31536000', // 1 год
};

// Получение оптимизированного URL изображения
const getOptimizedImageUrl = (path: string, width?: number, height?: number) => {
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  
  return `${CDN_CONFIG.baseUrl}/${path}?${params.toString()}`;
};
```

### Мониторинг и логирование

#### Health Checks
```typescript
// pages/api/health.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
  };
  
  res.status(200).json(healthCheck);
}
```

#### Error Tracking
```typescript
// Глобальный обработчик ошибок
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Отправка в систему мониторинга
});
```

---

## 🎨 UI/UX и компоненты

### Дизайн-система

#### Цветовая палитра
```css
:root {
  --primary-green: #10b981;
  --primary-blue: #3b82f6;
  --secondary-gray: #6b7280;
  --accent-yellow: #f59e0b;
  --danger-red: #ef4444;
  --success-green: #22c55e;
}
```

#### Типографика
Используются кастомные шрифты:
- **Nekst**: Основной шрифт для заголовков и UI элементов
- **Poppins**: Дополнительный шрифт для текста
- **Roboto**: Системный шрифт для форм

```css
@font-face {
  font-family: 'Nekst-Medium';
  src: url('/fonts/nekst/Nekst-Medium.woff2') format('woff2');
}
```

#### Компонентная библиотека

##### Кнопки
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}
```

##### Формы
```typescript
interface InputProps {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

### Анимации

Используется [`Framer Motion`](https://www.framer.com/motion/) для плавных анимаций:

```typescript
// Анимация появления карточек
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

<motion.div
  variants={cardVariants}
  initial="hidden"
  animate="visible"
>
  {/* Контент карточки */}
</motion.div>
```

### Адаптивность

Приложение полностью адаптивно с использованием Tailwind CSS breakpoints:

```typescript
// Адаптивная сетка
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Контент */}
</div>

// Адаптивная типографика
<h1 className="text-2xl md:text-4xl lg:text-6xl font-bold">
  Заголовок
</h1>
```

---

## 🛠️ Разработка

### Структура команд

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build", 
    "start": "next start -H 0.0.0.0 -p 3000",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### Линтинг и форматирование

#### ESLint конфигурация
```javascript
// eslint.config.mjs
export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      'import/order': ['error', {
        groups: [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
    },
  },
];
```

#### Prettier конфигурация
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Git workflow

#### Структура коммитов
```bash
# Типы коммитов
feat: новая функциональность
fix: исправление бага
docs: обновление документации
style: изменения стилей
refactor: рефакторинг кода
test: добавление тестов
chore: обновление зависимостей
```

#### Пример коммита
```bash
git commit -m "feat(dashboard): add real-time drone monitoring

- Implement WebSocket connection for live updates
- Add drone status indicators
- Update dashboard layout for better UX"
```

### Отладка

#### Next.js DevTools
```typescript
// next.config.ts
const nextConfig = {
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};
```

#### React DevTools
Установите расширение React Developer Tools для браузера для отладки компонентов и состояния.

---

## 📊 Производительность

### Оптимизация сборки

#### Next.js конфигурация
```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

#### Bundle анализ
```bash
# Анализ размера бандла
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

### Оптимизация изображений

```typescript
// Компонент оптимизированного изображения
import Image from 'next/image';

<Image
  src="/drone-image.jpg"
  alt="Drone"
  width={800}
  height={600}
  priority={true} // Для изображений above-the-fold
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Кеширование

#### Service Worker
```typescript
// Кеширование статических ресурсов
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

#### HTTP кеширование
```typescript
// Настройка заголовков кеширования
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache');
  } else if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return response;
}
```

---

## 🔒 Безопасность

### Аутентификация и авторизация

#### JWT токены
```typescript
// Управление токенами
const TokenManager = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
```

#### Защищенные маршруты
```typescript
// HOC для защиты маршрутов
const withAuth = (WrappedComponent: React.ComponentType) => {
  return function AuthComponent(props: any) {
    const { userRole } = useGlobalContext();
    
    if (userRole === 'guest') {
      redirect('/login');
    }
    
    return <WrappedComponent {...props} />;
  };
};
```

### Валидация данных

#### Клиентская валидация
```typescript
// Схемы валидации
const loginSchema = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Введите корректный email',
  },
  password: {
    required: true,
    minLength: 8,
    message: 'Пароль должен быть не менее 8 символов',
  },
};
```

#### Санитизация входных данных
```typescript
// Очистка пользовательского ввода
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
};
```

### HTTPS и CSP

#### Content Security Policy
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

---

## 🧪 Тестирование

### Структура тестов

```
tests/
├── __mocks__/          # Моки для тестирования
├── components/         # Тесты компонентов
├── pages/             # Тесты страниц
├── utils/             # Тесты утилит
└── e2e/               # End-to-end тесты
```

### Unit тесты

```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration тесты

```typescript
// pages/Dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { GlobalContextProvider } from '../src/app/GlobalContext';
import Dashboard from '../src/app/dashboard/page';

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <GlobalContextProvider>
      {component}
    </GlobalContextProvider>
  );
};

describe('Dashboard Page', () => {
  it('displays user statistics', async () => {
    renderWithContext(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Активные заявки')).toBeInTheDocument();
      expect(screen.getByText('Обработано (га)')).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 Лучшие практики

### Код-стайл

#### Именование
```typescript
// Компоненты - PascalCase
const DroneCard = () => {};

// Хуки - camelCase с префиксом use
const useDashboardData = () => {};

// Константы - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Переменные и функции - camelCase
const handleSubmit = () => {};
const userData = {};
```

#### Структура компонентов
```typescript
// Рекомендуемая структура React компонента
interface ComponentProps {
  // Типы пропсов
}

const Component: React.FC<ComponentProps> = ({ 
  prop1, 
  prop2 
}) => {
  // Хуки
  const [state, setState] = useState();
  const { contextValue } = useContext();
  
  // Обработчики событий
  const handleEvent = useCallback(() => {
    // логика
  }, [dependencies]);
  
  // Эффекты
  useEffect(() => {
    // побочные эффекты
  }, [dependencies]);
  
  // Условный рендеринг
  if (loading) return <LoadingSpinner />;
  
  // Основной рендер
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### Производительность

#### Мемоизация
```typescript
// Мемоизация компонентов
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Тяжелый рендеринг */}</div>;
});

// Мемоизация значений
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Мемоизация коллбеков
const handleClick = useCallback(() => {
  // обработчик
}, [dependency]);
```

#### Ленивая загрузка
```typescript
// Ленивая загрузка компонентов
const
// Ленивая загрузка компонентов
const LazyDashboard = React.lazy(() => import('./Dashboard'));
const LazyMap = React.lazy(() => import('./MapComponent'));

// Использование с Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyDashboard />
</Suspense>
```

#### Code Splitting
```typescript
// Динамический импорт для разделения кода
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

### Доступность (A11y)

#### Семантическая разметка
```typescript
// Правильная структура заголовков
<main>
  <h1>Главная страница</h1>
  <section>
    <h2>Статистика</h2>
    <article>
      <h3>Активные заявки</h3>
    </article>
  </section>
</main>
```

#### ARIA атрибуты
```typescript
// Доступные формы
<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
  aria-required="true"
/>
{hasError && (
  <div id="email-error" role="alert">
    Введите корректный email
  </div>
)}
```

#### Навигация с клавиатуры
```typescript
// Обработка клавиатурных событий
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    handleClick();
  }
};

<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
>
  Кликабельный элемент
</div>
```

---

## 📈 Мониторинг и аналитика

### Метрики производительности

#### Web Vitals
```typescript
// Отслеживание Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Отправка метрик в систему аналитики
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

#### Performance API
```typescript
// Измерение времени загрузки компонентов
const measureComponentLoad = (componentName: string) => {
  performance.mark(`${componentName}-start`);
  
  return () => {
    performance.mark(`${componentName}-end`);
    performance.measure(
      `${componentName}-load`,
      `${componentName}-start`,
      `${componentName}-end`
    );
  };
};
```

### Логирование

#### Структурированные логи
```typescript
// Утилита для логирования
const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
};
```

#### Error Boundaries
```typescript
// Компонент для перехвата ошибок
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary', error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

---

## 🔧 Утилиты и хелперы

### Общие утилиты

#### Форматирование данных
```typescript
// src/shared/utils/formatters.ts
export const formatCurrency = (amount: number, currency = 'RUB'): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date | string, format = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: format as any,
  }).format(dateObj);
};

export const formatArea = (area: number): string => {
  return `${area.toLocaleString('ru-RU')} га`;
};
```

#### Валидация
```typescript
// src/shared/utils/validation.ts
export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  phone: (value: string): boolean => {
    const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(value);
  },
  
  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  },
};
```

#### Дебаунс и троттлинг
```typescript
// src/shared/utils/performance.ts
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
```

### Хуки

#### Кастомные хуки
```typescript
// src/shared/hooks/useLocalStorage.ts
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
};
```

```typescript
// src/shared/hooks/useApi.ts
export const useApi = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<T>(url);
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

---

## 🌐 Интернационализация (i18n)

### Настройка локализации

```typescript
// src/shared/i18n/config.ts
export const locales = ['ru', 'en'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'ru';

export const dictionaries = {
  ru: () => import('./dictionaries/ru.json').then(module => module.default),
  en: () => import('./dictionaries/en.json').then(module => module.default),
};
```

### Словари переводов

```json
// src/shared/i18n/dictionaries/ru.json
{
  "common": {
    "loading": "Загрузка...",
    "error": "Ошибка",
    "save": "Сохранить",
    "cancel": "Отмена"
  },
  "dashboard": {
    "title": "Панель управления",
    "activeRequests": "Активные заявки",
    "processedArea": "Обработано (га)"
  },
  "auth": {
    "login": "Войти",
    "logout": "Выйти",
    "email": "Email",
    "password": "Пароль"
  }
}
```

### Использование переводов

```typescript
// src/shared/hooks/useTranslation.ts
export const useTranslation = (locale: Locale = 'ru') => {
  const [dictionary, setDictionary] = useState<any>({});

  useEffect(() => {
    dictionaries[locale]().then(setDictionary);
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value = dictionary;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return { t };
};
```

---

## 📱 PWA и мобильная оптимизация

### Service Worker

```typescript
// public/sw.js
const CACHE_NAME = 'drone-agro-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

### Web App Manifest

```json
// public/manifest.json
{
  "name": "ДронАгро - Управление дронами",
  "short_name": "ДронАгро",
  "description": "Платформа для автоматизации сельскохозяйственных процессов",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Мобильная оптимизация

```typescript
// src/shared/hooks/useDeviceDetection.ts
export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTablet };
};
```

---

## 🔄 CI/CD и автоматизация

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '21'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run type check
      run: npm run type-check
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        # Деплой скрипты
        echo "Deploying to production..."
```

### Docker в CI/CD

```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    tags: ['v*']

jobs:
  docker:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          droneagro/app:latest
          droneagro/app:${{ github.ref_name }}
```

---

## 📚 Дополнительные ресурсы

### Полезные ссылки

#### Документация технологий
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

#### Инструменты разработки
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

#### Дизайн и UI/UX
- [Figma](https://www.figma.com/)
- [Lucide Icons](https://lucide.dev/)
- [Heroicons](https://heroicons.com/)

### Команда и контакты

#### Роли в проекте
- **Tech Lead**: Архитектурные решения и код-ревью
- **Frontend Developer**: Разработка пользовательского интерфейса
- **Backend Developer**: API и серверная логика
- **DevOps Engineer**: Инфраструктура и деплой
- **QA Engineer**: Тестирование и контроль качества

#### Каналы связи
- **Slack**: #drone-agro-dev
- **Email**: dev-team@droneagro.ru
- **Jira**: Трекинг задач и багов
- **Confluence**: Техническая документация

---

## 🎯 Заключение

Данная документация представляет собой исчерпывающее руководство по разработке и поддержке платформы **ДронАгро**. Проект построен на современных технологиях и следует лучшим практикам разработки, обеспечивая:

### ✅ Ключевые достижения

- **Масштабируемая архитектура**: Feature-Sliced Design обеспечивает четкую структуру и легкость поддержки
- **Современный стек**: Next.js 15, TypeScript, Tailwind CSS гарантируют производительность и DX
- **Контейнеризация**: Docker обеспечивает консистентность окружений
- **Облачная интеграция**: S3 и CDN для оптимальной производительности
- **Мультиролевая система**: Гибкая система ролей для различных типов пользователей

### 🚀 Следующие шаги

1. **Тестирование**: Внедрение автоматизированного тестирования (Unit, Integration, E2E)
2. **Мониторинг**: Настройка системы мониторинга и алертов
3. **Оптимизация**: Дальнейшая оптимизация производительности и SEO
4. **Функциональность**: Расширение возможностей платформы
5. **Документация**: Поддержание актуальности документации

### 📞 Поддержка

При возникновении вопросов или проблем:

1. Проверьте данную документацию
2. Обратитесь к команде разработки
3. Создайте issue в системе трекинга
4. Обновите документацию при необходимости

---

**Версия документации**: 1.0.0  
**Дата обновления**: 31 октября 2024  
**Автор**: Команда разработки ДронАгро

---

*Эта документация является живым документом и должна обновляться по мере развития проекта.*