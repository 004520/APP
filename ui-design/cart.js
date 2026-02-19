// 购物车交互逻辑

class CartHandler {
  constructor() {
    this.cartItems = [];
    this.init();
  }

  init() {
    // 从本地存储加载购物车数据
    this.loadCart();
    // 渲染购物车
    this.renderCart();
    // 更新商城页面的购物车角标
    this.updateCartBadge();
  }

  // 加载购物车
  loadCart() {
    const saved = localStorage.getItem('shoppingCart');
    if (saved) {
      this.cartItems = JSON.parse(saved);
    } else {
      // 模拟初始数据
      this.cartItems = [
        {
          id: '1',
          productId: '101',
          title: 'iPhone 13 Pro Max 256G',
          seller: '张同学',
          sellerId: '1001',
          price: 6999.00,
          quantity: 1,
          image: '',
          selected: true
        },
        {
          id: '2',
          productId: '102',
          title: 'Apple Watch Series 7',
          seller: '李同学',
          sellerId: '1002',
          price: 2899.00,
          quantity: 1,
          image: '',
          selected: false
        }
      ];
    }
  }

  // 保存购物车
  saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(this.cartItems));
    this.updateCartBadge();
  }

  // 更新购物车角标
  updateCartBadge() {
    const badge = document.querySelector('.search-bar .cart-badge');
    if (badge) {
      const count = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // 渲染购物车
  renderCart() {
    const cartList = document.getElementById('cartList');
    const emptyCart = document.getElementById('emptyCart');
    const cartFooter = document.getElementById('cartFooter');

    if (this.cartItems.length === 0) {
      emptyCart.style.display = 'flex';
      cartFooter.style.display = 'none';
      return;
    }

    emptyCart.style.display = 'none';
    cartFooter.style.display = 'flex';

    // 渲染商品列表
    const itemsHtml = this.cartItems.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-checkbox">
          <input type="checkbox" ${item.selected ? 'checked' : ''} onchange="window.cartHandler.toggleItem('${item.id}')">
        </div>
        <div class="cart-item-image">
          ${item.image ? `<img src="${item.image}" alt="${item.title}">` : '<i class="fas fa-box" style="font-size: 32px; color: #CCCCCC;"></i>'}
        </div>
        <div class="cart-item-info">
          <h3 class="cart-item-title">${item.title}</h3>
          <div class="cart-item-seller">
            <i class="fas fa-user"></i>
            <span>${item.seller}</span>
          </div>
          <div class="cart-item-price">
            <span>¥</span>${item.price.toFixed(2)}
          </div>
          <div class="cart-item-actions">
            <div class="quantity-control">
              <button class="quantity-btn" ${item.quantity <= 1 ? 'disabled' : ''} onclick="window.cartHandler.changeQuantity('${item.id}', -1)">
                <i class="fas fa-minus" style="font-size: 10px;"></i>
              </button>
              <input type="text" class="quantity-input" value="${item.quantity}" readonly>
              <button class="quantity-btn" onclick="window.cartHandler.changeQuantity('${item.id}', 1)">
                <i class="fas fa-plus" style="font-size: 10px;"></i>
              </button>
            </div>
            <button class="item-delete-btn" onclick="window.cartHandler.deleteItem('${item.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    cartList.innerHTML = `
      <div class="cart-items">
        ${itemsHtml}
      </div>
    `;

    // 更新总价和结算按钮
    this.updateTotal();
  }

  // 切换商品选中状态
  toggleItem(itemId) {
    const item = this.cartItems.find(i => i.id === itemId);
    if (item) {
      item.selected = !item.selected;
      this.saveCart();
      this.renderCart();
    }
  }

  // 切换全选
  toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    this.cartItems.forEach(item => {
      item.selected = selectAll;
    });
    this.saveCart();
    this.renderCart();
  }

  // 修改数量
  changeQuantity(itemId, delta) {
    const item = this.cartItems.find(i => i.id === itemId);
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity >= 1 && newQuantity <= 99) {
        item.quantity = newQuantity;
        this.saveCart();
        this.renderCart();
      }
    }
  }

  // 删除商品
  deleteItem(itemId) {
    if (confirm('确定要从购物车中删除这个商品吗？')) {
      this.cartItems = this.cartItems.filter(i => i.id !== itemId);
      this.saveCart();
      this.renderCart();
      this.showToast('已删除');
    }
  }

  // 更新总价
  updateTotal() {
    const selectedItems = this.cartItems.filter(i => i.selected);
    const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    document.getElementById('totalPrice').textContent = `¥${total.toFixed(2)}`;
    document.getElementById('selectedCount').textContent = selectedItems.length;

    // 更新全选状态
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
      selectAll.checked = this.cartItems.length > 0 && this.cartItems.every(i => i.selected);
    }

    // 更新结算按钮状态
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
      checkoutBtn.disabled = selectedItems.length === 0;
    }
  }

  // 结算
  async checkout() {
    const selectedItems = this.cartItems.filter(i => i.selected);

    if (selectedItems.length === 0) {
      this.showToast('请选择要结算的商品');
      return;
    }

    try {
      // 显示加载状态
      const checkoutBtn = document.querySelector('.btn-checkout');
      const originalText = checkoutBtn.innerHTML;
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      // 调用CloudBase云函数创建订单
      const result = await CloudBaseHelper.callFunction('createOrder', {
        items: selectedItems.map(item => ({
          productId: item.productId,
          sellerId: item.sellerId,
          quantity: item.quantity,
          price: item.price
        }))
      });

      if (result.success) {
        this.showToast('下单成功');
        // 从购物车中移除已购买的商品
        this.cartItems = this.cartItems.filter(i => !i.selected);
        this.saveCart();
        this.renderCart();

        // 跳转到订单页面
        setTimeout(() => {
          window.location.href = 'todo.html';
        }, 1500);
      } else {
        this.showToast(result.message || '下单失败，请重试');
      }
    } catch (error) {
      console.error('结算失败:', error);
      this.showToast('网络错误，请稍后重试');
    } finally {
      // 恢复按钮状态
      const checkoutBtn = document.querySelector('.btn-checkout');
      checkoutBtn.disabled = this.cartItems.filter(i => i.selected).length === 0;
      checkoutBtn.innerHTML = '结算(<span id="selectedCount">${this.cartItems.filter(i => i.selected).length}</span>)';
    }
  }

  // 显示提示
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
  }
}

// 切换全选
function toggleSelectAll() {
  window.cartHandler.toggleSelectAll();
}

// 结算
function checkout() {
  window.cartHandler.checkout();
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  window.cartHandler = new CartHandler();
});
