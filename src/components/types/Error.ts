export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: ErrorInterface[];
}

export interface ErrorInterface {
  path: string;
  message: string;
}
