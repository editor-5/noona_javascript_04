// ====== 에러 핸들링 모듈 ======
const ErrorHandler = {
    logError(error, context = '') {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ${context}:`, error);
    },

    showUserError(message) {
        try {
            const newsBoard = document.querySelector(CONFIG.SELECTORS.newsBoard);
            if (newsBoard) {
                newsBoard.innerHTML = `
                    <div style="padding:40px 20px;text-align:center;color:#d32f2f;font-size:1.2em;border:1px solid #ffcdd2;background:#ffebee;border-radius:8px;margin:20px 0;">
                        <strong>오류 발생</strong><br>
                        <span style="font-size:1em;margin-top:8px;display:block;">${message}</span>
                    </div>
                `;
            }
        } catch (domError) {
            console.error('DOM 조작 중 오류:', domError);
            alert(message); // 폴백으로 alert 사용
        }
    },

    showNetworkError() {
        this.showUserError('네트워크 연결을 확인해주세요. 잠시 후 다시 시도해보세요.');
    },

    showApiError() {
        this.showUserError('뉴스를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해보세요.');
    },

    showSearchError() {
        this.showUserError('검색 중 문제가 발생했습니다. 다른 검색어로 시도해보세요.');
    },

    showGeneralError() {
        this.showUserError('예상치 못한 오류가 발생했습니다. 페이지를 새로고침해보세요.');
    }
};

// ====== 상수 및 설정 ======
const CONFIG = {
    BASE_URL: 'https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines',
    CATEGORY_MAP: {
        '사업': 'business',
        '오락': 'entertainment',
        '일반': 'general',
        '건강': 'health',
        '과학': 'science',
        '스포츠': 'sports',
        '기술': 'technology'
    },
    SELECTORS: {
        searchInput: '#search-input',
        hamburgerBtn: '#hamburger-btn',
        sideMenu: '#side-menu',
        closeMenu: '#close-menu',
        searchBtn: '#search-btn',
        searchModal: '#search-modal',
        searchModalBtn: '#search-modal-btn',
        closeSearch: '#close-search',
        searchModalBg: '.search-modal-bg',
        newsBoard: '#news-board',
        categoryBtns: '.side-menus button, section .menus button'
    }
};

// ====== 유틸리티 함수 ======
const Utils = {
    timeAgo(dateString) {
        try {
            if (!dateString) return '';
            
            const now = new Date();
            const date = new Date(dateString);
            
            // 유효하지 않은 날짜 체크
            if (isNaN(date.getTime())) {
                ErrorHandler.logError(new Error('Invalid date string'), 'Utils.timeAgo');
                return '';
            }
            
            const diff = now - date;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const months = Math.floor(days / 30);
            const years = Math.floor(days / 365);
            
            if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
            if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
            if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
            if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            return 'just now';
        } catch (error) {
            ErrorHandler.logError(error, 'Utils.timeAgo');
            return '';
        }
    },

    sanitizeText(text, maxLength = 200) {
        try {
            if (text === null || text === undefined) return '내용없음';
            if (typeof text !== 'string') {
                text = String(text);
            }
            return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
        } catch (error) {
            ErrorHandler.logError(error, 'Utils.sanitizeText');
            return '내용없음';
        }
    },

    createImageTag(imgSrc) {
        try {
            if (!imgSrc || typeof imgSrc !== 'string') {
                return '<div class="news-img-size no-image">no image</div>';
            }
            
            // URL 유효성 검사
            try {
                new URL(imgSrc);
            } catch (urlError) {
                ErrorHandler.logError(urlError, 'Utils.createImageTag - Invalid URL');
                return '<div class="news-img-size no-image">no image</div>';
            }
            
            return `<img class="news-img-size" src="${imgSrc}" onerror="this.onerror=null;this.classList.add('no-image');this.innerHTML='no image';" alt="news image"/>`;
        } catch (error) {
            ErrorHandler.logError(error, 'Utils.createImageTag');
            return '<div class="news-img-size no-image">no image</div>';
        }
    },

    validateNewsItem(news) {
        try {
            if (!news || typeof news !== 'object') {
                return false;
            }
            // 최소한의 필수 필드 체크
            return news.hasOwnProperty('title');
        } catch (error) {
            ErrorHandler.logError(error, 'Utils.validateNewsItem');
            return false;
        }
    }
};

// ====== API 모듈 ======
const NewsAPI = {
    makeUrl({ q, page, pageSize, category } = {}) {
        try {
            const url = new URL(CONFIG.BASE_URL);
            if (q && typeof q === 'string') url.searchParams.set('q', q.trim());
            if (page && !isNaN(page)) url.searchParams.set('page', String(page));
            if (pageSize && !isNaN(pageSize)) url.searchParams.set('pageSize', String(pageSize));
            if (category && typeof category === 'string') url.searchParams.set('category', category.trim());
            return url;
        } catch (error) {
            ErrorHandler.logError(error, 'NewsAPI.makeUrl');
            throw new Error('URL 생성 실패');
        }
    },

    // 단일 fetch 함수 - 모든 뉴스 요청의 중심
    async getNews(url) {
        try {
            if (!url) {
                throw new Error('URL이 제공되지 않았습니다');
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
            
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            if (!data || typeof data !== 'object') {
                throw new Error('서버에서 잘못된 데이터를 받았습니다');
            }
            
            const articles = data.articles || [];
            
            if (!Array.isArray(articles)) {
                throw new Error('뉴스 데이터 형식이 올바르지 않습니다');
            }
            
            // 유효한 뉴스 아이템만 필터링
            const validArticles = articles.filter(article => Utils.validateNewsItem(article));
            
            return validArticles;
            
        } catch (error) {
            ErrorHandler.logError(error, 'NewsAPI.getNews');
            
            if (error.name === 'AbortError') {
                throw new Error('요청 시간이 초과되었습니다');
            } else if (error.message.includes('fetch')) {
                throw new Error('네트워크 연결을 확인해주세요');
            } else {
                throw error;
            }
        }
    },

    // URL만 생성하여 getNews에 전달하는 함수들
    async getLatestNews(options = {}) {
        const url = this.makeUrl(options);
        return await this.getNews(url);
    },

    async getNewsBySearch(keyword) {
        const url = this.makeUrl({ q: keyword });
        return await this.getNews(url);
    },

    async getNewsByCategory(category) {
        const url = this.makeUrl({ category });
        return await this.getNews(url);
    },

    async getNewsByPage(page) {
        const url = this.makeUrl({ page });
        return await this.getNews(url);
    }
};

// ====== 뉴스 렌더링 모듈 ======
const NewsRenderer = {
    renderNewsItem(news) {
        try {
            if (!Utils.validateNewsItem(news)) {
                ErrorHandler.logError(new Error('Invalid news item'), 'NewsRenderer.renderNewsItem');
                return '<div class="row news error-news">뉴스 데이터를 표시할 수 없습니다.</div>';
            }
            
            const description = Utils.sanitizeText(news.description);
            const imageTag = Utils.createImageTag(news.urlToImage);
            const sourceName = (news.source && news.source.name) ? Utils.sanitizeText(news.source.name, 50) : 'no source';
            const publishedTime = news.publishedAt ? Utils.timeAgo(news.publishedAt) : '';
            const title = Utils.sanitizeText(news.title || '제목 없음', 150);

            return `
                <div class="row news">
                    <div class="col-lg-4">
                        ${imageTag}
                    </div>
                    <div class="col-lg-8">
                        <h2>${title}</h2>
                        <p>${description}</p>
                        <div>${sourceName} * ${publishedTime}</div>
                    </div>
                </div>
            `;
        } catch (error) {
            ErrorHandler.logError(error, 'NewsRenderer.renderNewsItem');
            return '<div class="row news error-news">뉴스를 표시하는 중 오류가 발생했습니다.</div>';
        }
    },

    renderNewsList(newsList) {
        try {
            const newsBoard = document.querySelector(CONFIG.SELECTORS.newsBoard);
            if (!newsBoard) {
                ErrorHandler.logError(new Error('News board element not found'), 'NewsRenderer.renderNewsList');
                return;
            }

            if (!newsList || !Array.isArray(newsList) || newsList.length === 0) {
                newsBoard.innerHTML = `
                    <div class="alert alert-danger d-flex align-items-center" role="alert">
                        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:">
                            <use xlink:href="#exclamation-triangle-fill"/>
                        </svg>
                        <div>
                            <strong>검색 결과가 없습니다!</strong> 다른 검색어로 시도해보세요.
                        </div>
                    </div>
                `;
                return;
            }

            const newsHTML = newsList
                .filter(news => Utils.validateNewsItem(news))
                .map(news => this.renderNewsItem(news))
                .join('');

            if (!newsHTML.trim()) {
                newsBoard.innerHTML = `
                    <div class="alert alert-info d-flex align-items-center" role="alert">
                        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:">
                            <use xlink:href="#exclamation-triangle-fill"/>
                        </svg>
                        <div>
                            <strong>표시할 수 있는 뉴스가 없습니다.</strong> 데이터 형식에 문제가 있습니다.
                        </div>
                    </div>
                `;
                return;
            }

            newsBoard.innerHTML = newsHTML;
        } catch (error) {
            ErrorHandler.logError(error, 'NewsRenderer.renderNewsList');
            this.showRenderError();
        }
    },

    showEmptyState() {
        try {
            const newsBoard = document.querySelector(CONFIG.SELECTORS.newsBoard);
            if (newsBoard) {
                newsBoard.innerHTML = `
                    <div class="alert alert-warning d-flex align-items-center" role="alert">
                        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
                            <use xlink:href="#exclamation-triangle-fill"/>
                        </svg>
                        <div>
                            <strong>뉴스를 불러올 수 없습니다.</strong> 잠시 후 다시 시도해주세요.
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            ErrorHandler.logError(error, 'NewsRenderer.showEmptyState');
        }
    },

    showRenderError() {
        try {
            const newsBoard = document.querySelector(CONFIG.SELECTORS.newsBoard);
            if (newsBoard) {
                newsBoard.innerHTML = `
                    <div style="padding:40px 20px;text-align:center;color:#d32f2f;font-size:1.2em;border:1px solid #ffcdd2;background:#ffebee;border-radius:8px;margin:20px 0;">
                        <strong>렌더링 오류</strong><br>
                        <span style="font-size:1em;margin-top:8px;display:block;">뉴스를 표시하는 중 문제가 발생했습니다.</span>
                    </div>
                `;
            }
        } catch (error) {
            ErrorHandler.logError(error, 'NewsRenderer.showRenderError');
        }
    }
};


