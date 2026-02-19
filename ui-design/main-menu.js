// 主菜单界面交互逻辑

class MainMenuHandler {
  constructor() {
    // 当前选中的分类
    this.currentCategory = 'all';
    this.products = [];

    // 获取 DOM 元素
    this.categoryTabs = document.querySelectorAll('.category-tab');
    this.searchInput = document.querySelector('.search-input');
    this.productList = document.querySelector('.product-list');
    this.navItems = document.querySelectorAll('.nav-item');

    // 初始化
    this.init();
  }

  async init() {
    // 绑定事件
    this.bindEvents();
    // 更新购物车角标
    this.updateCartBadge();
    // 加载商品数据
    await this.loadProducts();
    // 渲染商品列表
    this.renderProducts();
  }

  // 加载商品数据
  async loadProducts() {
    try {
      // 查询所有在售商品
      const result = await CloudBaseHelper.queryCollection('products', {
        where: { status: 'selling' }
      });

      if (result.success) {
        this.products = result.data || [];
      } else {
        console.error('加载商品失败:', result.message);
        this.products = [];
      }
    } catch (error) {
      console.error('加载商品失败:', error);
      this.products = [];
    }
  }

  // 渲染商品列表
  renderProducts() {
    const productList = document.querySelector('.product-list');
    const emptyState = document.querySelector('.empty-state');

    if (!productList) return;

    if (this.products.length === 0) {
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';

    const itemsHtml = this.products.map(product => `
      <div class="product-item" data-id="${product._id}">
        <div class="product-image">
          ${product.images && product.images.length > 0
            ? `<img src="${product.images[0]}" alt="${product.title}">`
            : '<i class="fas fa-image"></i>'
          }
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">¥${parseFloat(product.price).toFixed(2)}</div>
          <div class="product-meta">
            <span class="product-seller">
              <i class="fas fa-user"></i>
              ${product.sellerName || '匿名'}
            </span>
            <span class="product-condition">${this.formatCondition(product.condition)}</span>
          </div>
        </div>
      </div>
    `).join('');

    productList.innerHTML = itemsHtml;
  }

  // 格式化成色
  formatCondition(condition) {
    const map = {
      'new': '全新',
      'like_new': '几乎全新',
      'good': '轻微使用',
      'fair': '明显使用痕迹'
    };
    return map[condition] || condition;
  }

  // 更新购物车角标
  updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
      const saved = localStorage.getItem('shoppingCart');
      if (saved) {
        const cartItems = JSON.parse(saved);
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = count > 99 ? '99+' : count;
        cartBadge.style.display = count > 0 ? 'flex' : 'none';
      }
    }
  }

  bindEvents() {
    // 分类标签点击
    this.categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => this.handleCategoryChange(tab));
    });

    // 搜索输入
    this.searchInput.addEventListener('input', () => this.handleSearch());

    // 导航栏点击
    this.navItems.forEach(item => {
      item.addEventListener('click', () => this.handleNavChange(item));
    });
  }

  // 处理分类切换
  handleCategoryChange(tab) {
    const category = tab.dataset.category;

    // 更新选中状态
    this.categoryTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    this.currentCategory = category;

    // 模拟过滤商品
    this.filterProducts(category);
  }

  // 过滤商品
  filterProducts(category) {
    let filtered = this.products;

    if (category !== 'all') {
      filtered = this.products.filter(p => p.category === category);
    }

    const productList = document.querySelector('.product-list');
    const emptyState = document.querySelector('.empty-state');

    if (!productList) return;

    if (filtered.length === 0) {
      productList.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';

    const itemsHtml = filtered.map(product => `
      <div class="product-item" data-id="${product._id}">
        <div class="product-image">
          ${product.images && product.images.length > 0
            ? `<img src="${product.images[0]}" alt="${product.title}">`
            : '<i class="fas fa-image"></i>'
          }
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">¥${parseFloat(product.price).toFixed(2)}</div>
          <div class="product-meta">
            <span class="product-seller">
              <i class="fas fa-user"></i>
              ${product.sellerName || '匿名'}
            </span>
            <span class="product-condition">${this.formatCondition(product.condition)}</span>
          </div>
        </div>
      </div>
    `).join('');

    productList.innerHTML = itemsHtml;
  }

  // 处理搜索
  handleSearch() {
    const keyword = this.searchInput.value.trim();
    const productList = document.querySelector('.product-list');
    const emptyState = document.querySelector('.empty-state');

    if (!keyword) {
      this.renderProducts();
      return;
    }

    const filtered = this.products.filter(p => {
      return p.title.toLowerCase().includes(keyword.toLowerCase()) ||
             p.description.toLowerCase().includes(keyword.toLowerCase());
    });

    if (!productList) return;

    if (filtered.length === 0) {
      productList.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';

    const itemsHtml = filtered.map(product => `
      <div class="product-item" data-id="${product._id}">
        <div class="product-image">
          ${product.images && product.images.length > 0
            ? `<img src="${product.images[0]}" alt="${product.title}">`
            : '<i class="fas fa-image"></i>'
          }
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">¥${parseFloat(product.price).toFixed(2)}</div>
          <div class="product-meta">
            <span class="product-seller">
              <i class="fas fa-user"></i>
              ${product.sellerName || '匿名'}
            </span>
            <span class="product-condition">${this.formatCondition(product.condition)}</span>
          </div>
        </div>
      </div>
    `).join('');

    productList.innerHTML = itemsHtml;
  }

  // 处理导航栏切换
  handleNavChange(item) {
    const tab = item.dataset.tab;

    // 更新选中状态
    this.navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    console.log('切换到:', tab);

    // 这里可以添加实际的页面切换逻辑
    switch(tab) {
      case 'mall':
        console.log('商城页面');
        break;
      case 'selling':
        console.log('在售页面');
        break;
      case 'todo':
        console.log('待办页面');
        break;
      case 'settings':
        console.log('设置页面');
        break;
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new MainMenuHandler();
});
