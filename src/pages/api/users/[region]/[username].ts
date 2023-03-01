import { NextApiRequest, NextApiResponse } from "next";
import db from "@/Models/Database/db";
import league from "@/Models/Fetch/League";
import { IUser } from "@/Interfaces/IUser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IUser | { message: string }>
) {
  const { region, username } = req.query;
  // @ts-ignore
  const user = await db.getUserByName(username, region);
  if (user) res.status(200).json(user);
  else {
    // @ts-ignore
    const data: IUser = await league.getSummonerInfo(username, region);
    if (data) {
      // @ts-ignore
      data.region = region;
      const status = await db.insertUser(data);
      if (status) res.status(200).json(data);
      else res.status(500).json({ message: "Could not insert user" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  }
}
