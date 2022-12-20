import {get} from './http.js';
import {hideLoadingIconStatistics, showLoadingIconStatistics} from './animations.js';
import {hideNoUser} from './user.js';
import {General} from './Models/general.js';
import {secondsToMinutes, timeDifference} from './time.js';
import {calculateRunes} from './Runes.js';
import {noItem} from './Items.js';
import {trapFocus} from './accessibility.js';
import {createTeamDiff, createTeamHeader, createTeamList} from './elementCreator.js';

export const statCalculator = async champion => {
    console.debug(champion);
    const containerElement = document.querySelector('.js-match-history');
    // show loading icon
    showLoadingIconStatistics(containerElement);
    // hide notfound
    hideNoUser(containerElement);
    const url = General.backend + `/api/v2/matches/${General.user.puuid}/${champion.id}`;
    const matchList = await get(url);
    if (matchList.length === 0) {
        noMatches(champion.name)
    }
    General.loadedChampion = champion.id;
    const cards = containerElement.querySelector('.js-card-container');
    // clear the cards
    cards.innerHTML = '';
    matchList.forEach(match => {
        // console.log(match);
        const matchId = match.matchid;
        const userIndex = match.userIndex;
        const timeAgo = timeDifference(new Date(), new Date(match.info.gameEndTimestamp));

        const card = document.createElement('div');
        const gameDuration = secondsToMinutes(match.info.gameDuration);
        const participant = match.info.participants[userIndex];
        const win = participant.win ? "WIN" : "LOSS";
        const winColor = participant.win ? "u-positive-color" : "u-negative-color";
        const champion = participant.championName;
        const firstTree = participant.perks.styles[0].style;
        const mainRune = participant.perks.styles[0].selections[0].perk;
        const secondTree = participant.perks.styles[1].style;
        const runes = calculateRunes(firstTree, mainRune, secondTree);
        const minionsKilled = participant.totalMinionsKilled + participant.neutralMinionsKilled;
        const minionsPerMinute = (minionsKilled / match.info.gameDuration * 60).toFixed(2);
        // console.info(participant.summoner1Id, participant.summoner2Id);
        // rune stuff
        const ddragon = General.ddragon;
        const ddragonImg = General.ddragonImg;
        card.classList.add('c-match-card');
        card.classList.add('js-match-card');
        card.classList.add('u-notched-border');
        card.innerHTML = `
                <div class="c-match-card__header">
                    <div class="c-match-card__header--metadata">
                        <h3 class="js-game-type">${match.info.gameMode}</h3>
                        <p class="js-game-date">${timeAgo}</p>
                        <p>
                            <span class="js-outcome ${winColor}">${win}</span>
                            <span class="c-match-card__header--metadata--game-duration">${gameDuration}</span>
                        </p>
                    </div>

                    <div class="c-match-card__header--champ js-champion-played">
                        <img src="${ddragon}/img/champion/${champion}.png"
                             alt="${champion}"/>
                        <span class="js-level">${participant.champLevel}</span>
                    </div>
                    <div class="c-match-card__header--summoners-runes-container">
                        <img src="${ddragon}/img/spell/${General.summonerSpells[participant.summoner1Id]}.png"
                             alt="${participant.summoner1Id}"/>
                        <img src="${ddragon}/img/spell/${General.summonerSpells[participant.summoner2Id]}.png"
                             alt="${participant.summoner2Id}"/>
                        <img src="${ddragonImg + runes.firstTree.icon}"
                             alt="${runes.firstTree.name}"/>
                        <img src="${ddragonImg + runes.secondTree.icon}"
                             alt="${runes.secondTree.name}"/>
                    </div>
                    <div class="c-match-card__header--result">
                        <p class="c-match-card__header--result--kda">
                            <span class="js-kills">${participant.kills}</span> /
                            <span class="js-deaths u-negative-color">${participant.deaths}</span> /
                            <span class="js-assists">${participant.assists}</span>
                        </p>
                        <p class="c-match-card__header--result--kda-number"><span class="js-kda">
                            ${((participant.kills + participant.assists) / participant.deaths).toFixed(2)}</span>
                            KDA</p>
                        <p class="c-match-card__header--result--cs">
                            <span class="js-minions-killed">${minionsKilled}</span> CS
                            (<span class="js-minions-killed-per-minute">${minionsPerMinute}</span>)
                        </p>
                        <p class="c-match-card__header--result--vision"><span class="js-vision">${participant.visionScore}</span>
                            vision</p>
                    </div>
                    <div class="c-match-card__header--items">
                        ${noItem(participant.item0)}
                        ${noItem(participant.item1)}
                        ${noItem(participant.item2)}
                        ${noItem(participant.item3)}
                        ${noItem(participant.item4)}
                        ${noItem(participant.item5)}
                        ${noItem(participant.item6)}
                    </div>
                    <div class="c-expand-container">
                        <button class="js-expand">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                            <path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/>
                            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
                          </svg>
                        </button>
                    </div>
                </div>`;
        card.querySelector('.js-expand').addEventListener('click', () => {
            card.classList.toggle('js-card-expanded');
            card.querySelector('.js-expand').querySelector('svg').classList.toggle('u-rotate-180');
            if (card.classList.contains('js-card-expanded')) {
                loadMatchDetails(matchId, match, card);
            } else {
                console.log('remove');
                card.querySelector('.js-match-body').classList.add('u-hidden');
            }
        });
        cards.appendChild(card);
        // hide loading icon


    });
    hideLoadingIconStatistics(containerElement);
    trapFocus(document.querySelector('.js-popup-container'));
};


