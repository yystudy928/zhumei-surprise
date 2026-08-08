const ACCESS_CODE = '251214';
const intro = document.querySelector('#intro');
const teaser = document.querySelector('#teaser');
const playScreen = document.querySelector('#play-screen');
const ending = document.querySelector('#ending');
const form = document.querySelector('#password-form');
const input = document.querySelector('#password-input');
const hint = document.querySelector('#password-hint');
const line = document.querySelector('#teaser-line');
const progress = document.querySelector('.teaser-progress span');
const playButton = document.querySelector('#play-button');
const replayButton = document.querySelector('#replay-button');
const video = document.querySelector('#video');
const music = document.querySelector('#music');
const status = document.querySelector('#video-status');
const disc = document.querySelector('#music-disc');
const memoryWall = document.querySelector('#memory-wall');
const memoryLanes = [...document.querySelectorAll('.memory-lane')];
const polaroidTemplate = document.querySelector('#polaroid-template');
const memoryImages = Array.from({ length: 24 }, (_, index) => `assets/memories/memory-${String(index + 1).padStart(2, '0')}.jpg`);
let memoryIndex = 0;
let lastMemorySecond = -1;
const lines = ['本片历经多次延期……', '主演：一个一直说“快做好了”的人', '终于，到了交作业的这一天。'];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function show(screen) {
  [intro, teaser, playScreen, ending].forEach((item) => item.classList.add('is-hidden'));
  screen.classList.remove('is-hidden');
}

function startTeaser() {
  show(teaser);
  let index = 0;
  const next = () => {
    line.textContent = lines[index];
    progress.style.width = `${((index + 1) / lines.length) * 100}%`;
    index += 1;
    if (index < lines.length) setTimeout(next, reduced ? 250 : 2200);
    else setTimeout(() => show(playScreen), reduced ? 350 : 1800);
  };
  next();
}

function showMemory() {
  if (!memoryWall) return;
  const lane = memoryLanes[memoryIndex % memoryLanes.length];
  const card = polaroidTemplate.content.firstElementChild.cloneNode(true);
  const image = card.querySelector('img');
  card.style.setProperty('--tilt', `${[-7, -4, 4, 7][memoryIndex % 4]}deg`);
  card.style.top = `${10 + ((memoryIndex * 17) % 58)}%`;
  image.src = memoryImages[memoryIndex % memoryImages.length];
  image.alt = '';
  card.append(image);
  lane.append(card);
  requestAnimationFrame(() => card.classList.add('is-floating'));
  setTimeout(() => { card.classList.remove('is-floating'); setTimeout(() => card.remove(), 1100); }, 7200);
  memoryIndex += 1;
}

function clearMemories() {
  memoryLanes.forEach((lane) => lane.replaceChildren());
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (input.value.trim() !== ACCESS_CODE) {
    hint.textContent = '这个密码不对，再想想你们之间的小秘密 ✦';
    input.focus();
    return;
  }
  hint.textContent = '解锁成功，专属放映即将开始 ✨';
  startTeaser();
});

playButton.addEventListener('click', () => {
  status.textContent = '正在播放，记得看到最后。';
  music.play().catch(() => {
    status.textContent = '如果没有声音，请关闭手机静音模式并调高音量后重试。';
  });
  video.play().then(() => {
    playButton.classList.add('is-hidden');
    disc.classList.add('music-disc--visible', 'music-disc--playing');
  }).catch(() => {
    status.textContent = '视频还没准备好：请把文件放入 assets/handmade-gift.mp4 后重试。';
  });
});

video.addEventListener('play', () => {
  disc.classList.add('music-disc--visible', 'music-disc--playing');
});
video.addEventListener('pause', () => {
  music.pause();
  disc.classList.remove('music-disc--playing');
});
video.addEventListener('timeupdate', () => {
  const currentSecond = Math.floor(video.currentTime);
  if (!video.paused && currentSecond !== lastMemorySecond && currentSecond % 8 === 0) {
    lastMemorySecond = currentSecond;
    showMemory();
  }
});
video.addEventListener('error', () => {
  status.textContent = '视频文件加载失败，请确认 assets/handmade-gift.mp4 存在。';
});
video.addEventListener('ended', () => {
  music.pause();
  disc.classList.remove('music-disc--playing');
  clearMemories();
  show(ending);
});
replayButton.addEventListener('click', () => {
  video.currentTime = 0;
  playButton.classList.remove('is-hidden');
  disc.classList.remove('music-disc--visible', 'music-disc--playing');
  clearMemories();
  show(playScreen);
  status.textContent = '点击按钮，开始放映。';
});
