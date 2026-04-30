const DASHBOARD_ACTIVITY_KEY = "primeBankSafeActivity";
const DASHBOARD_STATUS_KEY = "primeBankSafeLiveStatus";

const activitySummary = document.getElementById("activitySummary");
const activityList = document.getElementById("activityList");
const activityEmpty = document.getElementById("activityEmpty");
const clearActivity = document.getElementById("clearActivity");
const liveStatus = document.getElementById("liveStatus");

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

function readStatus() {
  try {
    const savedStatus = JSON.parse(localStorage.getItem(DASHBOARD_STATUS_KEY) || "null");
    return savedStatus && typeof savedStatus === "object" ? savedStatus : null;
  } catch (error) {
    return null;
  }
}

function renderStatus() {
  const status = readStatus();
  const title = document.createElement("strong");
  const details = document.createElement("span");

  title.textContent = "الحالة المباشرة";

  if (!status) {
    details.textContent = "افتح موقع المستخدم من نفس المتصفح لتظهر الحالة هنا.";
  } else {
    const screen = status.stage === "otp" ? "شاشة OTP" : "شاشة تسجيل الدخول";
    const usernameState = status.usernameEntered ? "اسم المستخدم مملوء" : "اسم المستخدم فارغ";
    const passwordState = status.passwordEntered ? "كلمة المرور مملوءة" : "كلمة المرور فارغة";
    const otpState = status.stage === "otp" ? `، خانات OTP المملوءة: ${status.otpFilledCount || 0}` : "";
    details.textContent = `${screen}: ${usernameState}، ${passwordState}${otpState}. آخر تحديث ${formatDate(status.updatedAt)}.`;
  }

  liveStatus.replaceChildren(title, details);
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
  renderStatus();

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
  localStorage.removeItem(DASHBOARD_STATUS_KEY);
  renderActivity();
});

window.addEventListener("storage", (event) => {
  if (event.key === DASHBOARD_ACTIVITY_KEY || event.key === DASHBOARD_STATUS_KEY) {
    renderActivity();
  }
});

setInterval(renderActivity, 3000);
renderActivity();
