import { createContext, useContext, useState } from 'react'
import { IContext } from '@/Interfaces/IContext'

const defaultContext: IContext = {
  "message": "default value"

}
export const AppContext = createContext<IContext>(defaultContext);