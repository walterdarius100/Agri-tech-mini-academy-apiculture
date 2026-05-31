function renderCourse() {
  const modulesContainer = document.querySelector('#course-modules');

  modulesContainer.innerHTML = APICULTURE_COURSE.modules
    .map((module, moduleIndex) => {
      const moduleStats = getModuleProgress(module);
      const lessons = module.lessons
        .map((lesson) => {
          const completed = isLessonCompleted(lesson.id);
          return `
            <article class="lesson-card ${completed ? 'completed' : ''}">
              <div class="lesson-main">
                <span class="lesson-status">${completed ? 'Terminée' : 'À faire'}</span>
                <h3>${lesson.title}</h3>
                <div class="lesson-actions">
                  <a href="${lesson.videoUrl}" target="_blank" rel="noopener">Voir la vidéo</a>
                  <a href="${lesson.pdfUrl}" target="_blank" rel="noopener">Ressource PDF</a>
                </div>
              </div>
              <label class="check-control">
                <input type="checkbox" data-lesson-id="${lesson.id}" ${completed ? 'checked' : ''} />
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
              <h2>${module.title}</h2>
              <p>${module.description}</p>
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
