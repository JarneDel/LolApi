'use client'
import styles from './home.module.css'
import React from "react";
import SummonerSearch from "@/components/SummonerSearch/SummonerSearch";
import { IUser } from '@/Interfaces/IUser'
import ChampionList from '@/components/ChampionList/ChampionList'

export default function Home() {
  const onUserFound = (data: IUser) => {
    console.log(data)
  }
  return (
    <>
      <SummonerSearch  onUserFound={(data: IUser) => onUserFound(data)}/>
      <ChampionList></ChampionList>
    </>
  );
}