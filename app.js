const storageKey = 'threadline.listings.v1';
const channelInitials = { eBay: 'e', Poshmark: 'P', Depop: 'd', Mercari: 'm' };
const channelClasses = { eBay: 'ebay', Poshmark: 'posh', Depop: 'depop', Mercari: 'mercari' };
const seedListings = [
  { id: 'seed-1', title: 'Vintage leather trench coat', brand: 'Mango', category: 'Clothing', size: 'M', condition: 'Good', price: 86, channels: ['eBay', 'Poshmark'], status: 'active', icon: '🧥', tone: 'thumb-coat', created: 6 },
  { id: 'seed-2', title: 'Mini shoulder bag', brand: 'Coach', category: 'Bags', size: 'One size', condition: 'Like new', price: 112, channels: ['Poshmark', 'Depop', 'Mercari'], status: 'active', icon: '👜', tone: 'thumb-bag', created: 5 },
  { id: 'seed-3', title: 'Suede everyday sneakers', brand: 'Puma', category: 'Shoes', size: '8', condition: 'Good', price: 48, channels: ['eBay', 'Depop'], status: 'active', icon: '👟', tone: 'thumb-shoe', created: 4 },
  { id: 'seed-4', title: 'Chunky knit cardigan', brand: '& Other Stories', category: 'Clothing', size: 'S', condition: 'Like new', price: 64, channels: ['Poshmark', 'Mercari'], status: 'draft', icon: '🧶', tone: 'thumb-knit', created: 3 },
  { id: 'seed-5', title: 'Classic gold-tone watch', brand: 'Timex', category: 'Accessories', size: 'One size', condition: 'Good', price: 55, channels: ['eBay', 'Mercari'], status: 'sold', icon: '⌚', tone: 'thumb-watch', created: 2 },
  { id: 'seed-6', title: 'Straight-leg vintage jeans', brand: 'Levi\'s', category: 'Clothing', size: '28', condition: 'Good', price: 42, channels: ['eBay', 'Poshmark', 'Depop'], status: 'active', icon: '👖', tone: 'thumb-jeans', created: 1 }
];
let listings = loadListings();
let currentFilter = 'all';
let currentView = 'overview';
let toastTimer;

const elements = {
  rows: document.querySelector('#listing-rows'),
  empty: document.querySelector('#empty-state'),
  count: document.querySelector('#result-count'),
  search: document.querySelector('#search-input'),
  sort: document.querySelector('#sort-select'),
  form: document.querySelector('#listing-form'),
  backdrop: document.querySelector('#modal-backdrop'),
  toast: document.querySelector('#toast'),
  filterRow: document.querySelector('#filter-row')
};

function loadListings() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : seedListings;
  } catch {
    return seedListings;
  }
}

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(listings));
  } catch {
    showToast('Could not save on this device. Check browser storage settings.');
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function getFilteredListings() {
  const query = elements.search.value.trim().toLowerCase();
  const sort = elements.sort.value;
  const filtered = listings.filter(item => {
    const matchesSearch = [item.title, item.brand, item.category, ...item.channels].join(' ').toLowerCase().includes(query);
    const matchesFilter = currentFilter === 'all' || item.status === currentFilter;
    const matchesView = currentView === 'drafts' ? item.status === 'draft' : currentView === 'sold' ? item.status === 'sold' : currentView === 'listings' ? item.status !== 'sold' : true;
    return matchesSearch && matchesFilter && matchesView;
  });
  return filtered.sort((first, second) => {
    if (sort === 'price-high') return second.price - first.price;
    if (sort === 'price-low') return first.price - second.price;
    if (sort === 'name') return first.title.localeCompare(second.title);
    return second.created - first.created;
  });
}

function render() {
  document.querySelector('.eyebrow').textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase();
  const visibleListings = getFilteredListings();
  elements.rows.innerHTML = visibleListings.map(item => `
    <tr>
      <td><div class="item-cell"><span class="item-thumb ${escapeHtml(item.tone || 'thumb-coat')}">${escapeHtml(item.icon || '✳')}</span><span class="item-meta"><span class="item-name">${escapeHtml(item.title)}</span><span class="item-sub">${escapeHtml(item.brand || item.category)}${item.size ? ` · ${escapeHtml(item.size)}` : ''}</span></span></div></td>
      <td><span class="status-pill status-${escapeHtml(item.status)}">${item.status === 'active' ? 'Active' : item.status === 'draft' ? 'Draft' : 'Sold'}</span></td>
      <td><span class="market-tags">${item.channels.map(channel => `<span class="market-tag ${channelClasses[channel] || ''}" title="${escapeHtml(channel)}">${channelInitials[channel] || '?'}</span>`).join('')}</span></td>
      <td class="price-cell">${money(item.price)}</td>
      <td><button class="row-actions" data-action="${item.status === 'draft' ? 'activate' : item.status === 'active' ? 'sold' : 'relist'}" data-id="${escapeHtml(item.id)}" aria-label="${item.status === 'draft' ? 'Mark active' : item.status === 'active' ? 'Mark sold' : 'Relist'} ${escapeHtml(item.title)}">···</button></td>
    </tr>`).join('');
  elements.empty.hidden = visibleListings.length > 0;
  elements.count.textContent = `Showing ${visibleListings.length} ${visibleListings.length === 1 ? 'item' : 'items'}`;
  document.querySelector('#stat-active').textContent = listings.filter(item => item.status === 'active').length;
  document.querySelector('#stat-earnings').textContent = money(listings.filter(item => item.status === 'active').reduce((sum, item) => sum + Number(item.price), 0));
  document.querySelector('#stat-sold').textContent = listings.filter(item => item.status === 'sold').length;
  document.querySelector('#stat-drafts').textContent = listings.filter(item => item.status === 'draft').length;
  document.querySelector('#nav-count').textContent = listings.filter(item => item.status === 'active').length;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 2600);
}

