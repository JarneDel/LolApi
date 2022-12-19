import {General} from './Models/general.js';
import {noItem} from './Items.js';
import {calculateRunes} from './Runes.js';

export const createImageElement = (src, alt, classes = []) => {
    let img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    for (const classI of classes) {
        img.classList.add(classI);
    }
    return img;
};


export function createCardTitleElement(Title) {
    let title = document.createElement("h2");
    title.classList.add("c-card__title");
    title.classList.add("u-italic");
    title.classList.add("u-uppercase");
    title.classList.add("u-serif");
    title.textContent = Title;
    return title;
}

export function createCardBodyElement() {
    const body = document.createElement('div');
    body.classList.add('c-card__body');
    body.classList.add('u-hidden');
    let kda = document.createElement("p");
    kda.classList.add('c-card__text');
    kda.classList.add('c-card__kda');
    let winrate = document.createElement("p");
    winrate.classList.add('c-card__text');
    winrate.classList.add('c-card__winrate');
    let games = document.createElement("p");
    games.classList.add('c-card__text');
    games.classList.add('c-card__played');
    body.appendChild(kda);
    body.appendChild(winrate);
    body.appendChild(games);
    return body;
}

export function createCardElement(img, title, card_body) {
    let card = document.createElement('div');
    let cardContainer = document.createElement('a');
    card.classList.add('u-notched-content');
    card.classList.add('c-card');
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(card_body);
    cardContainer.classList.add('c-card__container');
    cardContainer.classList.add('js-card-box');
    cardContainer.appendChild(card);
    return cardContainer;
}


export const createSvg = (name) => {
    // create polygon
    const svgPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svgPathElement.setAttribute('d', 'M 0 0 53 0 74 22 75 75 0 75 0 0z');


    // animate polygon
    const svgAnimateElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    svgAnimateElement.setAttribute('from', '1000');
    svgAnimateElement.setAttribute('to', '0');
    svgAnimateElement.setAttribute('dur', '3s');
    svgAnimateElement.setAttribute('fill', 'freeze');
    svgAnimateElement.setAttribute('begin', 'indefinite');
    svgAnimateElement.classList.add('js-svg-animate');
    svgPathElement.appendChild(svgAnimateElement);


    // create the svg
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 75 75');
    svg.appendChild(svgPathElement);
    svg.classList.add('c-abilities__icon__border');
    svg.dataset.name = name;
    return svg;
};

export function createTeamHeader(TeamColor, userWon) {
    // create grid
    const header = document.createElement('div');
    header.classList.add('c-team__header', 'c-team__grid');
    let victoryText = userWon ? 'Victory' : 'Defeat';
    let redTeamBlueTeam = TeamColor === 'Red' ? 'Blue Team' : 'Red Team';
    const headerList = [`${victoryText} <span class="team">(${redTeamBlueTeam})<span></span>`, 'KDA', 'Damage', 'Vision', 'Gold', 'CS', 'Items'];
    for (const headerItem of headerList) {
        const headerElement = document.createElement('div');
        headerElement.classList.add('c-team__header-item');
        headerElement.innerHTML = headerItem;
        header.appendChild(headerElement);
    }
    return header;
}

export function createTeamList(participantsArray) {
    const teamList = document.createElement('div');
    const maxDamage = Math.max(...participantsArray.map(participant => participant.totalDamageDealtToChampions));


    for (const participant of participantsArray) {
        const grid = document.createElement('div');
        grid.classList.add('c-team__grid');

        grid.appendChild(createColumnGeneral(participant));
        grid.appendChild(createColumnKDA(participant));
        grid.appendChild(createColumnDamage(participant, maxDamage));
        grid.appendChild(createColumnVision(participant));
        grid.appendChild(createColumnGold(participant));
        grid.appendChild(createColumnCS(participant));
        grid.appendChild(createColumnItems(participant));
        teamList.appendChild(grid);
    }

    return teamList;
}

export function createTeamDiff(yourTeam, enemyTeam, teamColor) {
    // your team total damage
    const yourTeamTotalDamage = yourTeam.reduce((previousValue, participant) => previousValue + participant.totalDamageDealtToChampions, 0);
    // enemy team total damage
    const enemyTeamTotalDamage = enemyTeam.reduce((previousValue, participant) => previousValue + participant.totalDamageDealtToChampions, 0);
    // your team total gold
    const yourTeamTotalGold = yourTeam.reduce((previousValue, participant) => previousValue + participant.goldEarned, 0);
    // enemy team total gold
    const enemyTeamTotalGold = enemyTeam.reduce((previousValue, participant) => previousValue + participant.goldEarned, 0);
    const yourTeamDamageRatio = (yourTeamTotalDamage / (yourTeamTotalDamage + enemyTeamTotalDamage)) * 100;
    const yourTeamGoldRatio = (yourTeamTotalGold / (yourTeamTotalGold + enemyTeamTotalGold)) * 100;
    console.info(yourTeamTotalDamage, enemyTeamTotalDamage);
    const container = document.createElement('div');
    container.classList.add('c-team-diff');
    const teamClass = teamColor === 'Blue' ? 'blueTeam' : 'redTeam';
    container.appendChild(createProgressBar(yourTeamTotalDamage, enemyTeamTotalDamage, yourTeamDamageRatio, 'Total Damage', teamClass));
    container.appendChild(createProgressBar(yourTeamTotalGold, enemyTeamTotalGold, yourTeamGoldRatio, 'Total Gold', teamClass));
    return container;
}

