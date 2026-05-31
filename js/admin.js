const ADMIN_PASSWORD = 'agritech-admin';
const ADMIN_UNLOCK_KEY = 'agritech_admin_unlocked';

let adminCourse = cloneCourse(typeof APICULTURE_COURSE !== 'undefined' ? APICULTURE_COURSE : {
  title: 'Formation pratique en apiculture',
  category: 'Apiculture',
  description: 'Modules pratiques, ressources PDF et suivi de progression.',
  resources: [],
  modules: [],
});

function cloneCourse(course) {
  return JSON.parse(JSON.stringify(course));
}

function slugify(value) {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function escapeHtml(value = '') {
  return value
    .toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeCourse(course) {
  return {
    title: course.title || 'Formation pratique en apiculture',
    category: course.category || 'Apiculture',
    description: course.description || course.subtitle || 'Modules pratiques, ressources PDF et suivi de progression.',
    resources: course.resources || [],
    modules: (course.modules || []).map((module, moduleIndex) => ({
      id: module.id || `m${moduleIndex + 1}`,
      title: module.title || `Module ${moduleIndex + 1}`,
      description: module.description || '',
      lessons: (module.lessons || []).map((lesson, lessonIndex) => ({
        id: lesson.id || `m${moduleIndex + 1}-l${lessonIndex + 1}`,
        title: lesson.title || `Leçon ${lessonIndex + 1}`,
        duration: lesson.duration || '',
        videoEmbedUrl: lesson.videoEmbedUrl || lesson.videoUrl || '',
        summary: lesson.summary || '',
        resources: lesson.resources || (lesson.pdfUrl
          ? [
              {
                type: 'PDF',
                title: 'Support de la leçon',
                href: lesson.pdfUrl,
              },
            ]
          : []),
      })),
    })),
  };
}

function generateCourseDataCode(course) {
  return `const APICULTURE_COURSE = ${JSON.stringify(normalizeCourse(course), null, 2)};\n`;
}

function countLessons(course) {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}

function getLessonAdminPdf(lesson) {
  return lesson.resources?.find((resource) => resource.type === 'PDF')?.href || lesson.pdfUrl || '';
}

function updateLessonModuleOptions() {
  const lessonModule = document.querySelector('#lesson-module');
  lessonModule.innerHTML = adminCourse.modules
    .map((module, index) => `<option value="${index}">Module ${index + 1} · ${escapeHtml(module.title)}</option>`)
    .join('');
}

function renderPreview() {
  const preview = document.querySelector('#admin-preview');
  const previewCount = document.querySelector('#preview-count');

  previewCount.textContent = `${adminCourse.modules.length}M/${countLessons(adminCourse)}L`;

  if (adminCourse.modules.length === 0) {
    preview.innerHTML = '<p class="empty-state">Aucun module pour le moment. Ajoutez un module pour commencer.</p>';
    return;
  }

  preview.innerHTML = adminCourse.modules
    .map((module, moduleIndex) => {
      const lessons = module.lessons.length
        ? module.lessons
            .map((lesson, lessonIndex) => `
              <article class="admin-lesson-preview">
                <div>
                  <span class="lesson-status">Leçon ${lessonIndex + 1}${lesson.duration ? ` · ${escapeHtml(lesson.duration)}` : ''}</span>
                  <h4>${escapeHtml(lesson.title)}</h4>
                  ${lesson.summary ? `<p>${escapeHtml(lesson.summary)}</p>` : ''}
                  <div class="lesson-actions">
                    ${lesson.videoEmbedUrl ? `<a href="${escapeHtml(lesson.videoEmbedUrl)}" target="_blank" rel="noopener">Embed vidéo</a>` : ''}
                    ${getLessonAdminPdf(lesson) ? `<a href="${escapeHtml(getLessonAdminPdf(lesson))}" target="_blank" rel="noopener">PDF</a>` : ''}
                  </div>
                </div>
              </article>
            `)
            .join('')
        : '<p class="empty-state">Aucune leçon dans ce module.</p>';

      return `
        <article class="admin-module-preview">
          <div class="module-header">
            <div>
              <p class="eyebrow">Module ${moduleIndex + 1}</p>
              <h3>${escapeHtml(module.title)}</h3>
              <p>${escapeHtml(module.description)}</p>
            </div>
            <span class="module-pill">${module.lessons.length}</span>
          </div>
          <div class="lesson-list">${lessons}</div>
        </article>
      `;
    })
    .join('');
}

function renderGeneratedCode() {
  document.querySelector('#generated-code').value = generateCourseDataCode(adminCourse);
}

function renderAdmin() {
  adminCourse = normalizeCourse(adminCourse);
  document.querySelector('#course-title').value = adminCourse.title;
  document.querySelector('#course-subtitle').value = adminCourse.description;
  updateLessonModuleOptions();
  renderPreview();
  renderGeneratedCode();
}

function unlockAdmin() {
  document.querySelector('#admin-lock').hidden = true;
  document.querySelector('#admin-workspace').hidden = false;
  renderAdmin();
}

function addModule(event) {
  event.preventDefault();
  const titleInput = document.querySelector('#module-title');
  const descriptionInput = document.querySelector('#module-description');
  const nextIndex = adminCourse.modules.length + 1;

  adminCourse.modules.push({
    id: `m${nextIndex}-${slugify(titleInput.value)}`,
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    lessons: [],
  });

  event.target.reset();
  renderAdmin();
}

function addLesson(event) {
  event.preventDefault();
  const moduleIndex = Number(document.querySelector('#lesson-module').value);
  const targetModule = adminCourse.modules[moduleIndex];

  if (!targetModule) {
    return;
  }

  const title = document.querySelector('#lesson-title').value.trim();
  const lessonIndex = targetModule.lessons.length + 1;

  targetModule.lessons.push({
    id: `${targetModule.id}-l${lessonIndex}-${slugify(title)}`,
    title,
    duration: document.querySelector('#lesson-duration').value.trim(),
    videoEmbedUrl: document.querySelector('#lesson-video').value.trim(),
    summary: document.querySelector('#lesson-summary').value.trim(),
    resources: document.querySelector('#lesson-pdf').value.trim()
      ? [
          {
            type: 'PDF',
            title: 'Support de la leçon',
            href: document.querySelector('#lesson-pdf').value.trim(),
          },
        ]
      : [],
  });

  event.target.reset();
  updateLessonModuleOptions();
  document.querySelector('#lesson-module').value = moduleIndex.toString();
  renderAdmin();
}

async function copyGeneratedCode() {
  const codeOutput = document.querySelector('#generated-code');
  const copyMessage = document.querySelector('#copy-message');

  try {
    await navigator.clipboard.writeText(codeOutput.value);
    copyMessage.textContent = 'Code copié. Collez-le dans js/course-data.js puis republiez le site.';
  } catch (error) {
    codeOutput.select();
    document.execCommand('copy');
    copyMessage.textContent = 'Code sélectionné/copied si le navigateur l’autorise. Sinon copiez manuellement le bloc.';
  }
}

function bindAdminEvents() {
  document.querySelector('#admin-password-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const passwordInput = document.querySelector('#admin-password');
    const message = document.querySelector('#admin-password-message');

    if (passwordInput.value === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_UNLOCK_KEY, 'true');
      unlockAdmin();
      return;
    }

    message.textContent = 'Mot de passe incorrect.';
  });

  document.querySelector('#course-title').addEventListener('input', (event) => {
    adminCourse.title = event.target.value.trim();
    renderGeneratedCode();
  });

  document.querySelector('#course-subtitle').addEventListener('input', (event) => {
    adminCourse.description = event.target.value.trim();
    renderGeneratedCode();
  });

  document.querySelector('#module-form').addEventListener('submit', addModule);
  document.querySelector('#lesson-form').addEventListener('submit', addLesson);
  document.querySelector('#copy-course-data').addEventListener('click', copyGeneratedCode);
}

document.addEventListener('DOMContentLoaded', () => {
  bindAdminEvents();
  if (sessionStorage.getItem(ADMIN_UNLOCK_KEY) === 'true') {
    unlockAdmin();
  }
});
