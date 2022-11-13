
// region Globals
let htmlElements = {
    popup: {}, abilities: {}, filters: {}
};
let allChampions = {};
let backend = window.location.origin;
// for development only (live server)
if (backend === "http://127.0.0.1:3000") {
    // set backend to 8080
    backend = "http://127.0.0.1:8080";
}
let version = "12.19.1";

let userIsLoaded = false;
let loadedChampion = undefined;
let user;
let ddragon = `https://ddragon.leagueoflegends.com/cdn/${version}`;
const ddragonImg = "https://ddragon.leagueoflegends.com/cdn/img/";
let summonerSpells = {};
let runes = {};
let pos = {x: 0, y: 0}
// endregion

// region api

const getRequest = async function (url) {
    return await fetch(url)
        .then((res) => res.json())
        .catch((err) => console.warn(err));
};
const postRequest = async function (url, data) {
    return await fetch(url, {
        method: "POST", headers: {
            "Content-Type": "application/json",
        }, body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .catch((err) => console.warn(err));
}
const getChampions = async () => {
    const champions = await getRequest(`${ddragon}/data/en_GB/championFull.json`);
    console.log(champions);
    allChampions = champions;
    fillChampions(champions);
};
const getApiVersion = async () => {
    let res = await getRequest("https://ddragon.leagueoflegends.com/api/versions.json");
    return res[0];
};


// endregion

// region userInput

const invalidateUserForm = () => {
    htmlElements.submitUser.classList.add("is-invalid");
    htmlElements.submitUser.addEventListener("animationend", () => {
        htmlElements.submitUser.classList.remove("is-invalid");
    });
};

const filterChampionsByPlayed = out => {
    document.querySelector('#orderChampion').classList.add('u-hidden');

    const selector = element => element.querySelector()


};

const loadUser = async userObject => {
    // cache the user
    let url = backend + "/api/cacheMatches/";
    const res = await postRequest(url, userObject)
    console.info(url, res)
    user = userObject
    // get the matches per champion
    url = backend + "/api/v2/matches/" + userObject.puuid;
    const out = await getRequest(url);
    console.info(url, out);
    userIsLoaded = true;
    // add the data to the cards
    console.info("About to add the values to the cards");
    const cards = document.querySelectorAll('.c-card')
    cards.forEach((card) => {
        let found = false
        for (const [i, champion] of out.entries()) {
            if (parseInt(card.dataset.championId) === champion.championId) {
                found = true;
                // console.info(i, champion);
                card.dataset.order = out.length - i;
                // card.style.order = 0 - out.length + i;
                // card.tabIndex = 1+ i;
                const body = card.querySelector('.c-card__body');
                body.classList.remove("u-hidden")
                body.querySelector('.c-card__played').innerText = `${champion.matches}${champion.matches > 1 ? " games" : " game"}`;
                const winrateElement = body.querySelector('.c-card__winrate');
                winrateElement.innerText = Math.round(champion.winrate * 100) + "%";
                if (champion.winrate > .5) {
                    winrateElement.classList.add("u-positive-color")
                } else {
                    winrateElement.classList.add("u-negative-color")
                }
                body.querySelector('.c-card__kda').innerText = champion.kda;
            }
        }
        if (!found){
            // console.info("not found", card.dataset.championId, out.length);
            // card.tabIndex = out.length + 1;
            card.dataset.order = "0";
        }
    });
    // sort the cards
    // console.log(cards)
    const cardsArray = Array.prototype.slice.call(cards);
    cardsArray.sort((a, b) => {
        return parseInt(b.dataset.order) - parseInt(a.dataset.order);
    });
    // console.log(cardsArray)
    let fragment = document.createDocumentFragment();
    cardsArray.forEach((card) => {
        fragment.appendChild(card);
    });
    const container = document.querySelector('.js-champ-card-container')
    container.innerHTML = "";
    container.appendChild(fragment);


    // filterChampionsByPlayed(out);
};

// endregion

// region eventListeners

function saveCursorPosition(clientX, clientY) {
    pos.x = (clientX / window.innerWidth).toFixed(2)*100;
    pos.y = (clientY / window.innerHeight).toFixed(2)*100;
    // Do not save the cursor position if the animation is already running
    if (htmlElements.popup.animated.classList.contains('running')) {
        return;
    }
    
    document.documentElement.style.setProperty('--mouse-pos-x', `${pos.x}%`);
    document.documentElement.style.setProperty('--mouse-pos-y', `${pos.y}%`);
}

const listenToEvents = () => {
    // user form
    const usernameInput = document.querySelector('.js-search-username')
    usernameInput.addEventListener("focus", (e) => {document.querySelector('.c-searchBar').style.setProperty("--notched-border-color", "#00B7FF")
    });
    usernameInput.addEventListener('blur', (e) => {
        document.querySelector('.c-searchBar').style.removeProperty("--notched-border-color")
    })

    htmlElements.searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        let username = document.querySelector(".js-search-username").value.trim();
        let region = document.querySelector(".js-search-region").value;
        const res = await getRequest(`${backend}/api/user/${username}/${region}`);
        if (!res) {
            invalidateUserForm();
        } else {
            userIsLoaded = false;
            document.querySelector(".c-searchBar").classList.add("c-form-valid")
            document.querySelector(".js-search-username").textContent = `${res.username} found!`;
            loadUser(res);
        }
    });

    const searchInput = htmlElements.searchForm.querySelector('.js-search-username')
    const searchBar = document.querySelector('.c-searchBar')

    searchInput.addEventListener('keyup', (e) => {
        // console.log("change")
        searchBar.classList.remove('c-form-valid')})


    // close popup via click on the background
    htmlElements.popup.overlay.addEventListener("click", hidePopup);

    htmlElements.popup.close.addEventListener("click", hidePopup);
    htmlElements.popup.close.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            hidePopup();
        }
    });

    // filters
    htmlElements.filters.itemAll.forEach((item) => {
        // two events for accessibility
        item.addEventListener("click", (e) => {
            tagClicked(e, item);
        });
        // so that the element is selectable with the keyboard
        item.addEventListener("keyup", (e) => {
            if (a11yClick(e)) {
                // console.log("a11y click");
                tagClicked(e, item);
            }
        });
    });

    document.querySelector('.js-to-searchbar').addEventListener('click', () => {
        document.querySelector('.js-search-username').focus()
        hidePopup();
    });
    document.querySelector('.js-to-searchbar').addEventListener('keyup', () => {
        if (a11yClick(e)) {
            document.querySelector('.js-search-username').focus()
            hidePopup();
        }
    });

    document.addEventListener('mousemove', e => {
        saveCursorPosition(e.clientX, e.clientY)
    })

};

