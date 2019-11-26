const link = document.querySelector(`a`);
let data = {
  name: `qwerty`,
  wecwc: `wcwef`,
  wefwf: 34535
};
data = JSON.stringify(data);

const clickHeandler = () => {
  const xhr = new XMLHttpRequest();
  //xhr.responseType = `json`;
  const xhrHeandler = () => {
    console.log(xhr.response);
  };
  xhr.addEventListener(`load`, xhrHeandler);
  xhr.open(`POST`, `http://127.0.0.1:3000/api/license`);
  xhr.setRequestHeader(`Content-Type`, `application/json`);
  xhr.send(data);
};
link.addEventListener(`click`, clickHeandler);
