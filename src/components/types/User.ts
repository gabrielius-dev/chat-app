export interface UserResponse {
  success: boolean;
  message: string;
  user: UserInterface;
}

export interface UserInterface {
  username: string;
  password: string;
  _id: string;
}
