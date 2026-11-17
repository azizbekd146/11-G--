(() => {
  const username = '11G';
  const password = 'Azizbekk2009.';
  const sessionKey = '11g-admin-authenticated';
  const form = document.getElementById('admin-login');
  const status = document.getElementById('login-status');
  const usernameInput = document.getElementById('admin-username');
  const passwordInput = document.getElementById('admin-password');
  const togglePassword = document.getElementById('toggle-password');

  function updateView() {
    document.documentElement.classList.toggle(
      'admin-authenticated',
      sessionStorage.getItem(sessionKey) === 'true'
    );
  }

  togglePassword.addEventListener('click', () => {
    const showPassword = passwordInput.type === 'password';
    passwordInput.type = showPassword ? 'text' : 'password';
    togglePassword.setAttribute('aria-pressed', String(showPassword));
    togglePassword.setAttribute('aria-label', showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish');
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const enteredUsername = usernameInput.value;

    if (enteredUsername === username && passwordInput.value === password) {
      sessionStorage.setItem(sessionKey, 'true');
      updateView();
      return;
    }

    status.textContent = 'Login yoki parol noto‘g‘ri.';
    passwordInput.value = '';
    passwordInput.focus();
  });

  document.getElementById('admin-logout').addEventListener('click', () => {
    sessionStorage.removeItem(sessionKey);
    form.reset();
    status.textContent = '';
    passwordInput.type = 'password';
    togglePassword.setAttribute('aria-pressed', 'false');
    togglePassword.setAttribute('aria-label', 'Parolni ko‘rsatish');
    updateView();
    window.scrollTo(0, 0);
    usernameInput.focus();
  });

  updateView();
})();
