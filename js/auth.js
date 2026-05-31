const SESSION_KEY = 'agritech_apiculture_session';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase();
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function buildAccessHash(email, code) {
  return sha256Hex(`${normalizeEmail(email)}:${normalizeCode(code)}`);
}

function findStudentByHash(accessHash) {
  return STUDENT_ACCESS.find((student) => student.accessHash === accessHash && student.status === 'active');
}

async function authenticateStudent(email, code) {
  const accessHash = await buildAccessHash(email, code);
  const student = findStudentByHash(accessHash);

  if (!student || normalizeEmail(student.email) !== normalizeEmail(email)) {
    return null;
  }

  return {
    name: student.name,
    email: student.email,
    course: student.course,
    status: student.status,
    accessHash,
    loggedAt: new Date().toISOString(),
  };
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (error) {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getValidSession() {
  const session = getSession();
  if (!session || !session.accessHash) {
    return null;
  }

  const student = findStudentByHash(session.accessHash);
  if (!student || normalizeEmail(student.email) !== normalizeEmail(session.email)) {
    clearSession();
    return null;
  }

  return { ...session, name: student.name, course: student.course, status: student.status };
}

function redirectToAccessDenied() {
  window.location.replace('access-denied.html');
}

function redirectToLogin() {
  window.location.replace('login.html');
}

function logoutStudent() {
  clearSession();
  redirectToLogin();
}
