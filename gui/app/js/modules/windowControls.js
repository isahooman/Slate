const WindowControls = {
  init() {
    this.setupMinimizeButton();
    this.setupMaximizeButton();
    this.setupCloseButton();
    this.setupPinButton();
    this.setupDebugToggle();
  },

  /**
   * Sets up the minimize button click handler
   * @returns {void}
   * @author isahooman
   */
  setupMinimizeButton() {
    document.querySelector('.minimize-button')?.addEventListener('click', () => {
      window.api.window.minimize();
    });
  },

  /**
   * Sets up the maximize/restore button click handler
   * @returns {void}
   * @author isahooman
   */
  setupMaximizeButton() {
    document.querySelector('.maximize-button')?.addEventListener('click', () => {
      window.api.window.maximize();
    });
  },

  /**
   * Sets up the close button click handler
   * @returns {void}
   * @author isahooman
   */
  setupCloseButton() {
    document.querySelector('.close-button')?.addEventListener('click', () => {
      window.api.window.close();
    });
  },

  /**
   * Sets up the pin button click handler and state change listener
   * @returns {void}
   * @author isahooman
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
   * Updates the pin button's appearance based on the current pin state
   * @param {boolean} isPinned - Whether window is currently pinned
   * @returns {void}
   * @author isahooman
   */
  updatePinState(isPinned) {
    const pinIcon = document.querySelector('.pin-button img');
    const pinButton = document.querySelector('.pin-button');

    if (pinIcon) pinIcon.src = isPinned ? '../../assets/pin_off.svg' : '../../assets/pin.svg';
    if (pinButton) pinButton.classList.toggle('pinned', isPinned);
  },

  /**
   * Sets up the debug mode shortcut (Ctrl+D)
   * @returns {void}
   * @author isahooman
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

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
  WindowControls.init();
});
