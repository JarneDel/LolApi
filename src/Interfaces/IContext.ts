import { IUser } from '@/Interfaces/IUser'

export interface IContext {
  user?: IUser,
  message?: string
}