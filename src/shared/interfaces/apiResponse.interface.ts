export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T | null;
  error: boolean;
  errors: string[] | null;
}
