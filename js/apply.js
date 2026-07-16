/**
 * ============================================================================
 * CRESOL 지원서 — Google 스프레드시트 연동 설정 가이드
 * ============================================================================
 *
 * [사전 준비]
 * 1. cresolops@gmail.com 계정으로 Google Drive에 접속합니다.
 * 2. 새 Google 스프레드시트를 만듭니다. (예: "CRESOL 지원서 응답")
 * 3. 1행에 아래와 같이 헤더(열 제목)를 입력합니다:
 *    | 제출일시 | 이름 | 이메일 | 전화번호 | 학교 | 학과 | 학년 | 지원구분 | 지원동기 | 활동경험 | 포트폴리오 |
 *
 * [Google Apps Script 작성]
 * 4. 스프레드시트 메뉴 → 확장 프로그램 → Apps Script
 * 5. 아래 코드를 붙여넣고 저장합니다:
 *
 *    function doPost(e) {
 *      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *      const data = JSON.parse(e.postData.contents);
 *      sheet.appendRow([
 *        new Date(),
 *        data.name,
 *        data.email,
 *        data.phone,
 *        data.university,
 *        data.major,
 *        data.grade,
 *        data.applyType,
 *        data.motivation,
 *        data.experience || '',
 *        data.portfolio || ''
 *      ]);
 *      return ContentService
 *        .createTextOutput(JSON.stringify({ success: true }))
 *        .setMimeType(ContentService.MimeType.JSON);
 *    }
 *
 * [Web App 배포]
 * 6. Apps Script 편집기 → 배포 → 새 배포
 * 7. 유형: "웹 앱" 선택
 * 8. 실행 계정: "나(cresolops@gmail.com)"
 * 9. 액세스 권한: "모든 사용자" (익명 사용자 포함)
 * 10. 배포 후 생성된 "웹 앱 URL"을 복사합니다.
 *
 * [URL 설정]
 * 11. 아래 GAS_WEB_APP_URL 변수에 복사한 URL을 붙여넣으세요.
 *
 * ※ 스크립트 수정 후에는 "새 버전으로 배포"해야 변경사항이 반영됩니다.
 * ※ 브라우저 CORS 이슈를 피하기 위해 Content-Type: text/plain 으로 POST합니다.
 * ============================================================================
 */

/** @type {string} Google Apps Script Web App URL — 배포 후 여기에 붙여넣기 */
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwDWUl4NUdZr3vpFBoJbzKQEQ6rhK9LkvVZgnss6ZhX8Hi8LOBwUvKOYi9Epj0gO_8W4A/exec";

const STORAGE_KEY = "cresol_apply_draft";

const form = document.getElementById("apply-form");
const autosaveStatus = document.getElementById("autosave-status");
const submitBtn = document.getElementById("submit-btn");
const clearBtn = document.getElementById("clear-draft-btn");
const formMessage = document.getElementById("form-message");

let autosaveTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  restoreDraft();
  bindEvents();
});

function bindEvents() {
  form.addEventListener("input", handleFormChange);
  form.addEventListener("change", handleFormChange);
  form.addEventListener("submit", handleSubmit);
  clearBtn.addEventListener("click", handleClearDraft);
}

function handleFormChange() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(saveDraft, 200);
}

function getFormFields() {
  return form.querySelectorAll("input[name], textarea[name], select[name]");
}

function collectFormData() {
  const data = {};
  getFormFields().forEach((el) => {
    if (el.type === "checkbox") {
      data[el.name] = el.checked;
    } else {
      data[el.name] = el.value;
    }
  });
  return data;
}

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collectFormData()));
    showAutosaveStatus("작성 중인 내용이 자동 임시저장되었습니다.");
  } catch {
    showAutosaveStatus("임시저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.", "error");
  }
}

function restoreDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    getFormFields().forEach((el) => {
      if (!(el.name in data)) return;
      if (el.type === "checkbox") {
        el.checked = Boolean(data[el.name]);
      } else {
        el.value = data[el.name];
      }
    });
    showAutosaveStatus("이전에 작성하던 내용을 불러왔습니다.", "restored");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function handleClearDraft() {
  if (!confirm("임시저장된 작성 내용을 모두 삭제할까요?")) return;

  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  showFormMessage("");
  showAutosaveStatus("임시저장 내용이 삭제되었습니다.", "cleared");
}

function showAutosaveStatus(message, type = "saved") {
  autosaveStatus.textContent = message;
  autosaveStatus.className = "autosave-status visible " + type;
}

function showFormMessage(message, type = "") {
  formMessage.textContent = message;
  formMessage.className = "form-message" + (type ? " " + type : "");
}

function validateForm() {
  const data = collectFormData();
  const errors = [];

  if (!data.name?.trim()) errors.push("이름을 입력해 주세요.");
  if (!data.email?.trim()) errors.push("이메일을 입력해 주세요.");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push("올바른 이메일 형식을 입력해 주세요.");
  }
  if (!data.phone?.trim()) errors.push("전화번호를 입력해 주세요.");
  else if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(data.phone.trim().replace(/\s/g, ""))) {
    errors.push("올바른 전화번호 형식을 입력해 주세요. (예: 010-1234-5678)");
  }
  if (!data.university?.trim()) errors.push("학교를 입력해 주세요.");
  if (!data.major?.trim()) errors.push("학과를 입력해 주세요.");
  if (!data.grade) errors.push("학년을 선택해 주세요.");
  if (!data.applyType) errors.push("지원 구분을 선택해 주세요.");
  if (!data.motivation?.trim()) errors.push("지원동기를 입력해 주세요.");
  if (!data.privacyAgree) errors.push("개인정보 수집 및 이용에 동의해 주세요.");

  if (errors.length > 0) {
    showFormMessage(errors.join("\n"), "error");
    return null;
  }

  showFormMessage("");
  return {
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    university: data.university.trim(),
    major: data.major.trim(),
    grade: data.grade,
    applyType: data.applyType,
    motivation: data.motivation.trim(),
    experience: data.experience?.trim() || "",
    portfolio: data.portfolio?.trim() || "",
  };
}

async function handleSubmit(e) {
  e.preventDefault();

  const payload = validateForm();
  if (!payload) return;

  if (!GAS_WEB_APP_URL) {
    showFormMessage(
      "Google Apps Script Web App URL이 설정되지 않았습니다.\njs/apply.js 파일의 GAS_WEB_APP_URL 변수를 설정해 주세요.",
      "error"
    );
    return;
  }

  setSubmitting(true);

  try {
    // mode: "no-cors"를 추가하여 브라우저의 CORS 차단 에러를 방지합니다.
    await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    // no-cors 모드에서는 응답 본문을 읽을 수 없으므로, fetch가 에러 없이 수행되면 성공으로 처리합니다.
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    showAutosaveStatus("");
    autosaveStatus.className = "autosave-status";
    alert("지원서가 성공적으로 제출되었습니다!");
    showFormMessage("지원서가 성공적으로 제출되었습니다! CRESOL에 관심 가져주셔서 감사합니다.", "success");
  } catch (error) {
    console.error("제출 에러:", error);
    showFormMessage(
      "제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.\n문제가 계속되면 cresolops@gmail.com 으로 문의해 주세요.",
      "error"
    );
  } finally {
    setSubmitting(false);
  }
}

function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  submitBtn.textContent = isSubmitting ? "제출 중..." : "최종 제출";
  clearBtn.disabled = isSubmitting;
}
