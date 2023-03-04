'use client'
import styles from './home.module.css'
import { createContext, useContext, useEffect, useState } from 'react'
import SummonerSearch from "@/components/SummonerSearch/SummonerSearch";
import { IUser } from '@/Interfaces/IUser'
import ChampionList from '@/components/ChampionList/ChampionList'
import { IChampionData } from '@/Interfaces/IChampionListData'
import { AppContext } from '@/components/AppContext'

export default function Home() {
  const onUserFound = (data: IUser) => {
    console.log(data)
  }
  const onShowPopup = (data: IChampionData) => {
    console.log("Show popup for", data.name)

  }
  const [context, setContext] = useState("default context value");
  useEffect(() => {
    console.log("Context value", context)
  }, [context])
  return (
    <>
      <AppContext.Provider value={[context, setContext]}>
        <SummonerSearch  onUserFound={(data: IUser) => onUserFound(data)}/>
        <ChampionList onCardClicked={onShowPopup}></ChampionList>
      </AppContext.Provider>
    </>
  );
}
