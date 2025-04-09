class OutputBox {
  /**
   * Creates a new OutputBox instance
   * @param {string} elementId - The ID of the output box element
   * @param {object} [options={}] - Options
   * @param {number} [options.maxLines] - Maximum number of output groups to keep in history
   * @author isahooman
   */
  constructor(elementId, options = {}) {
    this.outputBox = document.getElementById(elementId);
    this.elementId = elementId;
    this.maxLines = options.maxLines || 10000;
    this.sessionId = Date.now();

    // Listen for state changes
    window.api.output.onStateChange(elementId, state => {
      if (state.display) this.displayOutput(state.data);
    });
  }

  /**
   * Adds an output entry to the output box
   * @param {HTMLElement} container - The output box container
   * @param {object} data - The output data
   * @param {string} data.message - The message content
   * @param {string} [data.type] - Message type
   * @param {number} [data.timestamp] - Optional timestamp for the message
   * @author isahooman
   */
  addOutputEntry(container, data) {
    const entry = document.createElement('div');
    entry.classList.add('output-entry');

    // Handle different types of messages with appropriate styling
    if (data.type === 'error') {
      entry.classList.add('output-error');
      entry.textContent = `Error: ${data.message}`;
    } else {
      entry.classList.add('output-message');
      entry.textContent = data.message;
    }

    // Add timestamp if provided
    if (data.timestamp) {
      const timestamp = document.createElement('span');
      timestamp.classList.add('output-timestamp');
      timestamp.textContent = new Date(data.timestamp).toLocaleTimeString();
      entry.prepend(timestamp);
    }

    container.appendChild(entry);
  }

  /**
   * Displays output data in the output box
   * @param {object | Array} data - Output entry or array of entries
   * @param {string} data.message - The message content
   * @param {string} [data.type] - Message type
   * @param {number} [data.timestamp] - Optional timestamp for the message
   * @author isahooman
   */
  displayOutput(data) {
    const outputGroup = document.createElement('div');
    outputGroup.classList.add('output-group');
    outputGroup.setAttribute('data-session', this.sessionId);

    // Handle single items and arrays of items
    if (Array.isArray(data)) data.forEach(item => this.addOutputEntry(outputGroup, item));
    else this.addOutputEntry(outputGroup, data);

    this.addDivider(outputGroup);

    // Insert the output at the top of the output box
    this.outputBox.insertBefore(outputGroup, this.outputBox.firstChild);
    this.outputBox.scrollTop = 0;

    // Max lines to prevent memory issues
    while (this.outputBox.childNodes.length > this.maxLines) this.outputBox.removeChild(this.outputBox.lastChild);
  }

  /**
   * Adds a visual divider to the output group
   * @param {HTMLElement} container - The container to append the divider to
   * @author isahooman
   */
  addDivider(container) {
    const divider = document.createElement('hr');
    divider.classList.add('output-divider');
    container.appendChild(divider);
  }

  /**
   * Clears the output box and resets the session ID
   * @author isahooman
   */
  clear() {
    this.outputBox.innerHTML = '';
    this.sessionId = Date.now();
  }
}

module.exports = OutputBox;
