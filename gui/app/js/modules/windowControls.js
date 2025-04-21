const WindowControls = {
  init() {
    this.setupMinimizeButton();
    this.setupMaximizeButton();
    this.setupCloseButton();
    this.setupPinButton();
    this.setupDebugToggle();
    this.setupMenuButton();
    this.debugActive = false;
    this.debugOverlay = null;
    this.debugTreeView = null;
    this.currentDebugElement = null;
    this.debugHighlight = null;
  },

  /**
   * Sets up the minimize button click handler
   * @author isahooman
   */
  setupMinimizeButton() {
    document.querySelector('.minimize-button')?.addEventListener('click', () => {
      window.api.window.minimize();
    });
  },

  /**
   * Sets up the maximize/restore button click handler
   * @author isahooman
   */
  setupMaximizeButton() {
    document.querySelector('.maximize-button')?.addEventListener('click', () => {
      window.api.window.maximize();
    });
  },

  /**
   * Sets up the close button click handler
   * @author isahooman
   */
  setupCloseButton() {
    document.querySelector('.close-button')?.addEventListener('click', () => {
      window.api.window.close();
    });
  },

  /**
   * Sets up the pin button click handler and state change listener
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
   * @author isahooman
   */
  setupDebugToggle() {
    document.addEventListener('keydown', event => {
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        this.toggleDebugMode();
      }
    });
  },

  /**
   * Toggles debug mode
   * @author isahooman
   */
  toggleDebugMode() {
    this.debugActive = !this.debugActive;

    // Store debug state
    window.slateDebugMode = this.debugActive;

    document.body.classList.toggle('debug', this.debugActive);

    // Preserve current view class
    const currentView = document.body.className.split(' ')
      .find(cls => cls.endsWith('-view')) || '';

    if (currentView) document.body.className = `${currentView}${this.debugActive ? ' debug' : ''}`;

    if (this.debugActive) {
      this.createDebugOverlay();
      document.addEventListener('mousemove', this.handleDebugMouse.bind(this));
    } else {
      this.removeDebugOverlay();
      document.removeEventListener('mousemove', this.handleDebugMouse.bind(this));
    }
  },

  /**
   * Initialize debug overlay
   * @author isahooman
   */
  createDebugOverlay() {
    // Create overlay container
    this.debugOverlay = document.createElement('div');
    this.debugOverlay.className = 'debug-overlay';
    this.debugOverlay.style = `
      position: fixed;
      top: calc(var(--titlebar-height) + 25px);
      right: 10px;
      background-color: rgba(0, 0, 0, 0.85);
      color: #fff;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      max-height: 80vh;
      max-width: 400px;
      overflow: auto;
      font-size: 12px;
      font-family: "Roboto Bold", Arial, sans-serif;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      pointer-events: none;
    `;

    // Create tree view container
    this.debugTreeView = document.createElement('div');
    this.debugTreeView.className = 'debug-tree';
    this.debugOverlay.appendChild(this.debugTreeView);

    // Add position data
    this.debugOverlay.dataset.position = 'top-right';

    document.body.appendChild(this.debugOverlay);
  },

  /**
   * Handle mouse movement for debug
   * @param {MouseEvent} e - Mouse event
   * @author isahooman
   */
  handleDebugMouse(e) {
    if (!this.debugActive) return;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target === this.currentDebugElement) return;

    this.currentDebugElement = target;
    this.updateDebugTree(target);

    // Check if mouse is over the overlay and reposition if needed
    const overlayRect = this.debugOverlay.getBoundingClientRect();
    const isOverOverlay =
      e.clientX >= overlayRect.left &&
      e.clientX <= overlayRect.right &&
      e.clientY >= overlayRect.top &&
      e.clientY <= overlayRect.bottom;

    if (isOverOverlay) this.cycleOverlayPosition();
  },

  /**
   * Cycle through overlay positions
   * @author isahooman
   */
  cycleOverlayPosition() {
    const positions = ['top-right', 'top-left', 'bottom-left', 'bottom-right'];
    const current = this.debugOverlay.dataset.position;
    const nextIndex = (positions.indexOf(current) + 1) % positions.length;
    const position = positions[nextIndex];

    const style = this.debugOverlay.style;
    style.top = style.bottom = style.left = style.right = null;

    switch (position) {
      case 'top-left':
        style.top = '10px';
        style.left = '10px';
        break;
      case 'bottom-left':
        style.bottom = '10px';
        style.left = '10px';
        break;
      case 'bottom-right':
        style.bottom = '10px';
        style.right = '10px';
        break;
      default: // top-right
        style.top = '10px';
        style.right = '10px';
    }

    this.debugOverlay.dataset.position = position;
  },

  /**
   * Update debug tree with element path
   * @param {HTMLElement} element - The target element
   * @author isahooman
   */
  updateDebugTree(element) {
    if (!element || !this.debugTreeView) return;

    this.debugTreeView.innerHTML = '';
    this.removeHighlight();

    // Build element path and display tree
    const path = [];
    let current = element;
    while (current && current !== document.documentElement) {
      path.unshift(current);
      current = current.parentElement;
    }

    path.forEach((el, index) => {
      const entry = document.createElement('div');
      entry.style = `
        padding-left: ${index * 12}px;
        position: relative;
        margin-bottom: 3px;
        padding-top: 2px;
        padding-bottom: 2px;
      `;

      // Add branch line
      if (index > 0) {
        const line = document.createElement('span');
        line.style = `
          position: absolute;
          left: ${(index - 1) * 12 + 5}px;
          top: 0;
          border-left: 1px solid #666;
          border-bottom: 1px solid #666;
          width: 7px;
          height: 10px;
        `;
        entry.appendChild(line);
      }

      // Element tag
      const tag = document.createElement('span');
      tag.textContent = el.tagName.toLowerCase();
      tag.style.color = '#FFA500';
      entry.appendChild(tag);

      // Element ID
      if (el.id) {
        const id = document.createElement('span');
        id.textContent = `#${el.id}`;
        id.style.cssText = 'color: #A0D6FF; margin-left: 5px;';
        entry.appendChild(id);
      }

      // Element classes
      if (el.classList && el.classList.length) {
        const classes = document.createElement('span');
        classes.textContent = Array.from(el.classList).map(c => `.${c}`).join('');
        classes.style.cssText = 'color: #A5D6A7; margin-left: 5px;';
        entry.appendChild(classes);
      }

      this.debugTreeView.appendChild(entry);
    });

    // Highlight the target element
    this.highlightElement(element);
  },

  /**
   * Highlight the target element
   * @param {HTMLElement} element - The target element
   * @author isahooman
   */
  highlightElement(element) {
    const rect = element.getBoundingClientRect();
    this.debugHighlight = document.createElement('div');
    this.debugHighlight.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid rgba(255, 165, 0, 0.9);
      background-color: rgba(255, 165, 0, 0.2);
      pointer-events: none;
      z-index: 9999;
      box-shadow: 0 0 5px rgba(255, 165, 0, 0.7);
    `;

    document.body.appendChild(this.debugHighlight);
  },

  /**
   * Remove highlight element
   * @author isahooman
   */
  removeHighlight() {
    if (this.debugHighlight && this.debugHighlight.parentNode) {
      this.debugHighlight.parentNode.removeChild(this.debugHighlight);
      this.debugHighlight = null;
    }
  },

  /**
   * Remove debug overlay and clean up
   * @author isahooman
   */
  removeDebugOverlay() {
    if (this.debugOverlay && this.debugOverlay.parentNode) {
      this.debugOverlay.parentNode.removeChild(this.debugOverlay);
      this.debugOverlay = null;
      this.debugTreeView = null;
    }

    this.removeHighlight();
    this.currentDebugElement = null;
  },

  /**
   * Sets up the menu button click handler
   * @author isahooman
   */
  setupMenuButton() {
    document.querySelector('.menu-button')?.addEventListener('click', () => {
      const currentLayout = document.documentElement.getAttribute('layout');
      const newLayout = currentLayout === 'expanded' ? 'compact' : 'expanded';
      // Update layout through api
      window.api.layout.update(newLayout);
    });
  },
};

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
  WindowControls.init();
});
