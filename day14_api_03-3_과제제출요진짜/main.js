// 상단 인풋창+돋보기 검색 이벤트 연결
document.addEventListener("DOMContentLoaded", function() {
    const searchBarInput = document.getElementById('search-bar-input');
    const searchBarBtn = document.getElementById('search-bar-btn');
    if (searchBarInput && searchBarBtn) {
        searchBarBtn.addEventListener('click', function() {
            const keyword = searchBarInput.value.trim();
            searchNewsByKeyword(keyword);
        });
        searchBarInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const keyword = searchBarInput.value.trim();
                searchNewsByKeyword(keyword);
            }
        });
    }
});
// ====== [과제 연습용: newsapi.org] ======

// ====== [연습용: newsapi.org] ======
// ====== [과제 제출용: 프록시 서버] ======
const BASE_URL = `https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines`;
// 동적으로 url을 생성하는 함수 (프록시 서버용)
function makeNewsUrl({q, page, pageSize, category} = {}) {
    const url = new URL(BASE_URL);
    if (q) url.searchParams.set('q', q);
    if (page) url.searchParams.set('page', page);
    if (pageSize) url.searchParams.set('pageSize', pageSize);
    if (category) url.searchParams.set('category', category);
    return url;
}
let newsList = [];
// 기본 뉴스 불러오기 (최신 뉴스)
const getLatestNews = async (options = {}) => {
    const url = makeNewsUrl(options);
    const response = await fetch(url);
    const data = await response.json();
    newsList = data.articles || [];
    render();
};

// 검색어로 뉴스 가져오기 (news-board에 렌더)
async function searchNewsByKeyword(keyword) {
    if (!keyword) {
        // 검색어 없으면 최신 뉴스
        await getLatestNews();
        return;
    }
    await getLatestNews({ q: keyword });
    // 검색 후 입력창 비우기
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    // 검색 결과 없을 때 안내
    if (!newsList || newsList.length === 0) {
        document.getElementById("news-board").innerHTML = '<div style="padding:40px 0;text-align:center;color:#888;font-size:1.3em;">검색 결과가 없습니다.</div>';
    }
}


function timeAgo(dateString) {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
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
}

const render = () => {
    const newsHTML = newsList.map((news) => {
        let desc = news.description;
        if (!desc) desc = '내용없음';
        if (desc.length > 200) desc = desc.slice(0, 200) + '...';
        let imgSrc = news.urlToImage ? news.urlToImage : '';
        // 이미지가 없으면 no image div, 이미지가 있지만 깨지면 onerror로 대체
        let imgTag = '';
        if (!imgSrc) {
            imgTag = '<div class="news-img-size no-image">no image</div>';
        } else {
            imgTag = `<img class="news-img-size" src="${imgSrc}" onerror="this.onerror=null;this.src='';this.classList.add('no-image');this.alt='no image';this.style.background='#f0f0f0';this.style.color='#888';this.style.display='flex';this.style.alignItems='center';this.style.justifyContent='center';this.value='no image';" alt="no image"/>`;
        }
        let sourceName = (news.source && news.source.name) ? news.source.name : 'no source';
        let published = news.publishedAt ? timeAgo(news.publishedAt) : '';
        return `
        <div class="row news">
            <div class="col-lg-4">
                ${imgTag}
            </div>
            <div class="col-lg-8">
                <h2>${news.title}</h2>
                <p>
                    ${desc}
                </p>
                <div>
                    ${sourceName} * ${published}
                </div>
            </div>
        </div>
        `;
    }).join("");
    document.getElementById("news-board").innerHTML = newsHTML;
};



// DOMContentLoaded에서 검색 모달 인풋 이벤트 연결

document.addEventListener("DOMContentLoaded", function() {
    // 검색 모달 인풋
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                searchNewsByKeyword(keyword);
                // 모달 닫기 등 추가 동작
            }
        });
    }

    const hamburger = document.getElementById("hamburger-btn");
    const sideMenu = document.getElementById("side-menu");
    const closeMenu = document.getElementById("close-menu");
    if (hamburger && sideMenu && closeMenu) {
        hamburger.addEventListener("click", function() {
            sideMenu.classList.add("active");
            hamburger.style.display = "none";
        });
        closeMenu.addEventListener("click", function() {
            sideMenu.classList.remove("active");
            hamburger.style.display = "flex";
        });
        // 사이드바 바깥 클릭 시 닫기 기능 제거 (내부 클릭해도 닫히지 않게)
    }
    // 모든 카테고리 버튼(사이드+메인)에 클릭 이벤트 등록
    const allCategoryBtns = document.querySelectorAll('.side-menus button, section .menus button');
    // 한글-영문 카테고리 매핑
    const categoryMap = {
        '사업': 'business',
        '오락': 'entertainment',
        '일반': 'general',
        '건강': 'health',
        '과학': 'science',
        '스포츠': 'sports',
        '기술': 'technology',
        'business': 'business',
        'entertainment': 'entertainment',
        'general': 'general',
        'health': 'health',
        'science': 'science',
        'sports': 'sports',
        'technology': 'technology'
    };
    allCategoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            let category = btn.textContent.trim();
            category = categoryMap[category] || category.toLowerCase();
            getLatestNews({ category });
            if (sideMenu) sideMenu.classList.remove("active");
            if (hamburger) hamburger.style.display = "flex";
        });
    });

    // 검색 모달 관련
    const searchBtn = document.getElementById("search-btn");
    const searchModal = document.getElementById("search-modal");
    const closeSearch = document.getElementById("close-search");
    const searchBg = document.querySelector(".search-modal-bg");
    if (searchBtn && searchModal && closeSearch && searchBg) {
        searchBtn.addEventListener("click", function() {
            searchModal.classList.add("active");
            setTimeout(() => {
                document.getElementById("search-input").focus();
            }, 100);
        });
        closeSearch.addEventListener("click", function() {
            searchModal.classList.remove("active");
        });
        searchBg.addEventListener("click", function() {
            searchModal.classList.remove("active");
        });
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") searchModal.classList.remove("active");
        });
    }
});

// 페이지 로드시 최신 뉴스도 기존처럼 불러오기 (news-board용)
getLatestNews();

// (중복 제거됨)

// 카테고리별 뉴스 가져오기 예시 함수
// 사용 예: getCategoryNews('business');
function getCategoryNews(category) {
    getLatestNews({ category });
}
// 그뉴스를 보여주기: render() 함수가 newsList를 화면에 출력합니다.
// getCategoryNews('business') 또는 getLatestNews({category: 'business'}) 호출 시 자동으로 render()가 실행되어 뉴스가 보입니다.