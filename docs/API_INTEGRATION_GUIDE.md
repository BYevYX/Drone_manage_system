# Comprehensive API Integration Guide

This guide provides complete documentation for the drone service ordering workflow and user registration system integration.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Services](#api-services)
4. [Type System](#type-system)
5. [State Management](#state-management)
6. [Components](#components)
7. [Form Validation](#form-validation)
8. [Authentication](#authentication)
9. [Usage Examples](#usage-examples)
10. [Error Handling](#error-handling)
11. [Testing](#testing)
12. [Deployment](#deployment)

## Overview

This integration provides a complete frontend client for the drone service ordering system, featuring:

- **User Registration & Authentication**: Complete user management with role-based access
- **Service Catalog**: Browse and select drone services with filtering and search
- **Order Management**: Full CRUD operations for service orders
- **Field Management**: Manage agricultural fields with GPS coordinates and metadata
- **Drone Fleet Management**: Monitor and control drone operations
- **Material Management**: Handle pesticides, fertilizers, and other materials
- **Review System**: Customer feedback and rating system
- **Real-time Updates**: Live status tracking and notifications

## Architecture

### Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **State Management**: Zustand with persistence
- **Form Validation**: Zod schemas
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React

### Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── services/          # Service-related components
│   ├── fields/            # Field management components
│   ├── drones/            # Drone management components
│   ├── materials/         # Material management components
│   └── reviews/           # Review system components
├── lib/
│   ├── api/               # API service functions
│   ├── stores/            # Zustand state stores
│   ├── hooks/             # Custom React hooks
│   └── validations/       # Zod validation schemas
├── types/                 # TypeScript type definitions
└── shared/                # Shared utilities and components
```

## API Services

### Core API Client

The base API client (`src/lib/api/client.ts`) provides:

- Automatic token management
- Request/response interceptors
- Error handling
- File upload utilities
- Request retry logic

```typescript
import { apiClient } from '@/src/lib/api/client';

// Example usage
const response = await apiClient.get('/orders');
```

### Service Modules

#### Authentication Service (`src/lib/api/auth.ts`)

```typescript
import { authApi } from '@/src/lib/api/auth';

// Login
const { user, tokens } = await authApi.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const newUser = await authApi.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  userRole: 'CLIENT'
});
```

#### Orders Service (`src/lib/api/orders.ts`)

```typescript
import { ordersApi } from '@/src/lib/api/orders';

// Create order
const order = await ordersApi.createOrder({
  typeProcessId: 'service-id',
  dataStart: '2024-01-15T10:00:00Z',
  fieldIds: ['field-1', 'field-2'],
  priority: 'HIGH'
});

// Get orders with filters
const orders = await ordersApi.getOrders({
  status: ['PENDING', 'APPROVED'],
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

#### Fields Service (`src/lib/api/fields.ts`)

```typescript
import { fieldsApi } from '@/src/lib/api/fields';

// Create field
const field = await fieldsApi.createField({
  name: 'North Field',
  area: 25.5,
  coordinates: [
    { latitude: 55.7558, longitude: 37.6176 },
    { latitude: 55.7568, longitude: 37.6186 },
    // ... more coordinates
  ],
  address: 'Moscow Region, Russia',
  cropType: 'wheat'
});

// Get weather data
const weather = await fieldsApi.getFieldWeather('field-id');
```

#### Drones Service (`src/lib/api/drones.ts`)

```typescript
import { dronesApi } from '@/src/lib/api/drones';

// Create drone
const drone = await dronesApi.createDrone({
  serialNumber: 'DJI001',
  model: 'Matrice 300 RTK',
  manufacturer: 'DJI',
  type: 'MULTIROTOR',
  specifications: {
    weight: 6.3,
    flightTime: 55,
    maxSpeed: 82,
    // ... more specs
  }
});

// Get real-time status
const status = await dronesApi.getDroneRealTimeStatus('drone-id');
```

## Type System

### Core Types (`src/types/api.ts`)

The type system provides comprehensive TypeScript definitions for all API models:

```typescript
// User types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userRole: 'CLIENT' | 'OPERATOR' | 'ADMIN' | 'CONTRACTOR';
  contractor?: ContractorInfo;
  // ... more fields
}

// Order types
interface Order {
  id: string;
  userId: string;
  typeProcessId: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  fields: OrderField[];
  selectedDrones: OrderDrone[];
  // ... more fields
}

// Field types
interface Field {
  id: string;
  name: string;
  area: number;
  coordinates: Coordinate[];
  cropType?: string;
  // ... more fields
}
```

### Request/Response Types

```typescript
// Create requests
interface CreateOrderRequest {
  typeProcessId: string;
  dataStart: string;
  fieldIds: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  // ... more fields
}

// API responses
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## State Management

### Zustand Stores

Each entity has its own Zustand store with persistence:

#### Orders Store (`src/lib/stores/orders.ts`)

```typescript
import { useOrdersStore } from '@/src/lib/stores/orders';

function OrdersComponent() {
  const {
    orders,
    isLoading,
    error,
    loadOrders,
    createOrder,
    updateOrder,
    deleteOrder
  } = useOrdersStore();

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCreateOrder = async (data) => {
    try {
      await createOrder(data);
      // Order automatically added to store
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {orders.map(order => (
        <div key={order.id}>{order.description}</div>
      ))}
    </div>
  );
}
```

#### Fields Store (`src/lib/stores/fields.ts`)

```typescript
import { useFieldsStore, useFieldsSelectors } from '@/src/lib/stores/fields';

function FieldsComponent() {
  const { loadFields, createField } = useFieldsStore();
  const { 
    fields, 
    selectedFields, 
    getActiveFields,
    selectField 
  } = useFieldsSelectors();

  const activeFields = getActiveFields();

  return (
    <div>
      {activeFields.map(field => (
        <div 
          key={field.id}
          onClick={() => selectField(field.id)}
          className={selectedFields.includes(field.id) ? 'selected' : ''}
        >
          {field.name} - {field.area} ha
        </div>
      ))}
    </div>
  );
}
```

## Components

### Service Selection Wizard

Complete multi-step wizard for service ordering:

```typescript
import ServiceSelectionWizard from '@/src/components/services/ServiceSelectionWizard';

function OrderPage() {
  const handleOrderComplete = (orderData) => {
    console.log('Order created:', orderData);
    // Handle successful order creation
  };

  return (
    <ServiceSelectionWizard
      onComplete={handleOrderComplete}
      onCancel={() => router.back()}
    />
  );
}
```

### Field Management

```typescript
import FieldManagement from '@/src/components/fields/FieldManagement';

function FieldsPage() {
  const handleFieldSelect = (field) => {
    console.log('Selected field:', field);
  };

  return (
    <FieldManagement
      onFieldSelect={handleFieldSelect}
      selectedFields={selectedFieldIds}
      multiSelect={true}
      showActions={true}
    />
  );
}
```

### Drone Fleet Dashboard

```typescript
import DroneManagement from '@/src/components/drones/DroneManagement';

function DronesPage() {
  return (
    <DroneManagement
      onDroneSelect={(drone) => setSelectedDrone(drone)}
      showActions={true}
    />
  );
}
```

## Form Validation

### Zod Schemas (`src/lib/validations/forms.ts`)

Comprehensive validation for all forms:

```typescript
import { validationSchemas } from '@/src/lib/validations/forms';

// Order validation
const orderData = validationSchemas.createOrder.parse({
  typeProcessId: 'service-id',
  dataStart: '2024-01-15T10:00:00Z',
  fieldIds: ['field-1'],
  priority: 'HIGH'
});

// Field validation
const fieldData = validationSchemas.createField.parse({
  name: 'Test Field',
  area: 10.5,
  coordinates: [/* coordinates */],
  address: 'Test Address'
});
```

### Form Hook Usage

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { validationSchemas } from '@/src/lib/validations/forms';

function CreateOrderForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(validationSchemas.createOrder)
  });

  const onSubmit = (data) => {
    // Data is automatically validated
    createOrder(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('typeProcessId')} />
      {errors.typeProcessId && (
        <span>{errors.typeProcessId.message}</span>
      )}
      {/* More form fields */}
    </form>
  );
}
```

## Authentication

### Protected Routes

```typescript
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';

function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="CLIENT">
      <div>Dashboard content</div>
    </ProtectedRoute>
  );
}
```

### Auth Hook

```typescript
import { useAuth } from '@/src/lib/hooks/useAuth';

function Header() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginButton onClick={() => login()} />;
  }

  return (
    <div>
      Welcome, {user.firstName}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Usage Examples

### Complete Order Flow

```typescript
import { useState } from 'react';
import { useOrdersStore } from '@/src/lib/stores/orders';
import { useFieldsStore } from '@/src/lib/stores/fields';
import ServiceSelectionWizard from '@/src/components/services/ServiceSelectionWizard';

function OrderFlow() {
  const [step, setStep] = useState('select-service');
  const { createOrder } = useOrdersStore();
  const { fields } = useFieldsStore();

  const handleOrderComplete = async (orderData) => {
    try {
      const order = await createOrder(orderData);
      setStep('order-created');
      console.log('Order created:', order);
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  switch (step) {
    case 'select-service':
      return (
        <ServiceSelectionWizard
          onComplete={handleOrderComplete}
          onCancel={() => setStep('cancelled')}
        />
      );
    
    case 'order-created':
      return <div>Order created successfully!</div>;
    
    default:
      return <div>Unknown step</div>;
  }
}
```

### Real-time Drone Monitoring

```typescript
import { useEffect } from 'react';
import { useDronesStore } from '@/src/lib/stores/drones';

function DroneMonitor({ droneId }) {
  const { currentDrone, getDrone, updateDroneLocation } = useDronesStore();

  useEffect(() => {
    // Load drone data
    getDrone(droneId);

    // Set up real-time updates (WebSocket or polling)
    const interval = setInterval(async () => {
      try {
        const status = await dronesApi.getDroneRealTimeStatus(droneId);
        if (status.location) {
          updateDroneLocation(droneId, status.location);
        }
      } catch (error) {
        console.error('Failed to update drone status:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [droneId]);

  if (!currentDrone) return <div>Loading...</div>;

  return (
    <div>
      <h2>{currentDrone.manufacturer} {currentDrone.model}</h2>
      <p>Status: {currentDrone.status}</p>
      <p>Battery: {currentDrone.batteryLevel}%</p>
      {currentDrone.currentLocation && (
        <p>
          Location: {currentDrone.currentLocation.latitude}, 
          {currentDrone.currentLocation.longitude}
        </p>
      )}
    </div>
  );
}
```

## Error Handling

### Global Error Boundary

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### API Error Handling

```typescript
// Automatic error handling in stores
const { error, clearError } = useOrdersStore();

useEffect(() => {
  if (error) {
    toast.error(error);
    clearError();
  }
}, [error, clearError]);
```

## Testing

### Unit Tests Example

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import OrdersComponent from './OrdersComponent';
import { useOrdersStore } from '@/src/lib/stores/orders';

// Mock the store
vi.mock('@/src/lib/stores/orders');

describe('OrdersComponent', () => {
  const mockLoadOrders = vi.fn();
  const mockCreateOrder = vi.fn();

  beforeEach(() => {
    useOrdersStore.mockReturnValue({
      orders: [],
      isLoading: false,
      error: null,
      loadOrders: mockLoadOrders,
      createOrder: mockCreateOrder,
    });
  });

  it('loads orders on mount', () => {
    render(<OrdersComponent />);
    expect(mockLoadOrders).toHaveBeenCalled();
  });

  it('creates order when form is submitted', async () => {
    render(<OrdersComponent />);
    
    fireEvent.click(screen.getByText('Create Order'));
    
    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalled();
    });
  });
});
```

### API Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ordersApi } from '@/src/lib/api/orders';
import { apiClient } from '@/src/lib/api/client';

vi.mock('@/src/lib/api/client');

describe('ordersApi', () => {
  it('creates order successfully', async () => {
    const mockOrder = { id: '1', description: 'Test Order' };
    apiClient.post.mockResolvedValue({ data: mockOrder });

    const result = await ordersApi.createOrder({
      typeProcessId: 'service-1',
      dataStart: '2024-01-15T10:00:00Z',
      fieldIds: ['field-1'],
      priority: 'HIGH'
    });

    expect(result).toEqual(mockOrder);
    expect(apiClient.post).toHaveBeenCalledWith('/orders', expect.any(Object));
  });
});
```

## Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://51.250.43.77:8080
NEXT_PUBLIC_APP_ENV=production
```

### Build Configuration

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Best Practices

### 1. Type Safety
- Always use TypeScript interfaces
- Validate API responses with Zod
- Use strict TypeScript configuration

### 2. Error Handling
- Implement global error boundaries
- Use consistent error messages
- Log errors for debugging

### 3. Performance
- Use React.memo for expensive components
- Implement proper loading states
- Cache API responses when appropriate

### 4. Security
- Validate all user inputs
- Implement proper authentication
- Use HTTPS in production

### 5. Testing
- Write unit tests for all utilities
- Test API integrations
- Use integration tests for critical flows

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check token expiration
   - Verify API endpoint configuration
   - Ensure proper CORS settings

2. **API Connection Issues**
   - Verify base URL configuration
   - Check network connectivity
   - Review API documentation

3. **State Management Issues**
   - Clear persisted state if needed
   - Check store initialization
   - Verify action dispatching

### Debug Tools

```typescript
// Enable debug logging
localStorage.setItem('debug', 'api:*');

// Clear persisted state
localStorage.removeItem('orders-store');
localStorage.removeItem('fields-store');
```

## Contributing

1. Follow TypeScript best practices
2. Write comprehensive tests
3. Update documentation
4. Use conventional commit messages
5. Ensure all linting passes

## Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation at http://51.250.43.77:8080/docs/
- Create detailed bug reports with reproduction steps