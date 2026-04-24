// video-player-component.js - 视频播放弹框组件
class VideoPlayerComponent extends HTMLElement {
    constructor() {
        super();
        // 创建 Shadow DOM 以隔离样式和结构
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // 获取属性值
        this.triggerId = this.getAttribute('trigger-id');
        this.videoUrl = this.getAttribute('video-url');
        this.videoTitle = this.getAttribute('video-title') || '产品演示视频';
        
        if (!this.triggerId) {
            console.warn('VideoPlayerComponent: 缺少 trigger-id 属性');
            return;
        }
        
        if (!this.videoUrl) {
            console.warn('VideoPlayerComponent: 缺少 video-url 属性');
            return;
        }

        // 渲染模态框模板
        this.renderModal();
        
        // 绑定触发按钮事件
        this.bindTriggerEvent();
        
        // 绑定模态框事件
        this.bindModalEvents();
    }

    renderModal() {
        const modalHTML = `
            <style>
                /* 模态框基础样式 */
                .video-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .video-modal-overlay.show {
                    display: flex;
                }
                
                .video-modal-overlay.fade-in {
                    opacity: 1;
                }
                
                .video-modal-container {
                    position: relative;
                    width: 90%;
                    max-width: 1000px;
                    background: #001220;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    transform: scale(0.95);
                    transition: transform 0.3s ease;
                }
                
                .video-modal-overlay.show .video-modal-container {
                    transform: scale(1);
                }
                
                .video-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    background: rgba(0, 18, 32, 0.95);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .video-modal-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0;
                }
                
                .video-modal-close {
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .video-modal-close:hover {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .video-modal-close icon-icon {
                    font-size: 24px;
                }
                
                .video-modal-body {
                    position: relative;
                    padding-bottom: 56.25%; /* 16:9 比例 */
                    height: 0;
                    background: #000000;
                }
                
                .video-modal-body iframe,
                .video-modal-body video {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                
                /* 自定义关闭按钮的简单样式（备用） */
                .close-icon {
                    font-size: 24px;
                    font-weight: 300;
                    line-height: 1;
                }
                
                @keyframes modalFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            </style>
            
            <div id="videoModal" class="video-modal-overlay">
                <div class="video-modal-container">
                    <div class="video-modal-header">
                        <h3 class="video-modal-title">${this.escapeHtml(this.videoTitle)}</h3>
                        <button id="closeModalBtn" class="video-modal-close" aria-label="关闭">
                            <span class="close-icon">✕</span>
                        </button>
                    </div>
                    <div class="video-modal-body" id="videoContainer">
                        <!-- 视频内容将动态插入 -->
                    </div>
                </div>
            </div>
        `;
        
        this.shadowRoot.innerHTML = modalHTML;
        
        // 缓存 DOM 元素
        this.modal = this.shadowRoot.getElementById('videoModal');
        this.closeBtn = this.shadowRoot.getElementById('closeModalBtn');
        this.videoContainer = this.shadowRoot.getElementById('videoContainer');
    }

    bindTriggerEvent() {
        // 查找触发按钮（在 Light DOM 中）
        this.triggerElement = document.getElementById(this.triggerId);
        
        if (this.triggerElement) {
            this.handleTriggerClick = this.openModal.bind(this);
            this.triggerElement.addEventListener('click', this.handleTriggerClick);
        } else {
            console.error(`VideoPlayerComponent: 未找到 ID 为 '${this.triggerId}' 的触发元素`);
        }
    }

    bindModalEvents() {
        // 关闭按钮事件
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', this.closeModal.bind(this));
        }
        
        // 点击遮罩层关闭
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        // ESC 键关闭
        this.handleEscKey = (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('show')) {
                this.closeModal();
            }
        };
    }

    openModal() {
        if (!this.modal) return;
        
        // 插入视频内容
        this.insertVideo();
        
        // 显示模态框
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // 添加淡入动画
        setTimeout(() => {
            this.modal.classList.add('fade-in');
        }, 10);
        
        // 绑定 ESC 键事件
        document.addEventListener('keydown', this.handleEscKey);
    }

    insertVideo() {
        if (!this.videoContainer) return;
        
        // 清空容器
        this.videoContainer.innerHTML = '';
        
        // 判断视频类型并创建对应的播放元素
        const videoElement = this.createVideoElement();
        this.videoContainer.appendChild(videoElement);
    }

    createVideoElement() {
        const url = this.videoUrl;
        
        // 检测是否是 YouTube 链接
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/;
        const youtubeMatch = url.match(youtubeRegex);
        
        if (youtubeMatch) {
            // YouTube 嵌入 iframe
            const videoId = youtubeMatch[1];
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.title = this.videoTitle;
            return iframe;
        }
        
        // 检测是否是 Bilibili 链接
        const bilibiliRegex = /(?:bilibili\.com\/video\/)([BV][a-zA-Z0-9]+)/;
        const bilibiliMatch = url.match(bilibiliRegex);
        
        if (bilibiliMatch) {
            // Bilibili 嵌入 iframe
            const videoId = bilibiliMatch[1];
            const iframe = document.createElement('iframe');
            iframe.src = `https://player.bilibili.com/player.html?bvid=${videoId}&autoplay=1&high_quality=1`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.title = this.videoTitle;
            return iframe;
        }
        
        // 检测是否是 Vimeo 链接
        const vimeoRegex = /vimeo\.com\/(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        
        if (vimeoMatch) {
            // Vimeo 嵌入 iframe
            const videoId = vimeoMatch[1];
            const iframe = document.createElement('iframe');
            iframe.src = `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
            iframe.allow = 'autoplay; fullscreen; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.title = this.videoTitle;
            return iframe;
        }
        
        // 默认使用 HTML5 video 标签（支持 .mp4, .webm, .mov 等）
        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.crossOrigin = 'anonymous';
        const source = document.createElement('source');
        source.src = url;
        source.type = this.getVideoType(url);
        video.appendChild(source);
        
        // 备用提示
        const fallbackText = document.createTextNode('您的浏览器不支持视频播放。');
        video.appendChild(fallbackText);
        
        return video;
    }

    getVideoType(url) {
        const extension = url.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'mp4': return 'video/mp4';
            case 'webm': return 'video/webm';
            case 'mov': return 'video/quicktime';
            case 'ogg': return 'video/ogg';
            default: return 'video/mp4';
        }
    }

    closeModal() {
        if (!this.modal) return;
        
        // 移除显示类
        this.modal.classList.remove('fade-in');
        this.modal.classList.remove('show');
        
        // 停止视频播放
        this.stopVideo();
        
        // 恢复页面滚动
        document.body.style.overflow = '';
        
        // 移除 ESC 键监听
        document.removeEventListener('keydown', this.handleEscKey);
    }

    stopVideo() {
        if (!this.videoContainer) return;
        
        // 清空视频容器，停止所有播放
        this.videoContainer.innerHTML = '';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    disconnectedCallback() {
        // 清理事件监听，防止内存泄漏
        if (this.triggerElement) {
            this.triggerElement.removeEventListener('click', this.handleTriggerClick);
        }
        
        // 移除 ESC 键监听
        document.removeEventListener('keydown', this.handleEscKey);
        
        // 恢复页面滚动
        document.body.style.overflow = '';
    }
}

// 定义自定义元素
customElements.define('video-player', VideoPlayerComponent);