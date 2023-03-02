export default interface IMatchStats {
  [key: number]: {
    matches: number;
    wins: number;
    kills: number,
    deaths: number,
    assists: number,
    avgKills: number,
    avgDeaths: number,
    avgAssists: number
  }
}