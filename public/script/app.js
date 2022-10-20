let htmlElements = {
  popup: {},
  abilities: {}
};
const backend = window.location.origin;
let version = "12.19.1";

function invalidateUserForm() {
  htmlElements.submitUser.classList.add("is-invalid");
  htmlElements.submitUser.addEventListener("animationend", () => {
    htmlElements.submitUser.classList.remove("is-invalid");
  });
}

listenToEvents = () => {
  htmlElements.searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let username = document.querySelector(".js-search-username").value;
    let region = document.querySelector(".js-search-region").value;
    const res = await getRequest(`${backend}/api/user/${username}/${region}`);
    if (!res) {
      invalidateUserForm();
    } else {
      document.querySelector(".js-search-username").textContent = `${res.username} found!`;
    }
  });
  htmlElements.popup.overlay.addEventListener("click", hidePopup);
};


const getRequest = async function(url) {
  return await fetch(url)
    .then((res) => res.json())
    .catch((err) => console.log(err));
};

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
  title.textContent = Title;
  return title;
}

function createCardElement(img, title, card_body) {
  let card = document.createElement("div");
  card.classList.add("c-card");
  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(card_body);
  return card;
}

function createBodyElement(champion) {
  const body = document.createElement("div");
  body.classList.add("c-card__body");
  const p = document.createElement("p");
  p.classList.add("c-card__text");
  let text = "";
  for (let i = 0; i < champion.tags.length; i++) {
    if (i === 0) {
      text += champion.tags[i];
    } else {
      text += `, ${champion.tags[i]}`;
    }
  }
  p.textContent = text;
  body.appendChild(p);
  return body;
}


function loadAllVideo(champion){
  const elements = htmlElements.abilities.videos;
  for (const element of elements) {
    element.pause();
    if (element.dataset.name === "P") {
      // remove hidden class
      element.classList.remove("u-hidden");
    }else{
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
    if(element.dataset.name === "P"){
      element.play();
    }
  }
}


function toggleVideo(type){
  for (let video of htmlElements.abilities.videos) {
    if (type === video.dataset.name) {
      video.classList.remove("u-hidden");
      video.currentTime = 0;
      video.play();
    }else{
      video.classList.add("u-hidden");
      // stop the video, so that it starts from the beginning when it is played again
      video.pause();
      video.currentTime= 0;
    }
  }
}



function displayAndQsAbilityImg(champion) {
  // nesting the functions to use the champion variable
  function abilityImgClicked(e) {
    console.log(e);
    console.log(this);
    // remove the u-selected-icon class from the selected icon
    try {
      document.querySelector(".u-selected-icon").classList.remove("u-selected-icon");
    } catch (e) {
      console.log("No icon selected");
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
          console.log(spell);
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

  htmlElements.abilities.name.textContent = champion.passive.name;
  htmlElements.abilities.description.innerHTML = champion.passive.description;
  htmlElements.abilities.type.textContent = "PASSIVE";
  let p = champion.passive.image.full;
  let pName = champion.passive.name;
  // load passive on popup load
  loadAllVideo(champion);
  // create spell elements
  const pImg = createImageElement(`https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${p}`, pName, ["c-abilities__icon", "u-selected-icon"]);
  pImg.addEventListener("click", abilityImgClicked);
  pImg.dataset.type = "passive";
  htmlElements.abilities.imgContainer.appendChild(pImg);
  const spellButtons = ["Q", "W", "E", "R"];
  let i = 0;
  for (const spellElement of champion.spells) {
    let spell = spellElement.image.full;
    let spellName = spellElement.name;
    const spellImg = createImageElement(`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell}`, spellName, ["c-abilities__icon"]);
    spellImg.addEventListener("click", abilityImgClicked);
    spellImg.dataset.type = "spell";
    spellImg.dataset.id = spellElement.id;
    // required because KENNEN does not follow the naming conventions.........
    spellImg.dataset.spellButton = spellButtons[i];
    htmlElements.abilities.imgContainer.appendChild(spellImg);
    i+=1;
  }

}


function showAbilities(e) {

  displayAndQsAbilityImg(e);


}

function showPopup(e) {
  console.log(e);
  htmlElements.popup.container.classList.remove("u-hidden");
  document.documentElement.style.overflow = "hidden";
  htmlElements.popup.image.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${e.id}_0.jpg`;
  htmlElements.popup.name.textContent = e.name;
  htmlElements.popup.title.textContent = e.title;
  htmlElements.popup.lore.textContent = e.lore;
  for (const icon of htmlElements.popup.tagIconAll) {
    const tag = icon.dataset.name;
    console.log(tag, e.tags);
    if (e.tags.includes(tag)) {
      console.log("Tag found");
      icon.classList.remove("u-hidden");
    }
  }
  showAbilities(e);
}

function hidePopup() {
  htmlElements.popup.container.classList.add("u-hidden");
  document.documentElement.style.overflow = "auto";
  htmlElements.popup.image.src = "";
  for (const icon of htmlElements.popup.tagIconAll) {
    icon.classList.add("u-hidden");
  }
}

function fillChampions(champions) {
  console.log("fillChampions");
  const championsName = Object.keys(champions.data);
  let i = 0;
  for (const dataKey in champions.data) {
    const champion = champions.data[dataKey];
    let champName = championsName[i];
    if (champName === "Fiddlesticks") {
      champName = "FiddleSticks";
    }
    const imgUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${champName}_0.jpg`;
    const img = createImageElement(imgUrl, champName, ["js-champ-img", "c-card__img"]);
    const title = createTitleElement(champion.name);
    const card_body = createBodyElement(champion);
    const card = createCardElement(img, title, card_body);
    card.addEventListener("click", (e) => {
      console.log("clicked");
      showPopup(champion);
    });
    // append child to container element
    htmlElements.championsContainer.appendChild(card);
    i += 1;
  }

}
let championsTest = {};
async function getChampions() {
  const champions = await getRequest(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_GB/championFull.json`);
  console.log(champions);
  championsTest = champions;
  fillChampions(champions);
}

function getApiVersion() {
  return getRequest("https://ddragon.leagueoflegends.com/api/versions.json")
    .then((res) => res[0]);
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM fully loaded and parsed");
  htmlElements.searchForm = document.querySelector(".userForm");
  htmlElements.submitUser = document.querySelector(".js-submit-user");
  htmlElements.championsContainer = document.querySelector(".js-champ-card-container");
  htmlElements.popup.container = document.querySelector(".js-popup-container");
  htmlElements.popup.content = document.querySelector(".js-popup-content");
  htmlElements.popup.image = document.querySelector(".js-popup-img");
  htmlElements.popup.overlay = document.querySelector(".js-popup-overlay");
  htmlElements.popup.name = document.querySelector(".js-champ-name");
  htmlElements.popup.title = document.querySelector(".js-champ-title");
  htmlElements.popup.lore = document.querySelector(".js-champ-lore");
  htmlElements.popup.tagIconAll = document.querySelectorAll(".js-role-icon");
  htmlElements.abilities.imgContainer = document.querySelector(".js-ability-img-container");
  htmlElements.abilities.name = document.querySelector(".js-ability-name");
  htmlElements.abilities.description = document.querySelector(".js-ability-description");
  htmlElements.abilities.type = document.querySelector(".js-ability-type");
  htmlElements.abilities.videos = document.querySelectorAll(".js-ability-video");

  listenToEvents();
  // fill cards with champions
  getApiVersion().then((res) => {
    version = res;
    getChampions();
  });

});
