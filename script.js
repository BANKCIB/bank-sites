const splashScreen = document.getElementById("splashScreen");
const loginScreen = document.getElementById("loginScreen");
const otpScreen = document.getElementById("otpScreen");
const loginForm = document.getElementById("loginForm");
const languageButton = document.getElementById("languageButton");
const languageLabel = document.getElementById("languageLabel");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const englishInputHint = document.getElementById("englishInputHint");
const usernameLabel = document.getElementById("usernameLabel");
const passwordLabel = document.getElementById("passwordLabel");
const loginButton = document.getElementById("loginButton");
const togglePassword = document.getElementById("togglePassword");
const forgotLink = document.getElementById("forgotLink");
const fingerprintButton = document.getElementById("fingerprintButton");
const signupPrompt = document.getElementById("signupPrompt");
const signupLink = document.getElementById("signupLink");
const helpText = document.getElementById("helpText");
const branchShortcut = document.getElementById("branchShortcut");
const rewardShortcut = document.getElementById("rewardShortcut");
const currencyShortcut = document.getElementById("currencyShortcut");
const closeOtp = document.getElementById("closeOtp");
const otpTopTitle = document.getElementById("otpTopTitle");
const otpTitle = document.getElementById("otpTitle");
const otpDescription = document.getElementById("otpDescription");
const otpInputs = Array.from(document.querySelectorAll(".otp-input"));
const timerText = document.getElementById("timer");
const timerPrefix = document.getElementById("timerPrefix");
const timerSuffix = document.getElementById("timerSuffix");
const resendOtp = document.getElementById("resendOtp");

const DEMO_MESSAGE = "واجهة تجريبية فقط";
const OTP_DURATION_SECONDS = 174;
const DASHBOARD_ACTIVITY_KEY = "primeBankSafeActivity";
const MAX_DASHBOARD_EVENTS = 20;
const translations = {
  ar: {
    dir: "rtl",
    languageName: "العربية",
    chooseLanguage: "اختيار اللغة",
    loginScreen: "تسجيل الدخول",
    username: "اسم المستخدم",
    usernamePlaceholder: "Enter username",
    password: "كلمة المرور",
    passwordPlaceholder: "Enter password",
    englishInputHint: "استخدم أحرف وأرقام ورموز إنجليزية فقط",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    forgotPassword: "هل نسيت كلمة المرور؟",
    login: "تسجيل الدخول",
    fingerprint: "تسجيل الدخول بالبصمة",
    signupPrompt: "مستخدم جديد؟",
    signupLink: "سجل الآن",
    help: "تحتاج إلى مساعدة؟ اتصل بنا",
    shortcuts: "اختصارات",
    branches: "أماكن الفروع وماكينات الصراف الآلي",
    rewards: "مكافأة Prime",
    currency: "محول العملات وأسعار الصرف",
    otpScreen: "الرقم السري المتغير",
    closeOtp: "العودة إلى تسجيل الدخول",
    otpTitle: "الرقم السري المتغير (OTP)",
    otpDescription: "يرجى إدخال الرقم السري المتغير (OTP) الذي تم استلامه على ********9805",
    otpBoxes: "خانات الرقم السري المتغير",
    otpDigit: "خانة OTP رقم",
    timerPrefix: "تنتهي الصلاحية خلال:",
    timerSuffix: "دقائق",
    resend: "لم تتلق الرمز؟ إعادة إرسال"
  },
  en: {
    dir: "ltr",
    languageName: "English",
    chooseLanguage: "Choose language",
    loginScreen: "Login",
    username: "Username",
    usernamePlaceholder: "Enter username",
    password: "Password",
    passwordPlaceholder: "Enter password",
    englishInputHint: "Use English letters, numbers, and symbols only",
    showPassword: "Show password",
    hidePassword: "Hide password",
    forgotPassword: "Forgot password?",
    login: "Log in",
    fingerprint: "Fingerprint login",
    signupPrompt: "New user?",
    signupLink: "Register now",
    help: "Need help? Contact us",
    shortcuts: "Shortcuts",
    branches: "Branches and ATM locations",
    rewards: "Prime Rewards",
    currency: "Currency converter and exchange rates",
    otpScreen: "One-Time Password",
    closeOtp: "Back to login",
    otpTitle: "One-Time Password (OTP)",
    otpDescription: "Please enter the One-Time Password (OTP) received on ********9805",
    otpBoxes: "One-Time Password boxes",
    otpDigit: "OTP digit",
    timerPrefix: "Expires in:",
    timerSuffix: "minutes",
    resend: "Did not receive the code? Resend"
  }
};