// ====== UI 컨트롤러 모듈 ======
const UIController = {
    elements: {},

    init() {
        try {
            this.cacheElements();
            this.bindEvents();
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.init');
            ErrorHandler.showGeneralError();
        }
    },

    cacheElements() {
        try {
            this.elements = {
                searchInput: document.querySelector(CONFIG.SELECTORS.searchInput),
                hamburgerBtn: document.querySelector(CONFIG.SELECTORS.hamburgerBtn),
                sideMenu: document.querySelector(CONFIG.SELECTORS.sideMenu),
                closeMenu: document.querySelector(CONFIG.SELECTORS.closeMenu),
                searchBtn: document.querySelector(CONFIG.SELECTORS.searchBtn),
                searchModal: document.querySelector(CONFIG.SELECTORS.searchModal),
                searchModalBtn: document.querySelector(CONFIG.SELECTORS.searchModalBtn),
                closeSearch: document.querySelector(CONFIG.SELECTORS.closeSearch),
                searchModalBg: document.querySelector(CONFIG.SELECTORS.searchModalBg),
                categoryBtns: document.querySelectorAll(CONFIG.SELECTORS.categoryBtns)
            };

            // 필수 요소들이 있는지 확인
            const requiredElements = ['searchInput', 'searchBtn'];
            const missingElements = requiredElements.filter(key => !this.elements[key]);
            
            if (missingElements.length > 0) {
                ErrorHandler.logError(new Error(`Missing required elements: ${missingElements.join(', ')}`), 'UIController.cacheElements');
            }
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.cacheElements');
            throw error;
        }
    },

    bindEvents() {
        try {
            this.bindSearchEvents();
            this.bindMenuEvents();
            this.bindModalEvents();
            this.bindCategoryEvents();
            this.bindKeyboardEvents();
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.bindEvents');
            throw error;
        }
    },

    bindSearchEvents() {
        try {
            const { searchInput } = this.elements;

            if (searchInput) {
                searchInput.addEventListener('keydown', (e) => {
                    try {
                        if (e.key === 'Enter') {
                            const keyword = searchInput.value.trim();
                            NewsApp.performSearch(keyword);
                            searchInput.value = '';
                            this.closeSearchModal();
                        }
                    } catch (error) {
                        ErrorHandler.logError(error, 'UIController.bindSearchEvents - searchInput keydown');
                        ErrorHandler.showSearchError();
                    }
                });
            }
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.bindSearchEvents');
            throw error;
        }
    },

    bindMenuEvents() {
        try {
            const { hamburgerBtn, sideMenu, closeMenu } = this.elements;

            if (hamburgerBtn && sideMenu && closeMenu) {
                hamburgerBtn.addEventListener('click', () => {
                    try {
                        this.openSideMenu();
                    } catch (error) {
                        ErrorHandler.logError(error, 'UIController.bindMenuEvents - hamburgerBtn click');
                    }
                });

                closeMenu.addEventListener('click', () => {
                    try {
                        this.closeSideMenu();
                    } catch (error) {
                        ErrorHandler.logError(error, 'UIController.bindMenuEvents - closeMenu click');
                    }
                });
            }
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.bindMenuEvents');
            throw error;
        }
    },

    bindModalEvents() {
        try {
            const { searchBtn, searchModal, searchModalBtn, closeSearch, searchModalBg } = this.elements;

            if (searchBtn && searchModal) {
                searchBtn.addEventListener('click', () => {
                    try {
                        this.openSearchModal();
                    } catch (error) {
                        ErrorHandler.logError(error, 'UIController.bindModalEvents - searchBtn click');
                    }
                });
            }

            if (searchModalBtn) {
                searchModalBtn.addEventListener('click', () => {
                    try {
                        this.performSearch();
                    } catch (error) {
                        ErrorHandler.logError(error, 'UIController.bindModalEvents - searchModalBtn click');
                    }
                });
            }

            if (closeSearch) {
                closeSearch.addEventListener('click', () => {
                    try {
                        this.closeSearchModal();
                    } catch (error) {
                        ErrorHandler.logError(error, 'UIController.bindModalEvents - closeSearch click');
                    }
                });
            }

            if (searchModalBg) {
                searchModalBg.addEventListener('click', () => {
                    try {
                        this.closeSearchModal();
                    } catch (error) {
                        ErrorHandler.logError(error, 'UIController.bindModalEvents - searchModalBg click');
                    }
                });
            }
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.bindModalEvents');
            throw error;
        }
    },

    bindCategoryEvents() {
        try {
            this.elements.categoryBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    try {
                        const category = btn.textContent?.trim();
                        if (!category) {
                            ErrorHandler.logError(new Error('Empty category text'), 'UIController.bindCategoryEvents');
                            return;
                        }
                        const mappedCategory = CONFIG.CATEGORY_MAP[category] || category.toLowerCase();
                        NewsApp.loadNewsByCategory(mappedCategory);
                        this.closeSideMenu();
                    } catch (error) {
                        ErrorHandler.logError(error, 'UIController.bindCategoryEvents - category click');
                        ErrorHandler.showGeneralError();
                    }
                });
            });
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.bindCategoryEvents');
            throw error;
        }
    },

    bindKeyboardEvents() {
        try {
            document.addEventListener('keydown', (e) => {
                try {
                    if (e.key === 'Escape') {
                        this.closeSearchModal();
                    }
                } catch (error) {
                    ErrorHandler.logError(error, 'UIController.bindKeyboardEvents - keydown');
                }
            });
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.bindKeyboardEvents');
            throw error;
        }
    },

    openSideMenu() {
        try {
            const { sideMenu, hamburgerBtn } = this.elements;
            if (sideMenu && hamburgerBtn) {
                sideMenu.classList.add('active');
                hamburgerBtn.style.display = 'none';
            }
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.openSideMenu');
        }
    },

    closeSideMenu() {
        try {
            const { sideMenu, hamburgerBtn } = this.elements;
            if (sideMenu && hamburgerBtn) {
                sideMenu.classList.remove('active');
                hamburgerBtn.style.display = 'flex';
            }
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.closeSideMenu');
        }
    },

    openSearchModal() {
        try {
            const { searchModal, searchInput } = this.elements;
            if (searchModal) {
                searchModal.classList.add('active');
                setTimeout(() => {
                    try {
                        if (searchInput) searchInput.focus();
                    } catch (focusError) {
                        ErrorHandler.logError(focusError, 'UIController.openSearchModal - focus');
                    }
                }, 100);
            }
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.openSearchModal');
        }
    },

    closeSearchModal() {
        try {
            const { searchModal } = this.elements;
            if (searchModal) {
                searchModal.classList.remove('active');
            }
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.closeSearchModal');
        }
    },

    performSearch() {
        try {
            const { searchInput } = this.elements;
            if (searchInput) {
                const keyword = searchInput.value.trim();
                if (keyword) {
                    NewsApp.performSearch(keyword);
                    this.closeSearchModal();
                } else {
                    ErrorHandler.logError(new Error('Empty search keyword'), 'UIController.performSearch');
                }
            }
        } catch (error) {
            ErrorHandler.logError(error, 'UIController.performSearch');
        }
    }
};

