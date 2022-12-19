import {trapFocus} from './accessibility.js'
import {listenToTags} from './filter.js';
import {listenToEventSearchChampion} from './inputs.js';
import {General} from './Models/general.js';
import {listenToInputSearchUser} from './user.js';
import {listenToHidePopup, listenToPopupToSearchbar} from './popup.js';
import './ddragon.js';
import * as ddragon from './ddragon.js';


// region Globals

let backend = window.location.origin;
if (window.location.port === "3000"){
    backend = `http://${window.location.hostname}:8080`
}
General.backend = backend;

// endregion



// region eventListeners
const listenToEvents = () => {

    // close popup with escape
    listenToHidePopup();
    listenToInputSearchUser();
    // trap focus in the container
    trapFocus(document.querySelector('.js-popup-container'));
    // filters
    listenToTags();
    listenToPopupToSearchbar();
    listenToEventSearchChampion();
};

// endregion



// region init
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    listenToEvents();
    // fill cards with champions
    ddragon.getApiVersion().then((res) => {
        General.apiVersion = res;
        console.info('API Version: ' + res, General.apiVersion);
        General.ddragon = `https://ddragon.leagueoflegends.com/cdn/${General.apiVersion}`;
        ddragon.getChampions().catch(err=>console.log(err));
        ddragon.getSummonerSpells().catch(err => console.log(err));
        ddragon.getRunes().catch(err => console.log(err));
    });

});
// endregion