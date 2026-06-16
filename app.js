// App State Management
let state = {
  cart: JSON.parse(localStorage.getItem('neo_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('neo_wishlist')) || [],
  compareList: JSON.parse(localStorage.getItem('neo_compare')) || [],
  currentView: 'home',
  activeProductId: null,
  activeProductConfig: {},
  theme: localStorage.getItem('neo_theme') || 'dark',
  promoApplied: localStorage.getItem('neo_promo') === 'true',
  filters: {
    search: '',
    category: 'all',
    minPrice: 0,
    maxPrice: 3000,
    sortBy: 'featured'
  },
  checkoutStep: 1,
  checkoutDetails: {}
};
// Target elements
const viewContainer = document.getElementById('app-view-container');
const desktopSearch = document.getElementById('desktop-search');
const mobileSearch = document.getElementById('mobile-search');
const searchAutocomplete = document.getElementById('search-autocomplete');
const wishlistBadge = document.getElementById('wishlist-badge');
const cartBadge = document.getElementById('cart-badge');
const compareBarFloat = document.getElementById('compare-bar-float');
const compareCountBadge = document.getElementById('compare-count-badge');
const globalModal = document.getElementById('global-modal');
const globalModalContent = document.getElementById('global-modal-content');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  updateBadges();
  setupSearch();
  setupCountdownTimer();

  // Set initial navigation route or fallback
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  const idParam = urlParams.get('id');

  if (viewParam && ['home', 'shop', 'detail', 'compare', 'checkout'].includes(viewParam)) {
    if (viewParam === 'detail' && idParam) {
      navigateDetail(idParam);
    } else {
      navigate(viewParam);
    }
  } else {
    navigate('home');
  }
});

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `flex items-center gap-3 p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto max-w-sm glass-panel backdrop-blur-md`;

  let icon = '<i class="fa-solid fa-circle-check text-emerald-500"></i>';
  let borderColor = 'border-emerald-500/30';
  if (type === 'error') {
    icon = '<i class="fa-solid fa-circle-exclamation text-rose-500"></i>';
    borderColor = 'border-rose-500/30';
  } else if (type === 'info') {
    icon = '<i class="fa-solid fa-circle-info text-brand-500"></i>';
    borderColor = 'border-brand-500/30';
  }

  toast.classList.add(borderColor);
  toast.innerHTML = `
    <div class="text-sm font-semibold">${icon}</div>
    <div class="text-xs text-slate-300 dark:text-slate-300 light:text-slate-800 font-medium">${message}</div>
    <button class="ml-auto text-slate-500 hover:text-slate-200 text-xs" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
  `;

  container.appendChild(toast);
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 50);

  // Auto dismiss after 3 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-10px]');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Navigation Engine
function navigate(viewName) {
  state.currentView = viewName;

  // Close drawers and mobile nav
  toggleCartDrawer(false);
  toggleWishlistDrawer(false);
  document.getElementById('mobile-nav-panel').classList.add('hidden');

  // Update nav link active classes
  const navs = ['home', 'shop', 'compare'];
  navs.forEach(nav => {
    const el = document.getElementById(`nav-${nav}`);
    if (el) {
      if (nav === viewName) {
        el.classList.add('text-brand-400');
        el.classList.remove('text-slate-400', 'dark:text-slate-400', 'light:text-slate-600');
      } else {
        el.classList.remove('text-brand-400');
        el.classList.add('text-slate-400', 'dark:text-slate-400', 'light:text-slate-600');
      }
    }
  });

  // Update browser URL query parameter without full reload
  const newUrl = `${window.location.pathname}?view=${viewName}`;
  window.history.pushState({ path: newUrl }, '', newUrl);

  renderView();
}

function navigateDetail(productId) {
  state.currentView = 'detail';
  state.activeProductId = productId;

  // Fetch product and initialize default configurations
  const product = products.find(p => p.id === productId);
  if (product) {
    state.activeProductConfig = {};
    if (product.configurations) {
      Object.keys(product.configurations).forEach(key => {
        state.activeProductConfig[key] = product.configurations[key][0]; // default to first option
      });
    }
  }

  const newUrl = `${window.location.pathname}?view=detail&id=${productId}`;
  window.history.pushState({ path: newUrl }, '', newUrl);

  renderView();
}

function renderView() {
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Switch visual loader on
  viewContainer.innerHTML = `
    <div class="h-96 flex items-center justify-center flex-col gap-4">
      <div class="loader ease-linear rounded-full border-4 border-t-4 border-slate-700 h-12 w-12"></div>
      <p class="text-slate-500 text-sm tracking-wide uppercase">Configuring Core Matrix...</p>
    </div>
  `;

  // Render view after a micro simulated loading lag for luxury aesthetics
  setTimeout(() => {
    switch (state.currentView) {
      case 'home':
        renderHome();
        break;
      case 'shop':
        renderShop();
        break;
      case 'detail':
        renderDetail();
        break;
      case 'compare':
        renderCompare();
        break;
      case 'checkout':
        renderCheckout();
        break;
      default:
        renderHome();
    }
    updateCompareBar();
  }, 250);
}

// ----------------------------------------------------
// THEME & CORE UTILITIES
// ----------------------------------------------------

function applyTheme(theme) {
  const html = document.documentElement;

  if (theme === 'dark') {
    html.className = 'dark';
    document.body.className = "bg-darkbg text-slate-200 min-h-screen flex flex-col transition-colors duration-300";
    if (icon) icon.className = 'fa-solid fa-moon';
  } else {
    html.className = 'light';
    document.body.className = "bg-lightbg text-slate-800 min-h-screen flex flex-col transition-colors duration-300";
    if (icon) icon.className = 'fa-solid fa-sun text-amber-500';
  }
}

// Setup static search triggers
function setupSearch() {
  const handleSearchInput = (e) => {
    const val = e.target.value;
    state.filters.search = val;

    if (val.trim().length > 1) {
      renderAutocomplete(val);
    } else {
      searchAutocomplete.classList.add('hidden');
    }
  };

  desktopSearch.addEventListener('input', handleSearchInput);
  mobileSearch.addEventListener('input', handleSearchInput);

  desktopSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchAutocomplete.classList.add('hidden');
      state.filters.category = 'all';
      navigate('shop');
    }
  });

  mobileSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchAutocomplete.classList.add('hidden');
      state.filters.category = 'all';
      navigate('shop');
    }
  });

  // Hide autocomplete when clicking outside
  document.addEventListener('click', (e) => {
    if (!desktopSearch.contains(e.target) && !searchAutocomplete.contains(e.target)) {
      searchAutocomplete.classList.add('hidden');
    }
  });
}

function renderAutocomplete(query) {
  const matching = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.brand.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  if (matching.length === 0) {
    searchAutocomplete.innerHTML = `
      <div class="p-4 text-xs text-slate-500 text-center">No laptops match your query</div>
    `;
  } else {
    searchAutocomplete.innerHTML = matching.map(p => `
      <div onclick="navigateDetail('${p.id}'); searchAutocomplete.classList.add('hidden');" 
        class="p-3 border-b border-white/5 dark:border-white/5 light:border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-50 transition-colors">
        <img src="${p.image}" class="w-8 h-8 rounded object-cover">
        <div class="flex-grow min-w-0">
          <div class="text-xs font-bold truncate text-slate-100 dark:text-slate-100 light:text-slate-800">${p.name}</div>
          <div class="text-[10px] text-slate-500">${p.brand} &bull; $${p.price.toLocaleString()}</div>
        </div>
        <i class="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
      </div>
    `).join('');
  }
  searchAutocomplete.classList.remove('hidden');
}

function toggleMobileNav() {
  const el = document.getElementById('mobile-nav-panel');
  el.classList.toggle('hidden');
}

