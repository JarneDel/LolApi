import {a11yClick} from '../accessibility.js';
import {loadAllVideo, resetVideo, toggleVideo} from './Video.js';
import {General} from '../Models/general.js';
import {createImageElement, createSvg} from '../elementCreator.js';


export function displayAbilityImg(champion) {
    const container = document.querySelector('.js-abilities-container');
    const abilityImgContainer = container.querySelector('.js-ability-img-container');
    abilityImgContainer.innerHTML = '';
    // set the name and description of the champion
    setAbilitiesInformation(champion.passive.name, champion.passive.description, 'PASSIVE');
    loadAllVideo(champion);
    let pApiImg = champion.passive.image.full;
    let pName = champion.passive.name;
    // load passive on popup load
    // create spell elements
    const pImg = createImageElement(`https://ddragon.leagueoflegends.com/cdn/${General.apiVersion}/img/passive/${pApiImg}`, pName, ['c-abilities__icon']);
    const imgContainer = document.createElement('a');

    const svg = createSvg('passive');

    imgContainer.dataset.type = 'passive';
    imgContainer.classList.add('c-abilities__img-container');
    imgContainer.classList.add('u-selected-icon');
    imgContainer.tabIndex = 0;
    imgContainer.addEventListener('click', () => {
        (abilityImgClicked('passive', 'passive', imgContainer.dataset.id, champion))
    });
    imgContainer.addEventListener('keyup', (e) => {
        if (a11yClick(e)) {
            abilityImgClicked('passive', 'passive', imgContainer.dataset.id, champion);
        }
    });
    // imgContainer.classList.add("u-notched-border");
    imgContainer.appendChild(pImg);
    imgContainer.appendChild(svg);
    abilityImgContainer.appendChild(imgContainer);
    const spellButtons = ['Q', 'W', 'E', 'R'];
    let i = 0;
    for (const spellElement of champion.spells) {
        let spell = spellElement.image.full;
        let spellName = spellElement.name;
        const spellImg = createImageElement(`https://ddragon.leagueoflegends.com/cdn/${General.apiVersion}/img/spell/${spell}`, spellName, ['c-abilities__icon']);
        const svg = createSvg(spellButtons[i]);
        svg.classList.add('u-hidden');
        const imgContainer = document.createElement('a');
        imgContainer.classList.add('c-abilities__img-container');
        // imgContainer.classList.add("u-notched-border");
        imgContainer.appendChild(spellImg);
        imgContainer.appendChild(svg);
        imgContainer.dataset.type = 'spell';
        imgContainer.dataset.id = spellElement.id;
        imgContainer.dataset.spellButton = spellButtons[i];
        imgContainer.addEventListener('click', () => {
            (abilityImgClicked(imgContainer.dataset.spellButton, 'spell', imgContainer.dataset.id, champion))
        });
        imgContainer.tabIndex = 0;
        abilityImgContainer.appendChild(imgContainer);
        imgContainer.addEventListener('keyup', (e) => {
            if (a11yClick(e)) {
                abilityImgClicked(imgContainer.dataset.spellButton, 'spell', imgContainer.dataset.id, champion)
            }
        });
        i += 1;
    }

}

function abilityImgClicked(spellButton, type, id, champion) {
    resetVideo();
    let container = document.querySelector('.js-abilities-container');
    // remove the border from all elements
    container.querySelectorAll('.c-abilities__icon__border').forEach((border) => {
        border.classList.add('u-hidden');
        console.info(border.dataset.name, spellButton, type)
        if (border.dataset.name === spellButton) {
            console.info('border found');
            border.classList.remove('u-hidden');
            border.querySelector('.js-svg-animate').beginElement();
        }
    });


    // remove the u-selected-icon class from the selected icon
    try {
        document.querySelector('.u-selected-icon').classList.remove('u-selected-icon');
    } catch (e) {
        console.warn('No icon selected');
    }
    // add the u-selected-icon class to the clicked icon
    document.querySelectorAll('.c-abilities__img-container').forEach((img) => {
        if (img.dataset.id === String(id)) {
            img.classList.add('u-selected-icon');
        }
    });
    if (type === 'passive') {
        const spell = champion.passive;
        setAbilitiesInformation(spell.name, spell.description, 'PASSIVE');
        toggleVideo('P');
        // show passive description
    } else {
        for (const spell of champion.spells) {
            if (spell.id === id) {
                // console.log(spell);
                setAbilitiesInformation(spell.name, spell.description, spellButton);
                toggleVideo(spellButton);
            }
        }
    }
}

function setAbilitiesInformation(name, description, type) {
    let container = document.querySelector('.js-abilities-container');
    container.querySelector('.js-ability-name').textContent = name;
    container.querySelector('.js-ability-description').innerHTML = description;
    container.querySelector('.js-ability-type').textContent = type;
}





