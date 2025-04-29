document.addEventListener('DOMContentLoaded', () => {
  // initial settings load
  window.api.settings.load();

  /**
   * Applies the specified layout to the application UI
   * @param {string} layout - The layout to apply ('compact' or 'expanded')
   * @author isahooman
   */
  function applyLayout(layout) {
    document.documentElement.setAttribute('layout', layout);

    // Resize the terminal to the new layout
    if (window.TerminalModule) window.TerminalModule.handleResize();
  }

  /**
   * Applies theme and layout from saved settings
   * @author isahooman
   */
  window.api.settings.onLoaded(settings => {
    document.documentElement.setAttribute('theme', settings.theme);
    applyLayout(settings.layout);
  });

  /**
   * Updates the UI when layout changes
   * @author isahooman
   */
  window.api.layout.onUpdated(layout => {
    applyLayout(layout);
  });

  // Start the terminal
  if (window.api && window.api.terminal) {
    window.api.terminal.start();

    // Log ready
    window.api.terminal.log('\x1b[1;32mTerminal initialized.\x1b[0m');
    console.log('\x1b[1;32mTerminal initialized.\x1b[0m');
  }
});
