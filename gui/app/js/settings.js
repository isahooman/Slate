document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme-select');
  const layoutSelect = document.getElementById('layout-select');

  // Load initial settings
  window.api.settings.load();

  window.api.settings.onLoaded(settings => {
    themeSelect.value = settings.theme;
    layoutSelect.value = settings.layout || 'expanded';
    document.documentElement.setAttribute('theme', settings.theme);
    document.documentElement.setAttribute('layout', 'expanded');
  });

  themeSelect?.addEventListener('change', e => {
    const selectedTheme = e.target.value;
    window.api.theme.update(selectedTheme);
    document.documentElement.setAttribute('theme', selectedTheme);
  });

  layoutSelect?.addEventListener('change', e => {
    const selectedLayout = e.target.value;
    window.api.layout.update(selectedLayout);
  });

  window.api.layout.onUpdated(success => {
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
