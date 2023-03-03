"use client"
import { IChampionData } from '@/Interfaces/IChampionListData'
import React from 'react'
import styles from "./ChampionCard.module.css"
import Image from "next/image"

const ChampionCard = ({ champion }: { champion: IChampionData }) => {

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Show popup")
  }

  return (
    <button onClick={handleClick} className={styles.cardContainer}>
      <div className={styles.card + " u-notched-content"}>
        <div className={styles.imageContainer}>
          <Image src={}></Image>
        </div>
      </div>
    </button>
  )
}


export default ChampionCard