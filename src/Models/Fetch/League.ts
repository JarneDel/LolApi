import axios from "axios";
import { IUser } from "@/Interfaces/IUser";

const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error("No API key found in .env file");
const options = {
  headers: {
    "X-Riot-Token": apiKey,
  },
};


export default (() => {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const checkRateLimit = (error: any) => {
    if (error.response.status === 429) {
      console.error("Rate limit exceeded");
      const retryAfter = error.response.headers["retry-after"];
      console.error("Retrying after", retryAfter, "seconds");
      return retryAfter * 1000;
    }else{
      return false;
    }
  };
  const get: any = async (url: string) => {
    try {
      const response = await axios.get(url, options);
      return response.data;
    } catch (error: any) {
      // check for rate limit
      const retryAfter = checkRateLimit(error);
      if(retryAfter){
        await delay(retryAfter)
        return await get(url);
      }
      console.error(error);
      return null;
    }
  }

  const getSummonerInfo= (username: string, region: string) : Promise<IUser> => {
    console.debug("Getting summoner info for", username);
    const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}`;
    return get(url);
  };

  const getMatchIds = (puuid: string, region :string , count: number) : Promise<any> => {
    console.debug("Getting match id's for", puuid);
    let url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    return get(url);
  };

  const getMatchInfo = (matchID: string, region: string) : Promise<any> => {
    console.debug("Getting match info for", matchID);
    let url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchID}`;
    return get(url);
  };
  const getMatchTimeline =  (matchID: string, region: string) : Promise<any> => {
    console.debug("Getting match timeline for", matchID);
    let url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchID}/timeline`;
    return get(url);
  };

  return {
    getSummonerInfo,
    getMatchIds,
    getMatchInfo,
    getMatchTimeline,
  };
})();
