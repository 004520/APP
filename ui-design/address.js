// 地址模块交互逻辑

class AddressHandler {
  constructor() {
    this.addresses = {
      trading: [],
      delivery: []
    };
    this.currentType = 'trading';
    this.editingId = null;
    this.init();
  }

  init() {
    // 从本地存储加载地址数据
    this.loadAddresses();
    // 绑定事件
    this.bindEvents();
    // 渲染地址列表
    this.renderAddresses();
  }

  bindEvents() {
    // Tab 切换
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        this.switchTab(type);
      });
    });

    // 地址类型切换
    document.querySelectorAll('input[name="addressType"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.toggleAddressTypeFields(e.target.value);
      });
    });

    // 表单提交
    document.getElementById('addressForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave();
    });
  }

  // 切换 Tab
  switchTab(type) {
    this.currentType = type;

    // 更新 Tab 样式
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.type === type) {
        tab.classList.add('active');
      }
    });

    // 切换地址列表显示
    document.querySelector('.trading-section').style.display =
      type === 'trading' ? 'block' : 'none';
    document.querySelector('.delivery-section').style.display =
      type === 'delivery' ? 'block' : 'none';

    // 更新模态框中的地址类型
    const typeRadio = document.querySelector(`input[name="addressType"][value="${type}"]`);
    if (typeRadio) {
      typeRadio.checked = true;
      this.toggleAddressTypeFields(type);
    }
  }

  // 切换地址类型相关字段显示
  toggleAddressTypeFields(type) {
    const modalContent = document.querySelector('.modal-content');
    if (type === 'delivery') {
      modalContent.classList.add('show-delivery');
    } else {
      modalContent.classList.remove('show-delivery');
    }
  }

  // 加载地址数据
  loadAddresses() {
    const saved = localStorage.getItem('userAddresses');
    if (saved) {
      this.addresses = JSON.parse(saved);
    }
  }

  // 保存地址数据
  saveAddresses() {
    localStorage.setItem('userAddresses', JSON.stringify(this.addresses));
  }

  // 渲染地址列表
  renderAddresses() {
    // 渲染交易地址
    this.renderAddressSection('trading');

    // 渲染收货地址
    this.renderAddressSection('delivery');
  }

  // 渲染指定类型的地址列表
  renderAddressSection(type) {
    const container = document.querySelector(`.${type}-section`);
    const addresses = this.addresses[type];

    if (addresses.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-title">暂无${type === 'trading' ? '交易' : '收货'}地址</h3>
          <p class="empty-desc">点击右上角"添加"按钮添加新地址</p>
        </div>
      `;
      return;
    }

    container.innerHTML = addresses.map(addr => `
      <div class="address-card">
        <div class="card-header">
          <span class="card-tag ${addr.isDefault ? 'default' : ''}">
            ${addr.isDefault ? '默认' : (type === 'trading' ? '交易' : '收货')}
          </span>
          <div class="card-actions">
            <span class="card-action" onclick="window.addressHandler.editAddress('${addr.id}')">编辑</span>
            <span class="card-action delete" onclick="window.addressHandler.deleteAddress('${addr.id}')">删除</span>
          </div>
        </div>
        <div class="card-info">
          ${type === 'delivery' ? `
            <div class="card-name">${addr.name}</div>
            <div class="card-phone">${addr.phone}</div>
          ` : ''}
          <div class="card-address">${addr.address}</div>
        </div>
      </div>
    `).join('');
  }

  // 显示添加/编辑地址弹窗
  showAddressModal(editData = null) {
    const modal = document.getElementById('addressModal');
    const form = document.getElementById('addressForm');

    if (editData) {
      // 编辑模式
      this.editingId = editData.id;
      document.getElementById('modalTitle').textContent = '编辑地址';

      // 填充表单数据
      document.querySelector(`input[name="addressType"][value="${editData.type}"]`).checked = true;
      this.toggleAddressTypeFields(editData.type);

      if (editData.type === 'delivery') {
        document.getElementById('receiverName').value = editData.name || '';
        document.getElementById('receiverPhone').value = editData.phone || '';
        document.getElementById('setDefault').checked = editData.isDefault || false;
      }

      document.getElementById('detailAddress').value = editData.address || '';
    } else {
      // 添加模式
      this.editingId = null;
      document.getElementById('modalTitle').textContent = '添加地址';

      // 根据当前 Tab 设置默认类型
      document.querySelector(`input[name="addressType"][value="${this.currentType}"]`).checked = true;
      this.toggleAddressTypeFields(this.currentType);

      // 清空表单
      form.reset();
    }

    modal.classList.add('show');
  }

  // 处理保存
  async handleSave() {
    const type = document.querySelector('input[name="addressType"]:checked').value;
    const address = document.getElementById('detailAddress').value.trim();

    // 验证
    if (!address) {
      this.showToast('请输入详细地址');
      return;
    }

    if (type === 'delivery') {
      const name = document.getElementById('receiverName').value.trim();
      const phone = document.getElementById('receiverPhone').value.trim();

      if (!name) {
        this.showToast('请输入收货人姓名');
        return;
      }

      if (!phone) {
        this.showToast('请输入联系电话');
        return;
      }

      // 手机号格式验证
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        this.showToast('请输入正确的手机号');
        return;
      }

      this.saveDeliveryAddress(type, name, phone, address);
    } else {
      this.saveTradingAddress(type, address);
    }
  }

  // 保存交易地址
  saveTradingAddress(type, address) {
    const addressData = {
      id: this.editingId || Date.now().toString(),
      type: type,
      address: address
    };

    if (this.editingId) {
      // 编辑模式
      const index = this.addresses[type].findIndex(a => a.id === this.editingId);
      if (index !== -1) {
        this.addresses[type][index] = addressData;
      }
    } else {
      // 添加模式
      this.addresses[type].push(addressData);
    }

    this.saveAddresses();
    this.renderAddresses();
    this.hideAddressModal();
    this.showToast('保存成功');
  }

  // 保存收货地址
  saveDeliveryAddress(type, name, phone, address) {
    const isDefault = document.getElementById('setDefault').checked;

    // 如果设置为默认地址，取消其他默认地址
    if (isDefault) {
      this.addresses[type].forEach(addr => {
        addr.isDefault = false;
      });
    }

    const addressData = {
      id: this.editingId || Date.now().toString(),
      type: type,
      name: name,
      phone: phone,
      address: address,
      isDefault: isDefault
    };

    if (this.editingId) {
      // 编辑模式
      const index = this.addresses[type].findIndex(a => a.id === this.editingId);
      if (index !== -1) {
        // 如果取消默认，保持原来的 isDefault
        if (!isDefault && this.addresses[type][index].isDefault) {
          addressData.isDefault = true;
        }
        this.addresses[type][index] = addressData;
      }
    } else {
      // 添加模式
      // 如果是第一个收货地址，自动设为默认
      if (this.addresses[type].length === 0) {
        addressData.isDefault = true;
      }
      this.addresses[type].push(addressData);
    }

    this.saveAddresses();
    this.renderAddresses();
    this.hideAddressModal();
    this.showToast('保存成功');
  }

  // 编辑地址
  editAddress(id) {
    const address = [...this.addresses.trading, ...this.addresses.delivery].find(a => a.id === id);
    if (address) {
      this.showAddressModal(address);
    }
  }

  // 删除地址
  deleteAddress(id) {
    if (!confirm('确定要删除这个地址吗？')) {
      return;
    }

    const type = this.currentType;
    const index = this.addresses[type].findIndex(a => a.id === id);

    if (index !== -1) {
      const deletedIsDefault = this.addresses[type][index].isDefault;

      this.addresses[type].splice(index, 1);

      // 如果删除的是默认地址，将第一个地址设为默认
      if (deletedIsDefault && this.addresses[type].length > 0) {
        this.addresses[type][0].isDefault = true;
      }

      this.saveAddresses();
      this.renderAddresses();
      this.showToast('删除成功');
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

// 显示添加地址弹窗
function showAddressModal() {
  window.addressHandler.showAddressModal();
}

// 隐藏添加地址弹窗
function hideAddressModal() {
  document.getElementById('addressModal').classList.remove('show');
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
  window.addressHandler = new AddressHandler();
});