// endregion

// region filters

const tagClicked = (e, item) => {
    htmlElements.filters.itemAll.forEach((filter) => {
        filter.classList.remove("u-selected");
    });
    item.classList.add("u-selected");
    // show the champions that have the tag
    document.querySelectorAll('.c-card').forEach((card) => {
        let tags = card.dataset.tags.split(',');
        // console.log(tags);
        if (tags.includes(item.dataset.tag) || item.dataset.tag === "All") {
            card.classList.remove("u-hidden");
        } else {
            card.classList.add('u-hidden');
        }
    });
};


// endregion

// region video

function loadAllVideo(champion) {
    const elements = htmlElements.abilities.videos;
    for (const element of elements) {
        element.pause();
        if (element.dataset.name === "P") {
            // remove hidden class
            element.classList.remove("u-hidden");
        } else {
            element.classList.add("u-hidden");
        }
        let id = champion.key;
        const length = id.toString().length;
        // add 0 to id so that it is 4 digits long
        for (let i = 0; i < 4 - length; i++) {
            id = "0" + id;
        }
        const webm = `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${id}/ability_${id}_${element.dataset.name}1.webm`;
        const mp4 = `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${id}/ability_${id}_${element.dataset.name}1.mp4`;
        element.children[0].src = webm;
        element.children[1].src = mp4;
        element.load();
        if (element.dataset.name === "P") {
            element.play();
        }
    }
}


