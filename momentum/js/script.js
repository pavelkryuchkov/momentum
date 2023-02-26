// Local Storage

function setLocalStorage() {
  localStorage.setItem('name', nameInput.value);
  localStorage.setItem('city', city.value);
  localStorage.setItem('playerVolume', currentVolume);
  state.widgets = Array.from(state.widgets);
  localStorage.setItem('state', JSON.stringify(state));
  localStorage.setItem('todoArray', JSON.stringify(todoArray));
  localStorage.setItem('doneArray', JSON.stringify(doneArray));
}
window.addEventListener('beforeunload', setLocalStorage);

function getLocalStorage() {
  if (localStorage.getItem('name')) {
    nameInput.value = localStorage.getItem('name');
  }
  if (localStorage.getItem('city')) {
    city.value = localStorage.getItem('city');
  } else {
    city.value = 'Minsk';
  }
  if (localStorage.getItem('playerVolume')) {
    currentVolume = parseFloat(localStorage.getItem('playerVolume'));
    displayVolume();
  }
  if (localStorage.getItem('state')) {
    state = JSON.parse(localStorage.getItem('state'));
    state.widgets = new Set(state.widgets);
  }
  if (localStorage.getItem('todoArray')) {
    todoArray = JSON.parse(localStorage.getItem('todoArray'));
  }
  if (localStorage.getItem('doneArray')) {
    doneArray = JSON.parse(localStorage.getItem('doneArray'));
  }
}
window.addEventListener('load', getLocalStorage);

// Время, дата и приветствие

const time = document.querySelector('.time');
const date = document.querySelector('.date');
const greeting = document.querySelector('.greeting');
const nameInput = document.querySelector('.name');
const nameWidth = document.querySelector('.name-width');
const greetingTranslation = {
  'Good morning': 'Доброе утро',
  'Good afternoon': 'Добрый день',
  'Good evening': 'Добрый вечер',
  'Good night': 'Спокойной ночи',
};

function showTime() {
  const date = new Date();
  const currentTime = date.toLocaleTimeString();
  time.textContent = currentTime;
  showDate();
  showGreeting();
  setTimeout(showTime, 1000);
}

function showDate() {
  const dateOptions = {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };
  let currentDate = new Date().toLocaleDateString(state.language, dateOptions);
  currentDate = currentDate.replace(/^./, (str) => str.toUpperCase());
  // .split(' ')
  // .map((word) => word.replace(/^./, (str) => str.toUpperCase()))
  // .join(' ');
  date.textContent = currentDate;
}

function getTimeOfDay() {
  const date = new Date();
  const hours = date.getHours();
  const dayParts = ['night', 'morning', 'afternoon', 'evening'];
  return dayParts[Math.floor(hours / 6)];
}

function showGreeting() {
  const timeOfDay = getTimeOfDay();
  let greetingText = `Good ${timeOfDay},`;
  if (state.language === 'ru') {
    greetingText = `${greetingTranslation[greetingText.slice(0, -1)]},`;
  }
  greeting.textContent = greetingText;
}

function setNameInputWidth() {
  const placeholder =
    state.language === 'en' ? '[Enter name]' : '[Введите имя]';
  nameWidth.textContent = nameInput.value ? nameInput.value : placeholder;
  const width = nameWidth.offsetWidth;
  nameInput.style.width = width + 'px';
}

window.addEventListener('load', showTime);
window.addEventListener('load', setNameInputWidth);
nameInput.addEventListener('change', () => {
  nameInput.blur();
});
nameInput.addEventListener('input', setNameInputWidth);

// Слайдер изображений

let randomNum = getRandomNum();
const slideNext = document.querySelector('.slide-next');
const slidePrev = document.querySelector('.slide-prev');

function getRandomNum(max = 20) {
  return Math.floor(Math.random() * max) + 1;
}