function setupCountdownTimer() {
  // 2 Hour mock promotional deal countdown timer
  let hours = 2, minutes = 14, seconds = 55;

  setInterval(() => {
    seconds--;
    if (seconds < 0) {
      seconds = 59;
      minutes--;
      if (minutes < 0) {
        minutes = 59;
        hours--;
        if (hours < 0) {
          hours = 2; // Loop for mock simulation
        }
      }
    }

    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    const containers = document.querySelectorAll('.countdown-timer');
    containers.forEach(el => {
      el.innerHTML = `
        <span class="bg-black/50 dark:bg-black/50 light:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-white/5 font-mono text-xs font-bold text-accent-pink">${hStr}h</span>
        <span class="text-xs font-bold animate-pulse">:</span>
        <span class="bg-black/50 dark:bg-black/50 light:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-white/5 font-mono text-xs font-bold text-accent-pink">${mStr}m</span>
        <span class="text-xs font-bold animate-pulse">:</span>
        <span class="bg-black/50 dark:bg-black/50 light:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-white/5 font-mono text-xs font-bold text-accent-pink">${sStr}s</span>
      `;
    });
  }, 1000);
}

// ----------------------------------------------------
// VIEW RENDERING: HOME VIEW
// ----------------------------------------------------
function renderHome() {
  // Find a couple of featured laptops for the slider/grid
  const featured = products.filter(p => p.featured);

  viewContainer.innerHTML = `
    <!-- Hero Section -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-8 lg:py-16 relative overflow-hidden">
      <div class="lg:col-span-7 space-y-6 z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-xs font-semibold text-brand-400">
          <i class="fa-solid fa-bolt text-accent-cyan"></i>
          <span>Welcome to Next-Gen Computing</span>
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight font-display text-white dark:text-white light:text-slate-900">
          Build Your Ultimate <br/>
          <span class="bg-gradient-to-r from-brand-400 via-accent-pink to-accent-cyan bg-clip-text text-transparent">Laptop Matrix</span>
        </h1>
        <p class="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-lg leading-relaxed">
          Premium performance configurations engineered to order. Toggle components, test performance side-by-side, and claim discount codes instantly.
        </p>
        <div class="flex flex-wrap gap-4 pt-2">
          <button onclick="state.filters.category='all'; navigate('shop')" class="px-7 py-3.5 bg-gradient-to-r from-brand-600 to-accent-pink hover:opacity-95 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-glow-purple transition-all">
            <span>Explore Catalog</span>
            <i class="fa-solid fa-store"></i>
          </button>
          <button onclick="navigateDetail('aeroblade-pro-16')" class="px-7 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 dark:bg-slate-900/80 light:bg-slate-200 light:text-slate-800 light:hover:bg-slate-300 text-sm font-semibold rounded-xl border border-white/5 transition-all">
            <span>Customize AeroBlade 16</span>
          </button>
        </div>
      </div>
      <div class="lg:col-span-5 flex justify-center items-center z-10 relative">
        <div class="absolute w-72 h-72 rounded-full bg-brand-500/10 blur-[80px] -z-10 pointer-events-none"></div>
        <img src="assets/images/aeroblade.png" alt="AeroBlade Pro 16" 
          class="w-full max-w-md drop-shadow-[0_20px_50px_rgba(139,92,246,0.35)] animate-float cursor-pointer" onclick="navigateDetail('aeroblade-pro-16')" title="Click to build this laptop!">
      </div>
    </section>

    <!-- Categories Filters -->
    <section class="py-12 border-t border-white/5 dark:border-white/5 light:border-slate-200">
      <div class="text-center max-w-xl mx-auto mb-10">
        <h2 class="text-2xl font-bold text-white dark:text-white light:text-slate-900">Search by Hardware Category</h2>
        <p class="text-slate-500 text-xs mt-2">Find a customized system optimized for your direct workspace workflows.</p>
      </div>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        ${renderCategoryButton('gaming', 'fa-gamepad', 'Gaming Systems', 'aeroblade-pro-16')}
        ${renderCategoryButton('ultrabook', 'fa-feather', 'Ultra Slims', 'zenbook-horizon-14')}
        ${renderCategoryButton('workstation', 'fa-microchip', 'Workstations', 'quantum-x1-workstation')}
        ${renderCategoryButton('student', 'fa-graduation-cap', 'Student Laptops', 'nova-lite-14')}
        ${renderCategoryButton('creator', 'fa-camera-retro', 'Pro Creators', 'apex-studio-15')}
        ${renderCategoryButton('rugged', 'fa-shield-halved', 'Rugged Tactical', 'titan-rugged-15')}
      </div>
    </section>

    <!-- Promoted Deal Section -->
    <section class="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-brand-950/80 to-slate-950/80 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 mb-16 shadow-2xl relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.1),transparent_50%)]"></div>
      <div class="space-y-4 max-w-lg z-10">
        <div class="flex items-center gap-3">
          <span class="bg-accent-pink/20 border border-accent-pink/30 text-accent-pink text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded">Flash Promo Deal</span>
          <div class="countdown-timer flex items-center gap-1"></div>
        </div>
        <h3 class="text-2xl font-bold text-white">Save 10% on Custom Laptops</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Customize any model and enter the code <strong class="text-brand-400">NEO10</strong> in the cart. Get instant cash reductions, free premium laptop sleeve, and free global cargo express shipping.</p>
      </div>
      <div class="flex flex-col items-center justify-center bg-white/5 border border-white/10 p-6 rounded-2xl min-w-[200px] z-10 backdrop-blur">
        <div class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Copy Coupon Code</div>
        <div class="text-lg font-mono font-bold text-white py-2 select-all cursor-pointer hover:text-brand-400 flex items-center gap-2" onclick="navigator.clipboard.writeText('NEO10'); showToast('Coupon copied to clipboard!');">
          <span>NEO10</span><i class="fa-regular fa-copy text-xs"></i>
        </div>
        <button onclick="state.filters.category='all'; navigate('shop')" class="w-full mt-2 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-xs font-semibold text-white transition-colors">Configure Now</button>
      </div>
    </section>

    <!-- Featured Products Row -->
    <section class="py-12 border-t border-white/5 dark:border-white/5 light:border-slate-200">
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-2xl font-bold text-white dark:text-white light:text-slate-900">Highly Acclaimed Models</h2>
          <p class="text-slate-500 text-xs mt-1">Our best-selling rigs configured with the most requested component loadouts.</p>
        </div>
        <a href="#" onclick="state.filters.category='all'; navigate('shop'); return false;" class="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1.5">
          <span>View Catalog</span><i class="fa-solid fa-arrow-right-long"></i>
        </a>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${featured.map(laptop => renderProductCard(laptop)).join('')}
      </div>
    </section>
  `;
}

function renderCategoryButton(catId, icon, label, defaultId) {
  return `
    <div onclick="state.filters.category='${catId}'; navigate('shop')" 
      class="p-5 glass-card rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-500/40 select-none group">
      <div class="w-12 h-12 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-400 group-hover:bg-brand-500/10 border border-white/5 dark:border-white/5 light:border-slate-200 transition-all mb-4 text-lg">
        <i class="fa-solid ${icon}"></i>
      </div>
      <span class="text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 group-hover:text-white">${label}</span>
      <span class="text-[9px] text-slate-500 mt-1 hover:underline">Build Matrix <i class="fa-solid fa-angle-right text-[7px]"></i></span>
    </div>
  `;
}