function toggleVideo(type) {
    for (let video of htmlElements.abilities.videos) {
        if (type === video.dataset.name) {
            video.classList.remove("u-hidden");
            video.currentTime = 0;
            video.play();
        } else {
            video.classList.add("u-hidden");
            // stop the video, so that it starts from the beginning when it is played again
            video.pause();
            video.currentTime = 0;
        }
    }
}


// endregion

// region popup

const createSvg = (name) => {
    // create polygon
    const svgPathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svgPathElement.setAttribute("d", "M 0 0 53 0 74 22 75 75 0 75 0 0z")


    // animate polygon
    const svgAnimateElement = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
    svgAnimateElement.setAttribute("from", "1000");
    svgAnimateElement.setAttribute("to", "0");
    svgAnimateElement.setAttribute("dur", "3s");
    svgAnimateElement.setAttribute("fill", "freeze");
    svgAnimateElement.setAttribute("begin", "indefinite");
    svgAnimateElement.classList.add("js-svg-animate");
    svgPathElement.appendChild(svgAnimateElement);


    // create the svg
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 75 75");
    svg.appendChild(svgPathElement);
    svg.classList.add("c-abilities__icon__border");
    svg.dataset.name = name;
    return svg
}


const displayAndQsAbilityImg = function (champion) {
    // nesting the functions to use the champion variable
    function abilityImgClicked(e) {
        // console.log(e);
        // console.log(this);
        // remove the border from all elements
        document.querySelectorAll(".c-abilities__icon__border").forEach((border) => {
            border.classList.add("u-hidden");
            if (border.dataset.name === this.dataset.spellButton || this.dataset.type === border.dataset.name) {
                border.classList.remove("u-hidden");
                border.querySelector('.js-svg-animate').beginElement();
            }
        });


        // remove the u-selected-icon class from the selected icon
        try {
            document.querySelector(".u-selected-icon").classList.remove("u-selected-icon");
        } catch (e) {
            console.warn("No icon selected");
        }
        // add the u-selected-icon class to the clicked icon
        this.classList.add("u-selected-icon")
        const ability = this.dataset.type;
        if (ability === "passive") {
            const spell = champion.passive;
            htmlElements.abilities.name.textContent = spell.name;
            htmlElements.abilities.description.innerHTML = spell.description;
            htmlElements.abilities.type.textContent = "PASSIVE";
            toggleVideo("P");
            // show passive description
        } else {
            const id = this.dataset.id;
            for (const spell of champion.spells) {
                if (spell.id === id) {
                    // console.log(spell);
                    htmlElements.abilities.name.textContent = spell.name;
                    htmlElements.abilities.description.innerHTML = spell.description;
                    // get the last character of the id: [q, w, e, r]
                    // scrapped because of kennen who dislikes naming conventions
                    // htmlElements.abilities.type.textContent = spell.id.substring(spell.id.length -1).toUpperCase();
                    htmlElements.abilities.type.textContent = this.dataset.spellButton;
                    toggleVideo(this.dataset.spellButton);
                }
            }
        }
    }

    // erase the other champ abilities
    htmlElements.abilities.imgContainer.innerHTML = "";
    // set the name and description of the champion
    htmlElements.abilities.name.textContent = champion.passive.name;
    htmlElements.abilities.description.innerHTML = champion.passive.description;
    htmlElements.abilities.type.textContent = "PASSIVE";
    loadAllVideo(champion);
    let pApiImg = champion.passive.image.full;
    let pName = champion.passive.name;
    // load passive on popup load
    // create spell elements
    const pImg = createImageElement(`https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${pApiImg}`, pName, ["c-abilities__icon"]);
    const imgContainer = document.createElement('a');

    const svg = createSvg("passive");

    imgContainer.dataset.type = "passive";
    imgContainer.classList.add("c-abilities__img-container");
    imgContainer.classList.add("u-selected-icon");
    imgContainer.tabIndex = 0;
    imgContainer.addEventListener("click", abilityImgClicked);
    // imgContainer.classList.add("u-notched-border");
    imgContainer.appendChild(pImg);
    imgContainer.appendChild(svg);

    htmlElements.abilities.imgContainer.appendChild(imgContainer);
    const spellButtons = ["Q", "W", "E", "R"];
    let i = 0;
    for (const spellElement of champion.spells) {
        let spell = spellElement.image.full;
        let spellName = spellElement.name;
        const spellImg = createImageElement(`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell}`, spellName, ["c-abilities__icon"]);
        const svg = createSvg(spellButtons[i]);
        svg.classList.add("u-hidden");
        const imgContainer = document.createElement('a');
        imgContainer.classList.add("c-abilities__img-container");
        // imgContainer.classList.add("u-notched-border");
        imgContainer.appendChild(spellImg);
        imgContainer.appendChild(svg);
        imgContainer.dataset.type = "spell";
        imgContainer.dataset.id = spellElement.id;
        imgContainer.dataset.spellButton = spellButtons[i];
        imgContainer.addEventListener("click", abilityImgClicked);
        imgContainer.tabIndex = 0;
        htmlElements.abilities.imgContainer.appendChild(imgContainer);
        i += 1;
    }

};

