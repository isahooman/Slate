const WindowControls = {
  /**
   * Initialize all window controls
   */
  init() {
    this.setupMinimizeButton();
    this.setupMaximizeButton();
    this.setupCloseButton();
    this.setupPinButton();
    this.setupDebugToggle();
  },

  /**
   * minimize button
   */
  setupMinimizeButton() {
    document.querySelector('.minimize-button')?.addEventListener('click', () => {
      window.api.window.minimize();
    });
  },

  /**
   * Maximize/restore button
   */
  setupMaximizeButton() {
    document.querySelector('.maximize-button')?.addEventListener('click', () => {
      window.api.window.maximize();
    });
  },

  /**
   * Close button
   */
  setupCloseButton() {
    document.querySelector('.close-button')?.addEventListener('click', () => {
      window.api.window.close();
    });
  },

  /**
   * Pin button
   */
  setupPinButton() {
    const pinButton = document.querySelector('.pin-button');

    if (pinButton) {
      pinButton.addEventListener('click', () => {
        window.api.window.pin().then(state => {
          if (state) this.updatePinState(state.isPinned);
        });
      });

      // Listen for state changes from main process
      window.api.window.onStateChange((event, state) => {
        if (state && state.type === 'pin') this.updatePinState(state.pinned);
      });
    }
  },

  /**
   * Update pin button state
   * @param {boolean} isPinned - Whether window is pinned
   */
  updatePinState(isPinned) {
    const pinIcon = document.querySelector('.pin-button img');
    const pinButton = document.querySelector('.pin-button');

    if (pinIcon) pinIcon.src = isPinned ? '../../assets/pin_off.svg' : '../../assets/pin.svg';
    if (pinButton) pinButton.classList.toggle('pinned', isPinned);
  },

  /**
   * Debug mode toggle (Ctrl+D)
   */
  setupDebugToggle() {
    document.addEventListener('keydown', event => {
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();

        // Toggle debug class
        document.body.classList.toggle('debug');

        // Preserve current view class when toggling debug mode
        const currentView = document.body.className.split(' ')
          .find(cls => cls.endsWith('-view')) || '';

        if (currentView) {
          const hasDebug = document.body.classList.contains('debug');
          document.body.className = `${currentView}${hasDebug ? ' debug' : ''}`;
        }
      }
    });
  },
};

// Self-initialize when ready
document.addEventListener('DOMContentLoaded', () => {
  WindowControls.init();
});
