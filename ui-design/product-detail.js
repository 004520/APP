// 商品详情页面交互逻辑

class ProductDetailHandler {
  constructor() {
    this.product = null;
    this.currentImageIndex = 0;
    this.init();
  }

  async init() {
    // 检查登录状态
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.openid) {
      showToast('请先登录');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
      return;
    }

    // 获取商品ID
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
      showToast('商品不存在');
      setTimeout(() => {
        window.location.href = 'main-menu.html';
      }, 1000);
      return;
    }

    // 加载商品详情
    await this.loadProductDetail(productId);

    // 绑定事件
    this.bindEvents();
  }

  // 加载商品详情
  async loadProductDetail(productId) {
    try {
      const result = await CloudBaseHelper.queryCollection('products', {
        where: { _id: productId }
      });

      if (result.success && result.data && result.data.length > 0) {
        this.product = result.data[0];
        this.renderProduct();
      } else {
        showToast('商品不存在');
        setTimeout(() => {
          window.location.href = 'main-menu.html';
        }, 1000);
      }
    } catch (error) {
      console.error('加载商品详情失败:', error);
      showToast('加载失败，请重试');
    }
  }

  // 渲染商品
  renderProduct() {
    // 渲染图片
    this.renderImages();

    // 渲染基本信息
    document.getElementById('productPrice').textContent = `¥${parseFloat(this.product.price).toFixed(2)}`;
    document.getElementById('productTitle').textContent = this.product.title || '';
    document.getElementById('productCondition').textContent = this.formatCondition(this.product.condition);
    document.getElementById('productStatus').textContent = this.formatStatus(this.product.status);
    document.getElementById('productDescription').textContent = this.product.description || '';

    // 渲染卖家信息
    document.getElementById('sellerName').textContent = this.product.sellerName || '匿名';
    document.getElementById('contactName').textContent = this.product.sellerName || '匿名';
    document.getElementById('contactPhone').textContent = this.product.sellerPhone || '暂无';

    // 渲染时间
    const time = this.formatTime(this.product.createdAt);
    document.getElementById('productTime').textContent = time;

    // 更新状态样式
    const statusEl = document.getElementById('productStatus');
    statusEl.className = 'product-status ' + (this.product.status === 'sold' ? 'sold' : '');
  }

  // 渲染图片
  renderImages() {
    const wrapper = document.getElementById('sliderWrapper');
    const indicators = document.getElementById('sliderIndicators');

    if (!this.product.images || this.product.images.length === 0) {
      wrapper.innerHTML = '<div class="slider-item"><i class="fas fa-image"></i></div>';
      indicators.innerHTML = '<span class="indicator active"></span>';
      return;
    }

    const imagesHtml = this.product.images.map(img => `
      <div class="slider-item">
        <img src="${img}" alt="${this.product.title}">
      </div>
    `).join('');

    const indicatorsHtml = this.product.images.map((_, index) => `
      <span class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
    `).join('');

    wrapper.innerHTML = imagesHtml;
    indicators.innerHTML = indicatorsHtml;

    // 绑定轮播事件
    this.bindSliderEvents();
  }

  // 绑定轮播事件
  bindSliderEvents() {
    const wrapper = document.getElementById('sliderWrapper');
    const indicators = document.querySelectorAll('.indicator');

    indicators.forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.goToSlide(index);
      });
    });

    // 滑动手势
    let startX = 0;
    let endX = 0;

    wrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    wrapper.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = endX - startX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.prevSlide();
        } else {
          this.nextSlide();
        }
      }
    });
  }

  // 切换到指定图片
  goToSlide(index) {
    const wrapper = document.getElementById('sliderWrapper');
    const indicators = document.querySelectorAll('.indicator');
    const total = indicators.length;

    this.currentImageIndex = (index + total) % total;
    wrapper.style.transform = `translateX(-${this.currentImageIndex * 100}%)`;

    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === this.currentImageIndex);
    });
  }

  // 上一张
  prevSlide() {
    this.goToSlide(this.currentImageIndex - 1);
  }

  // 下一张
  nextSlide() {
    this.goToSlide(this.currentImageIndex + 1);
  }

  // 绑定事件
  bindEvents() {
    // 消息字数统计
    const messageInput = document.getElementById('messageText');
    if (messageInput) {
      messageInput.addEventListener('input', (e) => {
        const count = e.target.value.length;
        document.getElementById('msgCount').textContent = count;
      });
    }
  }

  // 分享
  handleShare() {
    if (navigator.share) {
      navigator.share({
        title: this.product.title,
        text: this.product.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      // 复制链接
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('链接已复制');
      }).catch(() => {
        showToast('分享失败');
      });
    }
  }

  // 联系卖家
  handleContact() {
    const modal = document.getElementById('contactModal');
    modal.classList.add('show');
  }

  // 发送消息
  async handleSendMessage() {
    const messageText = document.getElementById('messageText').value.trim();

    if (!messageText) {
      showToast('请输入消息内容');
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      const result = await CloudBaseHelper.callFunction('sendMessage', {
        fromId: userInfo.openid,
        toId: this.product.sellerId,
        productId: this.product._id,
        content: messageText
      });

      if (result.success) {
        showToast('消息已发送');
        hideContactModal();
        document.getElementById('messageText').value = '';
        document.getElementById('msgCount').textContent = '0';
      } else {
        showToast(result.message || '发送失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      showToast('发送失败，请重试');
    }
  }

  // 加入购物车
  async handleAddToCart() {
    if (this.product.status !== 'selling') {
      showToast('商品已下架或已售出');
      return;
    }

    if (this.product.sellerId === JSON.parse(localStorage.getItem('userInfo')).openid) {
      showToast('不能购买自己的商品');
      return;
    }

    try {
      let cartItems = JSON.parse(localStorage.getItem('shoppingCart') || '[]');

      const existingItem = cartItems.find(item => item.productId === this.product._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cartItems.push({
          id: Date.now().toString(),
          productId: this.product._id,
          title: this.product.title,
          seller: this.product.sellerName || '匿名',
          sellerId: this.product.sellerId,
          price: parseFloat(this.product.price),
          quantity: 1,
          image: this.product.images && this.product.images.length > 0 ? this.product.images[0] : ''
        });
      }

      localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
      showToast('已加入购物车');
    } catch (error) {
      console.error('加入购物车失败:', error);
      showToast('操作失败');
    }
  }

  // 立即购买
  handleBuyNow() {
    if (this.product.status !== 'selling') {
      showToast('商品已下架或已售出');
      return;
    }

    if (this.product.sellerId === JSON.parse(localStorage.getItem('userInfo')).openid) {
      showToast('不能购买自己的商品');
      return;
    }

    // 先加入购物车，然后跳转到购物车
    this.handleAddToCart();

    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 500);
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

  // 格式化状态
  formatStatus(status) {
    const map = {
      'selling': '在售',
      'sold': '已售出',
      'reserved': '已预订'
    };
    return map[status] || status;
  }

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return '刚刚';

    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
    return time.toLocaleDateString();
  }
}

