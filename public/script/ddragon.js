import {get} from './http.js';
import {General} from './Models/general.js';
import {fillChampions} from './champions.js';

export async function getSummonerSpells() {
    const res = await get(General.ddragon + '/data/en_GB/summoner.json');
    // console.log(res.data);
    const data = res.data;
    for (const key in data) {
        const name = data[key].id;
        const id = data[key].key;
        General.summonerSpells[id] = name;
    }
}

export async function getRunes() {
    General.runes = await get(General.ddragon + "/data/en_GB/runesReforged.json");
}

export const getApiVersion = async () => {
    let res = await get("https://ddragon.leagueoflegends.com/api/versions.json");
    return res[0];
};

export const getChampions = async () => {
    console.log("Ddragon version: ", General.apiVersion, General.ddragon);
    fillChampions(await get(`${General.ddragon}/data/en_GB/championFull.json`));

};