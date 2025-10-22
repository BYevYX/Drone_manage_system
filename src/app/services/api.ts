const API_BASE_URL = 'http://51.250.43.77:8080';

// Types based on backend API
export interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'manager' | 'operator' | 'contractor' | 'supplier';
  name?: string;
  verified?: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  status:
    | 'new'
    | 'in_progress'
    | 'planned'
    | 'completed'
    | 'rejected'
    | 'clarify';
  type: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  assignedOperatorId?: string;
  assignedSupplierId?: string;
  fields?: Field[];
  materials?: SelectedMaterial[];
  drones?: SelectedDrone[];
  processingType?: ProcessingType;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
}

export interface Field {
  id: string;
  name: string;
  area: number;
  coordinates?: [number, number][];
  crop?: string;
  location?: string;
  orderId?: string;
}

export interface Material {
  id: string;
  name: string;
  type: string;
  unit: string;
  pricePerUnit: number;
  availableQuantity: number;
  description?: string;
}

export interface SelectedMaterial {
  id: string;
  materialId: string;
  orderId: string;
  quantity: number;
  material?: Material;
}

export interface Drone {
  id: string;
  model: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  batteryLevel?: number;
  location?: string;
  specifications?: Record<string, unknown>;
}

export interface SelectedDrone {
  id: string;
  droneId: string;
  orderId: string;
  drone?: Drone;
}

export interface ProcessingType {
  id: string;
  name: string;
  description?: string;
  estimatedDuration: number;
  requiredEquipment?: string[];
}

export interface Review {
  id: string;
  orderId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  userId: string;
}

// API Client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token =
      typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>).Authorization =
        `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth methods
  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    const result = await this.request<{ token: string; user: User }>(
      '/v1/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );

    this.token = result.token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', result.token);
    }

    return result;
  }

  async register(userData: {
    email: string;
    password: string;
    phone?: string;
    role: string;
  }): Promise<{ token: string; user: User }> {
    return this.request('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/v1/me');
  }

  // Orders methods
  async getOrders(filters?: {
    status?: string;
    assignedOperatorId?: string;
    customerId?: string;
  }): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const endpoint = `/api/orders${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.request(`/api/orders/${orderId}`);
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(
    orderId: string,
    orderData: Partial<Order>,
  ): Promise<Order> {
    return this.request(`/api/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(orderId: string): Promise<void> {
    return this.request(`/api/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  async activateOrder(orderId: string): Promise<Order> {
    return this.request(`/api/orders/${orderId}/activate`, {
      method: 'POST',
    });
  }

  async deactivateOrder(orderId: string): Promise<Order> {
    return this.request(`/api/orders/${orderId}/activate`, {
      method: 'DELETE',
    });
  }

  // Fields methods
  async getFields(): Promise<Field[]> {
    return this.request('/api/fields');
  }

  async createField(fieldData: Partial<Field>): Promise<Field> {
    return this.request('/api/fields', {
      method: 'POST',
      body: JSON.stringify(fieldData),
    });
  }

  async getOrderFields(orderId: string): Promise<Field[]> {
    return this.request(`/api/orders/${orderId}/fields`);
  }

  async addFieldToOrder(orderId: string, fieldId: string): Promise<void> {
    return this.request(`/api/orders/${orderId}/fields/${fieldId}`, {
      method: 'POST',
    });
  }

  async removeFieldFromOrder(orderId: string, fieldId: string): Promise<void> {
    return this.request(`/api/orders/${orderId}/fields/${fieldId}`, {
      method: 'DELETE',
    });
  }

  // Materials methods
  async getMaterials(): Promise<Material[]> {
    return this.request('/v1/materials');
  }

  async createMaterial(materialData: Partial<Material>): Promise<Material> {
    return this.request('/v1/materials', {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async getSelectedMaterials(orderId: string): Promise<SelectedMaterial[]> {
    return this.request(`/v1/selected-materials/order/${orderId}`);
  }

  async selectMaterial(materialData: {
    materialId: string;
    orderId: string;
    quantity: number;
  }): Promise<SelectedMaterial> {
    return this.request('/v1/selected-materials', {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async removeSelectedMaterial(
    orderId: string,
    materialId: string,
  ): Promise<void> {
    return this.request(`/v1/selected-materials/${orderId}/${materialId}`, {
      method: 'DELETE',
    });
  }

  // Drones methods
  async getDrones(): Promise<Drone[]> {
    return this.request('/v1/drones');
  }

  async createDrone(droneData: Partial<Drone>): Promise<Drone> {
    return this.request('/v1/drones', {
      method: 'POST',
      body: JSON.stringify(droneData),
    });
  }

  async getSelectedDrones(orderId: string): Promise<SelectedDrone[]> {
    return this.request(`/v1/selected-drones/order/${orderId}`);
  }

  async selectDrone(droneData: {
    droneId: string;
    orderId: string;
  }): Promise<SelectedDrone> {
    return this.request('/v1/selected-drones', {
      method: 'POST',
      body: JSON.stringify(droneData),
    });
  }

  async removeSelectedDrone(droneId: string, orderId: string): Promise<void> {
    return this.request(`/v1/selected-drones/${droneId}/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Processing types methods
  async getProcessingTypes(): Promise<ProcessingType[]> {
    return this.request('/api/processing-types');
  }

  async createProcessingType(
    typeData: Partial<ProcessingType>,
  ): Promise<ProcessingType> {
    return this.request('/api/processing-types', {
      method: 'POST',
      body: JSON.stringify(typeData),
    });
  }

  // Recommended drones methods
  async getRecommendedDrones(typeId: string): Promise<Drone[]> {
    return this.request(`/api/recommended-drones/${typeId}`);
  }

  async addRecommendedDrone(typeId: string, droneId: string): Promise<void> {
    return this.request('/api/recommended-drones', {
      method: 'POST',
      body: JSON.stringify({ typeId, droneId }),
    });
  }

  // Reviews methods
  async getReviews(): Promise<Review[]> {
    return this.request('/api/reviews');
  }

  async createReview(reviewData: Partial<Review>): Promise<Review> {
    return this.request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Users methods
  async getUsers(): Promise<User[]> {
    return this.request('/v1/users');
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.request(`/v1/users/email/${email}`);
  }

  async getUserByPhone(phone: string): Promise<User> {
    return this.request(`/v1/users/phone/${phone}`);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    return this.request(`/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<void> {
    return this.request(`/v1/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Email verification
  async sendEmailVerification(email: string): Promise<void> {
    return this.request('/v1/email-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmail(token: string): Promise<void> {
    return this.request('/v1/verification', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export utility functions
export const formatOrderStatus = (status: Order['status']): string => {
  const statusMap = {
    new: 'Новая',
    in_progress: 'В обработке',
    planned: 'Запланирована',
    completed: 'Выполнена',
    rejected: 'Отклонена',
    clarify: 'Нужна доработка',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: Order['status']): string => {
  const colorMap = {
    new: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    planned: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    clarify: 'bg-rose-100 text-rose-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const formatDroneStatus = (status: Drone['status']): string => {
  const statusMap = {
    available: 'Доступен',
    in_use: 'В работе',
    maintenance: 'На обслуживании',
    offline: 'Не в сети',
  };
  return statusMap[status] || status;
};

export const getDroneStatusColor = (status: Drone['status']): string => {
  const colorMap = {
    available: 'bg-green-100 text-green-800',
    in_use: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    offline: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};
