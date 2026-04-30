const DASHBOARD_ACTIVITY_KEY = "primeBankSafeActivity";

const activitySummary = document.getElementById("activitySummary");
const activityList = document.getElementById("activityList");
const activityEmpty = document.getElementById("activityEmpty");
const clearActivity = document.getElementById("clearActivity");

function readActivity() {
  try {
    const savedActivity = JSON.parse(localStorage.getItem(DASHBOARD_ACTIVITY_KEY) || "[]");
    return Array.isArray(savedActivity) ? savedActivity : [];
  } catch (error) {
    return [];
  }
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "وقت غير معروف";
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function getActivityTitle(event) {
  if (event.eventType === "login_attempt") {
    return "محاولة دخول تجريبية";
  }

  if (event.eventType === "otp_completed") {
    return "إدخال رمز OTP تجريبي";
  }

  if (event.eventType === "otp_resend") {
    return "طلب إعادة إرسال رمز";
  }

  return "نشاط تجريبي";
}

function getActivityDescription(event) {
  if (event.eventType === "login_attempt") {
    const usernameStatus = event.usernameEntered ? `اسم الدخول مكتوب (${event.usernameLength} أحرف)` : "اسم الدخول فارغ";
    const passwordStatus = event.passwordEntered ? "كلمة المرور مملوءة بدون عرضها" : "كلمة المرور فارغة";
    return `${usernameStatus}، ${passwordStatus}.`;
  }

  if (event.eventType === "otp_completed") {
    return `تم إدخال ${event.digitCount || 0} خانات بدون عرض الرمز.`;
  }

  if (event.eventType === "otp_resend") {
    return "تم الضغط على إعادة الإرسال بدون تسجيل أي رمز.";
  }

  return "تم تسجيل نشاط غير حساس.";
}

function renderActivity() {
  const activity = readActivity();
  activityList.replaceChildren();

  activitySummary.textContent = activity.length === 0
    ? "لا توجد محاولات بعد."
    : `آخر ${activity.length} نشاط تجريبي.`;
  activityEmpty.hidden = activity.length !== 0;

  activity.forEach((event) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const details = document.createElement("span");
    const time = document.createElement("span");

    item.className = "activity-item";
    title.textContent = getActivityTitle(event);
    details.textContent = getActivityDescription(event);
    time.textContent = formatDate(event.occurredAt);

    item.append(title, details, time);
    activityList.append(item);
  });
}

clearActivity.addEventListener("click", () => {
  localStorage.removeItem(DASHBOARD_ACTIVITY_KEY);
  renderActivity();
});

window.addEventListener("storage", (event) => {
  if (event.key === DASHBOARD_ACTIVITY_KEY) {
    renderActivity();
  }
});

setInterval(renderActivity, 3000);
renderActivity();
