// Deebato Theme JavaScript
(function() {
    'use strict';
    
    // DOM ready function
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }
    
    // Smooth scroll for anchor links
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Add active class to current navigation item
    function initNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (currentPath === linkPath || 
                (currentPath !== '/' && linkPath !== '/' && currentPath.startsWith(linkPath))) {
                link.classList.add('active');
            }
        });
    }
    
    // 页面切换动画
    function initPageTransition() {
        const mainContent = document.getElementById('mainContent');
        const loadingIndicator = document.getElementById('loadingIndicator');
        
        // 拦截文章链接点击
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (!target) return;
            
            const href = target.getAttribute('href');
            // 只处理内部链接（文章页面）
            if (!href || href.startsWith('#') || href.startsWith('http') || href.includes('mailto:')) {
                return;
            }
            
            // 检查是否是文章链接或导航链接
            if (target.classList.contains('post-link') || 
                target.classList.contains('read-more') ||
                target.classList.contains('top-nav-link') ||
                target.classList.contains('nav-brand-link') ||
                target.classList.contains('pagination-link')) {
                
                e.preventDefault();
                
                // 开始页面切换动画
                startPageTransition(href);
            }
        });
        
        function startPageTransition(url) {
            // 显示加载指示器
            loadingIndicator.classList.add('active');
            
            // 添加淡出效果
            mainContent.classList.add('fade-out');
            
            // 等待动画完成后跳转
            setTimeout(() => {
                window.location.href = url;
            }, 200);
        }
        
        // 页面加载完成后的淡入效果
        function pageLoadAnimation() {
            if (mainContent) {
                mainContent.classList.add('fade-in');
                
                // 移除加载指示器
                setTimeout(() => {
                    if (loadingIndicator) {
                        loadingIndicator.classList.remove('active');
                    }
                }, 100);
                
                // 清理动画类
                setTimeout(() => {
                    mainContent.classList.remove('fade-in', 'fade-out');
                }, 400);
            }
        }
        
        // 页面加载时执行淡入动画
        pageLoadAnimation();
    }

    // Back to top functionality
    function initBackToTop() {
        // Create back to top button
        const backToTop = document.createElement('button');
        backToTop.innerHTML = '↑';
        backToTop.className = 'back-to-top';
        backToTop.setAttribute('aria-label', 'Back to top');
        backToTop.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border: none;
            border-radius: 50%;
            background-color: #333;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        
        document.body.appendChild(backToTop);
        
        // Show/hide button based on scroll position
        function toggleBackToTop() {
            if (window.pageYOffset > 300) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
            }
        }
        
        // Scroll to top when clicked
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Listen for scroll events
        window.addEventListener('scroll', toggleBackToTop);
        
        // Hover effects
        backToTop.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#666';
        });
        
        backToTop.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#333';
        });
    }
    
    // Copy code functionality
    function initCodeCopy() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach(codeBlock => {
            const pre = codeBlock.parentElement;
            if (!pre) return;
            
            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.innerHTML = 'Copy';
            copyButton.className = 'code-copy-btn';
            copyButton.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 5px 10px;
                background-color: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 3px;
                font-size: 12px;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // Make pre relative for absolute positioning
            pre.style.position = 'relative';
            pre.appendChild(copyButton);
            
            // Show button on hover
            pre.addEventListener('mouseenter', function() {
                copyButton.style.opacity = '1';
            });
            
            pre.addEventListener('mouseleave', function() {
                copyButton.style.opacity = '0';
            });
            
            // Copy functionality
            copyButton.addEventListener('click', function() {
                const text = codeBlock.textContent;
                
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(() => {
                        copyButton.innerHTML = 'Copied!';
                        setTimeout(() => {
                            copyButton.innerHTML = 'Copy';
                        }, 2000);
                    });
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    copyButton.innerHTML = 'Copied!';
                    setTimeout(() => {
                        copyButton.innerHTML = 'Copy';
                    }, 2000);
                }
            });
        });
    }
    
    // Reading progress indicator
    function initReadingProgress() {
        // Only show on post pages
        if (!document.querySelector('.post-content')) return;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background-color: #333;
            z-index: 1000;
            transition: width 0.1s ease;
        `;
        
        document.body.appendChild(progressBar);
        
        function updateProgress() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
        }
        
        window.addEventListener('scroll', updateProgress);
    }
    
    // Scroll-triggered animations
    function initScrollAnimations() {
        const postItems = document.querySelectorAll('.post-item');
        
        // Remove initial animation classes
        postItems.forEach(item => {
            item.style.animation = 'none';
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
        });
        
        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    item.style.animation = 'fadeInUp 0.6s ease-out forwards';
                    observer.unobserve(item);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe all post items
        postItems.forEach(item => {
            observer.observe(item);
        });
    }
    
    // Initialize all features when DOM is ready
    ready(function() {
        initSmoothScroll();
        initNavigation();
        initBackToTop();
        initCodeCopy();
        initReadingProgress();
        initScrollAnimations();
        initPageTransition();
        
        // Add loaded class to body for CSS animations
        document.body.classList.add('loaded');
    });
    
})();