async function getLinkToImage() {
  const timeOfDay = getTimeOfDay();
  const tag = state.photoTag || timeOfDay;
  let link;
  if (state.photoSource === 'github') {
    const bgNum = randomNum.toString().padStart(2, '0');
    link = `https://raw.githubusercontent.com/pavelkryuchkov/stage1-tasks/assets/images/${timeOfDay}/${bgNum}.jpg`;
  } else if (state.photoSource === 'unsplash') {
    const url = `https://api.unsplash.com/photos/random?orientation=landscape&query=${tag}&client_id=oKOX10jBU_QzyHNFymlrF67_Esu3hx44mE1CRW5SO88`;
    const res = await fetch(url);
    const data = await res.json();
    link = data.urls.regular;
  } else if (state.photoSource === 'flickr') {
    const url = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=e299499257afdcabfdf96a94062903e2&tags=${tag}&extras=url_l&format=json&nojsoncallback=1`;
    const res = await fetch(url);
    const data = await res.json();
    const bgNum = getRandomNum(data.photos.photo.length - 1);
    link = data.photos.photo[bgNum].url_l;
  }
  return link;
}

async function setBg() {
  const img = new Image();
  img.src = await getLinkToImage();
  // console.log(img.src);
  img.onload = () => {
    document.body.style.backgroundImage = `url(${img.src})`;
  };
}

function getSlideNext() {
  if (state.photoSource === 'github') {
    randomNum = randomNum === 20 ? 1 : randomNum + 1;
  }
  setBg();
}

function getSlidePrev() {
  if (state.photoSource === 'github') {
    randomNum = randomNum === 1 ? 20 : randomNum - 1;
  }
  setBg();
}

slideNext.addEventListener('click', getSlideNext);
slidePrev.addEventListener('click', getSlidePrev);

window.addEventListener('load', setBg);

// Виджет погоды

const city = document.querySelector('.city');
const weatherIcon = document.querySelector('.weather-icon');
const temperature = document.querySelector('.temperature');
const weatherDescription = document.querySelector('.weather-description');
const wind = document.querySelector('.wind');
const humidity = document.querySelector('.humidity');
const weatherError = document.querySelector('.weather-error');

async function getWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.value}&lang=${state.language}&appid=a18d7ec4fd32da2a4a94a78dafb4b3c6&units=metric`;
  const res = await fetch(url);

  if (res.status === 200) {
    const data = await res.json();
    weatherIcon.classList.add(`owf-${data.weather[0].id}`);
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    weatherDescription.textContent = data.weather[0].description;
    wind.textContent = `${
      state.language === 'en' ? 'Wind speed' : 'Скорость ветра'
    }: ${Math.round(data.wind.speed)} ${
      state.language === 'en' ? 'm/s' : 'м/с'
    }`;
    humidity.textContent = `${
      state.language === 'en' ? 'Humidity' : 'Влажность'
    }: ${Math.round(data.main.humidity)}%`;
    weatherError.textContent = '';
  } else {
    weatherIcon.className = 'weather-icon owf';
    temperature.textContent = '';
    weatherDescription.textContent = '';
    weatherDescription.textContent = '';
    wind.textContent = '';
    humidity.textContent = '';
    if (city.value) {
      weatherError.textContent = `Error! City '${city.value}' not found.`;
    } else {
      weatherError.textContent = `Error! Enter city name.`;
    }
  }
  city.blur();
}

window.addEventListener('load', getWeather);
city.addEventListener('change', getWeather);

// Виджет "цитата дня"

const quote = document.querySelector('.quote');
const author = document.querySelector('.author');
const changeQuoteButton = document.querySelector('.change-quote');
let currentQuoteNumber;

async function getQuotes() {
  const quotes = './js/quotesData.json';
  const res = await fetch(quotes);
  const data = await res.json();
  const quoteNum = getRandomNum(data.length) - 1;
  currentQuoteNumber = quoteNum;
  quote.textContent = data[quoteNum][`text-${state.language}`];
  author.textContent = data[quoteNum][`author-${state.language}`];
}

window.addEventListener('load', getQuotes);
changeQuoteButton.addEventListener('click', getQuotes);

// Аудиоплеер

import playList from './playList.js';
const audio = new Audio();
const playListContainer = document.querySelector('.play-list');
const playButton = document.querySelector('.play');
const playPrevButton = document.querySelector('.play-prev');
const playNextButton = document.querySelector('.play-next');
const audioTimeline = document.querySelector('.player-timeline');
const audioProgress = document.querySelector('.player-progress');
const songName = document.querySelector('.player-song_name');
const songCurrentTime = document.querySelector('.player-current_time');
const songDuration = document.querySelector('.player-song_duration');
const volumeControls = document.querySelector('.volume-controls');
const volumeBar = document.querySelector('.volume-bar');
const volumeValueBar = document.querySelector('.volume-value');
const volumeButton = document.querySelector('.volume-button');
let isPlay = false;
let playNum = 0;
let prevVolume,
  currentVolume = 0.5;

playList.forEach((el) => {
  const li = document.createElement('li');
  li.classList.add('play-item');
  const itemBtn = document.createElement('i');
  itemBtn.classList.add('fa-regular', 'fa-circle-play', 'play-item_btn');
  li.textContent = el.title;
  li.prepend(itemBtn);
  li.addEventListener('click', handlePlayItemClick);
  playListContainer.append(li);
});

function playAudio() {
  if (!isPlay) {
    if (audio.src !== new URL(playList[playNum].src, document.baseURI).href) {
      audio.src = playList[playNum].src;
    }
    // audio.currentTime = 0;
    audio.play();
    setVolume();
    isPlay = true;
  } else {
    audio.pause();
    isPlay = false;
  }
  toggleBtn();
  showPlaying();
}

function toggleBtn() {
  if (isPlay) {
    playButton.classList.add('pause');
  } else {
    playButton.classList.remove('pause');
  }
}

function playPrev() {
  playNum = playNum === 0 ? playList.length - 1 : playNum - 1;
  isPlay = false;
  playAudio();
}

function playNext() {
  playNum = playNum === playList.length - 1 ? 0 : playNum + 1;
  isPlay = false;
  playAudio();
}

function showPlaying() {
  Array.from(playListContainer.children).forEach((el, index) => {
    if (index === playNum) {
      el.classList.add('item-active');
      if (isPlay) {
        el.firstChild.classList.remove('fa-circle-play');
        el.firstChild.classList.add('fa-circle-pause');
      } else {
        el.firstChild.classList.remove('fa-circle-pause');
        el.firstChild.classList.add('fa-circle-play');
      }
    } else {
      el.classList.remove('item-active');
      el.firstChild.classList.remove('fa-circle-pause');
      el.firstChild.classList.add('fa-circle-play');
    }
  });
  songName.textContent = playList[playNum].title;
  songDuration.textContent = `${playList[playNum].duration}`;
  // audio.addEventListener(
  //   'loadedmetadata',
  //   () => {
  //     // console.log(audio.duration);
  //     const minutes = Math.floor(audio.duration / 60);
  //     const seconds = Math.floor(audio.duration % 60)
  //       .toString()
  //       .padStart(2, '0');
  //     songDuration.textContent = `${minutes}:${seconds}`;
  //   },
  //   { once: true }
  // );
}

function handlePlayItemClick(e) {
  const clickedItem = e.target.closest('.play-item');
  Array.from(playListContainer.children).forEach((item, index) => {
    if (item === clickedItem) {
      if (playNum !== index) {
        isPlay = false;
        playNum = index;
      }
    }
  });
  playAudio();
}

function setProgress(ratio) {
  ratio = Math.min(0.999, ratio);
  ratio = Math.max(0, ratio);
  audio.currentTime = ratio * audio.duration;
  showProgress();
}

function showProgress() {
  const width = (audio.currentTime / audio.duration) * 100 + '%';
  audioProgress.style.width = width;
  const currentMinutes = Math.floor(audio.currentTime / 60);
  const currentSeconds = Math.floor(audio.currentTime % 60)
    .toString()
    .padStart(2, '0');
  songCurrentTime.textContent = `${currentMinutes}:${currentSeconds}`;
}

function handleProgressBarMousedown(e) {
  if (audio.src) {
    audio.pause();
    const ratio = e.offsetX / audioTimeline.offsetWidth;
    setProgress(ratio);
    document.body.style.cursor = 'pointer';
    document.addEventListener('mousemove', handleProgressMouseMove);
    document.addEventListener(
      'mouseup',
      () => {
        document.body.style.cursor = 'default';
        document.removeEventListener('mousemove', handleProgressMouseMove);
        if (isPlay) {
          audio.play();
        }
      },
      { once: true }
    );
  }
}

function handleProgressMouseMove(e) {
  const clientRect = audioTimeline.getBoundingClientRect();
  const clientX = clientRect.left;
  const ratio = (e.clientX - clientX) / audioTimeline.offsetWidth;
  setProgress(ratio);
}

function setVolume() {
  currentVolume = Math.max(0, currentVolume);
  currentVolume = Math.min(1, currentVolume);
  audio.volume = currentVolume;
  displayVolume();
}

function displayVolume() {
  const width = currentVolume * 100 + '%';
  volumeValueBar.style.width = width;
  const epsilon = 1e-6;
  if (Math.abs(currentVolume) < epsilon) {
    volumeButton.firstElementChild.classList.remove('fa-volume-up');
    volumeButton.firstElementChild.classList.remove('fa-volume-down');
    volumeButton.firstElementChild.classList.add('fa-volume-mute');
  } else if (currentVolume < 0.3) {
    volumeButton.firstElementChild.classList.remove('fa-volume-up');
    volumeButton.firstElementChild.classList.remove('fa-volume-mute');
    volumeButton.firstElementChild.classList.add('fa-volume-down');
  } else {
    volumeButton.firstElementChild.classList.remove('fa-volume-down');
    volumeButton.firstElementChild.classList.remove('fa-volume-mute');
    volumeButton.firstElementChild.classList.add('fa-volume-up');
  }
}

function handleVolumeBarMousedown(e) {
  currentVolume = e.offsetX / volumeBar.offsetWidth;
  setVolume();
  document.body.style.cursor = 'pointer';
  document.addEventListener('mousemove', handleVolumeMouseMove);
  document.addEventListener(
    'mouseup',
    () => {
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', handleVolumeMouseMove);
    },
    { once: true }
  );
}

function handleVolumeMouseMove(e) {
  const clientRect = volumeBar.getBoundingClientRect();
  const clientX = clientRect.left;
  currentVolume = (e.clientX - clientX) / volumeBar.offsetWidth;
  setVolume();
}

function handleVolumeBarWheel(e) {
  if (e.deltaY < 0) {
    currentVolume += 0.1;
    currentVolume = Math.min(1, currentVolume);
  } else {
    currentVolume -= 0.1;
    currentVolume = Math.max(0, currentVolume);
  }
  setVolume();
}

function handleVolumeBtnClick() {
  if (currentVolume) {
    prevVolume = currentVolume;
    currentVolume = 0;
  } else {
    currentVolume = prevVolume ? prevVolume : 0.1;
  }
  setVolume();
}

playButton.addEventListener('click', playAudio);
playPrevButton.addEventListener('click', playPrev);
playNextButton.addEventListener('click', playNext);

audio.addEventListener('ended', playNext);
audio.addEventListener('loadstart', () => {
  audioProgress.style.width = '0';
});
audio.addEventListener('timeupdate', showProgress);

volumeBar.addEventListener('mousedown', handleVolumeBarMousedown);
volumeControls.addEventListener('wheel', handleVolumeBarWheel);
volumeButton.addEventListener('click', handleVolumeBtnClick);

audioTimeline.addEventListener('mousedown', handleProgressBarMousedown);

// Настройки приложения

let state = {
  language: 'en',
  photoSource: 'github',
  photoTag: '',
  widgets: new Set([
    'time',
    'date',
    'greeting',
    'quote',
    'weather',
    'player',
    'todo',
  ]),
};
const settings = document.querySelector('.settings');
const settingsBtn = document.querySelector('.settings-btn');
const settingsOptions = document.querySelectorAll('.settings-option');
const widgets = document.querySelectorAll('.widget');
const tagInput = document.querySelector('.settings-tag');
const tagClear = document.querySelector('.settings-tag-clear');

function openSettings(e) {
  settings.classList.toggle('settings-hidden');
  if (!settings.classList.contains('settings-hidden')) {
    // e.stopPropagation();
    document.body.addEventListener('click', function closeSettings(e) {
      // console.log('close settings');
      if (!e.target.closest('.settings') && e.target !== settingsBtn) {
        settings.classList.add('settings-hidden');
        document.body.removeEventListener('click', closeSettings);
      }
    });
  }
}

function handleToggleBtnClick(e) {
  const option = e.currentTarget;
  if (option.dataset.setting === 'widgets') {
    if (state.widgets.has(option.dataset.value)) {
      state.widgets.delete(option.dataset.value);
    } else {
      state.widgets.add(option.dataset.value);
    }
    displayWidgets();
  } else if (option.dataset.setting === 'language') {
    state[option.dataset.setting] = option.dataset.value;
    translateApp(state.language);
  } else {
    state[option.dataset.setting] = option.dataset.value;
    setBg();
  }
  renderSettings();
}

function handleTagInputChange() {
  state.photoTag = tagInput.value;
  setBg();
  tagInput.blur();
}

function handleTagClearClick() {
  if (!tagInput.hasAttribute('disabled')) {
    tagInput.value = '';
    if (state.photoTag) {
      handleTagInputChange();
    }
    // state.photoTag = '';
    tagInput.focus();
  }
}

function renderSettings() {
  settingsOptions.forEach((option) => {
    if (option.dataset.setting === 'language') {
      if (option.dataset.value === state.language) {
        option.childNodes[1].classList.add('settings-toggle-active');
      } else {
        option.childNodes[1].classList.remove('settings-toggle-active');
      }
    } else if (option.dataset.setting === 'photoSource') {
      if (option.dataset.value === state.photoSource) {
        option.childNodes[1].classList.add('settings-toggle-active');
      } else {
        option.childNodes[1].classList.remove('settings-toggle-active');
      }
    } else {
      if (state.widgets.has(option.dataset.value)) {
        option.childNodes[1].classList.add('settings-toggle-active');
      } else {
        option.childNodes[1].classList.remove('settings-toggle-active');
      }
    }
  });
  tagInput.value = state.photoTag;
  if (state.photoSource === 'github') {
    tagInput.setAttribute('disabled', 'true');
    tagClear.classList.add('settings-tag-clear_disabled');
    tagInput.value = '';
  } else {
    tagInput.removeAttribute('disabled');
    tagClear.classList.remove('settings-tag-clear_disabled');
  }
}

function displayWidgets() {
  widgets.forEach((widget) => {
    if (state.widgets.has(widget.dataset.widgetName)) {
      widget.classList.remove('hidden');
    } else {
      widget.classList.add('hidden');
    }
  });
}

window.addEventListener('load', renderSettings);
window.addEventListener('load', displayWidgets);

settingsBtn.addEventListener('click', openSettings);
settingsOptions.forEach((option) => {
  option.addEventListener('click', handleToggleBtnClick);
});

tagInput.addEventListener('change', handleTagInputChange);
tagClear.addEventListener('click', handleTagClearClick);

// Перевод приложения

const settingsHeaders = document.querySelectorAll('.settings-header');
const settingsTranslation = {
  Language: 'Язык',
  Images: 'Картинки',
  Widgets: 'Виджеты',
  Weather: 'Погода',
  Player: 'Музыка',
  'ToDo List': 'Список дел',
  Quote: 'Цитата дня',
  Greeting: 'Приветствие',
  Date: 'Дата',
  Time: 'Время',
  '[Add a tag]': '[Добавьте тэг]',
};
Object.keys(settingsTranslation).forEach((word) => {
  let newKey = settingsTranslation[word];
  settingsTranslation[newKey] = word;
});

function translateApp(language) {
  translateWeather(language);
  translateDate();
  translateGreeting(language);
  translateQuote(language);
  translateSettings();
  translateTodo(language);
}

function translateWeather(language) {
  if (language === 'ru') {
    if (city.value === 'Minsk') {
      city.value = 'Минск';
    }
    city.setAttribute('placeholder', '[Введите город]');
  } else {
    if (city.value === 'Минск') {
      city.value = 'Minsk';
    }
    city.setAttribute('placeholder', '[Enter city]');
  }
  getWeather();
}

function translateDate() {
  showDate();
}

function translateGreeting(language) {
  showGreeting();
  if (language === 'ru') {
    nameInput.setAttribute('placeholder', '[Введите имя]');
  } else {
    nameInput.setAttribute('placeholder', '[Enter name]');
  }
  setNameInputWidth();
}

async function translateQuote(language) {
  const quotes = './js/quotesData.json';
  const res = await fetch(quotes);
  const data = await res.json();
  if (!currentQuoteNumber) {
    currentQuoteNumber = getRandomNum(data.length) - 1;
  }
  quote.textContent = data[currentQuoteNumber][`text-${language}`];
  author.textContent = data[currentQuoteNumber][`author-${language}`];
}

function translateSettings() {
  if (state.language !== settings.dataset.language) {
    settingsHeaders.forEach((header) => {
      const translation =
        settingsTranslation[header.textContent.trim().slice(0, -1)];
      header.textContent = translation + ':' || header.textContent;
    });
    settingsOptions.forEach((option) => {
      const translation =
        settingsTranslation[option.firstChild.textContent.trim()];
      option.firstChild.textContent =
        translation || option.firstChild.textContent;
    });
    tagInput.setAttribute(
      'placeholder',
      settingsTranslation[tagInput.placeholder]
    );
  }
  settings.dataset.language = state.language;
}

function translateTodo(language) {
  if (language === 'ru') {
    todoInput.setAttribute('placeholder', '[Добавьте задачу]');
    todoHeaders[0].textContent = 'Список дел';
    todoHeaders[1].textContent = 'Сделано';
  } else {
    todoInput.setAttribute('placeholder', '[Add todo]');
    todoHeaders[0].textContent = 'To Do';
    todoHeaders[1].textContent = 'Done';
  }
}

window.addEventListener('load', () => translateApp(state.language));

// ToDo List

const todo = document.querySelector('.todo-list');
const todoBtn = document.querySelector('.todo-list_icon');
const todoHeaders = document.querySelectorAll('.todo-header');
const todoInput = document.querySelector('.todo-input');
const todoAddBtn = document.querySelector('.todo-add');
const todoList = document.querySelector('.todo-list-todo');
const doneList = document.querySelector('.todo-list-todo_done');

let todoArray = [];
let doneArray = [];

function openTodo(e) {
  todo.classList.toggle('todo-hidden');
  // e.stopPropagation();
  if (!todo.classList.contains('todo-hidden')) {
    document.body.addEventListener('click', function closeTodo(e) {
      // console.log('close todo');
      if (!e.target.closest('.todo-list') && e.target !== todoBtn) {
        todo.classList.add('todo-hidden');
        document.body.removeEventListener('click', closeTodo);
      }
    });
  }
}

function addTodo(e) {
  if (todoInput.value === '') {
    return;
  }
  const todo = {
    id: Date.now().toString(),
    text: todoInput.value,
  };
  todoArray.push(todo);
  todoInput.value = '';
  if (e.target === todoAddBtn) {
    todoInput.blur();
  }
  renderTodos();
}

function createTodoElement(todo, done = false) {
  const checkbox = document.createElement('i');
  checkbox.classList.add(
    'fa-regular',
    done ? 'fa-square-check' : 'fa-square',
    'todo-checkbox'
  );
  checkbox.addEventListener('click', handleCheckboxClick);
  const todoText = document.createElement('span');
  todoText.classList.add('todo-text');
  todoText.textContent = todo.text;
  const deleteBtn = document.createElement('i');
  deleteBtn.classList.add('fa-solid', 'fa-trash', 'todo-trashcan');
  deleteBtn.addEventListener('click', handleDeleteBtnClick);
  const todoElement = document.createElement('li');
  todoElement.classList.add('todo-list-item');
  if (done) {
    todoElement.classList.add('todo-list-item_done');
  }
  todoElement.setAttribute('data-id', todo.id);
  todoElement.appendChild(checkbox);
  todoElement.appendChild(todoText);
  todoElement.appendChild(deleteBtn);
  return todoElement;
}

function renderTodos() {
  todoList.innerHTML = '';
  todoArray.forEach((todo) => {
    const todoElement = createTodoElement(todo);
    todoList.appendChild(todoElement);
  });
  doneList.innerHTML = '';
  doneArray.forEach((done) => {
    const todoElement = createTodoElement(done, true);
    doneList.appendChild(todoElement);
  });
}

function handleCheckboxClick(e) {
  e.stopPropagation();
  const todoElement = e.target.closest('.todo-list-item');
  const id = todoElement.dataset.id;
  if (e.target.closest('.todo-list-item_done')) {
    doneArray = doneArray.filter((todo) => {
      if (todo.id === id) {
        todoArray.push(todo);
        return false;
      }
      return true;
    });
  } else {
    todoArray = todoArray.filter((todo) => {
      if (todo.id === id) {
        doneArray.push(todo);
        return false;
      }
      return true;
    });
  }
  renderTodos();
}

function handleDeleteBtnClick(e) {
  e.stopPropagation();
  const todoElement = e.target.closest('.todo-list-item');
  const id = todoElement.dataset.id;
  todoArray = todoArray.filter((todo) => todo.id !== id);
  doneArray = doneArray.filter((todo) => todo.id !== id);
  renderTodos();
}

window.addEventListener('load', renderTodos);

todoBtn.addEventListener('click', openTodo);

todoInput.addEventListener('change', addTodo);
todoAddBtn.addEventListener('click', addTodo);
