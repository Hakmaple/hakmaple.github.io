// 搜索功能实现
class BlogSearch {
    constructor() {
        this.searchData = [];
        this.searchInput = null;
        this.searchResults = null;
        this.searchOverlay = null;
        this.init();
    }

    init() {
        this.createSearchModal();
        this.bindEvents();
        this.loadSearchData();
    }

    createSearchModal() {
        // 创建搜索模态框
        const searchModal = document.createElement('div');
        searchModal.className = 'search-modal';
        searchModal.innerHTML = `
            <div class="search-modal-content">
                <div class="search-header">
                    <input type="text" class="search-input" placeholder="搜索文章..." autocomplete="off">
                    <button class="search-close">&times;</button>
                </div>
                <div class="search-results"></div>
            </div>
            <div class="search-overlay"></div>
        `;
        document.body.appendChild(searchModal);

        this.searchInput = searchModal.querySelector('.search-input');
        this.searchResults = searchModal.querySelector('.search-results');
        this.searchOverlay = searchModal.querySelector('.search-overlay');
        this.searchModal = searchModal;
    }

    bindEvents() {
        // 绑定搜索按钮点击事件
        const searchToggle = document.querySelector('.search-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSearch();
            });
        }

        // 绑定关闭按钮事件
        const closeBtn = this.searchModal.querySelector('.search-close');
        closeBtn.addEventListener('click', () => this.closeSearch());

        // 绑定遮罩层点击事件
        this.searchOverlay.addEventListener('click', () => this.closeSearch());

        // 绑定ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchModal.classList.contains('active')) {
                this.closeSearch();
            }
        });

        // 绑定搜索输入事件
        this.searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });
    }

    async loadSearchData() {
        try {
            const response = await fetch('/search.json');
            this.searchData = await response.json();
        } catch (error) {
            console.error('Failed to load search data:', error);
        }
    }

    openSearch() {
        this.searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            this.searchInput.focus();
        }, 100);
    }

    closeSearch() {
        this.searchModal.classList.remove('active');
        document.body.style.overflow = '';
        this.searchInput.value = '';
        this.searchResults.innerHTML = '';
    }

    performSearch(query) {
        if (!query.trim()) {
            this.searchResults.innerHTML = '';
            return;
        }

        const results = this.searchData.filter(post => {
            const title = post.title.toLowerCase();
            const content = post.content.toLowerCase();
            const tags = post.tags ? post.tags.join(' ').toLowerCase() : '';
            const categories = post.categories ? post.categories.join(' ').toLowerCase() : '';
            const searchTerm = query.toLowerCase();

            return title.includes(searchTerm) || 
                   content.includes(searchTerm) || 
                   tags.includes(searchTerm) || 
                   categories.includes(searchTerm);
        });

        this.displayResults(results, query);
    }

    displayResults(results, query) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-no-results">
                    <p>没有找到包含 "${query}" 的文章</p>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(post => {
            const excerpt = this.getExcerpt(post.content, query);
            return `
                <div class="search-result-item">
                    <h3 class="search-result-title">
                        <a href="${post.url}">${this.highlightText(post.title, query)}</a>
                    </h3>
                    <p class="search-result-excerpt">${excerpt}</p>
                    <div class="search-result-meta">
                        <span class="search-result-date">${post.date}</span>
                        ${post.categories ? `<span class="search-result-category">${post.categories[0]}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        this.searchResults.innerHTML = `
            <div class="search-results-header">
                <p>找到 ${results.length} 篇相关文章</p>
            </div>
            ${resultsHTML}
        `;
    }

    getExcerpt(content, query) {
        const index = content.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) {
            return content.substring(0, 150) + '...';
        }
        
        const start = Math.max(0, index - 75);
        const end = Math.min(content.length, index + query.length + 75);
        let excerpt = content.substring(start, end);
        
        if (start > 0) excerpt = '...' + excerpt;
        if (end < content.length) excerpt = excerpt + '...';
        
        return this.highlightText(excerpt, query);
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

// 初始化搜索功能
document.addEventListener('DOMContentLoaded', () => {
    new BlogSearch();
});