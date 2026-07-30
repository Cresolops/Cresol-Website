// ↓ 새로 배포한 구글 웹 앱 URL을 넣으세요!
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw79WySv_yBwF_T6Inn0ZGe6kexDCHvVaqJdN3xiHh28KVZuuOECFHN4mqTHN4MWFJzhg/exec";
const STORAGE_KEY = "cresol_apply_draft";

const form = document.getElementById("apply-form");
const submitBtn = document.getElementById("submit-btn");
const photoInput = document.getElementById("photoInput");
const photoUploadBoxSpan = document.querySelector(".photo-upload-box span");

let photoData = { base64: "", name: "" };

// 페이지 로드 시 초기화
window.addEventListener("DOMContentLoaded", () => {
  initBirthSelects();   // 1. 생년월일 드롭다운 옵션 생성
  initActivityButton(); // 2. 교내/대외활동 추가 버튼 이벤트 연결
  restoreDraft();       // 임시저장 불러오기
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

  // 1990년 ~ 2010년 생성
  for (let y = 2026; y >= 1950; y--) {
    yearSelect.innerHTML += `<option value="${y}년">${y}년</option>`;
  }
  // 1월 ~ 12월 생성
  for (let m = 1; m <= 12; m++) {
    monthSelect.innerHTML += `<option value="${m}월">${m}월</option>`;
  }
  // 1일 ~ 31일 생성
  for (let d = 1; d <= 31; d++) {
    daySelect.innerHTML += `<option value="${d}일">${d}일</option>`;
  }
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

  data.skills = formData.getAll("skill").join(", ");
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

// ===== 6. 포트폴리오 제외 모든 입력값 유효성 검사 =====
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
  if (!data.activities.trim()) return "교내/대외활동 경험을 최소 1개 이상 입력해 주세요.";
  if (!data.q1.trim()) return "지원서 질문 1번을 작성해 주세요.";
  if (!data.q2.trim()) return "지원서 질문 2번을 작성해 주세요.";
  if (!data.q3.trim()) return "지원서 질문 3번을 작성해 주세요.";
  if (!data.q4.trim()) return "지원서 질문 4번을 작성해 주세요.";
  if (!data.skills) return "프로그램 활용 능력을 최소 1개 이상 선택해 주세요.";
  if (!data.interviews) return "참여 가능한 면접 날짜를 최소 1개 이상 선택해 주세요.";

  // 포트폴리오(data.portfolioLink)는 검사하지 않고 통과
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