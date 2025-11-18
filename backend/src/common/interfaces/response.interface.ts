export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  path?: string;
  method?: string;
  errors?: string[];
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}
