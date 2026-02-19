// 主菜单界面交互逻辑

class MainMenuHandler {
  constructor() {
    // 当前选中的分类
    this.currentCategory = 'all';

    // 获取 DOM 元素
    this.categoryTabs = document.querySelectorAll('.category-tab');
    this.searchInput = document.querySelector('.search-input');
    this.productList = document.querySelector('.product-list');
    this.navItems = document.querySelectorAll('.nav-item');

    // 初始化
    this.init();
  }

  init() {
    // 绑定事件
    this.bindEvents();
    // 更新购物车角标
    this.updateCartBadge();
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
    // 这里可以添加实际的过滤逻辑
    console.log('过滤分类:', category);

    // 模拟加载效果
    this.productList.style.opacity = '0.5';
    setTimeout(() => {
      this.productList.style.opacity = '1';
    }, 300);
  }

  // 处理搜索
  handleSearch() {
    const keyword = this.searchInput.value.trim();
    console.log('搜索关键词:', keyword);

    // 这里可以添加实际的搜索逻辑
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
