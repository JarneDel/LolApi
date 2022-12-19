import {a11yClick} from './accessibility.js';
import {
    createCardBodyElement,
    createCardElement,
    createCardTitleElement,
    createImageElement
} from './elementCreator.js';
import {saveCursorPosition} from './animations.js';
import {showPopup} from './popup.js';
import {listenToSearchChampion} from './filter.js';

export function fillChampions(champions) {
    const championsName = Object.keys(champions.data);
    let i = 0;
    for (const dataKey in champions.data) {
        const champion = champions.data[dataKey];
        const championId = champion.key;
        let champName = championsName[i];
        if (champName === 'Fiddlesticks') {
            champName = 'FiddleSticks';
        }
        const imgUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${champName}_0.jpg`;
        const img = createImageElement(imgUrl, "", ['js-champ-img', 'c-card__img']);
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('c-card__img-container');
        imgContainer.appendChild(img);
        const title = createCardTitleElement(champion.name);
        const card_body = createCardBodyElement();
        const cardContainer = createCardElement(imgContainer, title, card_body);
        const card = cardContainer.querySelector('.c-card');
        card.dataset.tags = champion.tags.join(',');
        card.dataset.difficulty = champion.info.difficulty;
        card.dataset.champion = champion.name;
        card.dataset.championId = championId;
        cardContainer.href = `javascript:showPopup(allChampions.data.${champion.id});`;
        cardContainer.href = '#';
        cardContainer.addEventListener('click', () => {
            // console.log("clicked");
            showPopup(champion);
        });
        cardContainer.addEventListener('keyup', (e) => {
            if (a11yClick(e)) {
                showPopup(champion);
            }
        });
        // append child to container element
        document.querySelector('.js-champ-card-container').appendChild(cardContainer);
        i += 1;

    }
    listenToSearchChampion();
    document.addEventListener('mousemove', e => {
        saveCursorPosition(e.clientX, e.clientY);
    });
}




