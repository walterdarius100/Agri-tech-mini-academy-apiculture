const WHATSAPP_SUPPORT_URL = 'https://wa.me/50936960292';
let currentLessonId = null;

function escapeHtml(value = '') {
  return value
    .toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getCourseDescription() {
  return APICULTURE_COURSE.description || APICULTURE_COURSE.subtitle || 'Apprendre à installer, suivre et valoriser un petit rucher avec méthode.';
}

function getCourseResources() {
  return APICULTURE_COURSE.resources || [];
}

function getLessonResources(lesson) {
  if (Array.isArray(lesson.resources) && lesson.resources.length > 0) {
    return lesson.resources;
  }

  return lesson.pdfUrl
    ? [
        {
          type: 'PDF',
          title: 'Support de la leçon',
          href: lesson.pdfUrl,
        },
      ]
    : [];
}

function getFlatLessons() {
  return APICULTURE_COURSE.modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, lessonIndex) => ({
      module,
      moduleIndex,
      lesson,
      lessonIndex,
    })),
  );
}

function getInitialLesson() {
  const lessons = getFlatLessons();
  return lessons.find(({ lesson }) => !isLessonCompleted(lesson.id)) || lessons[0];
}

function getCurrentLessonEntry() {
  const lessons = getFlatLessons();
  return lessons.find(({ lesson }) => lesson.id === currentLessonId) || getInitialLesson();
}

function getNextLessonEntry(currentEntry) {
  const lessons = getFlatLessons();
  const currentIndex = lessons.findIndex(({ lesson }) => lesson.id === currentEntry?.lesson.id);
  return currentIndex >= 0 ? lessons[currentIndex + 1] : null;
}

