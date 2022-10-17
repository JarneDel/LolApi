let htmlElements = {
  popup: { },
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
};


const getRequest = async function(url) {
  return await fetch(url)
    .then((res) => res.json())
    .catch((err) => console.log(err));
};

const createImageElement = (src, alt) => {
  let img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.classList.add("js-champ-img");
  img.classList.add("c-card__img");
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

function showPopup(e) {
  console.log(e);
  htmlElements.popup.container.classList.remove('u-hidden');
  document.documentElement.style.overflow = "hidden";
}

function hidePopup() {
  htmlElements.popup.container.classList.add('u-hidden');
  document.documentElement.style.overflow = "auto";
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
    const img = createImageElement(imgUrl, champName);
    const title = createTitleElement(champName);
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

async function getChampions() {
  const champions = await getRequest(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_GB/championFull.json`);
  console.log(champions);
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

  listenToEvents();
  // fill cards with champions
  getApiVersion().then((res) => {
    version = res;
    getChampions();
  });

});
