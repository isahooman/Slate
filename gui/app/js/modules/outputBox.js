class OutputBox {
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

  addOutputEntry(container, data) {
    const entry = document.createElement('div');
    entry.classList.add('output-entry');

    if (data.type === 'error') {
      entry.classList.add('output-error');
      entry.textContent = `Error: ${data.message}`;
    } else {
      entry.classList.add('output-message');
      entry.textContent = data.message;
    }

    if (data.timestamp) {
      const timestamp = document.createElement('span');
      timestamp.classList.add('output-timestamp');
      timestamp.textContent = new Date(data.timestamp).toLocaleTimeString();
      entry.prepend(timestamp);
    }

    container.appendChild(entry);
  }

  displayOutput(data) {
    const outputGroup = document.createElement('div');
    outputGroup.classList.add('output-group');
    outputGroup.setAttribute('data-session', this.sessionId);

    if (Array.isArray(data)) data.forEach(item => this.addOutputEntry(outputGroup, item));
    else this.addOutputEntry(outputGroup, data);

    this.addDivider(outputGroup);
    this.outputBox.insertBefore(outputGroup, this.outputBox.firstChild);
    this.outputBox.scrollTop = 0;

    // Maintain max lines limit
    while (this.outputBox.childNodes.length > this.maxLines) this.outputBox.removeChild(this.outputBox.lastChild);
  }

  addDivider(container) {
    const divider = document.createElement('hr');
    divider.classList.add('output-divider');
    container.appendChild(divider);
  }

  clear() {
    this.outputBox.innerHTML = '';
    this.sessionId = Date.now();
  }
}

module.exports = OutputBox;
