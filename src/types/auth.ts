export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  surname?: string;
  userRole: 'CLIENT' | 'OPERATOR' | 'ADMIN' | 'CONTRACTOR';
  contractor?: ContractorInfo;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface ContractorInfo {
  companyName: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  contactPerson: string;
  website?: string;
  description?: string;
  certifications: string[];
  serviceAreas: string[];
  specializations: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginByIdCredentials {
  userId: string;
}

export interface RegisterCredentials {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  surname?: string;
  userRole: User['userRole'];
  contractor?: Partial<ContractorInfo>;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginById: (credentials: LoginByIdCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  forgotPassword: (request: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

export interface ModalState {
  isOpen: boolean;
  mode: 'login' | 'register' | 'forgot-password' | 'reset-password';
}

export interface ModalActions {
  openModal: (mode: ModalState['mode']) => void;
  closeModal: () => void;
  switchMode: (mode: ModalState['mode']) => void;
}

export type ModalStore = ModalState & ModalActions;

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
  userId?: string;
}

export interface RegisterFormData {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  surname?: string;
  userRole: User['userRole'];
  contractor?: Partial<ContractorInfo>;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
}
