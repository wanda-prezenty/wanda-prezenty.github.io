const CATEGORY_LIST = ['Toys & Games', 'Books', 'Creative & Educational', 'Outdoor & Active Play', 'Furniture & Room Decor', 'Clothes & Accessories', 'Other Wishes'];
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
  const query = encodeURIComponent(gift.name || 'gift');
  return `https://www.google.com/search?tbm=shop&q=${query}`;
}
function createCard(gift) {
  const article = document.createElement('article');
  article.className = 'gift-card';
  const imageWrap = document.createElement('div');
  imageWrap.className = 'card-image';
  const image = document.createElement('img');
  image.src = safeImage(gift.image);
  image.alt = safeText(gift.name, 'Gift idea');
  image.loading = 'lazy';
  image.onerror = () => { image.onerror = null; image.src = 'images/gift-placeholder.svg'; };
  const pill = document.createElement('span');
  pill.className = 'category-pill';
  pill.textContent = safeText(gift.category, 'Other Wishes');
  imageWrap.append(image, pill);
  const body = document.createElement('div');
  body.className = 'card-body';
  const titleRow = document.createElement('div');
  titleRow.className = 'card-title-row';
  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = safeText(gift.name, 'A little wish');
  const price = document.createElement('span');
  price.className = 'card-price';
  price.textContent = Number.isFinite(Number(gift.price)) ? money.format(Number(gift.price)) : 'Price varies';
  titleRow.append(title, price);
  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = safeText(gift.shortDescription, 'A lovely idea for Christmas.');
  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const details = document.createElement('button');
  details.type = 'button';
  details.className = 'card-details';
  details.textContent = 'View details';
  details.addEventListener('click', () => openDetails(gift));
  const store = document.createElement('a');
  store.className = 'card-store';
  store.href = getStoreUrl(gift);
  store.target = '_blank';
  store.rel = 'noopener noreferrer';
  store.textContent = 'View in store ↗';
  actions.append(details, store);
  body.append(titleRow, description, actions);
  article.append(imageWrap, body);
  return article;
}
function render() {
  const category = categoryFilter.value;
  const query = searchInput.value.trim().toLocaleLowerCase();
  let visible = gifts.filter(gift => (category === 'all' || gift.category === category) && safeText(gift.name).toLocaleLowerCase().includes(query));
  if (priceSort.value === 'low') visible.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  if (priceSort.value === 'high') visible.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  grid.replaceChildren(...visible.map(createCard));
  count.textContent = `${visible.length} ${visible.length === 1 ? 'gift idea' : 'gift ideas'}${visible.length !== gifts.length ? ` · ${gifts.length} in all` : ''}`;
  emptyState.hidden = visible.length > 0;
}
function openDetails(gift) {
  document.querySelector('#dialog-image').src = safeImage(gift.image);
  document.querySelector('#dialog-image').alt = safeText(gift.name, 'Gift idea');
  document.querySelector('#dialog-title').textContent = safeText(gift.name, 'A little wish');
  document.querySelector('#dialog-category').textContent = safeText(gift.category, 'Other Wishes');
  document.querySelector('#dialog-price').textContent = Number.isFinite(Number(gift.price)) ? `About ${money.format(Number(gift.price))}` : 'Price varies';
  document.querySelector('#dialog-description').textContent = safeText(gift.description, safeText(gift.shortDescription));
  const variant = document.querySelector('#dialog-variant');
  variant.textContent = gift.variant ? `Details: ${gift.variant}` : '';
  variant.hidden = !gift.variant;
  document.querySelector('#dialog-store').href = getStoreUrl(gift);
  dialog.showModal();
}
async function copyWishlistUrl() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast('Wishlist link copied — ready to share!');
  } catch {
    const input = document.createElement('textarea');
    input.value = window.location.href;
    input.style.position = 'fixed'; input.style.opacity = '0';
    document.body.append(input); input.select();
    const copied = document.execCommand('copy'); input.remove();
    showToast(copied ? 'Wishlist link copied — ready to share!' : 'Copy this page address to share the wishlist.');
  }
}
async function shareWishlist() {
  if (navigator.share) {
    try { await navigator.share({ title: document.title, text: `A Christmas wishlist for ${document.querySelector('#child-name').textContent}`, url: window.location.href }); }
    catch (error) { if (error.name !== 'AbortError') showToast('Sharing is not available right now.'); }
  } else await copyWishlistUrl();
}
function setUpMenu() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('open', !expanded);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Open navigation');
  }));
}
async function loadWishlist() {
  try {
    const response = await fetch('gifts.json');
    if (!response.ok) throw new Error('Could not load gifts.json');
    const data = await response.json();
    if (!Array.isArray(data.gifts)) throw new Error('Gift data is missing');
    gifts = data.gifts;
    if (data.title) { document.title = data.title; document.querySelector('#page-title').innerHTML = `${safeText(data.title).replace(/\s+/, '<br>')}`; }
    if (data.childName) document.querySelector('#child-name').textContent = data.childName;
    if (data.description) document.querySelector('#intro-copy').textContent = data.description;
    const heading = document.querySelector('#wishlist-heading');
    if (data.childName) heading.innerHTML = `A few things to make<br><em>${data.childName}’s eyes sparkle</em>`;
    const presentCategories = CATEGORY_LIST.filter(category => gifts.some(gift => gift.category === category));
    for (const category of presentCategories) {
      const option = document.createElement('option'); option.value = category; option.textContent = category; categoryFilter.append(option);
    }
    render();
  } catch (error) {
    console.error(error);
    grid.hidden = true;
    count.textContent = 'Wishlist unavailable';
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
