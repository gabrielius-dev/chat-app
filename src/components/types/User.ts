export interface UserResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface User {
  username: string;
  _id: string;
  lastOnline: string;
  online: boolean;
  img?: string;
}

export interface DatabaseUserResponse {
  success: boolean;
  message: string;
  user?: User;
}
