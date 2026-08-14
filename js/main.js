document.addEventListener("DOMContentLoaded", () => {
  // 공통 기능 및 페이지 초기화 실행
  initMobileNav();
  initFaq();
  initProjectPage();
  initVisionCarousel();
  initEmailCopy(); // 💡 이메일 복사 모달 기능 추가
});

// 1. 모바일 네비게이션 제어
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

// 2. FAQ 아코디언 및 탭 제어
function initFaq() {
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

  const questions = document.querySelectorAll(".faq-question");
  questions.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (window.innerWidth <= 768) return;
      const item = this.closest(".faq-item");
      const isOpen = item.classList.contains("open");

      const parentList = item.closest(".faq-list");
      if (parentList) {
        parentList.querySelectorAll(".faq-item").forEach((el) => {
          el.classList.remove("open");
        });
      }

      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

// 3. 프로젝트 페이지 제어 및 상세페이지 데이터 바인딩
const ITEMS_PER_PAGE = 12;

function initProjectPage() {
  const grid = document.getElementById("project-grid");
  const pagination = document.getElementById("pagination");

  const filterSelect = document.getElementById("filter");
  const filterBtn = document.getElementById("cohort-filter-btn");
  const selectedValue = filterBtn?.querySelector(".selected-value");
  const dropdown = document.getElementById("cohort-dropdown");
  const options = dropdown?.querySelectorAll("li");

  // 상세 페이지 데이터 연결
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  if (document.querySelector(".detail-title") && typeof PROJECTS !== "undefined") {
    const project = PROJECTS.find((p) => p.id === projectId);

    if (!project) {
      alert("존재하지 않는 프로젝트입니다.");
      window.location.href = "project.html";
      return;
    }

    const titleEl = document.querySelector(".detail-title");
    const descEl = document.querySelector(".detail-desc");
    const cohortEl = document.querySelector(".detail-cohort");
    const membersEl = document.querySelector(".detail-members");
    const galleryEl = document.getElementById("detail-gallery");
    const galleryWrapper = document.querySelector(".detail-gallery-wrapper");

    if (titleEl) titleEl.textContent = project.title;
    if (descEl) descEl.textContent = project.fulldesc || project.desc;
    if (cohortEl) cohortEl.textContent = `${project.cohort}기`;
    if (membersEl) membersEl.textContent = project.members || "팀원 정보 없음";

    if (galleryEl && project.images && project.images.length > 0) {
      galleryEl.innerHTML = project.images
        .map((imgSrc) => `<img src="${imgSrc}" alt="${project.title} 이미지">`)
        .join("");
    }

    if (galleryWrapper) {
      galleryWrapper.addEventListener("wheel", (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          galleryWrapper.scrollLeft += e.deltaY * 2.5;
        }
      }, { passive: false });
    }
  }

  if (!grid || typeof PROJECTS === "undefined") return;

  let currentFilter = "all";
  let currentPage = 1;

  if (filterBtn && filterSelect) {
    filterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = filterSelect.classList.toggle("open");
      filterBtn.setAttribute("aria-expanded", isOpen);
    });

    document.addEventListener("click", (e) => {
      if (filterSelect && !filterSelect.contains(e.target)) {
        filterSelect.classList.remove("open");
        filterBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  options?.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");
      if (selectedValue) selectedValue.textContent = option.textContent;

      const value = option.getAttribute("data-value") || "all";
      currentFilter = value;
      currentPage = 1;

      render();

      filterSelect?.classList.remove("open");
      filterBtn?.setAttribute("aria-expanded", "false");
    });
  });

  function getFiltered() {
    if (currentFilter === "all") return PROJECTS;
    return PROJECTS.filter((p) => String(p.cohort) === String(currentFilter));
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
        <a href="project-detail.html?id=${p.id}" class="project-card-link" style="text-decoration: none; color: inherit;">
          <article class="project-card" data-cohort="${p.cohort}">
            <div class="project-cover">
              ${p.cover ? `<img src="${p.cover}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;">` : ''}
            </div>
            <div class="project-body">
              <span class="project-cohort">${p.cohort}기</span>
              <h3 class="project-name">${p.title}</h3>
              <p class="project-desc">${p.desc}</p>
            </div>
          </article>
        </a>`
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

  render();
}

// 4. 비전 캐러셀 제어 (Swiper 적용)
function initVisionCarousel() {
  const container = document.querySelector(".value-carousel");
  if (!container) return;

  new Swiper(".value-carousel", {
    loop: true,                 // 무한 루프
    centeredSlides: true,       // 활성 슬라이드를 중앙에 배치
    slidesPerView: 1.5,         // 모바일에서는 중앙 카드 + 양옆 카드의 끝부분만 살짝 보이게
    spaceBetween: 20,           // 카드 간격
    speed: 800,                 // 넘어가고 커지는 효과를 더 부드럽고 자연스럽게 (요청사항 1번)
    
    // 오른쪽에서 왼쪽으로 특정 시간에 따라 알아서 넘어가도록 설정 (요청사항 3번)
    autoplay: {
      delay: 3000,              // 3초(3000ms)마다 자동으로 다음 슬라이드로 이동
      disableOnInteraction: false, // 사용자가 클릭하거나 터치해도 자동 재생 유지
    },
    
    // 카드를 클릭하면 그 카드가 중앙으로 부드럽게 이동 (요청사항 4번)
    slideToClickedSlide: true,  
    
    breakpoints: {
      // 768px 이상 (PC/태블릿)에서는 두 번째 사진처럼 3개의 카드를 동시에 보여줌
      768: {
        slidesPerView: 3,
        spaceBetween: 30,
      }
    }
  });
}

// 5. 이메일 주소 클립보드 복사 & 커스텀 모달 알림창
function initEmailCopy() {
  const emailBtn = document.getElementById("email-copy-btn");
  const alertModal = document.getElementById("custom-alert");
  const closeBtn = document.getElementById("custom-alert-close");
  const emailAddress = "cresol_@naver.com";

  if (!emailBtn || !alertModal || !closeBtn) return;

  // 메일 버튼 클릭 이벤트
  emailBtn.addEventListener("click", () => {
    // 1) 클립보드 복사
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(emailAddress);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = emailAddress;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    // 2) 커스텀 알림창 띄우기
    alertModal.style.display = "flex";
  });

  // '확인' 버튼 클릭 시 모달 닫기
  closeBtn.addEventListener("click", () => {
    alertModal.style.display = "none";
  });

  // 모달 어두운 배경 영역 클릭 시 닫기
  alertModal.addEventListener("click", (e) => {
    if (e.target === alertModal) {
      alertModal.style.display = "none";
    }
  });
}