// 显示联系弹窗
function handleContact() {
  window.productDetailHandler.handleContact();
}

// 隐藏联系弹窗
function hideContactModal() {
  document.getElementById('contactModal').classList.remove('show');
}

// 发送消息
function handleSendMessage() {
  window.productDetailHandler.handleSendMessage();
}

// 分享
function handleShare() {
  window.productDetailHandler.handleShare();
}

// 加入购物车
function handleAddToCart() {
  window.productDetailHandler.handleAddToCart();
}

// 立即购买
function handleBuyNow() {
  window.productDetailHandler.handleBuyNow();
}

// 显示提示
function showToast(message) {
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

// 添加样式
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
  .product-image-slider {
    position: relative;
    width: 100%;
    height: 375px;
    overflow: hidden;
    background: #F5F5F5;
  }
  .slider-wrapper {
    display: flex;
    transition: transform 0.3s ease;
    height: 100%;
  }
  .slider-item {
    min-width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .slider-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .slider-item i {
    font-size: 48px;
    color: #CCCCCC;
  }
  .slider-indicators {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
  }
  .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s;
  }
  .indicator.active {
    background: #FFFFFF;
    width: 24px;
    border-radius: 4px;
  }
  .product-info-section {
    background: #FFFFFF;
    padding: 16px;
    margin-bottom: 8px;
  }
  .product-price-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .product-price {
    font-size: 28px;
    font-weight: 600;
    color: #FF6B6B;
  }
  .product-status {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
    color: #52C41A;
    background: #F6FFED;
  }
  .product-status.sold {
    color: #999999;
    background: #F5F5F5;
  }
  .product-title {
    font-size: 18px;
    font-weight: 500;
    color: #333333;
    margin-bottom: 12px;
    line-height: 1.4;
  }
  .product-meta {
    display: flex;
    gap: 16px;
  }
  .product-condition {
    font-size: 13px;
    color: #999999;
  }
  .product-time {
    font-size: 13px;
    color: #999999;
  }
  .seller-section {
    background: #FFFFFF;
    padding: 16px;
    margin-bottom: 8px;
  }
  .seller-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .seller-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #F5F5F5;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .seller-avatar i {
    font-size: 24px;
    color: #CCCCCC;
  }
  .seller-info {
    flex: 1;
  }
  .seller-name {
    font-size: 16px;
    font-weight: 500;
    color: #333333;
    margin-bottom: 4px;
  }
  .seller-reputation {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #FFA500;
  }
  .seller-reputation i {
    font-size: 12px;
  }
  .btn-contact {
    padding: 8px 16px;
    background: #FF6B6B;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .seller-location {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #999999;
  }
  .product-description-section {
    background: #FFFFFF;
    padding: 16px;
    margin-bottom: 70px;
  }
  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #333333;
    margin-bottom: 12px;
  }
  .description-content {
    font-size: 14px;
    color: #666666;
    line-height: 1.6;
    white-space: pre-wrap;
  }
  .product-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    background: #FFFFFF;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  }
  .product-footer .btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .btn-secondary {
    background: #FFF1F0;
    color: #FF6B6B;
  }
  .btn-primary {
    background: #FF6B6B;
    color: white;
  }
  .contact-info {
    margin-bottom: 24px;
  }
  .contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #F0F0F0;
  }
  .contact-item:last-child {
    border-bottom: none;
  }
  .contact-item i {
    width: 24px;
    color: #FF6B6B;
  }
  .message-input-section {
    position: relative;
  }
  .message-input-section .char-count {
    position: absolute;
    bottom: -24px;
    right: 0;
    font-size: 12px;
    color: #999999;
  }
  .message-input-section .btn {
    margin-top: 8px;
    width: 100%;
    padding: 12px;
  }
  .modal.show .modal-content {
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  window.productDetailHandler = new ProductDetailHandler();
});
