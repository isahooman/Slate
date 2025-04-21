/**
 * Navigation/Sidebar handler
 * @author isahooman
 */
const NavBar = {
  init() {
    const isSettingsPage = document.title.toLowerCase().includes('settings');

    // Set up nav for settings page or other
    const options = isSettingsPage ? {
      navSelector: '.sidebar-nav button',
      sectionSelector: '.settings-section',
    } : {
      onSectionChange: (section) => {
        document.body.className = `${section}-view${window.slateDebugMode ? ' debug' : ''}`;
      },
      specialButtons: {
        '.settings-nav-btn': () => window.api?.settings?.open?.(),
      },
    };

    this.setupNavigation(options);
  },

  setupNavigation({
    navSelector = '.sidebar-nav button[data-section]',
    sectionSelector = '.section',
    onSectionChange = null,
    specialButtons = {},
  } = {}) {
    const navButtons = document.querySelectorAll(navSelector);

    // Set up nav listeners
    navButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetSection = button.dataset.section;
        if (!targetSection) return;

        // Switch active button
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Switch active section
        document.querySelectorAll(sectionSelector).forEach(section => {
          section.classList.toggle('active', section.id === targetSection);
        });

        if (typeof onSectionChange === 'function') onSectionChange(targetSection);
      });
    });

    // Set up special buttons
    Object.entries(specialButtons).forEach(([selector, handler]) => {
      const button = document.querySelector(selector);
      if (button && typeof handler === 'function') button.addEventListener('click', handler);
    });
  },
};

document.addEventListener('DOMContentLoaded', NavBar.init.bind(NavBar));
