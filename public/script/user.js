import {get, post} from './http.js';
import {General} from './Models/general.js';

export function showNoUser(ancestor) {
    ancestor.querySelector('.js-no-user').classList.remove('u-hidden');
    ancestor.querySelector('.js-no-user-img').classList.remove('u-hidden');
}

export function hideNoUser(ancestor) {
    ancestor.querySelector('.js-no-user').classList.add('u-hidden');
    ancestor.querySelector('.js-no-user-img').classList.add('u-hidden');
}

export const invalidateUserForm = () => {
    // invalidate search username
    const searchContainer = document.querySelector('.js-search-container')
    searchContainer.classList.add('is-invalid');
    searchContainer.addEventListener('animationend', () => {
        searchContainer.classList.remove('is-invalid');
    });
};

export const loadUser = async userObject => {
    // show loading
    const container = document.querySelector('.js-champ-card-container');
    container.classList.add('u-is-loading')
    // cache the user
    let url = General.backend + '/api/cacheMatches/';
    const res = await post(url, userObject);
    console.info(url, res);
    General.user = userObject;
    // get the matches per champion
    url = General.backend + '/api/v2/matches/' + userObject.puuid;
    const out = await get(url);
    console.info(url, out);
    General.userIsLoaded = true;
    // add the data to the cards
    console.info('About to add the values to the cards');
    const cardBoxes = document.querySelectorAll('.js-card-box');
    cardBoxes.forEach((cardBox) => {
        let found = false;
        const card = cardBox.firstElementChild;
        for (const [i, champion] of out.entries()) {
            if (parseInt(card.dataset.championId) === champion.championId) {
                found = true;
                cardBox.dataset.order = out.length - i;
                const body = card.querySelector('.c-card__body');
                body.classList.remove('u-hidden');
                body.querySelector('.c-card__played').innerText = `${champion.matches}${champion.matches > 1 ? ' games' : ' game'}`;
                const winrateElement = body.querySelector('.c-card__winrate');
                winrateElement.innerText = Math.round(champion.winrate * 100) + '%';
                if (champion.winrate > .5) {
                    winrateElement.classList.add('u-positive-color');
                } else {
                    winrateElement.classList.add('u-negative-color');
                }
                body.querySelector('.c-card__kda').innerText = champion.kda;
            }
        }
        if (!found) {
            cardBox.dataset.order = '0';
        }
    });
    // sort the cards
    // console.log(cards)

    const cardsArray = Array.prototype.slice.call(cardBoxes);
    cardsArray.sort((a, b) => {
        return parseInt(b.dataset.order) - parseInt(a.dataset.order);
    });

    let fragment = document.createDocumentFragment();
    cardsArray.forEach((card) => {
        fragment.appendChild(card);
    });
    container.innerHTML = '';
    container.appendChild(fragment);
    container.classList.remove("u-is-loading")
};

export function listenToInputSearchUser() {
    const usernameInput = document.querySelector('.js-search-username');
    usernameInput.addEventListener('focus', () => {
        document.querySelector('.c-searchBar').style.setProperty('--notched-border-color', '#00B7FF');
    });
    usernameInput.addEventListener('blur', () => {
        document.querySelector('.c-searchBar').style.removeProperty('--notched-border-color');
    });

    document.querySelector('.userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        let username = document.querySelector('.js-search-username').value.trim();
        let region = document.querySelector('.js-search-region').value;
        if (General.lastInputUsername === username) {
            invalidateUserForm();
            return;
        }

        const res = await get(`${General.backend}/api/user/${username}/${region}`);
        if (!res) {
            invalidateUserForm();
        } else {
            General.userIsLoaded = false;
            document.querySelector('.c-searchBar').classList.add('c-form-valid');
            const searchBar = document.querySelector('.c-searchBar');
            searchBar.style.setProperty('--notched-border-color', 'green');
            searchBar.style.setProperty('--notched-border-width', '.15em');
            document.querySelector('.js-search-username').textContent = `${res.username} found!`;
            await loadUser(res);
        }
        General.lastInputUsername = username;
    });
    document.querySelector('.js-search-username').addEventListener('keyup', () => {
        // console.log("change")
        document.querySelector('.c-searchBar').classList.remove('c-form-valid');
    });

}