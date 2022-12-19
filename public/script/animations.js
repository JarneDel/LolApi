import {General} from './Models/general.js';

export function animatePopup() {
    if (document.querySelector('.js-popup-animate').classList.contains('running')) {
        return;
    }
    document.documentElement.style.setProperty('--mouse-pos-x', `${General.mousePos.x}%`);
    document.documentElement.style.setProperty('--mouse-pos-y', `${General.mousePos.y}%`);
}

export function saveCursorPosition(clientX, clientY) {
    General.mousePos.x = (clientX / window.innerWidth).toFixed(2) * 100;
    General.mousePos.y = (clientY / window.innerHeight).toFixed(2) * 100;
    // Do not save the cursor position if the animation is already running
}

export function showLoadingIconStatistics(ancestor) {
    ancestor.querySelector('.c-loader').classList.remove('u-hidden');
}
export function hideLoadingIconStatistics(ancestor) {
    ancestor.querySelector('.c-loader').classList.add('u-hidden');
}