let timerInterval = null;
let remainingSeconds = OTP_DURATION_SECONDS;
let otpAlertShown = false;
let currentLanguage = "ar";

function readDashboardActivity() {
  try {
    const savedActivity = JSON.parse(localStorage.getItem(DASHBOARD_ACTIVITY_KEY) || "[]");
    return Array.isArray(savedActivity) ? savedActivity : [];
  } catch (error) {
    return [];
  }
}

function writeDashboardActivity(eventType, details = {}) {
  const event = {
    eventType,
    occurredAt: new Date().toISOString(),
    ...details
  };
  const activity = [event, ...readDashboardActivity()].slice(0, MAX_DASHBOARD_EVENTS);
  localStorage.setItem(DASHBOARD_ACTIVITY_KEY, JSON.stringify(activity));
}

// يبدل بين الشاشات الثلاث بدون تحميل صفحات أو إرسال بيانات.
function showScreen(screen) {
  [splashScreen, loginScreen, otpScreen].forEach((item) => {
    item.classList.toggle("is-active", item === screen);
  });
}

// زر الدخول يتفعل فقط بعد تعبئة الحقلين.
function updateLoginButton() {
  const isReady = usernameInput.value.trim() !== "" && passwordInput.value.trim() !== "";
  loginButton.disabled = !isReady;
  loginButton.classList.toggle("is-ready", isReady);
}

function updatePasswordToggleLabel() {
  const text = translations[currentLanguage];
  const shouldShowPassword = passwordInput.type === "password";
  togglePassword.setAttribute("aria-label", shouldShowPassword ? text.showPassword : text.hidePassword);
}

