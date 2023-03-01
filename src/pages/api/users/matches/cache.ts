import { NextApiRequest, NextApiResponse } from "next";
import db from "@/Models/Database/db";
import region from "@/Models/region";
import League from "@/Models/Fetch/League";
import { IUser } from "@/Interfaces/IUser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "POST":
      const body = req.body as IUser;
      if (body.region === undefined) {
        res.status(400).json({ message: "Region is undefined" });
        return;
      }
      const globalRegion = region(body.region);
      const amount = Number(process.env.REQUEST_AMOUNT) || 10;
      const matchList = await League.getMatchIds(
        body.puuid,
        globalRegion,
        amount
      );
      const existingMatches = body.matchList || [];
      const newMatches = matchList.filter(
        (match: string) => !existingMatches.includes(match)
      );
      const matches = await db.checkIfMatchesExist(newMatches);
      console.log(matches);
      let matchesToInsert: string[] = [];
      newMatches.forEach((match: string) => {
        for (let i = 0; i < matches.length; i++) {
          if (match === matches[i].matchId) {
            return;
          }
        }
        matchesToInsert.push(match);
      });

      await Promise.all(
        matchesToInsert.map(async (match: string) => {
          const matchData = await League.getMatchInfo(match, globalRegion);
          await db.insertMatch(matchData, body.puuid);
        })
      );
      await db.addMatchesToUser(matchesToInsert, body.puuid)
      res
        .status(200)
        .json({
          message: `success: ${matchesToInsert.length} matches inserted`,
        });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