const noMatches = function (championName){
   let element = document.querySelector('.js-no-matches');
   element.classList.remove('u-hidden');
   element.querySelector('span').textContent = championName;

}



const loadMatchDetails = async (matchId, match, card) => {
    // toggle up and down arrow
    // check if match details are already loaded

    // if data is already loaded, toggle up and down arrow and return
    if (card.classList.contains('loaded')) {
        card.querySelector('.js-match-body').classList.remove('u-hidden');
        return;
    }


    const matchBody = document.createElement('div');
    matchBody.classList.add('c-match__body');
    matchBody.classList.add('js-match-body');
    const overflow = document.createElement('div');
    overflow.classList.add('u-overflow-hidden');
    overflow.appendChild(matchBody);
    card.appendChild(overflow);
    const title = document.createElement('h3');
    title.classList.add('c-match__title');
    title.innerText = 'Match performance';
    matchBody.appendChild(title);
    const grid = document.createElement('div');
    grid.classList.add('c-match__performance-grid');

    // team your team:
    let userWon = match.info.participants[match.userIndex].win;
    let yourTeam, enemyTeam, yourTeamColor, enemyTeamColor;
    if (match.userIndex <= 4) {
        yourTeam = match.info.participants.slice(0, 5);
        enemyTeam = match.info.participants.slice(5, 10);
        yourTeamColor = 'Blue';
        enemyTeamColor = 'Red';
    } else {
        yourTeam = match.info.participants.slice(5, 10);
        enemyTeam = match.info.participants.slice(0, 5);
        yourTeamColor = 'Red';
        enemyTeamColor = 'Blue';
    }
    // create your team div
    const yourTeamDiv = document.createElement('div');
    yourTeamDiv.classList.add('c-match__team');
    yourTeamDiv.classList.add('c-match__team--your');
    yourTeamDiv.appendChild(createTeamHeader(yourTeamColor, userWon));
    // create team body
    yourTeamDiv.appendChild(createTeamList(yourTeam));

    // create enemy team div
    const enemyTeamDiv = document.createElement('div');
    enemyTeamDiv.classList.add('c-match__team');
    enemyTeamDiv.classList.add('c-match__team--enemy');
    enemyTeamDiv.appendChild(createTeamHeader(enemyTeamColor, !userWon));
    // create team body
    enemyTeamDiv.appendChild(createTeamList(enemyTeam));


    // teamDiff.appendChild(createTeamDiff(yourTeam, enemyTeam));


    matchBody.appendChild(yourTeamDiv);
    matchBody.appendChild(createTeamDiff(yourTeam, enemyTeam, yourTeamColor));
    matchBody.appendChild(enemyTeamDiv);
    matchBody.appendChild(grid);
    card.classList.add('loaded');

};