function createProgressBar(a, b, percentage, type, color) {
    const progressBar = document.createElement('div');
    progressBar.classList.add('c-progress-bar');
    progressBar.classList.add(color);
    const progress = document.createElement('div');
    progress.classList.add('c-progress-bar--progress');
    progress.classList.add(color);
    progress.style.width = `${percentage}%`;
    const text = document.createElement('div');
    text.classList.add('c-progress-bar--text');
    const spanA = document.createElement('span');
    spanA.textContent = a;
    const spanType = document.createElement('span');
    spanType.textContent = type;
    const spanB = document.createElement('span');
    spanB.textContent = b;
    text.appendChild(spanA);
    text.appendChild(spanType);
    text.appendChild(spanB);
    progressBar.appendChild(progress);
    progressBar.appendChild(text);
    return progressBar;
}

function createColumnGeneral(participant) {
    const champion = participant.championName;
    const firstTree = participant.perks.styles[0].style;
    const mainRune = participant.perks.styles[0].selections[0].perk;
    const secondTree = participant.perks.styles[1].style;
    const runes = calculateRunes(firstTree, mainRune, secondTree);

    const columnGeneral = document.createElement('div');
    columnGeneral.innerHTML = `
            <div class="c-match-card__header--champ js-champion-played">
            <img src="${General.ddragon}/img/champion/${champion}.png"
                 alt="${champion}"/>
            <span class="js-level">${participant.champLevel}</span>
            </div>
            <div class="c-match-card__header--summoners-runes-container">
                <img src="${General.ddragon}/img/spell/${General.summonerSpells[participant.summoner1Id]}.png"
                     alt="${participant.summoner1Id}"/>
                <img src="${General.ddragon}/img/spell/${General.summonerSpells[participant.summoner2Id]}.png"
                     alt="${participant.summoner2Id}"/>
                <img src="${General.ddragonImg + runes.firstTree.icon}"
                     alt="${runes.firstTree.name}"/>
                <img src="${General.ddragonImg + runes.secondTree.icon}"
                     alt="${runes.secondTree.name}"/>
            </div>
            <div class="c-match-card__header--summoner">
                <div class="js-summoner-name">${participant.summonerName}</div>
                <div class="js-summoner-level">Level ${participant.summonerLevel}</div>
            </div>
            
        `;
    columnGeneral.classList.add('c-participant__general');
    return columnGeneral;
}

function createColumnKDA(participant) {
    const columnKDA = document.createElement('div');
    columnKDA.classList.add('c-participant__kda');
    let ratio;
    if (participant.deaths !== 0) {
        ratio = ((participant.kills + participant.assists) / participant.deaths).toFixed(2) + ':1';
    } else {
        ratio = `<span class="perfect">Perfect</span>`;
    }
    columnKDA.innerHTML = `
        <span class="c-participant__kda-value"><span>${participant.kills}</span>/<span class="u-negative-color">${participant.deaths}</span>/<span>${participant.assists}</span> </span>
        <span class="c-participant__kda-ratio">${ratio}</span>
    `;
    return columnKDA;
}

function createColumnDamage(participant, maxDamage) {
    const columnDamage = document.createElement('div');
    columnDamage.classList.add('c-participant__damage');
    const value = document.createElement('div');
    value.classList.add('c-participant__damage-value');
    value.textContent = participant.totalDamageDealtToChampions;
    const ratio = document.createElement('div');
    ratio.classList.add('c-participant__damage-ratio');
    const progressBar = document.createElement('div');
    progressBar.style.width = `${(participant.totalDamageDealtToChampions / maxDamage) * 100}%`;
    progressBar.classList.add('c-participant__damage-progress-bar');
    ratio.appendChild(progressBar);

    columnDamage.appendChild(value);
    columnDamage.appendChild(ratio);

    return columnDamage;
}

function createColumnVision(participant) {
    const vision = document.createElement('div');
    vision.classList.add('c-participant__vision');
    vision.textContent = participant.visionScore;
    return vision;
}

function createColumnGold(participant) {
    const gold = document.createElement('div');
    gold.classList.add('c-participant__gold');
    gold.textContent = participant.goldEarned;
    return gold;
}

function createColumnCS(participant) {
    const cs = document.createElement('div');
    cs.classList.add('c-participant__cs');
    cs.textContent = participant.totalMinionsKilled + participant.neutralMinionsKilled;
    return cs;
}


function createColumnItems(participant) {
    const divItems = document.createElement('div');
    const ArrayItems = [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6];
    divItems.classList.add('c-participant__items');
    for (const item of ArrayItems) {
        const divItem = document.createElement('div');
        divItem.classList.add('c-participant__item');
        divItem.innerHTML = noItem(item);
        divItems.appendChild(divItem);
    }
    return divItems;
}