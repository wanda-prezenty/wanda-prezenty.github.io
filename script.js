const CATEGORY_LIST = [
  'Zabawki i gry',
  'Książki',
  'Kreatywne i edukacyjne',
  'Zabawa na zewnątrz i ruch',
  'Meble i dekoracje pokoju',
  'Ubrania i akcesoria',
  'Inne życzenia'
];
const money = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 });
const grid = document.querySelector('#gift-grid');
const categoryFilter = document.querySelector('#category-filter');
const searchInput = document.querySelector('#gift-search');
const priceSort = document.querySelector('#price-sort');
const count = document.querySelector('#gift-count');
const emptyState = document.querySelector('#empty-state');
const errorState = document.querySelector('#error-state');
const dialog = document.querySelector('#gift-dialog');
let gifts = [];
let toastTimer;

function safeText(value, fallback = '') { return typeof value === 'string' ? value : fallback; }
function safeImage(path) { return safeText(path, 'images/gift-placeholder.svg'); }
function isValidStoreUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; }
  catch { return false; }
}
function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}
function getStoreUrl(gift) {
  if (isValidStoreUrl(gift.url)) return gift.url;
  const query = encodeURIComponent(gift.name || 'prezent');
  return `https://www.google.com/search?tbm=shop&q=${query}`;
}
function createCard(gift) {
  const article = document.createElement('article');
  article.className = 'gift-card';
  const imageWrap = document.createElement('div');
  imageWrap.className = 'card-image';
  const image = document.createElement('img');
  image.src = safeImage(gift.image);
  image.alt = safeText(gift.name, 'Pomysł na prezent');
  image.loading = 'lazy';
  image.onerror = () => { image.onerror = null; image.src = 'images/gift-placeholder.svg'; };
  const pill = document.createElement('span');
  pill.className = 'category-pill';
  pill.textContent = safeText(gift.category, 'Inne życzenia');
  imageWrap.append(image, pill);
  const body = document.createElement('div');
  body.className = 'card-body';
  const titleRow = document.createElement('div');
  titleRow.className = 'card-title-row';
  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = safeText(gift.name, 'Małe życzenie');
  const price = document.createElement('span');
  price.className = 'card-price';
  price.textContent = Number.isFinite(Number(gift.price)) && Number(gift.price) > 0 ? money.format(Number(gift.price)) : 'Cena do ustalenia';
  titleRow.append(title, price);
  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = safeText(gift.shortDescription, 'Śliczny pomysł na Święta.');
  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const details = document.createElement('button');
  details.type = 'button';
  details.className = 'card-details';
  details.textContent = 'Zobacz szczegóły';
  details.addEventListener('click', () => openDetails(gift));
  const store = document.createElement('a');
  store.className = 'card-store';
  store.href = getStoreUrl(gift);
  store.target = '_blank';
  store.rel = 'noopener noreferrer';
  store.textContent = 'Zobacz w sklepie ↗';
  actions.append(details, store);
  body.append(titleRow, description, actions);
  article.append(imageWrap, body);
  return article;
}
function render() {
  const category = categoryFilter.value;
  const query = searchInput.value.trim().toLocaleLowerCase('pl');
  let visible = gifts.filter(gift => (category === 'all' || gift.category === category) && safeText(gift.name).toLocaleLowerCase('pl').includes(query));
  if (priceSort.value === 'low') visible.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  if (priceSort.value === 'high') visible.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  grid.replaceChildren(...visible.map(createCard));
  const form = visible.length === 1 ? 'pomysł na prezent' : 'pomysłów na prezenty';
  count.textContent = `${visible.length} ${form}${visible.length !== gifts.length ? ` · łącznie ${gifts.length}` : ''}`;
  emptyState.hidden = visible.length > 0;
}
function openDetails(gift) {
  document.querySelector('#dialog-image').src = safeImage(gift.image);
  document.querySelector('#dialog-image').alt = safeText(gift.name, 'Pomysł na prezent');
  document.querySelector('#dialog-title').textContent = safeText(gift.name, 'Małe życzenie');
  document.querySelector('#dialog-category').textContent = safeText(gift.category, 'Inne życzenia');
  document.querySelector('#dialog-price').textContent = Number.isFinite(Number(gift.price)) && Number(gift.price) > 0 ? `Około ${money.format(Number(gift.price))}` : 'Cena do ustalenia';
  document.querySelector('#dialog-description').textContent = safeText(gift.description, safeText(gift.shortDescription));
  const variant = document.querySelector('#dialog-variant');
  variant.textContent = gift.variant ? `Informacje: ${gift.variant}` : '';
  variant.hidden = !gift.variant;
  document.querySelector('#dialog-store').href = getStoreUrl(gift);
  dialog.showModal();
}
async function copyWishlistUrl() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast('Skopiowano link do listy - gotowy do udostępnienia!');
  } catch {
    const input = document.createElement('textarea');
    input.value = window.location.href;
    input.style.position = 'fixed'; input.style.opacity = '0';
    document.body.append(input); input.select();
    const copied = document.execCommand('copy'); input.remove();
    showToast(copied ? 'Skopiowano link do listy - gotowy do udostępnienia!' : 'Skopiuj adres strony, aby udostępnić listę.');
  }
}
async function shareWishlist() {
  if (navigator.share) {
    try { await navigator.share({ title: document.title, text: `Świąteczna lista życzeń dla Wandzi`, url: window.location.href }); }
    catch (error) { if (error.name !== 'AbortError') showToast('Udostępnianie jest teraz niedostępne.'); }
  } else await copyWishlistUrl();
}
function setUpMenu() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.setAttribute('aria-label', expanded ? 'Otwórz nawigację' : 'Zamknij nawigację');
    nav.classList.toggle('open', !expanded);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Otwórz nawigację');
  }));
}
async function loadWishlist() {
  try {
    const response = await fetch('gifts.json');
    if (!response.ok) throw new Error('Nie udało się wczytać gifts.json');
    const data = await response.json();
    if (!Array.isArray(data.gifts)) throw new Error('Brakuje danych prezentów');
    gifts = data.gifts;
    if (data.title) { document.title = data.title; document.querySelector('#page-title').innerHTML = `${safeText(data.title).replace(/\s+/, '<br>')}`; }
    if (data.description) document.querySelector('#intro-copy').textContent = data.description;
    const heading = document.querySelector('#wishlist-heading');
    if (data.childName) heading.innerHTML = `Kilka pomysłów, by<br><em>oczy Wandzi się świeciły</em>`;
    const presentCategories = CATEGORY_LIST.filter(category => gifts.some(gift => gift.category === category));
    for (const category of presentCategories) {
      const option = document.createElement('option'); option.value = category; option.textContent = category; categoryFilter.append(option);
    }
    render();
  } catch (error) {
    console.error(error);
    grid.hidden = true;
    count.textContent = 'Lista życzeń niedostępna';
    errorState.hidden = false;
  }
}

categoryFilter.addEventListener('change', render);
searchInput.addEventListener('input', render);
priceSort.addEventListener('change', render);
document.querySelector('#clear-filters').addEventListener('click', () => { categoryFilter.value = 'all'; searchInput.value = ''; priceSort.value = 'featured'; render(); });
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', copyWishlistUrl));
document.querySelectorAll('[data-share]').forEach(button => button.addEventListener('click', shareWishlist));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
setUpMenu();
loadWishlist();
