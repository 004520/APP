// 待办页面交互逻辑

class TodoHandler {
  constructor() {
    this.orders = [];
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

    // 加载订单数据
    await this.loadOrders();
    // 渲染订单列表
    this.renderOrders();
    // 更新待办角标
    this.updateTodoBadge();
  }

  // 加载订单
  async loadOrders() {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.openid) {
        this.orders = [];
        return;
      }

      // 查询作为买家的订单
      const buyerResult = await CloudBaseHelper.queryCollection('orders', {
        where: { buyerId: userInfo.openid }
      });

      // 查询作为卖家的订单
      const sellerResult = await CloudBaseHelper.queryCollection('orders', {
        where: { sellerId: userInfo.openid }
      });

      this.orders = [];
      if (buyerResult.success) {
        buyerResult.data.forEach(order => {
          order.role = 'buyer';
          this.orders.push(order);
        });
      }
      if (sellerResult.success) {
        sellerResult.data.forEach(order => {
          order.role = 'seller';
          this.orders.push(order);
        });
      }

      // 按创建时间倒序排列
      this.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('加载订单失败:', error);
      this.orders = [];
    }
  }

  // 渲染订单列表
  renderOrders() {
    const todoList = document.querySelector('.todo-list') || document.querySelector('.empty-state')?.parentElement;
    const emptyState = document.querySelector('.empty-state');

    if (!todoList) {
      todoList = document.createElement('div');
      todoList.className = 'todo-list';
      todoList.style.padding = '0 16px 80px 16px';
      emptyState?.after(todoList);
    }

    if (this.orders.length === 0) {
      emptyState.style.display = 'flex';
      todoList.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    todoList.style.display = 'block';

    const itemsHtml = this.orders.map(order => `
      <div class="order-card" data-id="${order._id}">
        <div class="order-header">
          <div class="order-id">订单号：${order.orderId || order._id.substr(0, 12)}</div>
          <div class="order-status ${this.getStatusClass(order.status)}">
            ${this.getStatusText(order.status, order.role)}
          </div>
        </div>
        <div class="order-items">
          ${order.items && order.items.length > 0
            ? order.items.map(item => `
                <div class="order-item">
                  <div class="item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.title}">` : '<i class="fas fa-box"></i>'}
                  </div>
                  <div class="item-info">
                    <div class="item-title">${item.title}</div>
                    <div class="item-price">¥${parseFloat(item.price).toFixed(2)} × ${item.quantity}</div>
                  </div>
                </div>
              `).join('')
            : ''
          }
        </div>
        <div class="order-footer">
          <div class="order-total">合计: <span class="total-price">¥${parseFloat(order.totalPrice).toFixed(2)}</span></div>
          ${this.renderActionButton(order)}
        </div>
      </div>
    `).join('');

    todoList.innerHTML = itemsHtml;
  }

  // 获取状态样式类
  getStatusClass(status) {
    const map = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return map[status] || '';
  }

  // 获取状态文本
  getStatusText(status, role) {
    if (role === 'buyer') {
      const map = {
        'pending': '待确认',
        'confirmed': '已确认',
        'completed': '已完成',
        'cancelled': '已取消'
      };
      return map[status] || status;
    } else {
      const map = {
        'pending': '新订单',
        'confirmed': '已确认',
        'completed': '已完成',
        'cancelled': '已取消'
      };
      return map[status] || status;
    }
  }

  // 渲染操作按钮
  renderActionButton(order) {
    if (order.role === 'seller' && order.status === 'pending') {
      return `<button class="btn btn-primary btn-sm" onclick="window.todoHandler.confirmOrder('${order._id}')">确认订单</button>`;
    }
    if (order.role === 'buyer' && order.status === 'confirmed') {
      return `<button class="btn btn-success btn-sm" onclick="window.todoHandler.completeOrder('${order._id}')">确认收货</button>`;
    }
    if (order.status === 'pending') {
      return `<button class="btn btn-danger btn-sm" onclick="window.todoHandler.cancelOrder('${order._id}')">取消订单</button>`;
    }
    return '';
  }

  // 确认订单（卖家）
  async confirmOrder(orderId) {
    if (!confirm('确认接受此订单？')) {
      return;
    }

    try {
      const result = await CloudBaseHelper.callFunction('confirmOrder', {
        orderId: orderId,
        status: 'confirmed'
      });

      if (result.success) {
        showToast('订单已确认');
        await this.loadOrders();
        this.renderOrders();
        this.updateTodoBadge();
      } else {
        showToast(result.message || '确认失败');
      }
    } catch (error) {
      console.error('确认订单失败:', error);
      showToast('网络错误，请重试');
    }
  }

  // 完成订单（买家确认收货）
  async completeOrder(orderId) {
    if (!confirm('确认已收到商品？')) {
      return;
    }

    try {
      const result = await CloudBaseHelper.callFunction('confirmOrder', {
        orderId: orderId,
        status: 'completed'
      });

      if (result.success) {
        showToast('订单已完成');
        await this.loadOrders();
        this.renderOrders();
        this.updateTodoBadge();
      } else {
        showToast(result.message || '操作失败');
      }
    } catch (error) {
      console.error('完成订单失败:', error);
      showToast('网络错误，请重试');
    }
  }

  // 取消订单
  async cancelOrder(orderId) {
    if (!confirm('确定要取消此订单？')) {
      return;
    }

    try {
      const result = await CloudBaseHelper.callFunction('confirmOrder', {
        orderId: orderId,
        status: 'cancelled'
      });

      if (result.success) {
        showToast('订单已取消');
        await this.loadOrders();
        this.renderOrders();
        this.updateTodoBadge();
      } else {
        showToast(result.message || '取消失败');
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      showToast('网络错误，请重试');
    }
  }

  // 更新待办角标
  updateTodoBadge() {
    const todoBadge = document.getElementById('todoBadge');
    if (!todoBadge) return;

    // 统计待处理的订单数
    const pendingCount = this.orders.filter(order => {
      if (order.role === 'seller' && order.status === 'pending') return true;
      if (order.role === 'buyer' && order.status === 'confirmed') return true;
      return false;
    }).length;

    if (pendingCount > 0) {
      todoBadge.style.display = 'flex';
      todoBadge.textContent = pendingCount > 99 ? '99+' : pendingCount;
    } else {
      todoBadge.style.display = 'none';
    }
  }
}

// 初始化
window.todoHandler = new TodoHandler();

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

// 添加动画和样式
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
  .order-card {
    background: #FFFFFF;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #F0F0F0;
    margin-bottom: 12px;
  }
  .order-id {
    font-size: 13px;
    color: #999999;
  }
  .order-status {
    font-size: 13px;
    font-weight: 500;
  }
  .status-pending { color: #FFA500; }
  .status-confirmed { color: #1890FF; }
  .status-completed { color: #52C41A; }
  .status-cancelled { color: #999999; }
  .order-items {
    margin-bottom: 12px;
  }
  .order-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }
  .order-item:last-child {
    margin-bottom: 0;
  }
  .item-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F5F5F5;
  }
  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .item-image i {
    color: #CCCCCC;
  }
  .item-info {
    flex: 1;
  }
  .item-title {
    font-size: 14px;
    color: #333333;
    margin-bottom: 4px;
  }
  .item-price {
    font-size: 13px;
    color: #FF6B6B;
  }
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #F0F0F0;
  }
  .order-total {
    font-size: 14px;
    color: #333333;
  }
  .total-price {
    font-size: 18px;
    font-weight: 600;
    color: #FF6B6B;
  }
  .btn {
    padding: 6px 16px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
  }
  .btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }
  .btn-primary {
    background: #FF6B6B;
    color: white;
  }
  .btn-primary:hover {
    background: #FF5252;
  }
  .btn-success {
    background: #52C41A;
    color: white;
  }
  .btn-success:hover {
    background: #389E0D;
  }
  .btn-danger {
    background: #999999;
    color: white;
  }
  .btn-danger:hover {
    background: #777777;
  }
`;
document.head.appendChild(style);
