import { WithId , Document} from "mongodb";

export interface IUser extends WithId<Document>{
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
  region?: string;
  nameLowerCase?: string;
  matchList?: string[];
}