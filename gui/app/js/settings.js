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

  const navButtons = document.querySelectorAll('.sidebar-nav button');
  const sections = document.querySelectorAll('.settings-section');

  // Nav button click handlers
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the target section from the button's data
      const targetSection = button.dataset.section;

      // Update active state for navigation buttons
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Show the selected section and hide others
      sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetSection) section.classList.add('active');
      });
    });
  });
});
