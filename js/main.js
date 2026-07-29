document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initFaq();
  initProjectPage();
});

function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll(".nav-item.has-dropdown > .nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        link.parentElement.classList.toggle("dropdown-open");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // 1. FAQ 탭 전환 (지원 / 활동 / 수료)
  const tabs = document.querySelectorAll(".faq-tab");
  const panels = document.querySelectorAll(".faq-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      panels.forEach((panel) => {
        if (panel.getAttribute("data-panel") === targetTab) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });
    });
  });

  // 2. FAQ 질문 클릭 시 답변 열기/닫기 (아코디언)
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach((btn) => {
    btn.addEventListener("click", function () {
      const item = this.closest(".faq-item");
      
      // 현재 클릭한 항목이 열려있는지 확인
      const isOpen = item.classList.contains("open");

      // 동일한 탭 안에 있는 다른 질문들을 모두 닫음
      const parentList = item.closest(".faq-list");
      if (parentList) {
        parentList.querySelectorAll(".faq-item").forEach((el) => {
          el.classList.remove("open");
        });
      }

      // 클릭한 질문만 열기 (이미 열려있었다면 닫힘)
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
});

const PROJECTS = [
  { id: 1, cohort: 16, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 2, cohort: 16, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 3, cohort: 15, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 4, cohort: 15, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 5, cohort: 16, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 6, cohort: 15, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 7, cohort: 16, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 8, cohort: 15, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 9, cohort: 16, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 10, cohort: 15, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 11, cohort: 16, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 12, cohort: 15, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 13, cohort: 14, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 14, cohort: 14, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
  { id: 15, cohort: 14, title: "프로젝트명", desc: "설명을 적어두며 개별 프로젝트 페이지로 이동합니다. 최대 2줄로" },
];

const ITEMS_PER_PAGE = 12;

function initProjectPage() {
  const grid = document.getElementById("project-grid");
  const filter = document.getElementById("cohort-filter");
  const pagination = document.getElementById("pagination");

  if (!grid) return;

  let currentFilter = "all";
  let currentPage = 1;

  function getFiltered() {
    if (currentFilter === "all") return PROJECTS;
    return PROJECTS.filter((p) => p.cohort === Number(currentFilter));
  }

  function render() {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    grid.innerHTML = pageItems
      .map(
        (p) => `
      <article class="project-card" data-cohort="${p.cohort}">
        <div class="project-cover" aria-hidden="true"></div>
        <div class="project-body">
          <span class="project-cohort">${p.cohort}기</span>
          <h3 class="project-name">${p.title}</h3>
          <p class="project-desc">${p.desc}</p>
        </div>
      </article>`
      )
      .join("");

    if (pagination) {
      renderPagination(totalPages);
    }
  }

  function renderPagination(totalPages) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    pagination.innerHTML = `
      <button data-action="first" ${currentPage === 1 ? "disabled" : ""} aria-label="첫 페이지">&laquo;</button>
      <button data-action="prev" ${currentPage === 1 ? "disabled" : ""} aria-label="이전 페이지">&lsaquo;</button>
      ${pages
        .map(
          (n) =>
            `<button data-page="${n}" class="${n === currentPage ? "active" : ""}">${n}</button>`
        )
        .join("")}
      <button data-action="next" ${currentPage === totalPages ? "disabled" : ""} aria-label="다음 페이지">&rsaquo;</button>
      <button data-action="last" ${currentPage === totalPages ? "disabled" : ""} aria-label="마지막 페이지">&raquo;</button>
    `;

    pagination.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const page = btn.dataset.page;

        if (action === "first") currentPage = 1;
        else if (action === "prev") currentPage = Math.max(1, currentPage - 1);
        else if (action === "next") currentPage = Math.min(totalPages, currentPage + 1);
        else if (action === "last") currentPage = totalPages;
        else if (page) currentPage = Number(page);

        render();
        window.scrollTo({ top: grid.offsetTop - 100, behavior: "smooth" });
      });
    });
  }

  if (filter) {
    filter.addEventListener("change", () => {
      currentFilter = filter.value;
      currentPage = 1;
      render();
    });
  }

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  initVisionCarousel();
});

function initVisionCarousel() {
  const container = document.querySelector(".value-carousel");
  if (!container) return;

  let cards = Array.from(container.querySelectorAll(".value-card"));
  let timer = null;

  // 1. 카드의 위치와 active 상태 갱신 함수
  function updateCarousel() {
    // 768px 이하 모바일 화면일 때는 캐러셀 루프 동작 안 함
    if (window.innerWidth <= 768) {
      cards.forEach((card) => card.classList.remove("active"));
      return;
    }

    // 배열 순서대로 컨테이너에 다시 추가하여 DOM 순서 변경
    cards.forEach((card, index) => {
      container.appendChild(card);
      
      // 가운데(index 1) 카드에만 active 부여
      if (index === 1) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });
  }

  // 2. 다음 카드로 회전 (루프)
  function nextSlide() {
    if (window.innerWidth <= 768) return;
    // 맨 앞 카드를 꺼내 맨 뒤로 보냄
    const firstCard = cards.shift();
    cards.push(firstCard);
    updateCarousel();
  }

  // 3. 이전 카드로 회전
  function prevSlide() {
    if (window.innerWidth <= 768) return;
    // 맨 뒤 카드를 꺼내 맨 앞으로 보냄
    const lastCard = cards.pop();
    cards.unshift(lastCard);
    updateCarousel();
  }

  // 4. 8초 주기 타이머 시작
  function startAutoPlay() {
    stopAutoPlay();
    timer = setInterval(nextSlide, 8000); // 8000ms = 8초
  }

  function stopAutoPlay() {
    if (timer) clearInterval(timer);
  }

  // 5. 클릭 시 강제 전환 기능
  container.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) return;

    const clickedCard = e.target.closest(".value-card");
    if (!clickedCard) return;

    const clickedIndex = cards.indexOf(clickedCard);

    // 왼쪽(0번) 카드를 누르면 이전 장으로
    if (clickedIndex === 0) {
      prevSlide();
      startAutoPlay(); // 클릭 후 8초 타이머 리셋
    } 
    // 오른쪽(2번) 카드를 누르면 다음 장으로
    else if (clickedIndex === 2) {
      nextSlide();
      startAutoPlay(); // 클릭 후 8초 타이머 리셋
    }
  });

  // 초기화 실행
  updateCarousel();
  startAutoPlay();

  // 창 크기 변경 대응
  window.addEventListener("resize", () => {
    updateCarousel();
  });
}