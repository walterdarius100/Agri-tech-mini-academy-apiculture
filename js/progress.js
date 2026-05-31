function getAllLessons() {
  return APICULTURE_COURSE.modules.flatMap((module) => module.lessons);
}

function getProgressKey(session = getValidSession()) {
  const identifier = session?.accessHash || 'guest';
  return `agritech_apiculture_progress_${identifier}`;
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(getProgressKey()));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveProgress(completedLessons) {
  const uniqueLessons = [...new Set(completedLessons)];
  localStorage.setItem(getProgressKey(), JSON.stringify(uniqueLessons));
  return uniqueLessons;
}

function isLessonCompleted(lessonId) {
  return loadProgress().includes(lessonId);
}

function setLessonCompleted(lessonId, completed) {
  const currentProgress = loadProgress();
  if (completed) {
    return saveProgress([...currentProgress, lessonId]);
  }

  return saveProgress(currentProgress.filter((id) => id !== lessonId));
}

function getProgressStats() {
  const total = getAllLessons().length;
  const completed = loadProgress().filter((lessonId) => getAllLessons().some((lesson) => lesson.id === lessonId)).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent };
}

function getModuleProgress(module) {
  const completed = module.lessons.filter((lesson) => isLessonCompleted(lesson.id)).length;
  const total = module.lessons.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent };
}
