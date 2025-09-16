
/*
과제명: 뉴스 만들기 사이트 (누나타임즈)
제출자: [이름/학번 입력]
제출일: 2025-09-16

※ 제출용 안내 ※
 - 제출 시 반드시 아래 API 주소를 사용해야 합니다.
     https://noona-times-be-5ca9402f90d9.herokuapp.com/
 - 지원 기능:
     1. 키워드 검색: ?q=키워드
     2. 페이지네이션: ?page=숫자&pageSize=숫자
     3. 카테고리: ?category=카테고리명
     (카테고리: business, entertainment, general, health, science, technology, sports)
     예시: /top-headlines?q=아이유&page=1&pageSize=20&category=science
*/

const BASE_URL = 'https://noona-times-be-5ca9402f90d9.herokuapp.com';

// 동적으로 url을 생성하는 함수
function makeNewsUrl({q, page, pageSize, category} = {}) {
        const url = new URL(BASE_URL + '/top-headlines');
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
    // API 구조에 따라 articles 또는 data 자체가 배열일 수 있음
    newsList = data.articles || data;
    render();
};


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

getLatestNews();

document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.getElementById("hamburger-btn");
    const sideMenu = document.getElementById("side-menu");
    const closeMenu = document.getElementById("close-menu");
    if (hamburger && sideMenu && closeMenu) {
        hamburger.addEventListener("click", function() {
            sideMenu.classList.add("active");
        });
        closeMenu.addEventListener("click", function() {
            sideMenu.classList.remove("active");
        });
        // 바깥 클릭 시 닫기
        sideMenu.addEventListener("click", function(e) {
            if (e.target === sideMenu) {
                sideMenu.classList.remove("active");
            }
        });
    }
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


