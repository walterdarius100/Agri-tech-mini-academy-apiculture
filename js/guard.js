const currentSession = getValidSession();

if (!currentSession) {
  redirectToAccessDenied();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-logout]').forEach((button) => {
      button.addEventListener('click', logoutStudent);
    });
  });
}
