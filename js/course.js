function escapeHtml(value = '') {
  return value
    .toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderVideoPlayer(lesson) {
  if (!lesson.videoEmbedUrl) {
    return '<p class="lesson-empty">Vidéo à venir.</p>';
  }

  return `
    <div class="video-frame">
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

function renderCourse() {
  const modulesContainer = document.querySelector('#course-modules');
  const courseTitle = document.querySelector('#course-title');
  const courseSubtitle = document.querySelector('#course-subtitle');

  courseTitle.textContent = APICULTURE_COURSE.title;
  courseSubtitle.textContent = APICULTURE_COURSE.subtitle;

  modulesContainer.innerHTML = APICULTURE_COURSE.modules
    .map((module, moduleIndex) => {
      const moduleStats = getModuleProgress(module);
      const lessons = module.lessons
        .map((lesson) => {
          const completed = isLessonCompleted(lesson.id);
          return `
            <article class="lesson-card ${completed ? 'completed' : ''}">
              <div class="lesson-main">
                <div class="lesson-meta-row">
                  <span class="lesson-status">${completed ? 'Terminée' : 'À faire'}</span>
                  ${lesson.duration ? `<span class="lesson-duration">${escapeHtml(lesson.duration)}</span>` : ''}
                </div>
                <h3>${escapeHtml(lesson.title)}</h3>
                ${lesson.summary ? `<p class="lesson-summary">${escapeHtml(lesson.summary)}</p>` : ''}
                ${renderVideoPlayer(lesson)}
                <div class="lesson-actions">
                  ${lesson.pdfUrl ? `<a href="${escapeHtml(lesson.pdfUrl)}" target="_blank" rel="noopener">Ressource PDF</a>` : ''}
                </div>
              </div>
              <label class="check-control">
                <input type="checkbox" data-lesson-id="${escapeHtml(lesson.id)}" ${completed ? 'checked' : ''} />
                <span>Marquer comme terminée</span>
              </label>
            </article>
          `;
        })
        .join('');

      return `
        <article class="module-card">
          <div class="module-header">
            <div>
              <p class="eyebrow">Module ${moduleIndex + 1}</p>
              <h2>${escapeHtml(module.title)}</h2>
              <p>${escapeHtml(module.description)}</p>
            </div>
            <div class="module-pill">${moduleStats.completed}/${moduleStats.total}</div>
          </div>
          <div class="progress-track" aria-hidden="true"><span style="width:${moduleStats.percent}%"></span></div>
          <div class="lesson-list">${lessons}</div>
        </article>
      `;
    })
    .join('');

  modulesContainer.querySelectorAll('[data-lesson-id]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      setLessonCompleted(event.target.dataset.lessonId, event.target.checked);
      renderCourse();
      updateCourseProgress();
    });
  });
}

function updateCourseProgress() {
  const stats = getProgressStats();
  document.querySelector('#course-progress-percent').textContent = `${stats.percent}%`;
  document.querySelector('#course-progress-bar').style.width = `${stats.percent}%`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCourse();
  updateCourseProgress();
});
