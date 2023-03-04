'use client'
import { IChampionData } from '@/Interfaces/IChampionListData'
import React from 'react'
import styles from './ChampionCard.module.css'
import Image from 'next/image'
import { IChampionCallback } from '@/Interfaces/IChampionCallback'
import { useAppContext } from '@/app/page'

const ChampionCard = ({ champion, onClick }: { champion: IChampionData, onClick: IChampionCallback }) => {
  const handleClick = () => {
    console.log('Show popup', champion.id)
    onClick(champion)

  }
  let champName = champion.id
  if (champName === 'Fiddlesticks') {
    champName = 'FiddleSticks'
  }
  const src = '/centered/' + champName + '_0.jpg'

  return (
    <button onClick={handleClick} className={styles.cardContainer}>
      <section className={styles.card + ' u-notched-content'}>
        <div className={styles.imageContainer}>
          <Image
            src={src}
            alt={champion.name}
            width={300}
            height={300}
            className={styles.cardImage}
          ></Image>
        </div>
        <h2 className={styles.cardTitle}>{champion.name}</h2>
      </section>

    </button>
  )
}

export default ChampionCard
