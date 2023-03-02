import { NextApiRequest, NextApiResponse } from "next";
import IMatchStats from "@/Interfaces/IMatchStats";
import db from "@/Models/Database/db";
import { Participant } from "@/Interfaces/IMatch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let out: IMatchStats = {};
  const { puuid } = req.query;
  // @ts-ignore
  const matches: IMatch[] = await db.getMatchesByPuuid(puuid);
  if (!matches) {
    res.status(404).json({ message: "No matches found" });
    return;
  }
  matches.forEach((match) => {
    const cID = match.championPlayed;
    const matchData: Participant = match.info.participants[match.userIndex];

    if (cID in out) {
      out[cID].matches += 1;
      out[cID].wins += Number(matchData.win);
      out[cID].kills += matchData.kills;
      out[cID].deaths += matchData.deaths;
      out[cID].assists += matchData.assists;
      out[cID].avgKills = out[cID].kills / out[cID].matches;
      out[cID].avgDeaths = out[cID].deaths / out[cID].matches;
      out[cID].avgAssists = out[cID].assists / out[cID].matches;
    }
    else {
      out[cID] = {
        matches: 1,
        wins: Number(matchData.win),
        kills: matchData.kills,
        deaths: matchData.deaths,
        assists: matchData.assists,
        avgKills: matchData.kills,
        avgDeaths: matchData.deaths,
        avgAssists: matchData.assists,
      };
    }

  });
  // sort by most played
  const sorted = Object.entries(out).sort((a, b) => b[1].matches - a[1].matches);
  res.status(200).json(sorted);
}