function renderVideo(lesson) {
  if (!lesson.videoEmbedUrl) {
    return `
      <div class="student-video-placeholder">
        <span>Vidéo à venir</span>
        <p>Ajoutez un lien YouTube embed dans <code>js/course-data.js</code> pour afficher cette leçon.</p>
      </div>
    `;
  }

  return `
    <div class="student-video-frame">
      <iframe
        src="${escapeHtml(lesson.videoEmbedUrl)}"
        title="Vidéo de la leçon : ${escapeHtml(lesson.title)}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

function renderResourceLink(resource) {
  return `
    <a class="student-resource-link" href="${escapeHtml(resource.href)}" target="_blank" rel="noopener">
      <span>${escapeHtml(resource.type || 'PDF')}</span>
      <strong>${escapeHtml(resource.title || 'Ressource')}</strong>
    </a>
  `;
}

function renderResourceList(title, resources) {
  if (!resources.length) {
    return '';
  }

  return `
    <section class="student-resource-list" aria-label="${escapeHtml(title)}">
      <h3>${escapeHtml(title)}</h3>
      ${resources.map(renderResourceLink).join('')}
    </section>
  `;
}

function renderHero(stats) {
  return `
    <section class="student-player-hero">
      <div>
        <a class="academy-back-link" href="dashboard.html">← Retour au dashboard</a>
        <p class="eyebrow">${escapeHtml(APICULTURE_COURSE.category || 'Apiculture')}</p>
        <h1>${escapeHtml(APICULTURE_COURSE.title)}</h1>
        <p class="lead">${escapeHtml(getCourseDescription())}</p>
      </div>
      <aside class="student-progress" aria-label="Progression globale">
        <span class="student-progress-label">Progression globale</span>
        <strong>${stats.percent}%</strong>
        <div class="progress-track" aria-hidden="true"><span style="width:${stats.percent}%"></span></div>
        <p>${stats.completed}/${stats.total} leçon${stats.total > 1 ? 's' : ''} terminée${stats.completed > 1 ? 's' : ''}</p>
      </aside>
    </section>
  `;
}

function renderCurrentLessonCard(currentEntry, nextEntry) {
  const completed = isLessonCompleted(currentEntry.lesson.id);
  return `
    <aside class="student-next-card">
      <p class="eyebrow">Leçon actuelle</p>
      <h2>${escapeHtml(currentEntry.lesson.title)}</h2>
      <p>${escapeHtml(currentEntry.module.title)}${currentEntry.lesson.duration ? ` · ${escapeHtml(currentEntry.lesson.duration)}` : ''}</p>
      <span class="lesson-status">${completed ? 'Terminée' : 'En cours'}</span>
      ${nextEntry ? `<div class="student-next-card__next"><span>Prochaine leçon</span><strong>${escapeHtml(nextEntry.lesson.title)}</strong></div>` : '<div class="student-next-card__next"><span>Prochaine étape</span><strong>Formation complétée</strong></div>'}
    </aside>
  `;
}

function renderVideoPanel(currentEntry, nextEntry) {
  const { lesson, module } = currentEntry;
  const completed = isLessonCompleted(lesson.id);

  return `
    <article class="student-video-panel">
      <div class="student-video-heading">
        <div>
          <p class="eyebrow">Module ${currentEntry.moduleIndex + 1} · ${escapeHtml(module.title)}</p>
          <h2>${escapeHtml(lesson.title)}</h2>
          ${lesson.summary ? `<p>${escapeHtml(lesson.summary)}</p>` : ''}
        </div>
        ${lesson.duration ? `<span class="lesson-duration">${escapeHtml(lesson.duration)}</span>` : ''}
      </div>
      ${renderVideo(lesson)}
      <div class="student-video-actions">
        <button class="btn ${completed ? 'btn-secondary' : 'btn-primary'}" type="button" data-complete-current ${completed ? 'disabled' : ''}>
          ${completed ? 'Leçon déjà terminée' : 'Marquer cette leçon comme terminée'}
        </button>
        <button class="btn btn-outline" type="button" data-next-lesson ${nextEntry ? '' : 'disabled'}>Leçon suivante</button>
        <a class="btn btn-secondary" href="${WHATSAPP_SUPPORT_URL}" target="_blank" rel="noopener">Support WhatsApp</a>
      </div>
    </article>
  `;
}

function renderSidebar(currentEntry) {
  return `
    <aside class="student-sidebar">
      ${renderCurrentLessonCard(currentEntry, getNextLessonEntry(currentEntry))}
      ${renderResourceList('Ressources de la leçon', getLessonResources(currentEntry.lesson))}
      ${renderResourceList('Ressources générales du cours', getCourseResources())}
    </aside>
  `;
}

function renderModules(currentEntry) {
  return `
    <section class="student-modules-section" aria-label="Modules et leçons">
      <div class="section-heading">
        <p class="eyebrow">Programme</p>
        <h2>Modules et leçons</h2>
      </div>
      <div class="student-module-list">
        ${APICULTURE_COURSE.modules
          .map((module, moduleIndex) => {
            const moduleStats = getModuleProgress(module);
            return `
              <article class="student-module-card">
                <div class="student-module-card__header">
                  <div>
                    <p class="eyebrow">Module ${moduleIndex + 1}</p>
                    <h3>${escapeHtml(module.title)}</h3>
                    <p>${escapeHtml(module.description)}</p>
                  </div>
                  <span>${moduleStats.completed}/${moduleStats.total}</span>
                </div>
                <div class="progress-track" aria-hidden="true"><span style="width:${moduleStats.percent}%"></span></div>
                <div class="student-lesson-list">
                  ${module.lessons
                    .map((lesson) => {
                      const completed = isLessonCompleted(lesson.id);
                      const current = lesson.id === currentEntry.lesson.id;
                      const icon = completed ? '✓' : current ? '▶' : '○';
                      return `
                        <button class="student-lesson-item ${current ? 'is-current' : ''} ${completed ? 'is-completed' : ''}" type="button" data-select-lesson="${escapeHtml(lesson.id)}">
                          <span class="student-lesson-icon">${icon}</span>
                          <span>
                            <strong>${escapeHtml(lesson.title)}</strong>
                            <small>${lesson.duration ? escapeHtml(lesson.duration) : 'Durée à venir'}</small>
                          </span>
                        </button>
                      `;
                    })
                    .join('')}
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

function renderCoursePlayer() {
  const root = document.querySelector('#coursePlayerRoot');
  const stats = getProgressStats();
  const currentEntry = getCurrentLessonEntry();
  currentLessonId = currentEntry.lesson.id;
  const nextEntry = getNextLessonEntry(currentEntry);

  root.innerHTML = `
    ${renderHero(stats)}
    <section class="student-learning-layout">
      <div>
        ${renderVideoPanel(currentEntry, nextEntry)}
      </div>
      ${renderSidebar(currentEntry)}
    </section>
    ${renderModules(currentEntry)}
  `;

  bindCoursePlayerEvents();
}

function selectLesson(lessonId) {
  currentLessonId = lessonId;
  renderCoursePlayer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function completeCurrentLesson() {
  const currentEntry = getCurrentLessonEntry();
  const nextEntry = getNextLessonEntry(currentEntry);
  setLessonCompleted(currentEntry.lesson.id, true);
  currentLessonId = nextEntry?.lesson.id || currentEntry.lesson.id;
  renderCoursePlayer();
}

function goToNextLesson() {
  const nextEntry = getNextLessonEntry(getCurrentLessonEntry());
  if (nextEntry) {
    selectLesson(nextEntry.lesson.id);
  }
}

function bindCoursePlayerEvents() {
  document.querySelectorAll('[data-select-lesson]').forEach((button) => {
    button.addEventListener('click', () => selectLesson(button.dataset.selectLesson));
  });

  document.querySelector('[data-complete-current]')?.addEventListener('click', completeCurrentLesson);
  document.querySelector('[data-next-lesson]')?.addEventListener('click', goToNextLesson);
}

document.addEventListener('DOMContentLoaded', () => {
  currentLessonId = getInitialLesson()?.lesson.id || null;
  renderCoursePlayer();
});
