'use client'

import styles from './SummonerSearch.module.css'
import notch from '@/styles/notch.module.css'
import { ChangeEventHandler, useContext, useEffect, useState } from 'react'
import useSWR from 'swr'
import { IUser } from '@/Interfaces/IUser'
import { IUserCallback } from '@/Interfaces/IUserCallback'
import { AppContext } from '@/components/AppContext'

const SummonerSearch = ({onUserFound}: {onUserFound: IUserCallback}) => {
  const regions = [
    { value: 'euw1', label: 'EUW' },
    { value: 'na1', label: 'NA' },
    { value: 'eun1', label: 'EUNE' },
    { value: 'br1', label: 'BR' },
    { value: 'jp1', label: 'JP' },
    { value: 'kr', label: 'KR' },
    { value: 'la1', label: 'LAN' },
    { value: 'la2', label: 'LAS' },
    { value: 'oc1', label: 'OCE' },
    { value: 'tr1', label: 'TR' },
    { value: 'ru', label: 'RU' },
  ]
  const [region, setRegion] = useState(regions[0].value)
  const [username, setUsername] = useState('');
  const [previousUsername, setPreviousUsername] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false)
  const [success, setSuccess] = useState(false)
  const [hasError, setError] = useState(false)
  // @ts-ignore
  const [context, setContext] = useContext(AppContext)

  let url = `/api/users/${region}/${username}`
  const fetcher = (url: RequestInfo | URL) => fetch(url).then(r => r.json())
  const { data, isLoading, error } = useSWR(shouldFetch ? url : null, fetcher)

  useEffect(() => {
    // wait for animation to finish and then set hasError to false
    if (hasError) {
      setTimeout(() => {
        setError(false)
      }, 200)
    }
  }, [hasError])


  useEffect(() => {
    if (data) {
      console.log(data)
      if ('message' in data) setError(true)
      else if ("puuid" in data) {
        setPreviousUsername(data.name)
        // onUserFound(data)
        setUsername('')
        setSuccess(true)
        // set context
        setContext({user: data})
      }
      setShouldFetch(false)
    }
  }, [data])

  const searchForUser = (e: any) => {
    e.preventDefault()
    if (username === '' || username === previousUsername) {
      setError(true)
      return;
    }
    setShouldFetch(true)
  }

  function isValid() {
    if (success) return styles.valid
    if (hasError) return styles.invalid
    return ''
  }

  const resetResults = () => {
    setSuccess(false)
    setError(false)
  }

  return (
    <div className="o-row">
      <div className="u-horizontal u-center">
        <form
          onSubmit={searchForUser}
          onChange={() => resetResults()}
          className={styles.userForm + ' ' + isValid()}
        >
          <label htmlFor="user-username" className="u-hidden">
            username
          </label>
          <div className={styles.searchBar + ' ' + notch.notchedBorder}>
            <input
              type="text"
              name="username"
              className={styles.searchBarInput}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder={previousUsername ? previousUsername : "Summoner name"}
              value={username}
            />
            <label htmlFor="region" aria-hidden="true"></label>
            <select
              name="region select"
              className={styles.searchBarRegion}
              aria-label="Select region"
              onChange={e => setRegion(e.target.value)}
            >
              {regions.map(region => {
                return (
                  <option value={region.value} key={region.value}>
                    {region.label}
                  </option>
                )
              })}
            </select>
            <button
              type="submit"
              value="Submit"
              className={styles.searchBarSubmit + ' u-focus-border'}
              name="submit search for user"
              aria-label="submit query"
            >
              <svg className={styles.searchBarSearchIcon} viewBox="0 0 24 24">
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
              <svg className={styles.searchBarValid} viewBox="0 0 24 24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SummonerSearch
