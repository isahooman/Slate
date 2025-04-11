const Config = {
  init() {
    this.setupVisibilityToggles();
    this.setupTooltips();
    this.setupArrayContainers();
  },

  /**
   * Set up all show/hide toggle buttons
   * @author isahooman
   */
  setupVisibilityToggles() {
    // Click listener for toggles
    document.addEventListener('click', (event) => {
      const toggleButton = event.target.closest('.toggle-visibility');
      if (!toggleButton) return;

      // Get the target input from the button data
      const targetId = toggleButton.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);

      if (targetInput) {
        const isPassword = targetInput.type === 'password';
        targetInput.type = isPassword ? 'text' : 'password';

        // Update the button icon
        const icon = toggleButton.querySelector('img');
        if (icon) {
          icon.src = isPassword ? '../../assets/hide.svg' : '../../assets/show.svg';
          icon.alt = isPassword ? 'Hide' : 'Show';
        }
      }
    });
  },

  /**
   * Set up array containers for add/remove functionality
   * @author isahooman
   */
  setupArrayContainers() {
    // Initialize containers
    const arrayContainers = document.querySelectorAll('.array-container');
    arrayContainers.forEach(container => {
      // Set initial state as expanded
      container.classList.add('expanded');

      // Add placeholder if empty
      if (container.children.length === 0) this.addPlaceholderItem(container);
    });

    // Container toggle
    document.addEventListener('click', (event) => {
      const toggleButton = event.target.closest('.toggle-array-container');
      if (!toggleButton) return;

      const targetId = toggleButton.getAttribute('data-target');
      const container = document.getElementById(targetId);

      if (container) {
        const isExpanded = container.classList.contains('expanded');

        if (isExpanded) {
          // Collapse the container
          container.classList.remove('expanded');
          container.classList.add('collapsed');
        } else {
          // Expand the container
          container.classList.remove('collapsed');
          container.classList.add('expanded');
        }

        // Update arrow icon
        const icon = toggleButton.querySelector('img');
        if (icon) {
          icon.src = isExpanded ? '../../assets/down.svg' : '../../assets/up.svg';
          icon.alt = isExpanded ? 'Expand' : 'Collapse';
        }
      }
    });

    // Add items when Enter is pressed
    document.addEventListener('keypress', (event) => {
      if (event.key !== 'Enter') return;

      const input = event.target.closest('.input-array');
      if (!input || !input.value.trim()) return;

      const containerId = input.id + '-container';
      const container = document.getElementById(containerId);

      if (container) {
        // If initial item, remove placeholder
        if (container.querySelector('.placeholder-item')) container.innerHTML = '';

        // Add the new item
        this.addArrayItem(container, input.value.trim());

        // Clear the input
        input.value = '';
      }
    });

    // Handle removing array items
    document.addEventListener('click', (event) => {
      const removeButton = event.target.closest('.array-item-remove');
      if (!removeButton) return;

      const item = removeButton.closest('.array-item');
      const container = item.closest('.array-container');

      if (item && container) {
        container.removeChild(item);

        // Add placeholder if empty after removal
        if (container.children.length === 0) this.addPlaceholderItem(container);
      }
    });
  },

  /**
   * Add a placeholder item to an empty array container
   * @param {HTMLElement} container - The array container element
   * @author isahooman
   */
  addPlaceholderItem(container) {
    // Get the container id to find the associated text
    const containerId = container.id;
    const inputId = containerId.replace('-container', '');
    const input = document.getElementById(inputId);

    let placeholderText = 'No items added';

    if (input) {
      // Try to find the palceholder associated with the input
      const labelElement = document.querySelector(`label[for="${inputId}"]`);
      if (labelElement) {
        const labelText = labelElement.textContent.trim();

        if (labelText.includes('Owner')) {
          placeholderText = 'No owners have been added';
        } else if (labelText.includes('Channel')) {
          placeholderText = 'No channels have been added';
        } else if (labelText.includes('User')) {
          placeholderText = 'No users have been added';
        } else if (labelText.includes('Role')) {
          placeholderText = 'No roles have been added';
        } else if (labelText.includes('Command')) {
          placeholderText = 'No commands have been added';
        } else if (labelText.includes('Prefix')) {
          placeholderText = 'No prefixes have been added';
        } else if (labelText.includes('Event')) {
          placeholderText = 'No events have been added';
        } else {
          const type = labelText.toLowerCase().replace(/s\s*$/, '');
          placeholderText = `No ${type}s have been added`;
        }
      }
    }

    const placeholderItem = document.createElement('div');
    placeholderItem.className = 'array-item placeholder-item';
    placeholderItem.innerHTML = `
      <span class="array-item-value">${placeholderText}</span>
    `;
    container.appendChild(placeholderItem);
  },

  /**
   * Add a new item to an array container
   * @param {HTMLElement} container - The array container element
   * @param {string} value - The value to add
   * @author isahooman
   */
  addArrayItem(container, value) {
    const item = document.createElement('div');
    item.className = 'array-item';
    item.innerHTML = `
      <span class="array-item-value">${value}</span>
      <button class="array-item-remove" title="Remove">
        <img src="../../assets/trash.svg" alt="Remove">
      </button>
    `;
    container.appendChild(item);
  },

  /**
   * Set up tooltips for help icons
   * @author isahooman
   */
  setupTooltips() {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    document.body.appendChild(tooltip);

    // Hover event
    document.addEventListener('mouseover', (event) => {
      const helpIcon = event.target.closest('.help-icon');
      if (!helpIcon) return;

      const helpText = helpIcon.getAttribute('data-help');
      if (!helpText) return;

      tooltip.textContent = helpText;
      tooltip.style.display = 'block';

      // Position the tooltip
      this.positionTooltip(tooltip, helpIcon);
    });

    // Stop showing when no longer hovering
    document.addEventListener('mouseout', (event) => {
      const helpIcon = event.target.closest('.help-icon');
      if (!helpIcon) return;

      tooltip.style.display = 'none';
    });
  },

  /**
   * Position the tooltip to prevent it from going off-screen
   * @param {HTMLElement} tooltip - The tooltip element
   * @param {HTMLElement} helpIcon - The help icon element
   * @author isahooman
   */
  positionTooltip(tooltip, helpIcon) {
    const iconRect = helpIcon.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 8;

    const positions = {
      bottom: {
        top: iconRect.bottom + padding,
        left: iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2),
      },
      top: {
        top: iconRect.top - tooltipRect.height - padding,
        left: iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2),
      },
      right: {
        top: iconRect.top + (iconRect.height / 2) - (tooltipRect.height / 2),
        left: iconRect.right + padding,
      },
      left: {
        top: iconRect.top + (iconRect.height / 2) - (tooltipRect.height / 2),
        left: iconRect.left - tooltipRect.width - padding,
      },
    };

    const preferredOrder = ['bottom', 'top', 'right', 'left'];

    // Find the first position that fits within viewport
    let bestPosition = null;

    for (const pos of preferredOrder) {
      const { top, left } = positions[pos];

      // Check if this position keeps the tooltip within viewport bounds
      const fitsTop = top >= 5;
      const fitsBottom = top + tooltipRect.height <= window.innerHeight - 5;
      const fitsLeft = left >= 5;
      const fitsRight = left + tooltipRect.width <= window.innerWidth - 5;

      if (fitsTop && fitsBottom && fitsLeft && fitsRight) {
        bestPosition = pos;
        break;
      }
    }

    // If no ideal position, use bottom and adjust to keep within viewport
    if (!bestPosition) bestPosition = 'bottom';

    let { top, left } = positions[bestPosition];

    if (top < 5) top = 5;
    if (top + tooltipRect.height > window.innerHeight - 5) top = window.innerHeight - tooltipRect.height - 5;
    if (left < 5) left = 5;
    if (left + tooltipRect.width > window.innerWidth - 5) left = window.innerWidth - tooltipRect.width - 5;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    tooltip.setAttribute('data-position', bestPosition);
  },
};

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
  Config.init();
});

module.exports = Config;
