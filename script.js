const sayt = siteData.load();
const themeToggle = document.getElementById('theme-toggle');
const themeStorageKey = '11g-theme-v1';

if (localStorage.getItem(themeStorageKey) === 'light') {
  document.body.classList.add('light-theme');
}

function updateThemeToggle() {
  const isLight = document.body.classList.contains('light-theme');
  const themeIcon = themeToggle.querySelector('i');
  themeIcon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  themeToggle.setAttribute('aria-label', isLight ? 'Qorong‘i rejimni yoqish' : 'Yorug‘ rejimni yoqish');
  themeToggle.title = isLight ? 'Qorong‘i rejim' : 'Yorug‘ rejim';
  themeToggle.setAttribute('aria-pressed', String(isLight));
}

updateThemeToggle();
themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem(themeStorageKey, isLight ? 'light' : 'dark');
  updateThemeToggle();
});

const hero = document.querySelector('.hero');
hero.querySelector('.hero-sub').textContent = sayt.site.heroSubtitle;
const heroLogo = document.getElementById('hero-logo');
if (sayt.site.heroImage) {
  heroLogo.src = sayt.site.heroImage;
  document.getElementById('hero-logo-wrap').hidden = false;
}
document.getElementById('footer-text').textContent = sayt.site.footerText;
const instagramLink = document.getElementById('instagram-link');
if (sayt.site.instagramUrl) instagramLink.href = sayt.site.instagramUrl;
else instagramLink.hidden = true;

const quotes = document.querySelector('.quotes');
quotes.replaceChildren(...sayt.quotes.map(({ text, author }) => {
  const quote = document.createElement('blockquote');
  quote.append(document.createTextNode(text));
  const cite = document.createElement('cite');
  cite.textContent = author;
  quote.appendChild(cite);
  return quote;
}));

window.addEventListener('load', () => {
  const intro = document.getElementById('intro');
  setTimeout(() => {
    intro.classList.add('hide');
    document.body.classList.add('ready');
  }, 2500);
  setTimeout(() => {
    intro.remove();
    document.body.classList.add('intro-finished');
  }, 3500);
});

const grid = document.getElementById('grid');
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
let kuzatuvchi;

function lightboxOch(src) {
  lbImg.src = src;
  lightbox.classList.add('open');
}

function rasmKartasi(src) {
  const slot = document.createElement('div');
  slot.className = 'foto-slot pop';
  const button = document.createElement('button');
  button.className = 'foto';
  button.type = 'button';
  button.setAttribute('aria-label', 'Rasmni kattalashtirib ko‘rish');
  const img = document.createElement('img');
  img.src = src;
  img.alt = '11-G sinf rasmi';
  img.loading = 'lazy';
  img.draggable = false;
  button.appendChild(img);
  button.addEventListener('click', () => lightboxOch(src));
  slot.appendChild(button);
  grid.appendChild(slot);
  kuzatuvchi.observe(slot);
}

function renderGallery() {
  grid.replaceChildren();
  sayt.photos.forEach(photo => rasmKartasi(photo.src));
}

kuzatuvchi = new IntersectionObserver(items => {
  items.forEach(item => {
    if (item.isIntersecting) {
      item.target.classList.add('korindi');
      kuzatuvchi.unobserve(item.target);
    }
  });
}, { threshold: .15 });

renderGallery();

function rasmniSudrashniToxtat(event) {
  const target = event.target;
  if (target instanceof HTMLImageElement && target.matches('main img, .lightbox img')) {
    event.preventDefault();
  }
}

document.addEventListener('contextmenu', rasmniSudrashniToxtat);
document.addEventListener('dragstart', rasmniSudrashniToxtat);

const yop = () => lightbox.classList.remove('open');
document.getElementById('close').addEventListener('click', yop);
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) yop();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') yop();
});
