// ↓ 새로 배포한 구글 웹 앱 URL을 넣으세요!
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyDhHHndI_ATLh_dhQtGvm-bOetDuq4HeSZ4TzkbVQZX_huNuAg2qmCvIGvFiS8H0fp/exec";
const STORAGE_KEY = "cresol_apply_draft";

// ===== 지원서 마감일 설정 =====
// 다음 기수 모집 시 아래 날짜(연·월·일)만 변경하면 됩니다.
// 예) 2027년 9월 15일 23:59:59 마감 → new Date("2027-09-15T23:59:59")
// T23:59:59는 해당 날짜 밤 11시 59분 59초까지 접수를 허용합니다.
const DEADLINE = new Date("2026-08-20T23:59:59"); // 8월 20일 자정(23:59:59) 마감

const form = document.getElementById("apply-form");
const applyContent = document.getElementById("apply-content");
const successMessage = document.getElementById("success-message");
const btnComplete = document.getElementById("btn-complete");
const submitBtn = document.getElementById("submit-btn");
const photoInput = document.getElementById("photoInput");
const photoUploadBoxSpan = document.querySelector(".photo-upload-box span");

let photoData = { base64: "", name: "" };

// 페이지 로드 시 초기화
window.addEventListener("DOMContentLoaded", () => {
  initBirthSelects();             // 1. 생년월일 드롭다운 옵션 생성
  initActivityButton();           // 2. 교내/대외활동 추가 버튼 이벤트 연결
  restoreDraft();                 // 3. 임시저장 불러오기

  if (btnComplete) {
    btnComplete.addEventListener("click", () => {
      location.href = "index.html";
    });
  }
});

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

// ===== 7. 제출 완료 화면 전환 =====
function showSuccessScreen() {
  if (applyContent) applyContent.style.display = "none";
  if (successMessage) {
    successMessage.hidden = false;
    successMessage.classList.add("is-visible");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== 8. 폼 제출 처리 =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 마감 기한 초과 시 제출 차단 (DEADLINE 상수만 변경하면 다음 기수에도 재사용 가능)
  if (new Date() > DEADLINE) {
    alert("모집 기간이 마감되었습니다.");
    return;
  }

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

    localStorage.removeItem(STORAGE_KEY);
    showSuccessScreen();

  } catch (error) {
    console.error("제출 에러:", error);
    alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "제출하기";
  }
});
