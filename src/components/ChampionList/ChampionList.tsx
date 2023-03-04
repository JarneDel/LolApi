import NoResults from '@/components/states/NoResults'
import { useContext, useEffect, useState } from 'react'
import untypedData from "@/data/champion.json"
import { IChampionData, IChampionListData } from '@/Interfaces/IChampionListData'
import ChampionCard from '@/components/ChampionList/ChampionCard'
import styles from "./ChampionList.module.css"
import { IChampionCallback } from '@/Interfaces/IChampionCallback'
import { AppContext } from '@/components/AppContext'
import useSWR from 'swr'
const championListData: IChampionListData = untypedData;
const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ChampionList = ({onCardClicked}: {onCardClicked: IChampionCallback}) => {
  const [hasResults, setHasResults] = useState(true)
  const [userLoggedIn, setUserLoggedIn] = useState(false)

  const [context, setContext] = useContext(AppContext);

  const {data, isLoading, error} = useSWR(userLoggedIn? `/api/users/matches/${context.user.name}`: null, fetcher)
  useEffect(() => {
    console.log(data)
  }, [data])



  useEffect(() => {
    if (context.user) {
      setUserLoggedIn(true);
    }
  }, [context])

  const getCards = () => {
    const nodeList = []
    for (let champion in championListData.data) {
      nodeList.push(<ChampionCard key={champion} champion={championListData.data[champion]} onClick={onCardClicked}/>)
    }
    return nodeList
  }


  return (
    <div className={styles.row}>
      {hasResults ? (
        <div className={styles.cardsContainer}>
          {
            getCards()
          }
        </div>
      ) : (
        <NoResults></NoResults>
      )}
    </div>
  )
}

export default ChampionList
