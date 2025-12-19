import { Role } from "../utils/jwt";

export type RegisterDto = {
  email: string;
  password: string;
  name?: string;
};

export type LoginDto = {
  email: string;
  password: string;
};


export type CreateUserDto = {
  email: string;
  password: string;
  name?: string;
  role: Role;
};