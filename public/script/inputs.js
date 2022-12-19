export function listenToEventSearchChampion(){
    document.querySelectorAll('.js-dynamic-form').forEach((inputField) => {
        const input = inputField.querySelector('input');
        console.log(input.value)
        if (input.value.length > 0) {
            input.classList.add('c-form__input--filled');

        }
        input.addEventListener('input', () => {
            if(input.value.length > 0) {
                input.classList.add('c-form__input--filled');
            } else {
                input.classList.remove('c-form__input--filled');
            }
        });
    });
}