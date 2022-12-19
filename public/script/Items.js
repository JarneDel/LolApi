import {General} from './Models/general.js';

export function noItem(item) {
    // console.log("Item: ", item)
    if (item) {
        return `<img src="${General.ddragon}/img/item/${item}.png" alt="item">`;
    } else {
        return `<div class="no-item"></div> `;
    }
}