function timeDifference(current, previous) {

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function secondsToMinutes(gameDuration) {
    const minutes = Math.floor(gameDuration / 60);
    const seconds = gameDuration % 60;
    return `${minutes}m ${seconds}s`;
}

function calculateRunes(firstTree, mainRune, secondTree) {
    if (runes == null) throw new Error("Runes not loaded");
    let out = {
        firstTree: {}, secondTree: {},
    };
    runes.forEach(rune => {
        if (rune.id === firstTree) {
            // console.info(rune)
            rune.slots[0].runes.forEach(specificRune => {
                if (specificRune.id === mainRune) {
                    out.firstTree.icon = specificRune.icon
                    out.firstTree.name = specificRune.name
                    out.firstTree.key = specificRune.key
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

function showLoadingIconStatistics(ancestor) {
    ancestor.querySelector('.c-loader').classList.remove('u-hidden');
}
function hideLoadingIconStatistics(ancestor) {
    ancestor.querySelector('.c-loader').classList.add('u-hidden');
}

function hideNoUser(ancestor) {
    ancestor.querySelector('.js-no-user').classList.add('u-hidden');
    ancestor.querySelector('.js-no-user-img').classList.add('u-hidden');
}
function showNoUser(ancestor) {
    ancestor.querySelector('.js-no-user').classList.remove('u-hidden');
    ancestor.querySelector('.js-no-user-img').classList.remove('u-hidden');
}
function noItem(item){
    // console.log("Item: ", item)
    if (item) {
        return `<img src="${ddragon}/img/item/${item}.png" alt="item">`
    }
    else{
        return `<div class="no-item"></div> `
    }
}

function createTeamHeader(TeamColor, userWon) {
    // create grid
    const header = document.createElement('div');
    header.classList.add('c-team__header', 'c-team__grid');
    let victoryText = userWon ? "Victory" : "Defeat";
    let redTeamBlueTeam = TeamColor === "Red" ? "Blue Team" : "Red Team";
    const headerList = [`${victoryText} (${redTeamBlueTeam})`, 'KDA', 'Damage', 'Vision', 'Gold', 'CS', 'Items'];
    for (const headerItem of headerList) {
        const headerElement = document.createElement('div');
        headerElement.classList.add('c-team__header-item');
        headerElement.textContent = headerItem;
        header.appendChild(headerElement);
    }
    return header;
}

function createColumnGeneral(participant){
    const champion = participant.championName;
    const firstTree = participant.perks.styles[0].style;
    const mainRune = participant.perks.styles[0].selections[0].perk;
    const secondTree = participant.perks.styles[1].style;
    const runes = calculateRunes(firstTree, mainRune, secondTree);

    const columnGeneral = document.createElement('div');
    columnGeneral.innerHTML = `
            <div class="c-match-card__header--champ js-champion-played">
            <img src="${ddragon}/img/champion/${champion}.png"
                 alt="${champion}"/>
            <span class="js-level">${participant.champLevel}</span>
            </div>
            <div class="c-match-card__header--summoners-runes-container">
                <img src="${ddragon}/img/spell/${summonerSpells[participant.summoner1Id]}.png"
                     alt="${participant.summoner1Id}"/>
                <img src="${ddragon}/img/spell/${summonerSpells[participant.summoner2Id]}.png"
                     alt="${participant.summoner2Id}"/>
                <img src="${ddragonImg + runes.firstTree.icon}"
                     alt="${runes.firstTree.name}"/>
                <img src="${ddragonImg + runes.secondTree.icon}"
                     alt="${runes.secondTree.name}"/>
            </div>
            <div class="c-match-card__header--summoner">
                <div class="js-summoner-name">${participant.summonerName}</div>
                <div class="js-summoner-level">Level ${participant.summonerLevel}</div>
            </div>
            
        `
    columnGeneral.classList.add('c-participant__general');
    return columnGeneral;
}
function createColumnKDA(participant){
    const columnKDA = document.createElement('div');
    columnKDA.classList.add('c-participant__kda');
    let ratio
    if (participant.deaths !== 0) {
        ratio = ((participant.kills + participant.assists) / participant.deaths).toFixed(2) + ":1";
    }else{
        ratio = `<span class="perfect">Perfect</span>`
    }
    columnKDA.innerHTML = `
        <span class="c-participant__kda-value"><span>${participant.kills}</span>/<span class="u-negative-color">${participant.deaths}</span>/<span>${participant.assists}</span> </span>
        <span class="c-participant__kda-ratio">${ratio}</span>
    `
    return columnKDA;
}
function createColumnDamage(participant, maxDamage){
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

function createColumnVision(participant){
    const vision = document.createElement('div');
    vision.classList.add('c-participant__vision');
    vision.textContent = participant.visionScore;
    return vision;
}

function createColumnGold(participant){
    const gold = document.createElement('div');
    gold.classList.add('c-participant__gold');
    gold.textContent = participant.goldEarned;
    return gold;
}

function createColumnCS(participant){
    const cs = document.createElement('div');
    cs.classList.add('c-participant__cs');
    cs.textContent = participant.totalMinionsKilled  + participant.neutralMinionsKilled;
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

function createTeamList(participantsArray){
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

function createProgressBar(a, b, percentage, type, color){
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

function createTeamDiff(yourTeam, enemyTeam, teamColor) {
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

const loadMatchDetails = async (matchId, match ,card) => {
    // toggle up and down arrow
    // check if match details are already loaded


    if (card.classList.contains('loaded')) {
        card.querySelector('.js-match-body').classList.remove('u-hidden');
        return;
    }


    const url = `${backend}/api/v2/match/${matchId}/timeline/${user.region}`;
    const timeLine = await getRequest(url)
    console.info("matchID: ",matchId , "match: " ,match, "timeLine: ", timeLine)
    const matchBody = document.createElement('div');
    matchBody.classList.add('c-match__body');
    matchBody.classList.add('js-match-body');
    card.appendChild(matchBody);
    const title = document.createElement('h3')
    title.classList.add('c-match__title')
    title.innerText = "Match performance"
    matchBody.appendChild(title)
    const grid = document.createElement('div');
    grid.classList.add('c-match__performance-grid');


    // team your team:
    let userWon = match.info.participants[match.userIndex].win;
    let yourTeam = [], enemyTeam = [], yourTeamColor, enemyTeamColor;
    if (match.userIndex <= 4) {
        yourTeam = match.info.participants.slice(0, 5);
        enemyTeam = match.info.participants.slice(5, 10);
        yourTeamColor = "Blue";
        enemyTeamColor = "Red";
    }
    else {
        yourTeam = match.info.participants.slice(5, 10);
        enemyTeam = match.info.participants.slice(0, 5);
        yourTeamColor = "Red";
        enemyTeamColor = "Blue";
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

const statCalculator = async e => {
    console.debug(e);
    const containerElement = document.querySelector('.js-match-history')
    // todo: figure out what to do with the stats
    // show loading icon
    showLoadingIconStatistics(containerElement);
    // hide notfound
    hideNoUser(containerElement);
    const url = backend + `/api/v2/matches/${user.puuid}/${e.id}`
    const matchList = await getRequest(url)
    loadedChampion = e.id
    const cards = containerElement.querySelector('.js-card-container');
    // clear the cards
    cards.innerHTML = "";
    matchList.forEach(match => {
        // console.log(match);
        const matchId = match.matchid;
        const puuidUser = match.puuid;
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

        card.classList.add('c-match-card');
        card.classList.add('js-match-card');
        card.classList.add('u-notched-border')
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
                        <img src="${ddragon}/img/spell/${summonerSpells[participant.summoner1Id]}.png"
                             alt="${participant.summoner1Id}"/>
                        <img src="${ddragon}/img/spell/${summonerSpells[participant.summoner2Id]}.png"
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
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                            <path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/>
                            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
                          </svg>
                        </button>
                    </div>
                </div>`
        card.querySelector('.js-expand').addEventListener('click', () => {
            card.classList.toggle('js-card-expanded');
            card.querySelector('.js-expand').querySelector('svg').classList.toggle('u-rotate-180');
            if(card.classList.contains('js-card-expanded')) {
                loadMatchDetails(matchId, match, card);
            }
            else {
                console.log('remove');
                card.querySelector('.js-match-body').classList.add('u-hidden')
            }
        });
        cards.appendChild(card);
        // hide loading icon


    });
    hideLoadingIconStatistics(containerElement);


};

const showPopup = e => {
    // make rest of the page not tabbable
    htmlElements.submitUser.tabIndex = -1;


    // console.log(e);
    htmlElements.popup.animated.classList.add("running");
    htmlElements.popup.container.classList.remove("u-hidden");
    document.documentElement.style.overflow = "hidden";
    htmlElements.popup.image.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${e.id}_0.jpg`;
    htmlElements.popup.name.textContent = e.name;
    htmlElements.popup.title.textContent = e.title;
    htmlElements.popup.lore.textContent = e.lore;
    for (const icon of htmlElements.popup.tagIconAll) {
        const tag = icon.dataset.name;
        // console.log(tag, e.tags);
        if (e.tags.includes(tag)) {
            // console.log("Tag found");
            icon.classList.remove("u-hidden");
        }
    }
    displayAndQsAbilityImg(e);
    // hide previous matches

    console.info("showPopup", e);
    // shouldn't reload the matches if they are already loaded
    if (e.id === loadedChampion) return;
    document.querySelector('.js-card-container').innerHTML = '';
    // clear the cards


    if (userIsLoaded) {
        statCalculator(e);
    }else{
        showNoUser(htmlElements.popup.content)
    }
};

const hidePopup = () => {
    htmlElements.popup.container.classList.add("u-hidden");
    htmlElements.popup.animated.classList.remove("running");
    document.documentElement.style.overflow = "auto";
    htmlElements.popup.image.src = "";
    for (const icon of htmlElements.popup.tagIconAll) {
        icon.classList.add("u-hidden");
    }
};

// endregion

// region card


// region createElements

const createImageElement = (src, alt, classes = []) => {
    let img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    for (const classI of classes) {
        img.classList.add(classI);
    }
    return img;
};


function createTitleElement(Title) {
    let title = document.createElement("h2");
    title.classList.add("c-card__title");
    title.classList.add("u-italic");
    title.classList.add("u-uppercase");
    title.classList.add("u-serif");
    title.textContent = Title;
    return title;
}

function createCardElement(img, title, card_body, tags) {
    let card = document.createElement("a");
    card.tabIndex = 0;
    card.classList.add("c-card");
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(card_body);
    return card;
}

function createBodyElement(champion) {
    const body = document.createElement("div");
    body.classList.add("c-card__body");
    body.classList.add("u-hidden")
    // - todo: decide if i want to show the roles or not
    // const p = document.createElement("p");
    // p.classList.add("c-card__text");
    // let text = "";
    // for (let i = 0; i < champion.tags.length; i++) {
    //   if (i === 0) {
    //     text += champion.tags[i];
    //   } else {
    //     text += `, ${champion.tags[i]}`;
    //   }
    // }
    // p.textContent = text;
    // body.appendChild(p);
    let kda = document.createElement("p");
    kda.classList.add("c-card__text");
    kda.classList.add('c-card__kda');
    let winrate = document.createElement("p");
    winrate.classList.add("c-card__text");
    winrate.classList.add('c-card__winrate');
    let games = document.createElement("p");
    games.classList.add("c-card__text");
    games.classList.add('c-card__played');
    body.appendChild(kda);
    body.appendChild(winrate);
    body.appendChild(games);
    return body;
}

// endregion

function fillChampions(champions) {
    // console.log("fillChampions");
    const championsName = Object.keys(champions.data);
    let i = 0;
    for (const dataKey in champions.data) {
        const champion = champions.data[dataKey];
        const championId = champion.key;
        let champName = championsName[i];
        if (champName === "Fiddlesticks") {
            champName = "FiddleSticks";
        }
        const imgUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${champName}_0.jpg`;
        const img = createImageElement(imgUrl, champName, ["js-champ-img", "c-card__img"]);
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("c-card__img-container");
        imgContainer.appendChild(img);
        const title = createTitleElement(champion.name);
        const card_body = createBodyElement(champion);
        const card = createCardElement(imgContainer, title, card_body);
        card.dataset.tags = champion.tags.join(",");
        card.dataset.difficulty = champion.info.difficulty;
        card.dataset.champion = champion.name;
        card.dataset.championId = championId;
        card.classList.add('u-notched-content');
        card.addEventListener("click", (e) => {
            // console.log("clicked");
            showPopup(champion);
            document.querySelector('.c-popup').scrollTo(0, 0);
        });
        // append child to container element
        htmlElements.championsContainer.appendChild(card);
        i += 1;
    }
}


// endregion

async function getSummonerSpells() {
    const res = await getRequest(ddragon + "/data/en_GB/summoner.json");
    // console.log(res.data);
    const data = res.data;
    for (const key in data) {
        const name = data[key].id;
        const id = data[key].key;
        summonerSpells[id] = name;
    }
}

async function getRunes() {
    runes = await getRequest(ddragon + "/data/en_GB/runesReforged.json");

}

// region init
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");
    htmlElements.searchForm = document.querySelector(".userForm");
    htmlElements.submitUser = document.querySelector(".js-submit-user");
    htmlElements.championsContainer = document.querySelector(".js-champ-card-container");
    htmlElements.popup.container = document.querySelector(".js-popup-container");
    htmlElements.popup.content = document.querySelector(".js-popup-content");
    htmlElements.popup.image = document.querySelector(".js-popup-img");
    htmlElements.popup.overlay = document.querySelector(".js-popup-overlay");
    htmlElements.popup.close = document.querySelector(".js-popup-close");
    htmlElements.popup.name = document.querySelector(".js-champ-name");
    htmlElements.popup.title = document.querySelector(".js-champ-title");
    htmlElements.popup.lore = document.querySelector(".js-champ-lore");
    htmlElements.popup.animated = document.querySelector(".js-popup-animate");
    htmlElements.popup.tagIconAll = document.querySelectorAll(".js-role-icon");
    htmlElements.abilities.imgContainer = document.querySelector(".js-ability-img-container");
    htmlElements.abilities.name = document.querySelector(".js-ability-name");
    htmlElements.abilities.description = document.querySelector(".js-ability-description");
    htmlElements.abilities.type = document.querySelector(".js-ability-type");
    htmlElements.abilities.videos = document.querySelectorAll(".js-ability-video");
    htmlElements.filters.itemAll = document.querySelectorAll(".js-filter-item");

    listenToEvents();
    // fill cards with champions
    getApiVersion().then((res) => {
        version = res;
        ddragon = `https://ddragon.leagueoflegends.com/cdn/${version}`;
        getChampions();
        getSummonerSpells();
        getRunes();
    });

});
// endregion