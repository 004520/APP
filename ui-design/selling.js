// 在售商品页面交互逻辑

class SellingHandler {
  constructor() {
    this.products = [];
    this.uploadedImages = [];
    this.init();
  }

  async init() {
    // 从CloudBase加载商品数据
    await this.loadProducts();
    // 渲染商品列表
    this.renderProducts();
    // 绑定输入事件
    this.bindEvents();
  }

  // 加载商品
  async loadProducts() {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.openid) {
        console.log('用户未登录');
        this.products = [];
        return;
      }

      const result = await CloudBaseHelper.queryCollection('products', {
        where: { sellerId: userInfo.openid }
      });

      if (result.success) {
        this.products = result.data || [];
      } else {
        console.error('加载商品失败:', result.message);
        this.products = [];
      }
    } catch (error) {
      console.error('加载商品失败:', error);
      // 降级到本地存储
      const saved = localStorage.getItem('myProducts');
      this.products = saved ? JSON.parse(saved) : [];
    }
  }

  // 渲染商品列表
  renderProducts() {
    const productList = document.getElementById('productList');
    const emptyState = document.getElementById('emptyState');

    if (this.products.length === 0) {
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';

    const itemsHtml = this.products.map(product => `
      <div class="product-card" data-id="${product.id}">
        <div class="product-images">
          ${product.images && product.images.length > 0
            ? product.images.map(img => `
              <div class="product-image">
                <img src="${img}" alt="${product.title}">
              </div>
            `).join('')
            : '<div class="product-image"><i class="fas fa-image"></i></div>'
          }
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">
            <span>¥</span>${product.price.toFixed(2)}
          </div>
          <div class="product-meta">
            <span>${this.formatCondition(product.condition)}</span>
            <span class="product-status ${product.status === 'sold' ? 'sold' : ''}">
              ${this.formatStatus(product.status)}
            </span>
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

  // 格式化状态
  formatStatus(status) {
    const map = {
      'selling': '在售',
      'sold': '已售出',
      'reserved': '已预订'
    };
    return map[status] || status;
  }

  // 绑定事件
  bindEvents() {
    // 标题字数统计
    const titleInput = document.getElementById('productTitle');
    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        const count = e.target.value.length;
        document.getElementById('titleCount').textContent = count;
      });
    }

    // 描述字数统计
    const descInput = document.getElementById('productDescription');
    if (descInput) {
      descInput.addEventListener('input', (e) => {
        const count = e.target.value.length;
        document.getElementById('descCount').textContent = count;
      });
    }
  }

  // 处理图片上传
  handleImageUpload(event) {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // 检查图片数量限制
    if (this.uploadedImages.length + files.length > 6) {
      this.showToast('最多只能上传6张图片');
      event.target.value = '';
      return;
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      this.showToast('只支持 JPG、PNG 格式的图片');
      return;
    }

    // 读取并预览图片
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImages.push(e.target.result);
        this.renderImagePreview();
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }

  // 渲染图片预览
  renderImagePreview() {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;

    preview.innerHTML = this.uploadedImages.map((img, index) => `
      <div class="preview-item">
        <img src="${img}" alt="预览">
        <button class="preview-remove" onclick="window.sellingHandler.removeImage(${index})">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
  }

  // 移除图片
  removeImage(index) {
    this.uploadedImages.splice(index, 1);
    this.renderImagePreview();
  }

  // 提交商品
  async submitProduct() {
    const title = document.getElementById('productTitle').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value.trim();
    const conditionInputs = document.querySelectorAll('input[name="condition"]:checked');

    // 表单验证
    if (!title) {
      this.showToast('请输入商品标题');
      return;
    }

    if (title.length < 5) {
      this.showToast('商品标题至少5个字符');
      return;
    }

    if (!price || price <= 0) {
      this.showToast('请输入有效的价格');
      return;
    }

    if (this.uploadedImages.length === 0) {
      this.showToast('请至少上传一张商品图片');
      return;
    }

    if (!description) {
      this.showToast('请输入商品描述');
      return;
    }

    if (description.length < 10) {
      this.showToast('商品描述至少10个字符');
      return;
    }

    if (conditionInputs.length === 0) {
      this.showToast('请选择商品成色');
      return;
    }

    const condition = conditionInputs[0].value;

    try {
      // 显示加载状态
      const submitBtn = document.querySelector('.modal-footer .btn-primary');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传中...';

      // 上传图片
      const imageUrls = [];
      for (const imgData of this.uploadedImages) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传图片中...';
        const uploadResult = await CloudBaseHelper.callFunction('uploadImage', {
          file: imgData,
          category: 'product'
        });
        if (uploadResult.success && uploadResult.imageUrl) {
          imageUrls.push(uploadResult.imageUrl);
        }
      }

      if (imageUrls.length === 0) {
        this.showToast('图片上传失败,请重试');
        throw new Error('图片上传失败');
      }

      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 创建商品中...';

      // 调用CloudBase云函数创建商品
      const createResult = await CloudBaseHelper.callFunction('createProduct', {
        title,
        price,
        images: imageUrls,
        description,
        condition
      });

      if (createResult.success) {
        // 添加到本地列表
        const product = createResult.data || {
          _id: Date.now().toString(),
          title,
          price,
          images: imageUrls,
          description,
          condition,
          status: 'selling',
          createdAt: new Date().toISOString()
        };
        this.products.unshift(product);

        // 清空表单
        this.resetForm();

        // 关闭弹窗
        this.hideAddProductModal();

        this.showToast('商品发布成功');
      } else {
        this.showToast(createResult.message || '发布失败,请重试');
      }
    } catch (error) {
      console.error('发布失败:', error);
      this.showToast('发布失败,请检查网络连接');
    } finally {
      // 恢复按钮状态
      const submitBtn = document.querySelector('.modal-footer .btn-primary');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '发布';
    }
  }

  // 重置表单
  resetForm() {
    document.getElementById('addProductForm').reset();
    this.uploadedImages = [];
    this.renderImagePreview();
    document.getElementById('titleCount').textContent = '0';
    document.getElementById('descCount').textContent = '0';
  }

  // 显示添加商品弹窗
  showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // 隐藏添加商品弹窗
  hideAddProductModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    this.resetForm();
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

// 初始化
window.sellingHandler = new SellingHandler();

// 全局函数
function showAddProductModal() {
  window.sellingHandler.showAddProductModal();
}

function hideAddProductModal() {
  window.sellingHandler.hideAddProductModal();
}

function handleImageUpload(event) {
  window.sellingHandler.handleImageUpload(event);
}

function submitProduct() {
  window.sellingHandler.submitProduct();
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