// ====== 메인 애플리케이션 컨트롤러 ======
const NewsApp = {
    newsList: [],

    async init() {
        try {
            await this.loadLatestNews();
            UIController.init();
        } catch (error) {
            ErrorHandler.logError(error, 'NewsApp.init');
            ErrorHandler.showGeneralError();
        }
    },

    async loadLatestNews(options = {}) {
        try {
            // 입력 검증
            if (options && typeof options !== 'object') {
                throw new Error('Invalid options parameter');
            }

            this.newsList = await NewsAPI.getLatestNews(options);
            
            if (!Array.isArray(this.newsList)) {
                throw new Error('Invalid news data received');
            }

            NewsRenderer.renderNewsList(this.newsList);
        } catch (error) {
            this.handleError(error, 'NewsApp.loadLatestNews');
        }
    },

    async performSearch(keyword) {
        try {
            // 입력 검증
            if (typeof keyword !== 'string') {
                ErrorHandler.logError(new Error('Invalid keyword type'), 'NewsApp.performSearch');
                return;
            }

            const trimmedKeyword = keyword.trim();
            
            if (!trimmedKeyword) {
                await this.loadLatestNews();
                return;
            }

            // 검색어 길이 체크 (너무 짧거나 긴 경우)
            if (trimmedKeyword.length < 2) {
                ErrorHandler.showUserError('검색어는 2글자 이상 입력해주세요.');
                return;
            }

            if (trimmedKeyword.length > 100) {
                ErrorHandler.showUserError('검색어가 너무 깁니다. 100글자 이하로 입력해주세요.');
                return;
            }
            
            this.newsList = await NewsAPI.getNewsBySearch(trimmedKeyword);
            
            if (!Array.isArray(this.newsList)) {
                throw new Error('Invalid search results received');
            }

            NewsRenderer.renderNewsList(this.newsList);
        } catch (error) {
            this.handleError(error, 'NewsApp.performSearch', 'search');
        }
    },

    async loadNewsByCategory(category) {
        try {
            // 입력 검증
            if (!category || typeof category !== 'string') {
                ErrorHandler.logError(new Error('Invalid category parameter'), 'NewsApp.loadNewsByCategory');
                ErrorHandler.showUserError('올바르지 않은 카테고리입니다.');
                return;
            }

            const trimmedCategory = category.trim().toLowerCase();
            
            // 허용된 카테고리인지 확인
            const allowedCategories = Object.values(CONFIG.CATEGORY_MAP);
            if (!allowedCategories.includes(trimmedCategory)) {
                ErrorHandler.logError(new Error(`Invalid category: ${trimmedCategory}`), 'NewsApp.loadNewsByCategory');
                ErrorHandler.showUserError('지원하지 않는 카테고리입니다.');
                return;
            }

            this.newsList = await NewsAPI.getNewsByCategory(trimmedCategory);
            
            if (!Array.isArray(this.newsList)) {
                throw new Error('Invalid category news data received');
            }

            NewsRenderer.renderNewsList(this.newsList);
        } catch (error) {
            this.handleError(error, 'NewsApp.loadNewsByCategory', 'category');
        }
    },

    // 중앙화된 에러 처리
    handleError(error, context, type = 'general') {
        ErrorHandler.logError(error, context);
        
        if (error.message.includes('네트워크') || error.message.includes('연결')) {
            ErrorHandler.showNetworkError();
        } else if (error.message.includes('시간') || error.message.includes('timeout')) {
            const timeoutMessages = {
                search: '검색 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
                category: '카테고리 뉴스 로드 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
                general: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
            };
            ErrorHandler.showUserError(timeoutMessages[type]);
        } else {
            const errorMessages = {
                search: '검색 중 문제가 발생했습니다. 다른 검색어로 시도해보세요.',
                category: '카테고리 뉴스를 불러오는 중 문제가 발생했습니다.',
                general: '뉴스를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해보세요.'
            };
            
            if (type === 'search') {
                ErrorHandler.showSearchError();
            } else if (type === 'general') {
                ErrorHandler.showApiError();
            } else {
                ErrorHandler.showUserError(errorMessages[type]);
            }
        }
        
        this.newsList = [];
        NewsRenderer.showEmptyState();
    }
};

// ====== 애플리케이션 시작 ======
document.addEventListener('DOMContentLoaded', () => {
    try {
        NewsApp.init();
    } catch (error) {
        ErrorHandler.logError(error, 'Application startup');
        ErrorHandler.showGeneralError();
    }
});