function openModal() {
  elements.backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => elements.form.elements.title.focus(), 50);
}

function closeModal() {
  elements.backdrop.hidden = true;
  document.body.style.overflow = '';
}

function createListing(status) {
  if (!elements.form.reportValidity()) return;
  const formData = new FormData(elements.form);
  const channels = formData.getAll('channels');
  const title = formData.get('title').trim();
  if (!channels.length && status === 'active') {
    showToast('Choose at least one marketplace, or save as a draft.');
    return;
  }
  listings.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title,
    brand: formData.get('brand').trim(),
    category: formData.get('category'),
    size: formData.get('size').trim(),
    condition: formData.get('condition'),
    price: Number(formData.get('price')),
    channels,
    status,
    icon: '✳',
    tone: 'thumb-coat',
    created: Date.now()
  });
  persist();
  elements.form.reset();
  closeModal();
  currentView = 'overview';
  setView('overview');
  render();
  showToast(status === 'draft' ? 'Draft saved to your closet.' : 'Listing saved to your closet.');
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  const labels = { overview: 'Overview', listings: 'My listings', drafts: 'Drafts', sold: 'Sold' };
  document.querySelector('#breadcrumb-current').textContent = labels[view];
  document.querySelector('#page-title').innerHTML = view === 'overview' ? 'Good morning, Alex <span class="wave">✳</span>' : labels[view];
  document.querySelector('#page-subtitle').textContent = view === 'overview' ? "Here's what's happening with your closet today." : view === 'drafts' ? 'A little closer to getting these pieces out into the world.' : view === 'sold' ? 'A second life well lived. Here are your sold pieces.' : 'Everything you are getting ready to share.';
  document.querySelector('#list-heading').textContent = view === 'overview' ? 'Recent listings' : labels[view];
  elements.filterRow.hidden = view !== 'listings';
  if (view !== 'listings') currentFilter = 'all';
  document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.toggle('selected', chip.dataset.filter === currentFilter));
  render();
  document.querySelector('#sidebar').classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
document.querySelector('#add-listing').addEventListener('click', openModal);
document.querySelector('#add-listing-top').addEventListener('click', openModal);
document.querySelector('#empty-add').addEventListener('click', openModal);
document.querySelector('#close-modal').addEventListener('click', closeModal);
document.querySelector('#view-all').addEventListener('click', () => setView('listings'));
document.querySelector('#save-draft').addEventListener('click', () => createListing('draft'));
elements.form.addEventListener('submit', event => { event.preventDefault(); createListing('active'); });
elements.search.addEventListener('input', render);
elements.sort.addEventListener('change', render);
document.querySelector('#filter-button').addEventListener('click', () => { elements.filterRow.hidden = !elements.filterRow.hidden; });
document.querySelectorAll('.filter-chip').forEach(chip => chip.addEventListener('click', () => {
  currentFilter = chip.dataset.filter;
  document.querySelectorAll('.filter-chip').forEach(option => option.classList.toggle('selected', option === chip));
  render();
}));
elements.rows.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const item = listings.find(listing => listing.id === button.dataset.id);
  if (!item) return;
  const action = button.dataset.action;
  item.status = action === 'activate' ? 'active' : action === 'sold' ? 'sold' : 'active';
  persist();
  render();
  showToast(action === 'sold' ? 'Marked as sold. Nice one!' : action === 'relist' ? 'Moved back to active listings.' : 'Listing is now active.');
});
document.querySelector('#mobile-menu').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));
elements.backdrop.addEventListener('click', event => { if (event.target === elements.backdrop) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !elements.backdrop.hidden) closeModal(); });
render();
