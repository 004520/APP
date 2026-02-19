// 消息系统交互逻辑

class MessagesHandler {
  constructor() {
    this.messages = [];
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

    // 加载消息
    await this.loadMessages();
    // 渲染消息列表
    this.renderMessages();
  }

  // 加载消息
  async loadMessages() {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      // 查询所有相关消息
      const result = await CloudBaseHelper.queryCollection('messages', {
        where: {
          $or: [
            { fromId: userInfo.openid },
            { toId: userInfo.openid }
          ]
        }
      });

      if (result.success) {
        this.messages = result.data || [];

        // 按对话分组
        this.conversations = this.groupConversations(this.messages, userInfo.openid);
      } else {
        console.error('加载消息失败:', result.message);
        this.conversations = [];
      }
    } catch (error) {
      console.error('加载消息失败:', error);
      this.conversations = [];
    }
  }

  // 分组对话
  groupConversations(messages, myId) {
    const conversations = new Map();

    messages.forEach(msg => {
      const otherId = msg.fromId === myId ? msg.toId : msg.fromId;
      const productId = msg.productId;

      const key = `${otherId}_${productId}`;

      if (!conversations.has(key)) {
        conversations.set(key, {
          otherId,
          productId,
          productName: msg.productName || '商品',
          productImage: msg.productImage || '',
          messages: [],
          lastMessage: '',
          lastTime: msg.createdAt,
          unread: 0
        });
      }

      const conv = conversations.get(key);
      conv.messages.push(msg);

      // 统计未读消息
      if (msg.toId === myId && !msg.read) {
        conv.unread++;
      }

      // 更新最后一条消息
      if (new Date(msg.createdAt) > new Date(conv.lastTime)) {
        conv.lastMessage = msg.content;
        conv.lastTime = msg.createdAt;
      }
    });

    // 转换为数组并排序
    return Array.from(conversations.values()).sort((a, b) => {
      return new Date(b.lastTime) - new Date(a.lastTime);
    });
  }

  // 渲染消息列表
  renderMessages() {
    const messageList = document.getElementById('messageList');
    const emptyState = messageList.querySelector('.empty-state');

    if (!this.conversations || this.conversations.length === 0) {
      messageList.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-title">暂无消息</h3>
        </div>
      `;
      return;
    }

    const itemsHtml = this.conversations.map(conv => `
      <div class="message-card" onclick="window.messagesHandler.openChat('${conv.otherId}', '${conv.productId}')">
        <div class="message-avatar">
          ${conv.productImage
            ? `<img src="${conv.productImage}" alt="商品">`
            : '<i class="fas fa-box"></i>'
          }
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-product">${conv.productName}</span>
            <span class="message-time">${this.formatTime(conv.lastTime)}</span>
          </div>
          <div class="message-body">
            <div class="message-preview">${conv.lastMessage}</div>
            ${conv.unread > 0
              ? `<div class="message-unread">${conv.unread > 99 ? '99+' : conv.unread}</div>`
              : ''
            }
          </div>
        </div>
      </div>
    `).join('');

    messageList.innerHTML = itemsHtml;
  }

  // 打开聊天对话框
  openChat(otherId, productId) {
    // 跳转到聊天详情页面
    window.location.href = `chat-detail.html?otherId=${otherId}&productId=${productId}`;
  }

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return '';

    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
    return time.toLocaleDateString();
  }
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
  .message-list {
    padding: 8px 0 80px 0;
  }
  .message-card {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #FFFFFF;
    border-bottom: 1px solid #F0F0F0;
    cursor: pointer;
    transition: background 0.3s;
  }
  .message-card:active {
    background: #F5F5F5;
  }
  .message-avatar {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F5F5F5;
  }
  .message-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .message-avatar i {
    font-size: 24px;
    color: #CCCCCC;
  }
  .message-content {
    flex: 1;
    overflow: hidden;
  }
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .message-product {
    font-size: 15px;
    font-weight: 500;
    color: #333333;
  }
  .message-time {
    font-size: 12px;
    color: #999999;
  }
  .message-body {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .message-preview {
    flex: 1;
    font-size: 13px;
    color: #999999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .message-unread {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: #FF6B6B;
    color: #FFFFFF;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  window.messagesHandler = new MessagesHandler();
});