function applyLanguage(language) {
  currentLanguage = language;
  const text = translations[currentLanguage];

  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = text.dir;
  loginScreen.setAttribute("aria-label", text.loginScreen);
  otpScreen.setAttribute("aria-label", text.otpScreen);

  languageLabel.textContent = text.languageName;
  languageButton.setAttribute("aria-label", text.chooseLanguage);
  usernameLabel.textContent = text.username;
  usernameInput.placeholder = text.usernamePlaceholder;
  passwordLabel.textContent = text.password;
  passwordInput.placeholder = text.passwordPlaceholder;
  englishInputHint.textContent = text.englishInputHint;
  forgotLink.textContent = text.forgotPassword;
  forgotLink.setAttribute("aria-label", text.forgotPassword);
  loginButton.textContent = text.login;
  fingerprintButton.setAttribute("aria-label", text.fingerprint);
  signupPrompt.textContent = text.signupPrompt;
  signupLink.textContent = text.signupLink;
  helpText.textContent = text.help;
  document.querySelector(".footer-shortcuts").setAttribute("aria-label", text.shortcuts);
  branchShortcut.textContent = text.branches;
  rewardShortcut.textContent = text.rewards;
  currencyShortcut.textContent = text.currency;
  closeOtp.setAttribute("aria-label", text.closeOtp);
  otpTopTitle.textContent = text.otpTitle;
  otpTitle.textContent = text.otpTitle;
  otpDescription.textContent = text.otpDescription;
  document.querySelector(".otp-grid").setAttribute("aria-label", text.otpBoxes);
  otpInputs.forEach((input, index) => {
    input.setAttribute("aria-label", `${text.otpDigit} ${index + 1}`);
  });
  timerPrefix.textContent = text.timerPrefix;
  timerSuffix.textContent = text.timerSuffix;
  resendOtp.textContent = text.resend;
  updatePasswordToggleLabel();
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function sanitizeUsername(value) {
  return value.replace(/[^A-Za-z0-9._@-]/g, "");
}

function sanitizePassword(value) {
  return value.replace(/[^\x21-\x7E]/g, "");
}

function enforceEnglishCredentials() {
  usernameInput.value = sanitizeUsername(usernameInput.value);
  passwordInput.value = sanitizePassword(passwordInput.value);
  updateLoginButton();
}

function stopOtpTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startOtpTimer() {
  stopOtpTimer();
  remainingSeconds = OTP_DURATION_SECONDS;
  timerText.textContent = formatTime(remainingSeconds);

  timerInterval = setInterval(() => {
    remainingSeconds = Math.max(remainingSeconds - 1, 0);
    timerText.textContent = formatTime(remainingSeconds);

    if (remainingSeconds === 0) {
      stopOtpTimer();
    }
  }, 1000);
}

function resetOtpInputs() {
  otpInputs.forEach((input) => {
    input.value = "";
  });
  otpAlertShown = false;
}

// لا يوجد إرسال حقيقي للـ OTP؛ الاكتمال يعرض تنبيه الواجهة التجريبية فقط.
function showOtpDemoAlertIfComplete() {
  const otpComplete = otpInputs.every((otpInput) => otpInput.value.length === 1);
  if (otpComplete && !otpAlertShown) {
    otpAlertShown = true;
    writeDashboardActivity("otp_completed", {
      digitCount: otpInputs.length
    });
    alert(DEMO_MESSAGE);
  }
}

function openOtpScreen() {
  resetOtpInputs();
  showScreen(otpScreen);
  startOtpTimer();
  setTimeout(() => otpInputs[0].focus(), 80);
}

function openLoginScreen() {
  stopOtpTimer();
  showScreen(loginScreen);
}

setTimeout(() => {
  showScreen(loginScreen);
}, 2000);

applyLanguage(currentLanguage);

languageButton.addEventListener("click", () => {
  applyLanguage(currentLanguage === "ar" ? "en" : "ar");
});

usernameInput.addEventListener("input", enforceEnglishCredentials);
passwordInput.addEventListener("input", enforceEnglishCredentials);

togglePassword.addEventListener("click", () => {
  const shouldShowPassword = passwordInput.type === "password";
  passwordInput.type = shouldShowPassword ? "text" : "password";
  updatePasswordToggleLabel();
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (loginButton.disabled) {
    return;
  }

  writeDashboardActivity("login_attempt", {
    usernameEntered: usernameInput.value.trim() !== "",
    usernameLength: usernameInput.value.trim().length,
    passwordEntered: passwordInput.value.trim() !== "",
    language: currentLanguage
  });
  alert(DEMO_MESSAGE);
  openOtpScreen();
});

closeOtp.addEventListener("click", openLoginScreen);

resendOtp.addEventListener("click", () => {
  writeDashboardActivity("otp_resend");
  alert(DEMO_MESSAGE);
  resetOtpInputs();
  startOtpTimer();
  otpInputs[0].focus();
});

otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 1);

    if (input.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }

    showOtpDemoAlertIfComplete();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Backspace") {
      return;
    }

    if (input.value !== "") {
      input.value = "";
      event.preventDefault();
    }

    if (index > 0) {
      otpInputs[index - 1].focus();
    }
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, otpInputs.length);

    digits.split("").forEach((digit, digitIndex) => {
      otpInputs[digitIndex].value = digit;
    });

    const nextIndex = Math.min(digits.length, otpInputs.length - 1);
    otpInputs[nextIndex].focus();
    showOtpDemoAlertIfComplete();
  });
});
