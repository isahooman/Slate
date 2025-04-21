document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme-select');
  const layoutSelect = document.getElementById('layout-select');

  // Initial settings load
  window.api.settings.load();

  // Apply loaded settings
  window.api.settings.onLoaded(settings => {
    // Apply loaded option to the selections
    themeSelect.value = settings.theme;
    layoutSelect.value = settings.layout || 'expanded';

    // Apply loaded UI settings
    document.documentElement.setAttribute('theme', settings.theme);
    document.documentElement.setAttribute('layout', 'expanded');
  });

  // Handle theme dropdown changes
  themeSelect?.addEventListener('change', e => {
    const selectedTheme = e.target.value;
    window.api.theme.update(selectedTheme);
    document.documentElement.setAttribute('theme', selectedTheme);
  });

  // Handle layout dropdown changes
  layoutSelect?.addEventListener('change', e => {
    const selectedLayout = e.target.value;
    window.api.layout.update(selectedLayout);
  });
});
