import crab from "@/../public/crab.png"
import styles from "./NoResult.module.css"
import Image from 'next/image'
const NoResults = () => {
  return (
    <div className={styles.noResults}>
      <Image alt={""} src={crab}></Image>
      <span>We couldn't find any champions matching your search</span>
    </div>
  )
}

export default NoResults
