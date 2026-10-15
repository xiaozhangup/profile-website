/* Personal profile and selected open-source projects. */
const DEFAULT_PROFILE = Object.freeze({
  "name": "Daniel Zhang",
  "handle": "xiaozhangup",
  "location": "WUST · China · Fedora",
  "tagline": "Hello and welcome",
  "about": "你好，我是 xiaozhangup，也叫 Daniel Zhang。我使用 Fedora，关注 Linux 桌面体验，也在 Minecraft 生态中开发和探索。这里收集我的开源项目，以及那些从日常需求出发的小工具。"
});
const PROJECTS = {
  "01": {
    "title": "Octopus",
    "description": "基于 Paper 的 Minecraft 服务端分支，包含并行世界 Tick（PWT）、HAPPYLAND 专属功能与服务端 API 扩展。围绕实际服务器需求，探索性能与功能的改进。",
    "summary": "基于 Paper 的 Minecraft 服务端分支，包含 PWT 和 HAPPYLAND 专属功能。",
    "tags": [
      "Java",
      "Paper",
      "Minecraft"
    ],
    "category": "服务端",
    "url": "https://github.com/xiaozhangup/Octopus"
  },
  "02": {
    "title": "LyricifyIsland",
    "description": "Linux 桌面顶置歌词岛，支持 Spotify Web API 与本机 MPRIS 播放信息，提供逐字歌词、翻译和独立歌词窗口。使用 Skia 自绘歌词与动画；项目 README 标注由 AI 编写。",
    "summary": "在 Linux 桌面上还原灵动词岛体验，让歌词成为桌面的一部分。",
    "tags": [
      "C#",
      ".NET",
      "Skia",
      "MPRIS"
    ],
    "category": "桌面",
    "url": "https://github.com/xiaozhangup/LyricifyIsland"
  },
  "03": {
    "title": "xiaozhangup-bot",
    "description": "用于处理日常消息通知的自用机器人。按关键词和群号抓取、总结通知并发送到 Todoist，支持任务管理命令、定时天气早报和月度私信提醒。",
    "summary": "整理消息通知、同步 Todoist 任务，用自动化照顾日常琐事。",
    "tags": [
      "通知整理",
      "Todoist",
      "定时提醒"
    ],
    "category": "自动化",
    "url": "https://github.com/xiaozhangup/xiaozhangup-bot"
  }
};
const profile = DEFAULT_PROFILE;
let toastTimeout;

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}
function setText(element, value) {
  if (!element) return;
  if (element.hasAttribute('data-profile') && element.getAttribute('data-profile') === 'tagline') {
    element.replaceChildren(...String(value).split('\n').flatMap((line, i) => i ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
  } else { element.textContent = value; }
}
function paintProfile() {
  const words = profile.name.trim().split(/\s+/);
  const singleWordName = words.length < 2;
  const first = singleWordName ? '你好，' : words[0] || '你的';
  const last = singleWordName ? words[0] || '名字' : words.slice(1).join(' ');
  document.querySelector('.hero-title').classList.toggle('long-name', Math.max(first.length, last.length) > 7);
  document.querySelectorAll('[data-profile]').forEach(el => {
    const key = el.dataset.profile;
    if (key === 'heroFirst') setText(el, first);
    else if (key === 'heroLast') {
      el.textContent = last;
      const dot = document.createElement('span'); dot.className = 'title-dot'; dot.textContent = '。'; el.append(dot);
    } else { setText(el, profile[key] ?? ''); }
  });
  document.title = profile.name + ' / 个人作品集';
  const mark = document.querySelector('.avatar-glyph');
  const abbr = words.map(s => s.charAt(0)).slice(0, 2).join('').toUpperCase();
  if (mark) mark.textContent = '<' + (abbr || 'Y') + '/>';
  const footer = document.querySelector('.site-footer span:first-child');
  footer.innerHTML = '<b>&lt;/&gt;</b> ';
  footer.append(document.createTextNode(profile.handle + ' / © 2026'));
}
paintProfile();

// Accessible project details and source links.
const projectDialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-open-project]').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.openProject;
  const p = PROJECTS[id];
  document.querySelector('#project-dialog-number').textContent = '项目_' + id.padStart(3,'0');
  document.querySelector('#project-dialog-title').textContent = p.title;
  document.querySelector('#project-dialog-description').textContent = p.description;
  document.querySelector('#project-dialog-tags').replaceChildren(...p.tags.map(label => {
    const span = document.createElement('span'); span.textContent = label; return span;
  }));
  document.querySelector('#project-dialog-source').href = p.url;
  projectDialog.showModal();
}));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {
  document.getElementById(button.dataset.close).close();
}));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', e => {
  if (e.target === dialog) dialog.close();
}));

