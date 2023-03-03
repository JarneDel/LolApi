import { IUser } from '@/Interfaces/IUser'

export interface IUserCallback {
  (data: IUser): void
}