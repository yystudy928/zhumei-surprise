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
const status = document.querySelector('#video-status');
const disc = document.querySelector('#music-disc');
const memoryWall = document.querySelector('#memory-wall');
const memoryLanes = [...document.querySelectorAll('.memory-lane')];
const polaroidTemplate = document.querySelector('#polaroid-template');
const memoryImages = Array.from({ length: 24 }, (_, index) => `assets/memories/thumbs/memory-${String(index + 1).padStart(2, '0')}.jpg?v=14`);
const mobileMemoryStrip = document.querySelector('#memory-mobile-strip');
const mobileMemorySlots = mobileMemoryStrip ? [...mobileMemoryStrip.querySelectorAll('img')] : [];
let memoryIndex = 0;
let lastMemorySecond = -1;
let mobileMemorySlot = 0;
let mobileMemoryTimer = null;
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
  const index = memoryIndex;
  const lane = memoryLanes[index % memoryLanes.length];
  const card = polaroidTemplate.content.firstElementChild.cloneNode(true);
  const image = card.querySelector('img');
  const isMobile = matchMedia('(max-width: 900px)').matches;
  card.style.setProperty('--tilt', `${[-7, -4, 4, 7][index % 4]}deg`);
  if (!isMobile) card.style.top = `${10 + ((index * 17) % 58)}%`;
  image.alt = '';
  image.addEventListener('load', () => {
    lane.append(card);
    requestAnimationFrame(() => card.classList.add('is-floating'));
    isMobile ? null : setTimeout(() => {
      card.classList.remove('is-floating');
      setTimeout(() => card.remove(), 1100);
    }, isMobile ? 5200 : 7200);
  }, { once: true });
  image.addEventListener('error', () => card.remove(), { once: true });
  image.src = memoryImages[memoryIndex % memoryImages.length];
  memoryIndex += 1;
}

function clearMemories() {
  memoryLanes.forEach((lane) => lane.replaceChildren());
}

function resetMobileMemories() {
  mobileMemorySlot = mobileMemorySlots.length;
  mobileMemorySlots.forEach((image, index) => {
    image.src = memoryImages[index];
  });
}

function rotateMobileMemories() {
  if (!mobileMemorySlots.length) return;
  const image = mobileMemorySlots[mobileMemorySlot % mobileMemorySlots.length];
  image.src = memoryImages[mobileMemorySlot % memoryImages.length];
  mobileMemorySlot = (mobileMemorySlot + 1) % memoryImages.length;
}

resetMobileMemories();

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
  video.play().then(() => {
    playButton.classList.add('is-hidden');
    disc.classList.add('music-disc--visible', 'music-disc--playing');
  }).catch(() => {
    status.textContent = '视频还没准备好：请确认视频地址可访问，并检查手机静音开关和音量。';
  });
});

video.addEventListener('play', () => {
  if (memoryIndex === 0) {
    showMemory();
    lastMemorySecond = 0;
  }
  if (mobileMemorySlots.length && matchMedia('(max-width: 900px)').matches && !mobileMemoryTimer) {
    mobileMemoryTimer = setInterval(rotateMobileMemories, 4000);
  }
  disc.classList.add('music-disc--visible', 'music-disc--playing');
});
video.addEventListener('pause', () => {
  clearInterval(mobileMemoryTimer);
  mobileMemoryTimer = null;
  disc.classList.remove('music-disc--playing');
});
video.addEventListener('timeupdate', () => {
  const currentSecond = Math.floor(video.currentTime);
  if (!video.paused && currentSecond !== lastMemorySecond && currentSecond % (matchMedia('(max-width: 900px)').matches ? 4 : 8) === 0) {
    lastMemorySecond = currentSecond;
    showMemory();
  }
});
video.addEventListener('error', () => {
  status.textContent = '视频文件加载失败，请确认视频地址可访问。';
});
video.addEventListener('ended', () => {
  clearInterval(mobileMemoryTimer);
  mobileMemoryTimer = null;
  disc.classList.remove('music-disc--playing');
  clearMemories();
  show(ending);
});
replayButton.addEventListener('click', () => {
  video.currentTime = 0;
  playButton.classList.remove('is-hidden');
  disc.classList.remove('music-disc--visible', 'music-disc--playing');
  clearMemories();
  resetMobileMemories();
  show(playScreen);
  status.textContent = '点击按钮，开始放映。';
});
