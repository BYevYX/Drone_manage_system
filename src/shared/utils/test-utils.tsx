/**
 * Утилиты для тестирования
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { GlobalContext } from '../../app/GlobalContext';

// Типы для тестовых данных
export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'guest' | 'manager' | 'contractor' | 'drone_supplier' | 'material_supplier';
}

export interface MockDrone {
  id: number;
  name: string;
  description: string;
  photo_url: string;
  manufacturer: string;
}

export interface MockRequest {
  id: number;
  date: string;
  field: string;
  crop: string;
  type: string;
  area: number;
  status: 'new' | 'in_progress' | 'completed' | 'rejected';
}

// Моковые данные
export const mockUser: MockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'contractor',
};

export const mockDrones: MockDrone[] = [
  {
    id: 1,
    name: 'Test Drone 1',
    description: 'Test drone description',
    photo_url: '/test-drone.jpg',
    manufacturer: 'Test Manufacturer',
  },
  {
    id: 2,
    name: 'Test Drone 2',
    description: 'Another test drone',
    photo_url: '/test-drone-2.jpg',
    manufacturer: 'Test Manufacturer 2',
  },
];

export const mockRequests: MockRequest[] = [
  {
    id: 1,
    date: '2024-01-15',
    field: 'Test Field 1',
    crop: 'Wheat',
    type: 'Spraying',
    area: 10,
    status: 'new',
  },
  {
    id: 2,
    date: '2024-01-16',
    field: 'Test Field 2',
    crop: 'Corn',
    type: 'Fertilizing',
    area: 15,
    status: 'in_progress',
  },
];

// Провайдер для тестов с моковыми данными
interface TestProviderProps {
  children: React.ReactNode;
  initialState?: {
    userRole?: MockUser['role'];
    dronesList?: MockDrone[];
    requests?: MockRequest[];
  };
}

export const TestProvider: React.FC<TestProviderProps> = ({
  children,
  initialState = {},
}) => {
  const mockContextValue = {
    userRole: initialState.userRole || 'contractor',
    setUserRole: jest.fn(),
    dronesList: initialState.dronesList || mockDrones,
    requests: initialState.requests || mockRequests,
  };

  return (
    <GlobalContext.Provider value={mockContextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

// Кастомная функция рендера с провайдерами
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: TestProviderProps['initialState'];
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) => {
  const { initialState, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProvider initialState={initialState}>
      {children}
    </TestProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Утилиты для создания моковых функций
export const createMockApiResponse = <T,>(data: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const createMockApiError = (message = 'API Error', delay = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};

// Утилиты для работы с localStorage в тестах
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() {
      return { ...store };
    },
  };
};

// Утилиты для мокирования fetch
export const mockFetch = (response: any, ok = true, status = 200) => {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response)
  );
};

// Утилиты для работы с формами в тестах
export const fillForm = async (
  getByLabelText: (text: string) => HTMLElement,
  formData: Record<string, string>,
) => {
  const { fireEvent } = await import('@testing-library/react');
  
  Object.entries(formData).forEach(([label, value]) => {
    const input = getByLabelText(label) as HTMLInputElement;
    fireEvent.change(input, { target: { value } });
  });
};

// Утилиты для ожидания асинхронных операций
export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved, screen } = await import('@testing-library/react');
  
  try {
    await waitForElementToBeRemoved(() => screen.getByText(/загрузка/i), {
      timeout: 3000,
    });
  } catch (error) {
    // Игнорируем ошибку, если элемент загрузки не найден
  }
};

// Утилиты для тестирования хуков
export const createHookWrapper = (providers: React.ComponentType<any>[] = []) => {
  return ({ children }: { children: React.ReactNode }) => {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children as React.ReactElement,
    );
  };
};

// Утилиты для мокирования роутера Next.js
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

// Утилиты для тестирования компонентов с анимациями
export const disableAnimations = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  
  window.IntersectionObserver = mockIntersectionObserver;
  
  // Отключаем анимации CSS
  const style = document.createElement('style');
  style.innerHTML = `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
  `;
  document.head.appendChild(style);
};

// Утилиты для создания снапшотов
export const createSnapshot = (component: React.ReactElement) => {
  const { render } = require('@testing-library/react');
  const { container } = render(component);
  return container.firstChild;
};

// Экспорт всех утилит testing-library для удобства
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';