// Full-height chapters share one navigation path for wheels, keys, links and hashes.
const chapters = [...document.querySelectorAll('main > section')];
const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function syncMotionVisibility() {
  root.classList.toggle('motion-paused', document.hidden);
}
document.addEventListener('visibilitychange', syncMotionVisibility);
syncMotionVisibility();
let activeChapter = 0;
let switching = false;
let wheelGestureActive = false;
let wheelIdleTimer;
let settleTimer;
let layoutFrame;
let runningAnimations = [];

for (const chapter of chapters) {
  const stage = document.createElement('div');
  const content = document.createElement('div');
  stage.className = 'chapter-stage';
  content.className = 'chapter-content';
  content.append(...chapter.childNodes);
  stage.append(content);
  chapter.append(stage);
}
root.classList.add('chapter-ready');

function chapterTop(chapter) {
  return chapter.getBoundingClientRect().top + window.scrollY;
}
function nearestChapter() {
  return chapters.reduce((best, chapter, index) => Math.abs(chapterTop(chapter) - window.scrollY) < Math.abs(chapterTop(chapters[best]) - window.scrollY) ? index : best, 0);
}
function hashChapter() {
  const id = location.hash.slice(1);
  const index = chapters.findIndex(chapter => chapter.id === id);
  return index < 0 ? 0 : index;
}
function updateChapter(index) {
  activeChapter = index;
  chapters.forEach((chapter, i) => {
    chapter.classList.toggle('is-active', i === index);
    chapter.inert = i !== index;
  });
  const hash = index ? '#' + chapters[index].id : '#top';
  if (location.hash !== hash) history.replaceState(null, '', hash);
}
function fitChapters() {
  for (const chapter of chapters) {
    const style = getComputedStyle(chapter);
    const available = chapter.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    // Distribute the available space in CSS; keep text at its natural readable size.
    chapter.style.setProperty('--chapter-height', `${Math.floor(available)}px`);
  }
}
// Reveal existing text without changing its size, line breaks or accessible content.
const typingSelector = 'h1, h2, h3, .hero-statement, .about-lede, .toolbox-note, .contact-inner > p, .terminal-lines p, .info-prompt, .stack-prompt, .eyebrow, .section-no, .section-index, .project-content > p, .beyond-note, .plan-description';
const graphemes = new Intl.Segmenter('zh-CN', { granularity: 'grapheme' });
let typingChapter;
let typingTimer;
function prepareTypewriter(chapter) {
  chapter.querySelectorAll('.selected-code .strip').forEach((element, index) => {
    element.style.setProperty('--code-delay', `${index * 25}ms`);
  });
  const targets = [...chapter.querySelectorAll(typingSelector)];
  targets.filter(element => !targets.some(other => other !== element && other.contains(element))).forEach((element, group) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const glyphs = [];
    for (const node of nodes) {
      if (!node.textContent.trim()) continue;
      const fragment = document.createDocumentFragment();
      // Keep Latin words together; Chinese characters retain their natural wrapping.
      for (const token of node.textContent.split(/([A-Za-z0-9_]+)/)) {
        const word = /^[A-Za-z0-9_]+$/.test(token) ? document.createElement('span') : fragment;
        if (word !== fragment) word.className = 'typing-word';
        for (const { segment } of graphemes.segment(token)) {
          const glyph = document.createElement('span');
          glyph.className = 'typing-glyph';
          glyph.textContent = segment;
          glyphs.push(glyph);
          word.append(glyph);
        }
        if (word !== fragment) fragment.append(word);
      }
      node.replaceWith(fragment);
    }
    // Reveal each glyph as the cursor reaches it; sweep the long tail in 240 ms.
    const tailStart = Math.ceil(1200 / 28);
    const tailStep = 240 / Math.max(1, glyphs.length - tailStart);
    glyphs.forEach((glyph, index) => {
      const cursorDelay = index < tailStart ? index * 28 : 1200 + (index - tailStart) * tailStep;
      const cursorDuration = index < tailStart ? Math.min(28, 1200 - index * 28) : tailStep;
      glyph.style.setProperty('--typing-delay', `${Math.min(group * 45, 450) + cursorDelay}ms`);
      glyph.style.setProperty('--cursor-delay', `${Math.min(group * 45, 450) + cursorDelay}ms`);
      glyph.style.setProperty('--cursor-duration', `${cursorDuration}ms`);
    });
  });
}
function finishTyping() {
  clearTimeout(typingTimer);
  typingChapter?.classList.remove('is-typing');
  typingChapter = null;
}
function startTyping(chapter, delay = 0) {
  finishTyping();
  if (reducedMotion.matches) return;
  typingChapter = chapter;
  chapter.style.setProperty('--typing-start', `${delay}ms`);
  chapter.classList.add('is-typing');
  typingTimer = setTimeout(finishTyping, delay + 1900);
}
chapters.forEach(prepareTypewriter);

