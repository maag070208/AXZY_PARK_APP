export interface IAuthToken {
  id: number;
  name: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  active: boolean;

  // Metadata
  iat: number;
  exp: number;
}
