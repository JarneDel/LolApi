import {animatePopup} from './animations.js';
import {General} from './Models/general.js';
import {statCalculator} from './matchInfo.js';
import {showNoUser} from './user.js';
import {displayAbilityImg} from './Modules/Abilities.js';
import {a11yClick} from './accessibility.js';

export const showPopup = champion => {
    animatePopup();
    const container = document.querySelector('.js-popup-container');
    container.querySelector('.js-popup-animate').classList.add('running');
    container.classList.remove('u-hidden');
    document.documentElement.style.overflow = 'hidden';
    const header = container.querySelector('.js-popup-header'); // (.c-popup__header)
    const body = container.querySelector('.js-popup-body'); // (.c-popup__content)
    header.querySelector('.js-popup-img').src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`;
    header.querySelector('.js-champ-name').textContent = champion.name;
    header.querySelector('.js-champ-title').textContent = champion.title;
    body.querySelector('.js-champ-lore').textContent = champion.lore;
    for (const icon of body.querySelectorAll('.js-role-icon')) {
        const tag = icon.dataset.name;
        // console.log(tag, e.tags);
        if (champion.tags.includes(tag)) {
            // console.log("Tag found");
            icon.classList.remove('u-hidden');
        }
    }

    displayAbilityImg(champion);
    // hide previous matches
    // shouldn't reload the matches if they are already loaded
    if (champion.id === General.loadedChampion) return;
    document.querySelector('.js-card-container').innerHTML = '';
    // clear the cards

    if (General.userIsLoaded) {
        statCalculator(champion).catch(err => {
            console.log(err);
        });
    } else {
        showNoUser(document.querySelector('.js-popup-content'));
    }
    document.querySelector('.c-popup').scrollTo(0, 0);
    document.querySelector('.c-popup__close').focus();
};

const hidePopup = () => {
    document.querySelector('.js-popup-container').classList.add('u-hidden');
    document.querySelector('.js-popup-animate').classList.remove('running');
    document.documentElement.style.overflow = "auto";
    document.querySelector('.js-popup-img').src = "";
    for (const icon of document.querySelectorAll('.js-role-icon')) {
        icon.classList.add("u-hidden");
    }
};


export function listenToHidePopup(){
    document.querySelector('.js-popup-container').addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hidePopup();
        }
    });

    document.querySelector('.js-popup-overlay').addEventListener('click', () => {
        hidePopup();
    });

    document.querySelector('.js-popup-close').addEventListener('click', () => {
        hidePopup();
    });

}

export function listenToPopupToSearchbar(){
    document.querySelector('.js-to-searchbar').addEventListener('click', () => {
        document.querySelector('.js-search-username').focus();
        hidePopup();
    });
    document.querySelector('.js-to-searchbar').addEventListener('keyup', (e) => {
        if (a11yClick(e)) {
            document.querySelector('.js-search-username').focus();
            hidePopup();
        }
    });
}