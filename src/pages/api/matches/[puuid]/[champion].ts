import { NextApiRequest, NextApiResponse } from "next";
import db from "@/Models/Database/db";
import { IMatch } from "@/Interfaces/IMatch";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { puuid, champion } = req.query;
  // @ts-ignore
  const matches: IMatch[] = await db.getMatchesByPuuidAndChampion(puuid, Number(champion));
  if (matches) {
    // matches.sort((a, b) => b.info.gameCreation - a.info.gameCreation);
    res.status(200).json(matches);
  }
  else res.status(404).json({ message: "No matches found" });
}