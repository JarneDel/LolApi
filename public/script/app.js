let htmlElements = {};
const backend = window.location.origin


function invalidateUserForm() {
  htmlElements.submitUser.classList.add('is-invalid');
  htmlElements.submitUser.addEventListener('animationend', () => {
    htmlElements.submitUser.classList.remove('is-invalid');
  });
}

listenToEvents =  () => {
  htmlElements.searchForm.addEventListener('submit',  async (e) => {
    e.preventDefault();
    let username = document.querySelector('.js-search-username').value;
    let region = document.querySelector('.js-search-region').value;
    const res = await getRequest(`${backend}/api/user/${username}/${region}`)
    if (!res){
      invalidateUserForm();
    }else{
      document.querySelector('.js-search-username').textContent = `${res.username} found!`;
    }
  });
}


const getRequest = async function( url){
  return await fetch(url)
    .then((res) => res.json())
    .catch((err) => console.log(err));
}


function fillChampions() {

}

function getChampions() {

}

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');
  htmlElements.searchForm = document.querySelector('.userForm');
  htmlElements.submitUser = document.querySelector('.js-submit-user');
  listenToEvents();
  // fill cards with champions
  getChampions();
});
