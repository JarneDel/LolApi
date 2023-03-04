import { IChampionData } from '@/Interfaces/IChampionListData'

export interface IChampionCallback {
  (data: IChampionData): void
}