// api-key-component.js - 与 home.html 逻辑保持一致
class ApiKeyApplyComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.modalId = 'apiKeyModal';
        // 不自动渲染，等待 connectedCallback
    }

    connectedCallback() {
        const triggerId = this.getAttribute('trigger-id');
        if (!triggerId) {
            console.warn('ApiKeyApplyComponent: 缺少 trigger-id 属性');
            return;
        }

        this.triggerElement = document.getElementById(triggerId);
        if (!this.triggerElement) {
            console.error(`ApiKeyApplyComponent: 未找到 ID 为 '${triggerId}' 的触发元素`);
            return;
        }

        // 检查页面上是否已存在模态框
        let existingModal = document.getElementById(this.modalId);
        if (!existingModal) {
            // 创建模态框并添加到 body
            this.createModal();
        }

        // 绑定点击事件
        this.handleTriggerClick = this.openModal.bind(this);
        this.triggerElement.addEventListener('click', this.handleTriggerClick);
    }

    createModal() {
        const modalHTML = `
<div id="${this.modalId}" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="glass-card rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h3 class="text-2xl font-bold">申请 API 密钥</h3>
                <p class="text-sm text-gray-400 mt-1">请输入公司基本信息，我们会立即生成您的专属 API Key。</p>
            </div>
            <button id="closeApiKeyModalBtn" class="text-gray-400 hover:text-white">
                <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
            </button>
        </div>
        <form id="apiKeyFormModal" class="space-y-4">
            <div>
                <label class="block text-sm text-gray-400 mb-2">公司名称 *</label>
                <input type="text" id="apiCompanyNameModal" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#00D1B2] outline-none" placeholder="请输入公司全称" required>
            </div>
            <div>
                <label class="block text-sm text-gray-400 mb-2">联系人姓名 *</label>
                <input type="text" id="apiContactNameModal" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#00D1B2] outline-none" placeholder="请输入联系人姓名" required>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-2">手机号码 *</label>
                    <input type="tel" id="apiPhoneModal" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#00D1B2] outline-none" placeholder="138-0000-0000" required>
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-2">邮箱地址 *</label>
                    <input type="email" id="apiEmailModal" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#00D1B2] outline-none" placeholder="your@email.com" required>
                </div>
            </div>
            <div>
                <label class="block text-sm text-gray-400 mb-2">行业类型</label>
                <select id="apiIndustryModal" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00D1B2] outline-none">
                    <option value="">请选择行业</option>
                    <option value="retail">零售/连锁</option>
                    <option value="food">餐饮/生鲜</option>
                    <option value="fashion">时尚/服饰</option>
                    <option value="electronics">电子产品</option>
                    <option value="other">其他</option>
                </select>
            </div>
            <button type="submit" class="w-full py-4 rounded-xl bg-[#00D1B2] text-white font-bold hover:bg-[#00b59a] transition-all">立即生成 API Key</button>
        </form>
        <div id="apiKeyResultModal" class="mt-6 hidden">
            <div class="bg-[#00D1B2]/10 border border-[#00D1B2]/20 rounded-xl p-5">
                <h4 class="font-bold text-lg mb-3 text-[#00D1B2]">API Key 已生成</h4>
                <p class="text-gray-300 mb-4">请复制并保存该密钥，后续接入时使用。</p>
                <div class="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 break-all text-sm text-[#00D1B2] font-mono" id="apiKeyValueModal"></div>
                <button id="copyApiKeyBtnModal" class="mt-4 w-full py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all">复制 API Key</button>
                <p id="apiCopyNoticeModal" class="mt-3 text-sm text-green-300 hidden">API Key 已复制到剪贴板。</p>
            </div>
        </div>
    </div>
</div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 绑定模态框事件
        this.modal = document.getElementById(this.modalId);
        this.closeBtn = document.getElementById('closeApiKeyModalBtn');
        this.form = document.getElementById('apiKeyFormModal');
        this.resultDiv = document.getElementById('apiKeyResultModal');
        this.keyValueDisplay = document.getElementById('apiKeyValueModal');
        this.copyBtn = document.getElementById('copyApiKeyBtnModal');
        this.copyNotice = document.getElementById('apiCopyNoticeModal');
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', this.closeModal.bind(this));
        }
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', this.handleCopy.bind(this));
        }
    }

    openModal() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            
            // 重置表单
            setTimeout(() => {
                if (this.form) this.form.reset();
                if (this.resultDiv) this.resultDiv.classList.add('hidden');
                if (this.form) this.form.classList.remove('hidden');
                if (this.copyNotice) this.copyNotice.classList.add('hidden');
            }, 200);
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const companyName = document.getElementById('apiCompanyNameModal')?.value.trim();
        const contactName = document.getElementById('apiContactNameModal')?.value.trim();
        const phone = document.getElementById('apiPhoneModal')?.value.trim();
        const email = document.getElementById('apiEmailModal')?.value.trim();

        if (!companyName || !contactName || !phone || !email) {
            alert('请填写所有必填字段。');
            return;
        }

        const newKey = this.generateApiKey();
        if (this.keyValueDisplay) this.keyValueDisplay.textContent = newKey;
        
        if (this.form) this.form.classList.add('hidden');
        if (this.resultDiv) this.resultDiv.classList.remove('hidden');
    }

    handleCopy() {
        const keyText = this.keyValueDisplay?.textContent.trim();
        if (!keyText) return;

        navigator.clipboard.writeText(keyText).then(() => {
            if (this.copyNotice) {
                this.copyNotice.classList.remove('hidden');
                setTimeout(() => {
                    this.copyNotice.classList.add('hidden');
                }, 2000);
            }
        }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制。');
        });
    }

    generateApiKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = 'RG-';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 8; j++) {
                key += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            if (i < 3) key += '-';
        }
        return key;
    }

    disconnectedCallback() {
        if (this.triggerElement) {
            this.triggerElement.removeEventListener('click', this.handleTriggerClick);
        }
    }
}

customElements.define('api-key-apply', ApiKeyApplyComponent);