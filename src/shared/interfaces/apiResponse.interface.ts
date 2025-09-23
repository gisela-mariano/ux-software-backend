export interface BaseApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
  error: boolean;
  errors: string[] | null;
}
