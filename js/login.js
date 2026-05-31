document.addEventListener('DOMContentLoaded', () => {
  if (getValidSession()) {
    window.location.replace('dashboard.html');
    return;
  }

  const form = document.querySelector('#login-form');
  const errorBox = document.querySelector('#login-error');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = 'Vérification…';

    const formData = new FormData(form);
    const email = formData.get('email');
    const accessCode = formData.get('accessCode');

    try {
      const session = await authenticateStudent(email, accessCode);
      if (!session) {
        errorBox.textContent = 'Email ou code invalide. Vérifiez les informations reçues après validation du paiement.';
        return;
      }

      saveSession(session);
      window.location.replace('dashboard.html');
    } catch (error) {
      errorBox.textContent = 'Impossible de vérifier l’accès pour le moment. Réessayez ou contactez le support.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Accéder à la formation';
    }
  });
});
