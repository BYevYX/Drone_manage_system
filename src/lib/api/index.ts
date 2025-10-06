// Export the main API client
export {
  apiClient,
  tokenStorage,
  apiRequest,
  paginatedRequest,
  uploadFile,
  uploadFiles,
  downloadFile,
  healthCheck,
} from './client';

// Export all API services
export { authApi } from './auth';
export { default as ordersApi } from './orders';
export { default as fieldsApi } from './fields';
export { default as dronesApi } from './drones';
export { default as materialsApi } from './materials';
export { default as processingTypesApi } from './processing-types';
export { default as reviewsApi } from './reviews';
export { default as usersApi } from './users';

// Import for combined API object
import { authApi } from './auth';
import dronesApi from './drones';
import fieldsApi from './fields';
import materialsApi from './materials';
import ordersApi from './orders';
import processingTypesApi from './processing-types';
import reviewsApi from './reviews';
import usersApi from './users';

// Export default combined API object
export const api = {
  auth: authApi,
  orders: ordersApi,
  fields: fieldsApi,
  drones: dronesApi,
  materials: materialsApi,
  processingTypes: processingTypesApi,
  reviews: reviewsApi,
  users: usersApi,
};

export default api;
