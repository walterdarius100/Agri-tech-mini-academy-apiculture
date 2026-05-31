document.addEventListener('DOMContentLoaded', () => {
  const session = getValidSession();
  if (!session) {
    return;
  }

  const stats = getProgressStats();

  document.querySelector('#student-name').textContent = session.name;
  document.querySelector('#student-course').textContent = session.course;
  document.querySelector('#progress-percent').textContent = `${stats.percent}%`;
  document.querySelector('#progress-bar').style.width = `${stats.percent}%`;
  document.querySelector('#progress-details').textContent = `${stats.completed} leçon${stats.completed > 1 ? 's' : ''} terminée${stats.completed > 1 ? 's' : ''} sur ${stats.total}.`;

  const moduleSummary = document.querySelector('#module-summary');
  moduleSummary.innerHTML = APICULTURE_COURSE.modules
    .map((module, index) => {
      const moduleStats = getModuleProgress(module);
      return `
        <article class="module-summary-item">
          <span class="module-number">${index + 1}</span>
          <div>
            <h3>${module.title}</h3>
            <p>${module.lessons.length} leçon${module.lessons.length > 1 ? 's' : ''} · ${moduleStats.percent}% terminé</p>
          </div>
        </article>
      `;
    })
    .join('');
});
