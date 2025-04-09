let debugMode = false;

// initial settings load
window.api.settings.load();

/**
 * Applies the specified layout to the application UI
 * @param {string} layout - The layout to apply ('compact' or 'expanded')
 * @author isahooman
 */
function applyLayout(layout) {
  document.documentElement.setAttribute('layout', layout);
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

/**
 * Synchronizes multiple output boxes with the main output
 * @author isahooman
 */
function syncOutput() {
  // Loop through all output container IDs that need to be synchronized
  ['logs-output-box', 'main-output-box'].forEach(outputId => {
    // Register output listener for each output box
    window.api.output.onStateChange(outputId, state => {
      const outputBox = document.getElementById(outputId);
      if (!outputBox) return;

      if (state.clear) outputBox.innerHTML = '';
      else if (state.display && state.data) createOutputEntry(outputBox, state.data);
    });
  });
}

/**
 * Creates an entry into the output container
 * @param {HTMLElement} outputBox - The container element
 * @param {object} data - The output data
 * @param {string} data.message - The message to display
 * @param {string} [data.type] - The type of message (ex: 'error')
 * @param {string|number} [data.timestamp] - The message timestamp
 * @author isahooman
 */
function createOutputEntry(outputBox, data) {
  // Create the main container for the output
  const entry = document.createElement('div');
  entry.classList.add('output-entry');

  // Add timestamp if provided
  if (data.timestamp) {
    const timestamp = document.createElement('span');
    timestamp.classList.add('output-timestamp');
    timestamp.textContent = new Date(data.timestamp).toLocaleTimeString();
    entry.appendChild(timestamp);
  }

  // Add the message
  const message = document.createElement('span');
  message.classList.add('output-message');
  // Apply error styling if this is an error message
  if (data.type === 'error') message.classList.add('output-error');
  message.textContent = data.message;
  entry.appendChild(message);

  // Add a visual divider after each entry
  const divider = document.createElement('hr');
  divider.classList.add('output-divider');
  entry.appendChild(divider);

  // Insert at the beginning for newest-first order
  outputBox.insertBefore(entry, outputBox.firstChild);
}

// Setup sync once loaded
document.addEventListener('DOMContentLoaded', () => {
  syncOutput();
});

/**
 * Set up event handlers for sidebar navigation buttons
 * @author isahooman
 */
const sidebarButtons = document.querySelectorAll('.sidebar-nav button[data-section]');

sidebarButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetSection = button.dataset.section;

    // Skip if clicking settings button or button has no target
    if (!targetSection) return;

    // Update active states
    sidebarButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Show/hide sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
      if (section.id === targetSection) section.classList.add('active');
    });

    document.body.className = `${targetSection}-view${debugMode ? ' debug' : ''}`;
  });
});

// Separate handler for settings nav (opens new window instead of section)
document.querySelector('.settings-nav-btn')?.addEventListener('click', () => {
  window.api.settings.open();
});

// Menu button handler to toggle layouts
document.querySelector('.menu-button')?.addEventListener('click', () => {
  const currentLayout = document.documentElement.getAttribute('layout');
  const newLayout = currentLayout === 'expanded' ? 'compact' : 'expanded';
  // Update through api
  window.api.layout.update(newLayout);
});
