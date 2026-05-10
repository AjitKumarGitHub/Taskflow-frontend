export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type User = {
  id: string;
  email: string;
};

export type AuthSession = {
  token: string;
  user: User & { role?: "admin" | "user" };
};


export type Task = {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};