// ----------------------------------------------------
// VIEW RENDERING: SHOP CATALOG VIEW
// ----------------------------------------------------
function renderShop() {
  const filtered = filterProducts();

  viewContainer.innerHTML = `
    <div class="flex flex-col lg:flex-row gap-8 py-4">
      
      <!-- Collapsible Sidebar Filters -->
      <aside class="w-full lg:w-64 flex-shrink-0 glass-panel border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl p-6 h-fit space-y-6">
        <div>
          <h3 class="text-sm font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider mb-4">Categories</h3>
          <div class="space-y-1.5">
            ${renderFilterCategoryItem('all', 'All Systems')}
            ${renderFilterCategoryItem('gaming', 'Gaming')}
            ${renderFilterCategoryItem('ultrabook', 'Ultra Slim')}
            ${renderFilterCategoryItem('workstation', 'Workstations')}
            ${renderFilterCategoryItem('student', 'Student')}
            ${renderFilterCategoryItem('creator', 'Creators')}
            ${renderFilterCategoryItem('rugged', 'Rugged')}
          </div>
        </div>

        <div class="border-t border-white/5 dark:border-white/5 light:border-slate-200 pt-4">
          <h3 class="text-sm font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider mb-4">Max Budget</h3>
          <div class="space-y-2">
            <input type="range" id="price-slider" min="500" max="3000" step="100" value="${state.filters.maxPrice}" 
              class="w-full accent-brand-500 bg-slate-800" oninput="updatePriceSlider(this.value)">
            <div class="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>$500</span>
              <span class="text-brand-400 font-bold font-sans">Max: $${state.filters.maxPrice.toLocaleString()}</span>
              <span>$3,000</span>
            </div>
          </div>
        </div>

        <div class="border-t border-white/5 dark:border-white/5 light:border-slate-200 pt-4">
          <h3 class="text-sm font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider mb-4">Sort By</h3>
          <select id="sort-select" onchange="state.filters.sortBy = this.value; renderShop();" 
            class="w-full text-xs bg-slate-900 border border-white/5 dark:bg-slate-900 dark:border-white/5 light:bg-slate-100 light:border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500 text-slate-300 dark:text-slate-300 light:text-slate-800">
            <option value="featured" ${state.filters.sortBy === 'featured' ? 'selected' : ''}>Featured Loadout</option>
            <option value="price-asc" ${state.filters.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
            <option value="price-desc" ${state.filters.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
            <option value="rating" ${state.filters.sortBy === 'rating' ? 'selected' : ''}>Customer Rating</option>
          </select>
        </div>
        
        <button onclick="resetFilters()" class="w-full py-2.5 border border-dashed border-white/10 hover:border-brand-500/40 hover:text-brand-400 text-xs font-semibold rounded-lg text-slate-400 transition-all">
          Reset All Filters
        </button>
      </aside>

      <!-- Shop Products Grid -->
      <div class="flex-grow space-y-6">
        <!-- Top Toolbar info -->
        <div class="flex justify-between items-center bg-white/5 dark:bg-white/5 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 rounded-2xl px-6 py-4">
          <div class="text-xs text-slate-400">
            Showing <span class="font-bold text-slate-200 dark:text-slate-200 light:text-slate-800">${filtered.length}</span> laptops matching filters
          </div>
          <div class="flex gap-2">
            <!-- Grid option layouts mock toggles -->
            <button class="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center text-xs">
              <i class="fa-solid fa-grip-vertical"></i>
            </button>
          </div>
        </div>

        <!-- Laptop Cards Grid -->
        ${filtered.length === 0 ? `
          <div class="glass-panel border border-white/5 rounded-2xl p-16 text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 mx-auto text-xl"><i class="fa-solid fa-laptop-slash"></i></div>
            <h3 class="text-lg font-bold text-white">No Laptops Found</h3>
            <p class="text-slate-500 text-xs max-w-sm mx-auto">Try resetting price constraints, adjusting search filters, or exploring another product category.</p>
            <button onclick="resetFilters()" class="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-xs transition-colors">Clear Filter Set</button>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            ${filtered.map(laptop => renderProductCard(laptop)).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderFilterCategoryItem(catId, label) {
  const isActive = state.filters.category === catId;
  return `
    <button onclick="state.filters.category='${catId}'; renderShop();" 
      class="w-full text-left text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${isActive
      ? 'bg-brand-500 text-white shadow-glow-purple'
      : 'text-slate-400 hover:bg-white/5 dark:text-slate-400 dark:hover:bg-white/5 light:text-slate-600 light:hover:bg-slate-100'
    }">
      <span>${label}</span>
      <span class="text-[10px] opacity-65">${products.filter(p => catId === 'all' || p.category === catId).length}</span>
    </button>
  `;
}

function updatePriceSlider(val) {
  state.filters.maxPrice = parseInt(val);
  const el = document.getElementById('price-slider');
  // Dynamic update range text on slide to avoid full rendering lag
  const badge = el.nextElementSibling.querySelector('.text-brand-400');
  if (badge) badge.innerText = `Max: $${state.filters.maxPrice.toLocaleString()}`;

  // Debounce actual grid reload slightly
  if (window.priceDebounce) clearTimeout(window.priceDebounce);
  window.priceDebounce = setTimeout(() => {
    renderShop();
  }, 150);
}

function resetFilters() {
  state.filters.search = '';
  state.filters.category = 'all';
  state.filters.maxPrice = 3000;
  state.filters.sortBy = 'featured';
  desktopSearch.value = '';
  mobileSearch.value = '';
  renderShop();
  showToast("Filters reset to default defaults", "info");
}

function filterProducts() {
  return products.filter(p => {
    // Search
    const searchMatch = p.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
      p.brand.toLowerCase().includes(state.filters.search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(state.filters.search.toLowerCase());

    // Category
    const categoryMatch = state.filters.category === 'all' || p.category === state.filters.category;

    // Price
    const priceMatch = p.price <= state.filters.maxPrice;

    return searchMatch && categoryMatch && priceMatch;
  }).sort((a, b) => {
    // Sorting
    if (state.filters.sortBy === 'price-asc') return a.price - b.price;
    if (state.filters.sortBy === 'price-desc') return b.price - a.price;
    if (state.filters.sortBy === 'rating') return b.rating - a.rating;
    return 0; // Default Featured sorting (follows initial array index)
  });
}

// ----------------------------------------------------
// PRODUCT CARD COMPONENT
// ----------------------------------------------------
function renderProductCard(laptop) {
  const isInWishlist = state.wishlist.includes(laptop.id);
  const isInCompare = state.compareList.some(item => item.id === laptop.id);

  return `
    <article class="glass-card rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden relative group">
      <!-- Badge Category -->
      <span class="absolute top-4 left-4 bg-slate-900/80 border border-white/5 text-slate-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full z-10">
        ${laptop.category}
      </span>

      <!-- Action wishlist button -->
      <button onclick="toggleWishlist('${laptop.id}'); event.stopPropagation();" 
        class="absolute top-3.5 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-slate-900/80 border border-white/5 text-slate-400 hover:text-accent-pink transition-all z-10" 
        title="Save to Wishlist">
        <i class="${isInWishlist ? 'fa-solid fa-heart text-accent-pink' : 'fa-regular fa-heart'}"></i>
      </button>

      <!-- Laptop Preview Image -->
      <div class="h-44 w-full bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center p-6 overflow-hidden cursor-pointer" onclick="navigateDetail('${laptop.id}')">
        <img src="${laptop.image}" alt="${laptop.name}" 
          class="h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
      </div>

      <!-- Content -->
      <div class="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div class="space-y-1">
          <!-- Brand and Rating -->
          <div class="flex justify-between items-center text-[10px] text-slate-500">
            <span class="font-bold tracking-wider uppercase text-brand-400">${laptop.brand}</span>
            <span class="flex items-center gap-1 font-semibold">
              <i class="fa-solid fa-star text-amber-500"></i> ${laptop.rating} (${laptop.reviewsCount})
            </span>
          </div>
          <h3 onclick="navigateDetail('${laptop.id}')" 
            class="text-base font-bold text-white hover:text-brand-400 transition-colors cursor-pointer truncate dark:text-white light:text-slate-900">
            ${laptop.name}
          </h3>
          <p class="text-xs text-slate-400 line-clamp-2 dark:text-slate-400 light:text-slate-500">${laptop.tagline}</p>
        </div>

        <!-- Specs highlights bar -->
        <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-500 light:text-slate-600 bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
          <div class="truncate"><i class="fa-solid fa-microchip mr-1.5 text-accent-cyan"></i>${laptop.specs.cpu.split('(')[0]}</div>
          <div class="truncate"><i class="fa-solid fa-memory mr-1.5 text-accent-indigo"></i>${laptop.specs.ram.split(' ')[0]}</div>
        </div>

        <!-- Footer Card details (price & build trigger) -->
        <div class="flex justify-between items-center pt-2">
          <div>
            <div class="text-[9px] uppercase font-semibold text-slate-500">Starting price</div>
            <div class="text-lg font-black font-display text-white dark:text-white light:text-slate-900">$${laptop.price.toLocaleString()}</div>
          </div>
          
          <div class="flex gap-2">
            <!-- Compare action -->
            <button onclick="toggleCompare('${laptop.id}'); event.stopPropagation();" 
              class="w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isInCompare
      ? 'bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan'
      : 'border-white/5 hover:border-slate-600 text-slate-400'
    }" 
              title="Add to spec comparison">
              <i class="fa-solid fa-code-compare text-xs"></i>
            </button>

            <!-- Build Customizer -->
            <button onclick="navigateDetail('${laptop.id}')" 
              class="px-3.5 h-10 bg-brand-600 hover:bg-brand-700 hover:shadow-glow-purple text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all">
              <span>Build</span>
              <i class="fa-solid fa-sliders"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// ----------------------------------------------------
// VIEW RENDERING: PRODUCT DETAIL CONFIGURATOR VIEW
// ----------------------------------------------------
function renderDetail() {
  const laptop = products.find(p => p.id === state.activeProductId);
  if (!laptop) {
    navigate('shop');
    return;
  }

  // Calculate pricing based on current selected specifications
  let finalPrice = laptop.price;
  const activeConfigValues = [];

  if (laptop.configurations) {
    Object.keys(laptop.configurations).forEach(key => {
      const selectedOption = state.activeProductConfig[key];
      if (selectedOption) {
        finalPrice += selectedOption.price;
        activeConfigValues.push(`${key.toUpperCase()}: ${selectedOption.name}`);
      }
    });
  }

  const hasConfig = laptop.configurations && Object.keys(laptop.configurations).length > 0;

  viewContainer.innerHTML = `
    <!-- Back to catalog breadcrumb -->
    <div class="mb-6">
      <button onclick="navigate('shop')" class="text-xs font-semibold text-slate-500 hover:text-slate-300 flex items-center gap-1.5">
        <i class="fa-solid fa-arrow-left-long"></i>
        <span>Back to Product Catalog</span>
      </button>
    </div>

    <!-- Product Grid detail page -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      <!-- Left Column: Specs gallery & summary -->
      <div class="lg:col-span-5 space-y-6">
        <div class="glass-panel border border-white/5 rounded-2xl p-8 flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden h-96">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)]"></div>
          <img id="detail-main-image" src="${laptop.image}" alt="${laptop.name}" 
            class="h-72 object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)] animate-float">
        </div>
        
        <!-- Hardware core specifications summary list -->
        <div class="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 class="text-xs font-extrabold uppercase tracking-widest text-slate-400">Standard Specifications</h3>
          <div class="space-y-3 text-xs">
            ${renderSpecDetailRow('Processor', laptop.specs.cpu, 'fa-microchip')}
            ${renderSpecDetailRow('Memory', laptop.specs.ram, 'fa-memory')}
            ${renderSpecDetailRow('Solid State Storage', laptop.specs.ssd, 'fa-database')}
            ${renderSpecDetailRow('Video Controller', laptop.specs.gpu, 'fa-tv')}
            ${renderSpecDetailRow('Display Matrix', laptop.specs.screen, 'fa-desktop')}
            ${renderSpecDetailRow('Battery Core', laptop.specs.battery, 'fa-battery-full')}
            ${renderSpecDetailRow('Device Weight', laptop.specs.weight, 'fa-weight-hanging')}
          </div>
        </div>
      </div>

      <!-- Right Column: Info & Configurator -->
      <div class="lg:col-span-7 space-y-6">
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-brand-400 uppercase tracking-widest">${laptop.brand} System</span>
            <span class="flex items-center gap-1.5 text-xs font-semibold bg-slate-900/60 border border-white/5 px-2.5 py-1 rounded-full">
              <i class="fa-solid fa-star text-amber-500"></i> ${laptop.rating} (${laptop.reviewsCount} customer reviews)
            </span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white dark:text-white light:text-slate-900">${laptop.name}</h2>
          <p class="text-sm text-slate-400 leading-relaxed dark:text-slate-400 light:text-slate-600">${laptop.description}</p>
        </div>

        <!-- Interactive Spec Configurator Options -->
        ${hasConfig ? `
          <div class="border-t border-b border-white/5 dark:border-white/5 light:border-slate-200 py-6 space-y-6">
            <h3 class="text-xs font-extrabold uppercase tracking-widest text-slate-300 dark:text-slate-300 light:text-slate-700">Customize Components</h3>
            <div class="space-y-6">
              ${Object.keys(laptop.configurations).map(key => renderConfigGroup(key, laptop.configurations[key])).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Pricing layout and cart actions -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-slate-950/40 p-6 rounded-2xl border border-white/5">
          <div>
            <div class="text-[10px] uppercase font-bold text-slate-500">Calculated custom build price</div>
            <div class="flex items-baseline gap-2">
              <span id="detail-price-tag" class="text-3xl font-black font-display text-white transition-all duration-300">$${finalPrice.toLocaleString()}</span>
              ${hasConfig ? `<span class="text-[10px] text-slate-500 font-medium">(base config: $${laptop.price.toLocaleString()})</span>` : ''}
            </div>
          </div>
          
          <div class="flex gap-3 w-full sm:w-auto">
            <button onclick="toggleWishlist('${laptop.id}'); renderDetail();" 
              class="w-12 h-12 rounded-xl border border-white/5 hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-accent-pink transition-all">
              <i class="${state.wishlist.includes(laptop.id) ? 'fa-solid fa-heart text-accent-pink' : 'fa-regular fa-heart'}"></i>
            </button>
            <button onclick="addActiveToCart('${laptop.id}', ${finalPrice})" 
              class="flex-grow sm:flex-grow-0 px-8 py-3.5 bg-gradient-to-r from-brand-600 to-accent-pink hover:opacity-95 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-glow-purple transition-all">
              <span>Add Custom Build to Cart</span>
              <i class="fa-solid fa-cart-arrow-down"></i>
            </button>
          </div>
        </div>

        <!-- Customer Review Section -->
        <div class="glass-panel border border-white/5 rounded-2xl p-6 space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-slate-300 dark:text-slate-300 light:text-slate-700">Customer Testimonials</h3>
            <button onclick="openReviewModal('${laptop.id}')" class="text-xs font-semibold text-brand-400 hover:underline"><i class="fa-solid fa-pen-nib mr-1.5"></i>Write Review</button>
          </div>
          
          <div class="space-y-4">
            ${laptop.reviews.map(rev => `
              <div class="border-b border-white/5 dark:border-white/5 light:border-slate-100 pb-4 last:border-b-0 last:pb-0 space-y-1.5">
                <div class="flex justify-between text-xs">
                  <span class="font-bold text-slate-300 dark:text-slate-300 light:text-slate-800">${rev.author}</span>
                  <span class="text-slate-500 font-mono">${rev.date}</span>
                </div>
                <div class="flex text-[9px] text-amber-500">
                  ${Array(5).fill().map((_, i) => `<i class="${i < rev.rating ? 'fa-solid fa-star' : 'fa-regular fa-star'}"></i>`).join('')}
                </div>
                <p class="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 italic">"${rev.comment}"</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSpecDetailRow(label, value, icon) {
  return `
    <div class="flex items-start justify-between py-2 border-b border-white/5 dark:border-white/5 light:border-slate-100 last:border-0 last:pb-0">
      <span class="text-slate-500 font-medium flex items-center gap-2">
        <i class="fa-solid ${icon} text-slate-600 w-4"></i>${label}
      </span>
      <span class="text-slate-300 dark:text-slate-300 light:text-slate-700 text-right max-w-[240px] font-medium">${value}</span>
    </div>
  `;
}

function renderConfigGroup(key, options) {
  const selected = state.activeProductConfig[key];
  const optionTitle = key.toUpperCase();

  return `
    <div class="space-y-2">
      <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${optionTitle} options</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${options.map(opt => {
    const isSelected = selected && selected.name === opt.name;
    const priceLabel = opt.price === 0 ? "Included" : `+$${opt.price}`;

    return `
            <div onclick="updateConfigOption('${key}', '${opt.name}')" 
              class="p-3.5 rounded-xl cursor-pointer border select-none transition-all flex flex-col justify-between ${isSelected
        ? 'bg-brand-500/10 border-brand-500 text-white shadow-glow-purple'
        : 'bg-slate-900/40 border-white/5 dark:border-white/5 light:bg-white light:border-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-700 hover:border-slate-500'
      }">
              <span class="text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300 dark:text-slate-300 light:text-slate-800'}">${opt.name}</span>
              <span class="text-[10px] mt-1.5 font-bold ${isSelected ? 'text-brand-400' : 'text-slate-500'}">${priceLabel}</span>
            </div>
          `;
  }).join('')}
      </div>
    </div>
  `;
}

function updateConfigOption(key, optionName) {
  const laptop = products.find(p => p.id === state.activeProductId);
  const options = laptop.configurations[key];
  const optionObj = options.find(o => o.name === optionName);

  state.activeProductConfig[key] = optionObj;

  // Re-render Detail View
  renderDetail();

  // Trigger brief pulse animation on price tag to show user it calculated
  const priceTag = document.getElementById('detail-price-tag');
  if (priceTag) {
    priceTag.classList.add('scale-105', 'text-brand-400');
    setTimeout(() => {
      priceTag.classList.remove('scale-105', 'text-brand-400');
    }, 150);
  }
}

function addActiveToCart(productId, finalPrice) {
  const laptop = products.find(p => p.id === productId);
  const itemConfig = { ...state.activeProductConfig };

  // Build clean cart ID based on custom hardware hashing
  let hashStr = productId;
  Object.keys(itemConfig).forEach(k => {
    hashStr += `-${itemConfig[k].name}`;
  });

  // Check if identical loadout exists in cart
  const cartIdx = state.cart.findIndex(c => c.id === hashStr);
  if (cartIdx > -1) {
    state.cart[cartIdx].quantity++;
  } else {
    state.cart.push({
      id: hashStr,
      productId: productId,
      name: laptop.name,
      image: laptop.image,
      config: itemConfig,
      basePrice: laptop.price,
      totalPrice: finalPrice,
      quantity: 1
    });
  }

  localStorage.setItem('neo_cart', JSON.stringify(state.cart));
  updateBadges();
  showToast(`Added customized ${laptop.name} to your cart`, "success");
  toggleCartDrawer(true);
}

// ----------------------------------------------------
// CART & WISHLIST DRAWER ACTIONS
// ----------------------------------------------------
function toggleCartDrawer(open) {
  const overlay = document.getElementById('cart-drawer-overlay');
  const panel = document.getElementById('cart-drawer-panel');

  if (open) {
    overlay.classList.remove('pointer-events-none', 'opacity-0');
    overlay.classList.add('opacity-100');
    panel.classList.remove('translate-x-full');
    panel.classList.add('translate-x-0');
    renderCartItems();
  } else {
    overlay.classList.remove('opacity-100');
    overlay.classList.add('pointer-events-none', 'opacity-0');
    panel.classList.remove('translate-x-0');
    panel.classList.add('translate-x-full');
  }
}

function renderCartItems() {
  const container = document.getElementById('cart-drawer-items');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const discountRow = document.getElementById('cart-discount-row');
  const discountEl = document.getElementById('cart-discount');
  const promoAppliedTag = document.getElementById('promo-applied-tag');

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
        <div class="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500"><i class="fa-solid fa-basket-shopping"></i></div>
        <div class="text-sm font-bold text-slate-300">Your Cart is Empty</div>
        <p class="text-xs text-slate-500 max-w-[200px]">Head over to the Catalog to configure your custom systems.</p>
        <button onclick="toggleCartDrawer(false); navigate('shop');" class="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors">Go Shop Catalog</button>
      </div>
    `;
    subtotalEl.innerText = "$0.00";
    totalEl.innerText = "$0.00";
    discountRow.classList.add('hidden');
    return;
  }

  container.innerHTML = state.cart.map((item, idx) => {
    // Generate config readable text line
    const configTexts = Object.keys(item.config).map(k => item.config[k].name).join(', ');

    return `
      <div class="flex gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5 relative group">
        <button onclick="removeFromCart('${item.id}')" 
          class="absolute top-3 right-3 text-slate-500 hover:text-rose-500 text-xs transition-colors" 
          title="Remove from Cart">
          <i class="fa-solid fa-trash-can"></i>
        </button>
        
        <img src="${item.image}" class="w-16 h-16 object-contain self-center bg-white/5 rounded-lg p-1">
        
        <div class="flex-grow min-w-0 pr-4 space-y-1.5">
          <h4 class="text-xs font-bold text-white truncate dark:text-white light:text-slate-800">${item.name}</h4>
          <p class="text-[9px] text-slate-500 line-clamp-2 leading-relaxed">${configTexts}</p>
          
          <div class="flex justify-between items-center pt-1.5">
            <span class="text-xs font-bold text-white dark:text-white light:text-slate-800">$${(item.totalPrice * item.quantity).toLocaleString()}</span>
            
            <!-- Quantity adjust controls -->
            <div class="flex items-center border border-white/10 dark:border-white/10 light:border-slate-200 rounded-lg overflow-hidden bg-slate-900 text-slate-300">
              <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center hover:bg-white/5 text-[10px] font-bold"><i class="fa-solid fa-minus"></i></button>
              <span class="w-8 text-center text-[10px] font-bold select-none">${item.quantity}</span>
              <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center hover:bg-white/5 text-[10px] font-bold"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Subtotal and Total Math
  let subtotal = state.cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
  let discount = state.promoApplied ? subtotal * 0.1 : 0;
  let total = subtotal - discount;

  subtotalEl.innerText = `$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (state.promoApplied) {
    discountRow.classList.remove('hidden');
    discountEl.innerText = `-$${discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    promoAppliedTag.classList.remove('hidden');
  } else {
    discountRow.classList.add('hidden');
    promoAppliedTag.classList.add('hidden');
  }

  totalEl.innerText = `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateCartQty(cartId, direction) {
  const idx = state.cart.findIndex(c => c.id === cartId);
  if (idx > -1) {
    state.cart[idx].quantity += direction;
    if (state.cart[idx].quantity <= 0) {
      state.cart.splice(idx, 1);
    }
    localStorage.setItem('neo_cart', JSON.stringify(state.cart));
    updateBadges();
    renderCartItems();
  }
}

function removeFromCart(cartId) {
  state.cart = state.cart.filter(c => c.id !== cartId);
  localStorage.setItem('neo_cart', JSON.stringify(state.cart));
  updateBadges();
  renderCartItems();
  showToast("Product removed from cart", "info");
}

function applyPromoCode() {
  const code = document.getElementById('promo-code').value.trim();
  if (code.toUpperCase() === 'NEO10') {
    state.promoApplied = true;
    localStorage.setItem('neo_promo', 'true');
    renderCartItems();
    showToast("Promo applied successfully! 10% saved.", "success");
  } else {
    showToast("Invalid Promo Code entered", "error");
  }
}

function removePromoCode() {
  state.promoApplied = false;
  localStorage.removeItem('neo_promo');
  renderCartItems();
  showToast("Coupon removed", "info");
}

// Wishlist Logic
function toggleWishlistDrawer(open) {
  const overlay = document.getElementById('wishlist-drawer-overlay');
  const panel = document.getElementById('wishlist-drawer-panel');

  if (open) {
    overlay.classList.remove('pointer-events-none', 'opacity-0');
    overlay.classList.add('opacity-100');
    panel.classList.remove('translate-x-full');
    panel.classList.add('translate-x-0');
    renderWishlistItems();
  } else {
    overlay.classList.remove('opacity-100');
    overlay.classList.add('pointer-events-none', 'opacity-0');
    panel.classList.remove('translate-x-0');
    panel.classList.add('translate-x-full');
  }
}

function toggleWishlist(productId) {
  const idx = state.wishlist.indexOf(productId);
  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    showToast("Removed from wishlist", "info");
  } else {
    state.wishlist.push(productId);
    showToast("Added to wishlist", "success");
  }
  localStorage.setItem('neo_wishlist', JSON.stringify(state.wishlist));
  updateBadges();

  if (state.currentView === 'shop') renderShop();
  if (state.currentView === 'detail') renderDetail();
}

function renderWishlistItems() {
  const container = document.getElementById('wishlist-drawer-items');

  if (state.wishlist.length === 0) {
    container.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
        <div class="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500"><i class="fa-solid fa-heart"></i></div>
        <div class="text-sm font-bold text-slate-300">Your Wishlist is Empty</div>
        <p class="text-xs text-slate-500 max-w-[200px]">Save custom system setups here for quick recall later.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.wishlist.map(pId => {
    const p = products.find(prod => prod.id === pId);
    if (!p) return '';
    return `
      <div class="flex gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5 relative group">
        <button onclick="toggleWishlist('${p.id}'); renderWishlistItems();" 
          class="absolute top-3 right-3 text-slate-500 hover:text-accent-pink text-xs transition-colors" 
          title="Remove">
          <i class="fa-solid fa-heart-crack"></i>
        </button>
        
        <img src="${p.image}" class="w-16 h-16 object-contain self-center bg-white/5 rounded-lg p-1">
        
        <div class="flex-grow min-w-0 pr-4 space-y-1">
          <h4 onclick="navigateDetail('${p.id}'); toggleWishlistDrawer(false);" 
            class="text-xs font-bold text-white hover:text-brand-400 cursor-pointer truncate dark:text-white light:text-slate-800">${p.name}</h4>
          <p class="text-[9px] text-slate-400 dark:text-slate-400 light:text-slate-500 line-clamp-1">${p.tagline}</p>
          <div class="text-xs font-bold text-brand-400 pt-1">$${p.price.toLocaleString()}</div>
          <button onclick="navigateDetail('${p.id}'); toggleWishlistDrawer(false);" 
            class="mt-2 text-[10px] font-bold text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 w-fit">
            <span>Configure</span><i class="fa-solid fa-angle-right"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// COMPARISON LOGIC & VIEW RENDERING
// ----------------------------------------------------
function toggleCompare(productId) {
  const laptop = products.find(p => p.id === productId);
  const existingIdx = state.compareList.findIndex(c => c.id === productId);

  if (existingIdx > -1) {
    state.compareList.splice(existingIdx, 1);
    showToast("Removed from laptop comparison list", "info");
  } else {
    if (state.compareList.length >= 3) {
      showToast("Comparison limit reached (max 3 laptops)", "error");
      return;
    }
    state.compareList.push(laptop);
    showToast(`Added ${laptop.name} to comparison`, "success");
  }

  localStorage.setItem('neo_compare', JSON.stringify(state.compareList));
  updateCompareBar();
  if (state.currentView === 'shop') renderShop();
}

function updateCompareBar() {
  const count = state.compareList.length;
  compareCountBadge.innerText = count;

  if (count > 0 && state.currentView !== 'compare' && state.currentView !== 'checkout') {
    compareBarFloat.classList.remove('hidden', 'translate-y-12');
    compareBarFloat.classList.add('flex', 'translate-y-0');
  } else {
    compareBarFloat.classList.remove('flex', 'translate-y-0');
    compareBarFloat.classList.add('hidden', 'translate-y-12');
  }
}

function clearComparison() {
  state.compareList = [];
  localStorage.setItem('neo_compare', JSON.stringify([]));
  updateCompareBar();
  if (state.currentView === 'shop') renderShop();
  if (state.currentView === 'compare') renderCompare();
  showToast("Comparison cleared", "info");
}

function renderCompare() {
  const list = state.compareList;

  if (list.length === 0) {
    viewContainer.innerHTML = `
      <div class="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div class="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 mx-auto text-xl"><i class="fa-solid fa-code-compare"></i></div>
        <h2 class="text-2xl font-bold text-white dark:text-white light:text-slate-900">Compare Laptop Blueprints</h2>
        <p class="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">Select up to 3 customized laptops from the Catalog to check side-by-side specs, price comparisons, and configurations.</p>
        <button onclick="state.filters.category='all'; navigate('shop')" class="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-all shadow-glow-purple">
          Browse Product Catalog
        </button>
      </div>
    `;
    return;
  }

  const columns = list.length;
  // Dynamic CSS grids based on length
  const gridClass = columns === 1
    ? 'grid-cols-2'
    : columns === 2
      ? 'grid-cols-3'
      : 'grid-cols-4';

  viewContainer.innerHTML = `
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-white dark:text-white light:text-slate-900">Side-by-Side Blueprint Compare</h2>
        <p class="text-slate-500 text-xs mt-1">Comparing technical specifications of selected systems.</p>
      </div>
      <button onclick="clearComparison()" class="text-xs font-semibold border border-dashed border-white/10 hover:border-brand-500/40 text-slate-400 hover:text-brand-400 px-4 py-2 rounded-xl transition-all">Clear Compare Matrix</button>
    </div>

    <!-- Comparison Table Grid -->
    <div class="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div class="grid ${gridClass} divide-x divide-white/5 dark:divide-white/5 light:divide-slate-200">
        <!-- HEADER ROW: Images & Names -->
        <div class="p-6 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50 flex items-center justify-center font-bold text-xs uppercase tracking-wider text-slate-500">Spec Blueprint</div>
        ${list.map(p => `
          <div class="p-6 text-center space-y-4 relative group">
            <button onclick="toggleCompare('${p.id}'); renderCompare();" 
              class="absolute top-4 right-4 text-slate-500 hover:text-rose-500 transition-colors" 
              title="Remove">
              <i class="fa-solid fa-circle-xmark text-sm"></i>
            </button>
            <div class="h-28 flex items-center justify-center">
              <img src="${p.image}" class="h-full object-contain drop-shadow-lg">
            </div>
            <div>
              <h3 class="text-sm font-bold text-white dark:text-white light:text-slate-800">${p.name}</h3>
              <span class="text-[9px] uppercase font-bold text-slate-500">${p.brand}</span>
            </div>
            <button onclick="navigateDetail('${p.id}')" class="w-full py-2 bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-brand-500/20">Configure Build</button>
          </div>
        `).join('')}

        <!-- Price -->
        ${renderCompareRow(gridClass, 'Starting Price', list.map(p => `<strong class="text-white dark:text-white light:text-slate-900">$${p.price.toLocaleString()}</strong>`))}
        
        <!-- CPU -->
        ${renderCompareRow(gridClass, 'Processor', list.map(p => p.specs.cpu))}

        <!-- GPU -->
        ${renderCompareRow(gridClass, 'Graphics Card', list.map(p => p.specs.gpu))}

        <!-- RAM -->
        ${renderCompareRow(gridClass, 'Base Memory', list.map(p => p.specs.ram))}

        <!-- SSD -->
        ${renderCompareRow(gridClass, 'Base Storage', list.map(p => p.specs.ssd))}

        <!-- Screen -->
        ${renderCompareRow(gridClass, 'Display Screen', list.map(p => p.specs.screen))}

        <!-- Battery -->
        ${renderCompareRow(gridClass, 'Battery Spec', list.map(p => p.specs.battery))}

        <!-- Weight -->
        ${renderCompareRow(gridClass, 'Unit Weight', list.map(p => p.specs.weight))}
      </div>
    </div>
  `;
}

function renderCompareRow(gridClass, label, values) {
  return `
    <div class="col-span-full border-t border-white/5 dark:border-white/5 light:border-slate-200">
      <div class="grid ${gridClass} divide-x divide-white/5 dark:divide-white/5 light:divide-slate-200 compare-row transition-colors">
        <div class="p-4 text-xs font-semibold text-slate-500 flex items-center">${label}</div>
        ${values.map(val => `
          <div class="p-4 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 flex items-center">${val}</div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// VIEW RENDERING: CHECKOUT FLOW
// ----------------------------------------------------
function goToCheckout() {
  if (state.cart.length === 0) {
    showToast("Please add items to your cart to checkout", "error");
    return;
  }
  state.checkoutStep = 1;
  navigate('checkout');
}

function renderCheckout() {
  let subtotal = state.cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
  let discount = state.promoApplied ? subtotal * 0.1 : 0;
  let total = subtotal - discount;

  viewContainer.innerHTML = `
    <div class="max-w-4xl mx-auto py-4 space-y-8">
      <!-- Checkout Progress Indicator -->
      <div class="flex justify-between items-center max-w-lg mx-auto relative px-4">
        <div class="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-800 dark:bg-slate-800 light:bg-slate-200 -translate-y-1/2 z-0"></div>
        <div id="checkout-progress-bar" class="absolute top-1/2 left-0 h-[2px] bg-brand-500 -translate-y-1/2 z-0 transition-all duration-300" style="width: ${state.checkoutStep === 1 ? '15%' : state.checkoutStep === 2 ? '50%' : '100%'}"></div>
        
        ${renderProgressStep(1, 'Shipping')}
        ${renderProgressStep(2, 'Payment')}
        ${renderProgressStep(3, 'Confirmation')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Form Area (Left) -->
        <div class="lg:col-span-7 bg-white/5 dark:bg-white/5 light:bg-white border border-white/5 dark:border-white/5 light:border-slate-200 p-6 rounded-2xl space-y-6 z-10">
          ${renderCheckoutStepForm()}
        </div>

        <!-- Receipt Order Summary (Right) -->
        <div class="lg:col-span-5 glass-panel border border-white/5 rounded-2xl p-6 space-y-6 z-10">
          <h3 class="text-sm font-bold text-white dark:text-white light:text-slate-850 uppercase tracking-wider">Order Summary</h3>
          
          <div class="space-y-3 overflow-y-auto max-h-56 pr-2">
            ${state.cart.map(item => `
              <div class="flex justify-between text-xs border-b border-white/5 dark:border-b-white/5 light:border-b-slate-100 pb-2.5 last:border-0 last:pb-0">
                <div class="min-w-0 pr-4">
                  <div class="font-bold text-white dark:text-white light:text-slate-850 truncate">${item.name} <span class="text-brand-400">x${item.quantity}</span></div>
                  <div class="text-[9px] text-slate-500 truncate mt-0.5">${Object.keys(item.config).map(k => item.config[k].name).join(', ')}</div>
                </div>
                <span class="font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 font-mono flex-shrink-0">$${(item.totalPrice * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>

          <div class="border-t border-white/5 dark:border-white/5 light:border-slate-200 pt-4 space-y-2 text-xs">
            <div class="flex justify-between text-slate-400">
              <span>Items Subtotal</span>
              <span class="font-mono">$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            ${state.promoApplied ? `
              <div class="flex justify-between text-emerald-400">
                <span>Coupon Discount (10%)</span>
                <span class="font-mono">-$${discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ` : ''}
            <div class="flex justify-between text-slate-400">
              <span>Standard Logistics</span>
              <span class="text-brand-400 font-semibold uppercase">FREE</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-white dark:text-white light:text-slate-850 pt-2 border-t border-white/5 dark:border-white/5 light:border-slate-200">
              <span>Grand Total</span>
              <span class="font-mono">$${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProgressStep(stepNum, label) {
  const isDone = state.checkoutStep > stepNum;
  const isActive = state.checkoutStep === stepNum;

  return `
    <div class="flex flex-col items-center gap-1.5 z-10">
      <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs font-mono transition-all duration-300 ${isDone
      ? 'bg-brand-500 border-brand-500 text-white shadow-glow-purple'
      : isActive
        ? 'bg-slate-900 border-brand-500 text-brand-400 shadow-glow-purple'
        : 'bg-slate-950 border-slate-800 text-slate-500 dark:bg-slate-950 dark:border-slate-800 light:bg-slate-100 light:border-slate-200'
    }">
        ${isDone ? '<i class="fa-solid fa-check text-[10px]"></i>' : stepNum}
      </div>
      <span class="text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-brand-400' : 'text-slate-500'}">${label}</span>
    </div>
  `;
}

function renderCheckoutStepForm() {
  if (state.checkoutStep === 1) {
    return `
      <h3 class="text-base font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2"><i class="fa-solid fa-truck text-brand-500"></i>Shipping & Contact Particulars</h3>
      <form id="shipping-form" onsubmit="handleShippingSubmit(event)" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-bold text-slate-500">First Name</label>
            <input type="text" required id="ship-first" value="${state.checkoutDetails.first || ''}" 
              class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800">
          </div>
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-bold text-slate-500">Last Name</label>
            <input type="text" required id="ship-last" value="${state.checkoutDetails.last || ''}" 
              class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800">
          </div>
        </div>
        
        <div class="space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-500">Delivery Address</label>
          <input type="text" required id="ship-address" value="${state.checkoutDetails.address || ''}" 
            class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800">
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-bold text-slate-500">City</label>
            <input type="text" required id="ship-city" value="${state.checkoutDetails.city || ''}" 
              class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800">
          </div>
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-bold text-slate-500">Zip / Postal Code</label>
            <input type="text" required id="ship-zip" value="${state.checkoutDetails.zip || ''}" 
              class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800">
          </div>
          <div class="space-y-1 col-span-2 sm:col-span-1">
            <label class="text-[10px] uppercase font-bold text-slate-500">Country</label>
            <input type="text" required id="ship-country" value="${state.checkoutDetails.country || 'United States'}" 
              class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800">
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-500">Email for invoice updates</label>
          <input type="email" required id="ship-email" value="${state.checkoutDetails.email || ''}" 
            class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800">
        </div>

        <button type="submit" class="w-full py-3.5 mt-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-glow-purple flex items-center justify-center gap-2">
          <span>Continue to Payment Method</span><i class="fa-solid fa-arrow-right"></i>
        </button>
      </form>
    `;
  }

  if (state.checkoutStep === 2) {
    return `
      <h3 class="text-base font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2"><i class="fa-regular fa-credit-card text-brand-500"></i>Secure Payment Gateway</h3>
      
      <!-- Interactive Visualizer Credit Card -->
      <div class="credit-card-container mb-6">
        <div id="credit-card-element" class="credit-card">
          <!-- Card Front -->
          <div class="card-front">
            <div class="flex justify-between items-start">
              <i class="fa-solid fa-microchip text-2xl text-amber-400 animate-pulse"></i>
              <span class="text-xs tracking-wider italic font-bold">NEO BANK</span>
            </div>
            <div>
              <div id="cc-number-preview" class="text-lg tracking-[0.15em] font-mono text-white py-1">•••• •••• •••• ••••</div>
              <div class="flex justify-between mt-4">
                <div>
                  <div class="text-[8px] text-slate-400 uppercase font-semibold">Card Member</div>
                  <div id="cc-name-preview" class="text-xs uppercase font-medium truncate max-w-[170px] text-slate-100">Cardholder Name</div>
                </div>
                <div>
                  <div class="text-[8px] text-slate-400 uppercase font-semibold">Expiration</div>
                  <div id="cc-expiry-preview" class="text-xs font-mono text-slate-100">MM/YY</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Card Back -->
          <div class="card-back">
            <div class="card-magnetic-strip"></div>
            <div class="px-6 flex flex-col gap-1 mt-4">
              <div class="text-[8px] text-slate-400 uppercase text-right font-semibold">CVV Verification</div>
              <div class="bg-white/90 text-slate-900 font-mono text-right pr-4 py-2 rounded text-xs italic font-bold">
                <span id="cc-cvv-preview">•••</span>
              </div>
            </div>
            <div class="px-6 flex justify-between items-center text-[7px] text-slate-400 font-bold">
              <span>Neo Security Matrix &copy;</span>
              <span>Signature Authorized</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Form -->
      <form id="payment-form" onsubmit="handlePaymentSubmit(event)" class="space-y-4 text-xs">
        <div class="space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-500">Name on Card</label>
          <input type="text" required id="pay-name" placeholder="John Doe" 
            class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800"
            oninput="updateCCVisualizer('name', this.value)">
        </div>

        <div class="space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-500">Credit Card Number</label>
          <input type="text" required id="pay-number" placeholder="1234 5678 1234 5678" maxlength="19"
            class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800"
            oninput="formatCCNumber(this); updateCCVisualizer('number', this.value)">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-bold text-slate-500">Expiry Date</label>
            <input type="text" required id="pay-expiry" placeholder="MM/YY" maxlength="5"
              class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800"
              oninput="formatCCExpiry(this); updateCCVisualizer('expiry', this.value)">
          </div>
          
          <!-- CVV / Trigger Flipping -->
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-bold text-slate-500">CVV / CVC</label>
            <input type="password" required id="pay-cvv" placeholder="•••" maxlength="3"
              class="w-full bg-slate-900/60 border border-white/5 rounded-lg p-2.5 text-slate-200 dark:bg-slate-900/60 dark:border-white/5 light:bg-slate-100 light:border-slate-200 light:text-slate-800"
              onfocus="flipCard(true)" onblur="flipCard(false)"
              oninput="updateCCVisualizer('cvv', this.value)">
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" onclick="state.checkoutStep = 1; renderCheckout();" 
            class="flex-shrink-0 px-5 border border-white/5 hover:border-slate-500 hover:text-slate-200 text-slate-400 font-semibold rounded-xl text-xs transition-colors">
            Back
          </button>
          <button type="submit" class="flex-grow py-3.5 bg-gradient-to-r from-brand-600 to-accent-pink hover:opacity-95 text-white font-semibold rounded-xl shadow-glow-purple flex items-center justify-center gap-2">
            <span>Securely Pay and Place Order</span><i class="fa-solid fa-shield-halved"></i>
          </button>
        </div>
      </form>
    `;
  }

  if (state.checkoutStep === 3) {
    // Generate order random ID
    const randomOrderId = "NEO-" + Math.floor(100000 + Math.random() * 900000);

    // Arrival date calculation (5 days from now)
    const arrivalDate = new Date();
    arrivalDate.setDate(arrivalDate.getDate() + 5);
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = arrivalDate.toLocaleDateString(undefined, dateOptions);

    return `
      <div class="text-center py-10 space-y-6">
        <div class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl mx-auto animate-bounce">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div class="space-y-2">
          <h3 class="text-2xl font-black font-display text-white dark:text-white light:text-slate-900">Order Placed Successfully!</h3>
          <p class="text-xs text-slate-500">Invoice and confirmation details transmitted to <span class="font-bold text-slate-300 dark:text-slate-300 light:text-slate-700">${state.checkoutDetails.email}</span></p>
        </div>

        <div class="p-6 bg-slate-950/40 rounded-xl border border-white/5 text-left max-w-sm mx-auto space-y-3 font-medium">
          <div class="flex justify-between text-xs border-b border-white/5 pb-2">
            <span class="text-slate-500">Order Tracking Reference</span>
            <span class="font-mono text-brand-400 font-bold">${randomOrderId}</span>
          </div>
          <div class="flex justify-between text-xs border-b border-white/5 pb-2">
            <span class="text-slate-500">Logistics Carrier</span>
            <span class="text-slate-300">Neo Cargo Express</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">Expected Delivery</span>
            <span class="text-slate-300 text-right text-[11px]">${dateStr}</span>
          </div>
        </div>

        <button onclick="clearCartAndReset()" class="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-all shadow-glow-purple">
          Continue Shopping
        </button>
      </div>
    `;
  }
}

// Checkout Actions
function handleShippingSubmit(e) {
  e.preventDefault();
  state.checkoutDetails = {
    first: document.getElementById('ship-first').value,
    last: document.getElementById('ship-last').value,
    address: document.getElementById('ship-address').value,
    city: document.getElementById('ship-city').value,
    zip: document.getElementById('ship-zip').value,
    country: document.getElementById('ship-country').value,
    email: document.getElementById('ship-email').value,
  };
  state.checkoutStep = 2;
  renderCheckout();
}

function handlePaymentSubmit(e) {
  e.preventDefault();

  // Show secure matrix authorization loader
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Securing Network Corridor...`;

  setTimeout(() => {
    state.checkoutStep = 3;
    renderCheckout();
    showToast("Transaction authorized successfully!", "success");
  }, 1800);
}

// CC inputs visual formats
function formatCCNumber(el) {
  let val = el.value.replace(/\D/g, '');
  let formatted = '';
  for (let i = 0; i < val.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += ' ';
    formatted += val[i];
  }
  el.value = formatted;
}

function formatCCExpiry(el) {
  let val = el.value.replace(/\D/g, '');
  if (val.length >= 2) {
    el.value = val.substring(0, 2) + '/' + val.substring(2, 4);
  } else {
    el.value = val;
  }
}

function flipCard(flip) {
  const card = document.getElementById('credit-card-element');
  if (card) {
    if (flip) {
      card.classList.add('flipped');
    } else {
      card.classList.remove('flipped');
    }
  }
}

function updateCCVisualizer(field, value) {
  if (field === 'name') {
    const el = document.getElementById('cc-name-preview');
    if (el) el.innerText = value.trim() === '' ? 'Cardholder Name' : value.toUpperCase();
  }
  if (field === 'number') {
    const el = document.getElementById('cc-number-preview');
    if (el) el.innerText = value.trim() === '' ? '•••• •••• •••• ••••' : value;
  }
  if (field === 'expiry') {
    const el = document.getElementById('cc-expiry-preview');
    if (el) el.innerText = value.trim() === '' ? 'MM/YY' : value;
  }
  if (field === 'cvv') {
    const el = document.getElementById('cc-cvv-preview');
    if (el) el.innerText = value.trim() === '' ? '•••' : value;
  }
}

function clearCartAndReset() {
  state.cart = [];
  state.promoApplied = false;
  localStorage.setItem('neo_cart', JSON.stringify([]));
  localStorage.removeItem('neo_promo');
  updateBadges();
  navigate('home');
}

function updateBadges() {
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = state.wishlist.length;

  if (cartCount > 0) {
    cartBadge.innerText = cartCount;
    cartBadge.classList.remove('hidden');
  } else {
    cartBadge.classList.add('hidden');
  }

  if (wishlistCount > 0) {
    wishlistBadge.innerText = wishlistCount;
    wishlistBadge.classList.remove('hidden');
  } else {
    wishlistBadge.classList.add('hidden');
  }
}

// ----------------------------------------------------
// CUSTOMER REVIEWS WRITER MODAL
// ----------------------------------------------------
function openReviewModal(productId) {
  const laptop = products.find(p => p.id === productId);

  globalModalContent.innerHTML = `
    <!-- Modal Close -->
    <button onclick="closeModal()" class="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
      <i class="fa-solid fa-xmark text-lg"></i>
    </button>
    
    <div class="p-6 space-y-6">
      <div>
        <h3 class="text-lg font-bold text-white flex items-center gap-2"><i class="fa-solid fa-feather-pointed text-brand-400"></i>Write a Customer Review</h3>
        <p class="text-xs text-slate-500 mt-1">Provide feedback for your customized ${laptop.name} system.</p>
      </div>

      <form id="add-review-form" onsubmit="handleReviewSubmit(event, '${productId}')" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-slate-500">Your Name</label>
            <input type="text" required id="rev-name" placeholder="E.g. Alan T." 
              class="w-full bg-slate-900 border border-white/5 rounded-lg p-2.5 text-slate-200">
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-slate-500">Hardware Rating</label>
            <select id="rev-rating" class="w-full bg-slate-900 border border-white/5 rounded-lg p-2.5 text-slate-200">
              <option value="5">★★★★★ (5 Stars - Flawless)</option>
              <option value="4">★★★★☆ (4 Stars - Great)</option>
              <option value="3">★★★☆☆ (3 Stars - Average)</option>
              <option value="2">★★☆☆☆ (2 Stars - Disappointed)</option>
              <option value="1">★☆☆☆☆ (1 Star - Defective)</option>
            </select>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] uppercase font-bold text-slate-500">Review Comments</label>
          <textarea required id="rev-comment" rows="4" placeholder="How does the system perform? How are thermal loads, graphic rates and screen response..."
            class="w-full bg-slate-900 border border-white/5 rounded-lg p-2.5 text-slate-200"></textarea>
        </div>

        <button type="submit" class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-glow-purple transition-all">
          Transmit Review Data
        </button>
      </form>
    </div>
  `;

  globalModal.classList.remove('hidden');
}

function closeModal() {
  globalModal.classList.add('hidden');
}

function handleReviewSubmit(e, productId) {
  e.preventDefault();
  const laptop = products.find(p => p.id === productId);

  const name = document.getElementById('rev-name').value;
  const rating = parseInt(document.getElementById('rev-rating').value);
  const comment = document.getElementById('rev-comment').value;

  const dateObj = new Date();
  const dateStr = dateObj.toISOString().split('T')[0];

  laptop.reviews.unshift({
    author: name,
    rating: rating,
    date: dateStr,
    comment: comment
  });

  // Recalculate average rating
  laptop.reviewsCount++;
  const sum = laptop.reviews.reduce((s, r) => s + r.rating, 0);
  laptop.rating = parseFloat((sum / laptop.reviews.length).toFixed(1));

  closeModal();
  renderDetail();
  showToast("Your review has been successfully indexed", "success");
}

// ----------------------------------------------------
// NEWSLETTER & FOOTER HANDLERS
// ----------------------------------------------------
function handleNewsletter(e) {
  e.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  const successEl = document.getElementById('newsletter-success');

  emailInput.disabled = true;
  successEl.classList.remove('hidden');

  showToast("Subscribed to the newsletter database!", "success");
  setTimeout(() => {
    emailInput.disabled = false;
    emailInput.value = '';
    successEl.classList.add('hidden');
  }, 3000);
}
