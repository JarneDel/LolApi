import {General} from './Models/general.js';

export function calculateRunes(firstTree, mainRune, secondTree) {
    if (General.runes == null) throw new Error("Runes not loaded");
    let out = {
        firstTree: {}, secondTree: {}
    };
    General.runes.forEach(rune => {
        if (rune.id === firstTree) {
            // console.info(rune)
            rune.slots[0].runes.forEach(specificRune => {
                if (specificRune.id === mainRune) {
                    out.firstTree.icon = specificRune.icon;
                    out.firstTree.name = specificRune.name;
                    out.firstTree.key = specificRune.key;
                }
            });
        }
        if (rune.id === secondTree) {
            out.secondTree.name = rune.name;
            out.secondTree.icon = rune.icon;
            out.secondTree.key = rune.key;
        }
    });
    return out;
}