function motionElements(chapter) {
  return [...chapter.querySelectorAll('.section-heading, .strip, .avatar-block, .visual-footnote, .hero-copy > *, .hero-baseline, .about-title-col > *, .about-ascii, .info-prompt, .profile-facts > div, .section-title-row, .projects-toolbar, .project-card, .project-status, .toolbox-grid > div:first-child > *, .stack-line, .stack-prompt, .beyond-code > div, .interest-links, .workflow, .plan-column > .eyebrow, .plan-column > h3, .plan-description, .contact-top, .contact-inner > h2, .contact-inner > p, .contact-links, .contact-end, .site-footer')].filter(el => el.getClientRects().length && !el.hidden);
}
function animateChapter(chapter, entering, direction) {
  if (reducedMotion.matches) return Promise.resolve();
  const elements = motionElements(chapter).filter(element => !entering || !element.matches('.selected-code .strip'));
  return Promise.all(elements.map((element, i) => {
    const base = getComputedStyle(element).transform;
    const rest = base === 'none' ? '' : base;
    const offset = `${rest} translateY(${(entering ? 28 : -16) * direction}px)`;
    const frames = entering
      ? [{ opacity: 0, transform: offset }, { opacity: 1, transform: base }]
      : [{ opacity: 1, transform: base }, { opacity: .65, transform: offset }];
    const animation = element.animate(frames, {
      duration: entering ? 560 : 620,
      delay: entering ? 60 + Math.min(i * 12, 120) : 0,
      easing: entering ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.4,0,1,1)',
      fill: 'both'
    });
    runningAnimations.push(animation);
    return animation.finished.catch(() => {});
  }));
}
function scrollToChapter(index, animated, onArrival = () => {}) {
  const from = window.scrollY;
  const started = performance.now();
  let arrivalStarted = false;
  return new Promise(resolve => {
    function tick(now) {
      const progress = animated && !reducedMotion.matches ? Math.min(1, (now - started) / 620) : 1;
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: from + (chapterTop(chapters[index]) - from) * eased, behavior: 'instant' });
      // Use actual eased travel distance, not elapsed animation time.
      if (!arrivalStarted && eased >= .8) {
        arrivalStarted = true;
        onArrival();
      }
      if (progress < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}
async function goToChapter(index, animate = true) {
  index = Math.max(0, Math.min(chapters.length - 1, index));
  if (switching) return;
  const previous = activeChapter;
  if (index === previous && Math.abs(window.scrollY - chapterTop(chapters[index])) < 1) return;
  switching = true;
  root.classList.add('is-switching');
  const direction = index >= previous ? 1 : -1;
  const oldFocus = chapters[previous].contains(document.activeElement);
  const target = chapters[index];
  target.scrollTop = 0;
  target.inert = false;
  const useMotion = animate && !reducedMotion.matches;
  finishTyping();
  const entering = useMotion && index !== previous;
  let entranceAnimation = Promise.resolve();
  // Keep the target in its unrevealed state until 80% of the scroll distance.
  // Visibility preserves layout, so animation targets can still be measured.
  if (entering) target.classList.add('is-awaiting-entry');
  const startEntrance = () => {
    if (!entering) return;
    target.classList.add('is-entering');
    startTyping(target);
    entranceAnimation = animateChapter(target, true, direction);
    target.classList.remove('is-awaiting-entry');
  };
  try {
    await Promise.all([
      entering ? animateChapter(chapters[previous], false, direction) : Promise.resolve(),
      scrollToChapter(index, useMotion, startEntrance)
    ]);
    await entranceAnimation;
  } finally {
    runningAnimations.forEach(animation => animation.cancel());
    runningAnimations = [];
    updateChapter(index);
    target.classList.remove('is-entering', 'is-awaiting-entry');
    window.scrollTo({ top: chapterTop(target), behavior: 'instant' });
    root.classList.remove('is-switching');
    switching = false;
    if (oldFocus) {
      const title = target.querySelector('h1, h2');
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
    }
  }
}
function allowsChapterScroll(target) {
  return !document.querySelector('dialog[open]') && !(target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]'));
}
function canScrollInside(direction) {
  const chapter = chapters[activeChapter];
  return direction > 0 ? chapter.scrollTop + chapter.clientHeight < chapter.scrollHeight - 2 : chapter.scrollTop > 2;
}
window.addEventListener('wheel', event => {
  if (event.ctrlKey || !allowsChapterScroll(event.target) || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  const direction = Math.sign(event.deltaY);
  if (!switching && canScrollInside(direction)) return;
  event.preventDefault();
  clearTimeout(wheelIdleTimer);
  wheelIdleTimer = setTimeout(() => { wheelGestureActive = false; }, 240);
  if (wheelGestureActive || switching) return;
  wheelGestureActive = true;
  goToChapter(activeChapter + direction);
}, { passive: false });
window.addEventListener('keydown', event => {
  if (!allowsChapterScroll(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target instanceof Element && event.target.closest('button, a, [role="button"]') && [' ', 'Enter'].includes(event.key)) return;
  const direction = ['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey) ? 1 : ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 0;
  if (direction) {
    event.preventDefault();
    if (!switching && canScrollInside(direction)) chapters[activeChapter].scrollBy({ top: direction * chapters[activeChapter].clientHeight * .7, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    else goToChapter(activeChapter + direction);
  } else if (['Home', 'End'].includes(event.key)) {
    event.preventDefault();
    goToChapter(event.key === 'Home' ? 0 : chapters.length - 1);
  }
});
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const id = link.getAttribute('href').slice(1);
  const index = ['top', 'main', 'intro'].includes(id) ? 0 : chapters.findIndex(chapter => chapter.id === id);
  if (index < 0) return;
  event.preventDefault();
  goToChapter(index);
});
let touchStart;
window.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 && allowsChapterScroll(event.target) ? { x: event.touches[0].clientX, y: event.touches[0].clientY, used: false } : null;
}, { passive: true });
window.addEventListener('touchmove', event => {
  if (!touchStart || event.touches.length !== 1 || !allowsChapterScroll(event.target)) return;
  const dx = touchStart.x - event.touches[0].clientX;
  const dy = touchStart.y - event.touches[0].clientY;
  if (Math.abs(dy) <= Math.abs(dx)) return;
  const direction = Math.sign(dy);
  if (!switching && canScrollInside(direction)) { touchStart.used = true; return; }
  event.preventDefault();
  if (touchStart.used || switching || Math.abs(dy) < 45) return;
  touchStart.used = true;
  goToChapter(activeChapter + direction);
}, { passive: false });
window.addEventListener('touchend', () => { touchStart = null; });
window.addEventListener('hashchange', () => goToChapter(hashChapter()));
window.addEventListener('scroll', () => {
  clearTimeout(settleTimer);
  if (switching) return;
  // Covers dragging the scrollbar and browser-driven restoration.
  settleTimer = setTimeout(() => goToChapter(nearestChapter()), 160);
}, { passive: true });
function refreshLayout() {
  cancelAnimationFrame(layoutFrame);
  layoutFrame = requestAnimationFrame(() => {
    fitChapters();
    if (!switching) window.scrollTo({ top: chapterTop(chapters[activeChapter]), behavior: 'instant' });
  });
}
window.addEventListener('resize', refreshLayout);
const chapterResizeObserver = new ResizeObserver(refreshLayout);
chapters.forEach(chapter => chapterResizeObserver.observe(chapter.querySelector('.chapter-content')));
fitChapters();
updateChapter(hashChapter());
window.scrollTo({ top: chapterTop(chapters[activeChapter]), behavior: 'instant' });
startTyping(chapters[activeChapter], 80);
document.fonts.ready.then(refreshLayout);
window.addEventListener('pageshow', refreshLayout);
reducedMotion.addEventListener('change', () => {
  runningAnimations.forEach(animation => animation.finish());
  finishTyping();
});

// Additive translation keeps chapter entrances and decorative rotation independent.
const compactFloat = window.matchMedia('(max-width: 650px)');
const floatSpecs = [
  ['.s04', 3, 6200], ['.s09', 3, 7400], ['.s13', 3, 8000],
  ['.avatar-block', 5, 7000],
  ['.about-ascii > span:first-child', 4, 6000],
  ['.about-ascii > span:last-child', 4, 8000],
  ['.terminal-window', 4, 6400], ['.orbit-shape', 4, 7800],
  ['.big-angle', 4, 7000], ['.contact-star', 3, 7000]
];
let ambientFloats = [];
function syncAmbientFloats() {
  for (const { element, chapter, animation } of ambientFloats) {
    const interacting = element.matches('.avatar-block') &&
      (element.matches(':hover') || element.matches(':focus-within'));
    const playing = !document.hidden && !root.classList.contains('is-switching') &&
      chapter.classList.contains('is-active') && !interacting;
    if (playing && animation.playState !== 'running') animation.play();
    else if (!playing && animation.playState !== 'paused') animation.pause();
  }
}
function prepareAmbientFloats() {
  ambientFloats.forEach(({ animation }) => animation.cancel());
  ambientFloats = [];
  if (reducedMotion.matches) return;
  floatSpecs.forEach(([selector, amplitude, duration], index) => {
    document.querySelectorAll(selector).forEach(element => {
      const distance = amplitude * (compactFloat.matches ? .5 : 1);
      const sign = index % 2 ? -1 : 1;
      const frames = Array.from({ length: 65 }, (_, step) => ({
        translate: `0 ${-Math.sin(step / 64 * Math.PI * 2) * distance * sign}px`,
        offset: step / 64
      }));
      const animation = element.animate(frames, {
        duration, delay: 1000 + (index % 3) * 180, iterations: Infinity,
        easing: 'linear', composite: 'add'
      });
      animation.pause();
      ambientFloats.push({ element, chapter: element.closest('main > section'), animation });
    });
  });
  syncAmbientFloats();
}
const ambientObserver = new MutationObserver(syncAmbientFloats);
[root, ...chapters].forEach(element => ambientObserver.observe(element, {
  attributes: true, attributeFilter: ['class']
}));
const floatingAvatar = document.querySelector('.avatar-block');
['pointerenter', 'pointerleave', 'focusin', 'focusout'].forEach(type => {
  floatingAvatar.addEventListener(type, () => queueMicrotask(syncAmbientFloats));
});
document.addEventListener('visibilitychange', syncAmbientFloats);
reducedMotion.addEventListener('change', prepareAmbientFloats);
compactFloat.addEventListener('change', prepareAmbientFloats);
prepareAmbientFloats();
