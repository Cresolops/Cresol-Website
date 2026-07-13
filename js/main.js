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

function initFaq() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");

      item.closest(".faq-list")
        ?.querySelectorAll(".faq-item")
        .forEach((el) => el.classList.remove("open"));

      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

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
