import NoResults from '@/components/states/NoResults'
import { useState } from 'react'
import untypedData from "@/data/champion.json"
import { IChampionData, IChampionListData } from '@/Interfaces/IChampionListData'
import ChampionCard from '@/components/ChampionList/ChampionCard'
const data: IChampionListData = untypedData;
console.log(data)
const ChampionList = () => {
  const [hasResults, setHasResults] = useState(true)
  const getCards = () => {
    const nodeList = []
    for (let champion in data.data) {
      nodeList.push(<ChampionCard key={champion} champion={data.data[champion]}/>)
    }
    return nodeList
  }


  return (
    <div className="o-row">
      {hasResults ? (
        <div className="o-container c-cards__container">
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
