export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  meta?: Record<string, unknown> | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
  } | null;
}
