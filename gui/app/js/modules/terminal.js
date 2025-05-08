const TerminalModule = {
  terminals: {},
  addons: {},
  buffer: [],
  filteredBuffer: {},
  filterActive: {},
  filterTerms: {},
  maxBuffer: 5000,

  /**
   * Initialize the terminal system
   * @author isahooman
   */
  init() {
    this.setupIPC();
    this.createTerminals();
  },

  /**
   * Create all terminal instances
   * @author isahooman
   */
  createTerminals() {
    // Find terminal container elements
    const logsTerminal = document.getElementById('logs-terminal');
    const homeTerminal = document.getElementById('home-terminal');

    // Create terminal instances for each container
    if (logsTerminal) this.createTerminal('logs', logsTerminal);
    if (homeTerminal) this.createTerminal('main', homeTerminal);
  },

  /**
   * Set up IPC communication and DOM event listeners
   * @author isahooman
   */
  setupIPC() {
    // IPC listeners
    if (window.api.terminal) {
      window.api.terminal.onData(data => this.writeToTerminals(data));
      window.api.terminal.onLog(message => this.writeToBuffer(message));
      window.api.terminal.onClear(() => this.clearTerminals());
    }

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.setAttribute('placeholder', 'Search logs...');
      searchInput.addEventListener('input', (e) => {
        this.filterTerminal('logs', e.target.value.trim().toLowerCase());
      });
    }

    // Clear logs button
    document.querySelector('.clear-logs-btn').addEventListener('click', () => {
      if (window.api.terminal) window.api.terminal.clear();
      else this.clearTerminals();
    });

    // resize terminals when the window is resized
    window.addEventListener('resize', this.handleResize.bind(this));
  },

  /**
   * Handle window resizing
   * @author isahooman
   */
  handleResize() {
    setTimeout(() => {
      Object.keys(this.terminals).forEach(id => this.resizeTerminal(id));
    }, 100);
  },

  /**
   * Create a terminal instance
   * @param {string} id - The ID of the terminal
   * @param {HTMLElement} container - The element to attach the terminal to
   * @author isahooman
   */
  createTerminal(id, container) {
    const options = {
      cursorBlink: false,
      fontSize: 12,
      fontFamily: 'Consolas, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
        cursor: '#ffffff',
        cursorAccent: '#000000',
        selection: 'rgba(255, 255, 255, 0.3)',
      },
      convertEol: true,
      scrollback: this.maxBuffer,
      disableStdin: true,
      allowTransparency: true,
      allowProposedApi: true,
    };

    try {
      const term = new window.Terminal(options);
      this.addons[id] = {};

      // Use fit addon for terminal resizing
      const fitAddon = new window.FitAddon.FitAddon();
      term.loadAddon(fitAddon);
      this.addons[id].fit = fitAddon;

      // Use search addon for logs searching
      if (id === 'logs') {
        const searchAddon = new window.SearchAddon.SearchAddon();
        term.loadAddon(searchAddon);
        this.addons[id].search = searchAddon;
      }

      // Open and fit the terminal
      term.open(container);
      fitAddon.fit();

      // Remove the terminal cursor
      term.write('\x1b[?25l');

      this.terminals[id] = term;
      this.syncTerminal(id);

      return term;
    } catch (e) {
      console.error('Error creating terminal:', e);
      return null;
    }
  },

  /**
   * Resize a specific terminal instance
   * @param {string} id - The ID of the terminal to resize
   * @author isahooman
   */
  resizeTerminal(id) {
    const terminal = this.getTerminal(id);
    const fitAddon = this.addons[id]?.fit;

    if (!terminal || !fitAddon) return;

    // check if the terminal exists and is visible
    const container = terminal.element.closest('.terminal-container');
    if (!container || container.offsetHeight === 0 || container.offsetWidth === 0) {
      setTimeout(() => this.resizeTerminal(id), 50);
      return;
    }

    try {
      // Apply fit addon
      fitAddon.fit();

      // Resize the terminal to fit the container
      const xtermRows = terminal.element.querySelector('.xterm-rows');
      if (xtermRows) {
        xtermRows.style.cssText = 'width: 100% !important; height: 100% !important;';
        xtermRows.style.minWidth = container.offsetWidth + 'px';
      }

      ['viewport', 'screen'].forEach(className => {
        const element = terminal.element.querySelector(`.xterm-${className}`);
        if (element) {
          element.style.width = '100%';
          element.style.height = '100%';
        }
      });

      // Force refresh
      terminal.refresh(0, terminal.rows - 1);
    } catch (e) {
      console.error(`Error resizing terminal ${id}:`, e);
    }
  },

  /**
   * Filter the terminal output based on the search input
   * @param {string} id - The ID of the terminal to filter
   * @param {string} filterTerm - The term to filter by
   * @author isahooman
   */
  filterTerminal(id, filterTerm) {
    const term = this.getTerminal(id);
    if (!term) return;

    this.filterTerms[id] = filterTerm;

    if (!filterTerm) {
      this.resetFilter(id);
      return;
    }

    this.filterActive[id] = true;
    this.filteredBuffer[id] = this.buffer.filter(line =>
      line.toLowerCase().includes(filterTerm.toLowerCase()),
    );

    this.displayContent(id);
  },

  /**
   * Reset filter for a terminal
   * @param {string} id - The ID of the terminal to reset filter for
   * @author isahooman
   */
  resetFilter(id) {
    this.filterActive[id] = false;
    this.filterTerms[id] = '';
    this.filteredBuffer[id] = [];
    this.displayContent(id);
  },

  /**
   * Display the content of a terminal based on the filter state
   * @param {string} id - The ID of the terminal to display content for
   * @author isahooman
   */
  displayContent(id) {
    const term = this.getTerminal(id);
    if (!term) return;

    term.clear();

    if (this.filterActive[id] && this.filterTerms[id]) if (this.filteredBuffer[id]?.length > 0) term.write(this.filteredBuffer[id].join('\r\n') + '\r\n');
    else term.write(`\x1b[3m\x1b[33mNo matching results for: ${this.filterTerms[id]}\x1b[0m\r\n`);

    else if (this.buffer.length > 0) term.write(this.buffer.join('\r\n') + '\r\n');
  },

  /**
   * Format a message for terminal output
   * @param {string} message - The message to format
   * @returns {string} The formatted message
   * @author isahooman
   */
  formatMessage(message) {
    let outputMessage;

    if (message === null) outputMessage = 'null';
    else if (message === undefined) outputMessage = 'undefined';
    else if (typeof message === 'object') try {
      outputMessage = JSON.stringify(message, null, 2);
    } catch {
      outputMessage = '[Unstringifiable Object]';
    }
    else outputMessage = String(message);

    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] ${outputMessage}`;
  },

  /**
   * Write a message to the buffer and all terminals
   * @param {string} message - The message to write
   * @author isahooman
   */
  writeToBuffer(message) {
    const formattedMessage = this.formatMessage(message);

    // Add to main buffer and trim if needed
    this.buffer.push(formattedMessage);
    this.buffer = this.trimBuffer(this.buffer);

    // Write to all terminals
    Object.keys(this.terminals).forEach(id => {
      const term = this.terminals[id];
      const isFiltered = this.filterActive[id] && this.filterTerms[id];

      if (isFiltered) {
        if (formattedMessage.toLowerCase().includes(this.filterTerms[id].toLowerCase())) {
          term.writeln(formattedMessage);

          // Initialize filtered buffer if needed
          if (!this.filteredBuffer[id]) this.filteredBuffer[id] = [];

          // Add to filtered buffer and trim if needed
          this.filteredBuffer[id].push(formattedMessage);
          this.filteredBuffer[id] = this.trimBuffer(this.filteredBuffer[id]);
        }
      } else {
        term.writeln(formattedMessage);
      }
    });
  },

  /**
   * Sync a terminal with the current buffer
   * @param {string} id - The ID of the terminal to sync
   * @author isahooman
   */
  syncTerminal(id) {
    this.displayContent(id);
  },

  /**
   * Clear all terminals and reset the buffer
   * @author isahooman
   */
  clearTerminals() {
    this.buffer = [];
    this.filteredBuffer = {};

    Object.keys(this.terminals).forEach(id => {
      const term = this.terminals[id];
      if (term) {
        term.clear();
        this.resetFilter(id);
      }
    });
  },

  /**
   * Write data to all terminals
   * @param {string} data - The data to write
   * @author isahooman
   */
  writeToTerminals(data) {
    Object.values(this.terminals).forEach(term => {
      if (term) term.write(data);
    });
  },

  /**
   * Get a terminal instance by ID
   * @param {string} id - The ID of the terminal
   * @author isahooman
   */
  getTerminal(id) {
    return this.terminals[id] || null;
  },

  /**
   * Trim the buffer to maintain a maximum size
   * @param {string[]} buffer - The buffer to trim
   * @returns {string[]} The trimmed buffer
   * @author isahooman
   */
  trimBuffer(buffer) {
    if (buffer.length > this.maxBuffer) return buffer.slice(buffer.length - this.maxBuffer);
    return buffer;
  },
};

/**
 * Initialize when ready
 */
document.addEventListener('DOMContentLoaded', () => {
  TerminalModule.init();
});

window.TerminalModule = TerminalModule;
