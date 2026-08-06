// ↓ 새로 배포한 구글 웹 앱 URL을 넣으세요!
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyDhHHndI_ATLh_dhQtGvm-bOetDuq4HeSZ4TzkbVQZX_huNuAg2qmCvIGvFiS8H0fp/exec";
const STORAGE_KEY = "cresol_apply_draft";

const form = document.getElementById("apply-form");
const submitBtn = document.getElementById("submit-btn");
const photoInput = document.getElementById("photoInput");
const photoUploadBoxSpan = document.querySelector(".photo-upload-box span");

let photoData = { base64: "", name: "" };

// 페이지 로드 시 초기화
window.addEventListener("DOMContentLoaded", () => {
  initBirthSelects();             // 1. 생년월일 드롭다운 옵션 생성
  initActivityButton();           // 2. 교내/대외활동 추가 버튼 이벤트 연결
  handleInterviewTableResponsive(); // 3. 면접 시간 표 반응형 초기화
  restoreDraft();                 // 4. 임시저장 불러오기
});

// 화면 크기 변경 시 면접 표 반응형 처리
window.addEventListener("resize", handleInterviewTableResponsive);

// 폼 입력 시 자동 저장
form.addEventListener("input", saveDraft);

// ===== 1. 생년월일 옵션 자동 생성 =====
function initBirthSelects() {
  const yearSelect = document.querySelector("select[name='birthYear']");
  const monthSelect = document.querySelector("select[name='birthMonth']");
  const daySelect = document.querySelector("select[name='birthDay']");

  if (!yearSelect || !monthSelect || !daySelect) return;

  yearSelect.innerHTML = '<option value="">년도</option>';
  monthSelect.innerHTML = '<option value="">월</option>';
  daySelect.innerHTML = '<option value="">일</option>';

  for (let y = 2026; y >= 1950; y--) {
    yearSelect.innerHTML += `<option value="${y}년">${y}년</option>`;
  }
  for (let m = 1; m <= 12; m++) {
    monthSelect.innerHTML += `<option value="${m}월">${m}월</option>`;
  }
  for (let d = 1; d <= 31; d++) {
    daySelect.innerHTML += `<option value="${d}일">${d}일</option>`;
  }

  const selects = [yearSelect, monthSelect, daySelect];
  
  selects.forEach((select) => {
    if (!select.value) {
      select.classList.add("is-placeholder");
    }

    select.addEventListener("change", () => {
      if (!select.value) {
        select.classList.add("is-placeholder");
      } else {
        select.classList.remove("is-placeholder");
      }
    });
  });
}

// ===== 2. 교내/대외활동 행 추가 버튼 =====
function initActivityButton() {
  const addBtn = document.querySelector(".btn-add");
  const activityTable = document.querySelector(".activity-table");

  if (!addBtn || !activityTable) return;

  addBtn.addEventListener("click", () => {
    const newRow = document.createElement("div");
    newRow.className = "activity-row";
    newRow.innerHTML = `
      <input type="text" class="form-input date-input" placeholder="기간을 입력해 주세요.">
      <input type="text" class="form-input" placeholder="활동 내용을 입력해 주세요.">
      <input type="text" class="form-input" placeholder="활동 기관을 입력해 주세요.">
    `;
    activityTable.insertBefore(newRow, addBtn);
  });
}

// ===== 3. 증명사진 첨부 처리 =====
if (photoInput) {
  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("사진 용량은 5MB 이하만 가능합니다.");
      photoInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      photoData.base64 = event.target.result;
      photoData.name = file.name;
      if (photoUploadBoxSpan) photoUploadBoxSpan.innerHTML = "✔<br>첨부 완료";
    };
    reader.readAsDataURL(file);
  });
}

// ===== 4. 자동 저장 / 불러오기 =====
function saveDraft() {
  const rawData = {};
  const formData = new FormData(form);

  for (let [key, value] of formData.entries()) {
    if (!rawData[key]) {
      rawData[key] = formData.getAll(key);
    }
  }

  const activityInputs = Array.from(document.querySelectorAll('.activity-row input')).map(i => i.value);
  rawData._activities = activityInputs;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(rawData));
}

function restoreDraft() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const rawData = JSON.parse(saved);

  Array.from(form.elements).forEach(el => {
    if (!el.name) return;
    const values = rawData[el.name];
    if (!values) return;

    if (el.type === 'checkbox' || el.type === 'radio') {
      el.checked = values.includes(el.value);
    } else if (el.type !== 'file') {
      el.value = values[0] || '';
    }
  });

  if (rawData._activities && Array.isArray(rawData._activities)) {
    const activityTable = document.querySelector('.activity-table');
    const addBtn = document.querySelector('.btn-add');
    if (!activityTable || !addBtn) return;

    const requiredRows = Math.ceil(rawData._activities.length / 3);
    let currentRows = document.querySelectorAll('.activity-row').length;

    while (currentRows < requiredRows) {
      const newRow = document.createElement('div');
      newRow.className = 'activity-row';
      newRow.innerHTML = `
        <input type="text" class="form-input date-input" placeholder="기간을 입력해 주세요.">
        <input type="text" class="form-input" placeholder="활동 내용을 입력해 주세요.">
        <input type="text" class="form-input" placeholder="활동 기관을 입력해 주세요.">
      `;
      activityTable.insertBefore(newRow, addBtn);
      currentRows++;
    }

    const activityInputs = document.querySelectorAll('.activity-row input');
    activityInputs.forEach((input, index) => {
      input.value = rawData._activities[index] || '';
    });
  }
}

