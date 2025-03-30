let debugMode = false;

function applyLayout(layout) {
  document.documentElement.setAttribute('layout', layout);
}

window.api.loadSettings();
window.api.onSettingsLoaded(settings => {
  document.documentElement.setAttribute('theme', settings.theme);
  applyLayout(settings.layout);
});

window.api.onLayoutUpdated(success => {
  if (success) window.api.loadSettings();
});

window.api.onLayoutChanged(layout => {
  applyLayout(layout);
});

// Output handling
function syncOutput() {
  const outputBoxes = {
    'logs-output-box': document.getElementById('logs-output-box'),
    'main-output-box': document.getElementById('main-output-box'),
  };

  Object.entries(outputBoxes).forEach(([outputId, outputBox]) => {
    if (!outputBox) return;

    window.api.output.getBuffer().then(buffer => {
      if (buffer && buffer.length > 0) buffer.forEach(data => {
        createOutputEntry(outputBox, data);
      });
    });

    // Listen for new output
    window.api.output.onStateChange(outputId, state => {
      if (!outputBox) return;

      if (state.clear) outputBox.innerHTML = '';
      else if (state.display && state.data) createOutputEntry(outputBox, state.data);
    });
  });
}

function createOutputEntry(outputBox, data) {
  const entry = document.createElement('div');
  entry.classList.add('output-entry');

  if (data.timestamp) {
    const timestamp = document.createElement('span');
    timestamp.classList.add('output-timestamp');
    timestamp.textContent = new Date(data.timestamp).toLocaleTimeString();
    entry.appendChild(timestamp);
  }

  const message = document.createElement('span');
  message.classList.add('output-message');
  if (data.type === 'error') message.classList.add('output-error');
  message.textContent = data.message;
  entry.appendChild(message);

  const divider = document.createElement('hr');
  divider.classList.add('output-divider');
  entry.appendChild(divider);

  outputBox.insertBefore(entry, outputBox.firstChild);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  syncOutput();
});

// Section navigation
const sidebarButtons = document.querySelectorAll('.sidebar-nav button[data-section]');

sidebarButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetSection = button.dataset.section;

    // Skip if clicking settings button (it opens a new window)
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

// Settings button
document.querySelector('.settings-nav-btn')?.addEventListener('click', () => {
  window.api.openSettings();
});

// Menu button
document.querySelector('.menu-button')?.addEventListener('click', () => {
  const currentLayout = document.documentElement.getAttribute('layout');
  const newLayout = currentLayout === 'expanded' ? 'compact' : 'expanded';
  window.api.updateLayout(newLayout);
});
