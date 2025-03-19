document.addEventListener('DOMContentLoaded', () => {
  const pinButton = document.querySelector('.pin-button');
  const pinIcon = pinButton?.querySelector('img');

  // Window control handlers
  document.querySelector('.minimize-button')?.addEventListener('click', () => {
    window.api.window.minimize();
  });

  document.querySelector('.close-button')?.addEventListener('click', () => {
    window.api.window.close();
  });

  // Pin button slop
  if (pinButton && pinIcon) {
    const updatePinState = isPinned => {
      pinIcon.src = isPinned ? '../../assets/pin_off.svg' : '../../assets/pin.svg';
      pinButton.classList.toggle('pinned', isPinned);
    };

    pinButton.addEventListener('click', () => {
      window.api.window.pin().then(state => updatePinState(state.isPinned));
    });

    window.api.window.onStateChange((event, state) => {
      if (state.type === 'pin') updatePinState(state.pinned);
    });
  }

  // Debug mode toggle
  document.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key === 'd') {
      event.preventDefault();
      document.body.classList.toggle('debug');
    }
  });

  const themeSelect = document.getElementById('theme-select');
  const layoutSelect = document.getElementById('layout-select');

  // Load initial settings
  window.api.loadSettings();

  window.api.onSettingsLoaded(settings => {
    themeSelect.value = settings.theme;
    layoutSelect.value = settings.layout || 'expanded';
    document.documentElement.setAttribute('theme', settings.theme);
    document.documentElement.setAttribute('layout', 'expanded');
  });

  themeSelect?.addEventListener('change', e => {
    const selectedTheme = e.target.value;
    window.api.updateTheme(selectedTheme);
    document.documentElement.setAttribute('theme', selectedTheme);
  });

  layoutSelect?.addEventListener('change', e => {
    const selectedLayout = e.target.value;
    window.api.updateLayout(selectedLayout);
  });

  window.api.onLayoutUpdated(success => {
    if (success) window.api.sendToMain('layout-change', layoutSelect.value);
  });

  const navButtons = document.querySelectorAll('.sidebar-nav button');
  const sections = document.querySelectorAll('.settings-section');

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSection = button.dataset.section;

      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetSection) section.classList.add('active');
      });
    });
  });
});