// ===== 5. 데이터 수집 및 정제 =====
function collectFormData() {
  const formData = new FormData(form);
  const data = {};

  data.privacyAgree = formData.get("privacyAgree") ? "동의함" : "미동의";
  data.name = formData.get("name") || "";
  
  data.birthYear = formData.get("birthYear") || "";
  data.birthMonth = formData.get("birthMonth") || "";
  data.birthDay = formData.get("birthDay") || "";
  data.birth = `${data.birthYear} ${data.birthMonth} ${data.birthDay}`.trim();

  data.university = formData.get("university") || "";
  data.major = formData.get("major") || "";
  data.phone = formData.get("phone") || "";
  data.address = formData.get("address") || "";
  data.route = formData.get("route") || "";

  data.q1 = formData.get("q1") || "";
  data.q2 = formData.get("q2") || "";
  data.q3 = formData.get("q3") || "";
  data.q4 = formData.get("q4") || "";
  data.portfolioLink = formData.get("portfolioLink") || "";

  // 프로그램 활용 능력 (기타 입력값 정제 포함)
  const selectedSkills = formData.getAll("skill");
  const skillOtherInput = formData.get("skillOther") || "";
  
  const formattedSkills = selectedSkills.map(skill => {
    if (skill === "기타" && skillOtherInput.trim() !== "") {
      return `기타(${skillOtherInput.trim()})`;
    }
    return skill;
  });
  data.skills = formattedSkills.join(", ");

  data.interviews = formData.getAll("interview").join(", ");

  const activityRows = document.querySelectorAll('.activity-row');
  let activities = [];
  activityRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (inputs[0].value || inputs[1].value || inputs[2].value) {
      activities.push(`[${inputs[0].value}] ${inputs[1].value} - ${inputs[2].value}`);
    }
  });
  data.activities = activities.length > 0 ? activities.join("\n") : "";

  data.photoBase64 = photoData.base64;
  data.photoName = photoData.name;

  return data;
}

// ===== 6. 유효성 검사 =====
function validateForm(data) {
  if (data.privacyAgree === "미동의") return "개인정보 활용 동의에 체크해 주세요.";
  if (!data.photoBase64) return "증명사진을 첨부해 주세요.";
  if (!data.name.trim()) return "이름을 입력해 주세요.";
  if (!data.birthYear || !data.birthMonth || !data.birthDay) return "생년월일(년, 월, 일)을 모두 선택해 주세요.";
  if (!data.university.trim()) return "학교를 입력해 주세요.";
  if (!data.major.trim()) return "학과/학년을 입력해 주세요.";
  if (!data.phone.trim()) return "핸드폰 번호를 입력해 주세요.";
  if (!data.address.trim()) return "주소를 입력해 주세요.";
  if (!data.route) return "인지 경로를 선택해 주세요.";
  if (!data.q1.trim()) return "지원서 질문 1번을 작성해 주세요.";
  if (!data.q2.trim()) return "지원서 질문 2번을 작성해 주세요.";
  if (!data.q3.trim()) return "지원서 질문 3번을 작성해 주세요.";
  if (!data.q4.trim()) return "지원서 질문 4번을 작성해 주세요.";
  if (!data.skills) return "프로그램 활용 능력을 최소 1개 이상 선택해 주세요.";
  if (!data.interviews) return "참여 가능한 면접 날짜를 최소 1개 이상 선택해 주세요.";

  return null;
}

// ===== 7. 폼 제출 처리 =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = collectFormData();
  const errorMessage = validateForm(payload);

  if (errorMessage) {
    alert(errorMessage);
    return;
  }

  if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("여기에_복사한")) {
    alert("구글 앱스 스크립트 웹 앱 URL을 먼저 설정해 주세요.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "제출 중...";

  try {
    await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    alert("지원서가 성공적으로 제출되었습니다!");
    localStorage.removeItem(STORAGE_KEY);
    form.reset();

    photoData = { base64: "", name: "" };
    if (photoUploadBoxSpan) photoUploadBoxSpan.innerHTML = "+<br>증명사진 첨부";

  } catch (error) {
    console.error("제출 에러:", error);
    alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "제출하기";
  }
});

// ===== 8. 면접 날짜 표 반응형 행/열 전환 함수 =====
function handleInterviewTableResponsive() {
  const table = document.querySelector('.interview-table');
  if (!table) return;

  const isMobile = window.innerWidth <= 768;
  const currentMode = table.getAttribute('data-responsive-mode');

  // 1) 최초 진입 시 모드 판별
  if (!currentMode) {
    if (!isMobile) {
      // PC 모드에서는 원본 표(시간=열, 요일=행) 그대로 사용
      table.setAttribute('data-responsive-mode', 'desktop');
      return;
    } else {
      // 모바일 최초 진입 시 반전 수행
      table.setAttribute('data-responsive-mode', 'mobile');
    }
  } else {
    // 이미 현재 모드와 화면 설정이 일치하면 아무 작업 하지 않음
    if ((isMobile && currentMode === 'mobile') || (!isMobile && currentMode === 'desktop')) {
      return;
    }
  }

  // 2) 행과 열 반전 (Transpose)
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 0) return;

  const matrix = rows.map(row => Array.from(row.children));
  const rowCount = matrix.length;
  const colCount = matrix[0].length;

  const newTable = document.createElement('table');
  newTable.className = table.className;
  newTable.setAttribute('data-responsive-mode', isMobile ? 'mobile' : 'desktop');

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  for (let col = 0; col < colCount; col++) {
    const newTr = document.createElement('tr');
    for (let row = 0; row < rowCount; row++) {
      const cell = matrix[row][col].cloneNode(true);
      newTr.appendChild(cell);
    }
    if (col === 0) {
      thead.appendChild(newTr);
    } else {
      tbody.appendChild(newTr);
    }
  }

  newTable.appendChild(thead);
  newTable.appendChild(tbody);
  table.parentNode.replaceChild(newTable, table);
}