const DebugMenu = {
  isOpen: false,
  terminalTestActive: false,
  testIntervals: [],

  /**
   * Initialize the debug menu
   * @author isahooman
   */
  init() {
    const debugButton = document.querySelector('.debug-button');
    if (debugButton) debugButton.addEventListener('click', this.toggleMenu.bind(this));

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen &&
          !e.target.closest('#debugMenu') &&
          !e.target.closest('.debug-button')) this.closeMenu();
    });
  },

  /**
   * Toggle menu visibility
   * @param {Event} e - The event object
   */
  toggleMenu(e) {
    e?.stopPropagation();
    if (this.isOpen) this.closeMenu();
    else this.openMenu();
  },

  /**
   * Open the debug menu
   * @author isahooman
   */
  openMenu() {
    // Close existing menu
    this.closeMenu();

    const debugButton = document.querySelector('.debug-button');
    if (!debugButton) return;

    const menu = document.createElement('div');
    menu.id = 'debugMenu';
    menu.className = 'debug-menu';

    // Define menu items
    const menuItems = [
      { id: 'openDevTools', text: 'Open DevTools' },
      {
        id: 'toggleTerminalTest',
        text: 'Terminal Test',
        active: this.terminalTestActive,
      },
      {
        id: 'toggleDebugUI',
        text: 'Debug UI',
        active: window.slateDebugMode,
      },
    ];

    // Generate menu HTML
    menu.innerHTML = menuItems.map(item => `
      <div class="debug-menu-item${item.active ? ' active' : ''}" id="${item.id}">
        ${item.text}${item.active ? ' ✓' : ''}
      </div>
    `).join('');

    // Position menu relative to debug button
    const rect = debugButton.getBoundingClientRect();
    menu.style.top = `${rect.bottom}px`;
    menu.style.left = `${rect.left}px`;

    document.body.appendChild(menu);
    this.setupMenuActions();
    this.isOpen = true;
  },

  /**
   * Set up click handlers for debug menu items
   * @author isahooman
   */
  setupMenuActions() {
    const actions = {
      openDevTools: () => window.api?.debug?.openDevTools(),
      toggleTerminalTest: () => {
        this.terminalTestActive = !this.terminalTestActive;
        if (this.terminalTestActive) this.startTerminalTest();
        else this.stopTerminalTest();
      },
      toggleDebugUI: () => {
        // Use keybind as simple workaround toggle
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'd',
          code: 'KeyD',
          ctrlKey: true,
          bubbles: true,
        }));
      },
    };

    // Attach event listeners to each menu items
    Object.entries(actions).forEach(([id, action]) => {
      const element = document.getElementById(id);
      if (element) element.addEventListener('click', () => {
        action();
        this.closeMenu();
      });
    });
  },

  /**
   * Close the debug menu
   * @author isahooman
   */
  closeMenu() {
    const menu = document.getElementById('debugMenu');
    if (menu) menu.remove();

    this.isOpen = false;
  },

  /**
   * Start the terminal test
   * @author isahooman
   */
  startTerminalTest() {
    const terminal = window.api?.terminal;
    if (!terminal) return;

    const { ansiTest } = this;
    terminal.log(`${ansiTest.randomFg()}${ansiTest.randomStyle()}[DEBUG] Terminal test started${ansiTest.reset}`);

    // Display random log messages at regular intervals
    this.testIntervals.push(setInterval(() => {
      // Match bot logger levels
      const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'COMMAND', 'START', 'MESSAGE', 'INTERACTION', 'LOADING'];
      const level = levels[Math.floor(Math.random() * levels.length)];

      // Apply random styling with or without background
      const styling = Math.random() > 0.3 ?
        `${ansiTest.randomFg()}${ansiTest.randomStyle()}` :
        `${ansiTest.randomFg()}${ansiTest.randomBg()}${ansiTest.randomStyle()}`;

      terminal.log(`${styling}[${level}] ${this.generateRandomText()}${ansiTest.reset}`);
    }, 150));
  },

  /**
   * Stop the terminal test
   * @author isahooman
   */
  stopTerminalTest() {
    this.testIntervals.forEach(clearInterval);
    this.testIntervals = [];

    const terminal = window.api?.terminal;
    if (terminal) {
      const { ansiTest } = this;
      terminal.log(`${ansiTest.randomFg()}${ansiTest.randomStyle()}[DEBUG] Terminal test deactivated${ansiTest.reset}`);
    }
  },

  /**
   * ANSI helper for terminal styling
   */
  ansiTest: {
    reset: '\x1b[0m',

    /**
     * Generate random foreground color for terminal test messages
     * @returns {string} - ANSI code for random foreground color
     * @author isahooman
     */
    randomFg() {
      return Math.random() > 0.5 ?
        `\x1b[${Math.random() > 0.5 ? 90 : 30 + Math.floor(Math.random() * 8)}m` :
        `\x1b[38;5;${Math.floor(Math.random() * 256)}m`;
    },

    /**
     * Generate random background color for terminal test messages
     * @returns {string} - ANSI code for random background color
     * @author isahooman
     */
    randomBg() {
      return Math.random() > 0.5 ?
        `\x1b[${40 + Math.floor(Math.random() * 8)}m` :
        `\x1b[48;5;${Math.floor(Math.random() * 256)}m`;
    },

    /**
     * Generate random text styles for terminal test messages
     * @returns {string} - ANSI code for random style
     * @author isahooman
     */
    randomStyle() {
      const styles = [1, 2, 4, 5, 7];
      return `\x1b[${styles[Math.floor(Math.random() * styles.length)]}m`;
    },
  },

  /**
   * Generate random numbers for terminal test messages
   * @returns {string} - Random text
   * @author isahooman
   */
  generateRandomText() {
    return Array(Math.floor(Math.random() * 20) + 10)
      .fill(0)
      .map((_, i) => Math.floor(Math.random() * 10) + (i % 5 === 4 ? ' ' : ''))
      .join('');
  },
};

document.addEventListener('DOMContentLoaded', () => {
  DebugMenu.init();
});
