const Config = {
  init() {
    this.setupVisibilityToggles();
    this.setupTooltips();
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
   * Set up tooltips for help icons
   * @author isahooman
   */
  setupTooltips() {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '1000';
    tooltip.style.backgroundColor = '#696666';
    tooltip.style.color = 'var(--text-color)';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '14px';
    tooltip.style.maxWidth = '300px';
    tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    tooltip.style.textAlign = 'left';
    tooltip.style.wordWrap = 'break-word';
    tooltip.style.lineHeight = '1.4';
    document.body.appendChild(tooltip);

    // Mouse enter event
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

    // Mouse leave event
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

    // Default position below the help icon
    let top = iconRect.bottom + 8;
    let left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);

    // Check if tooltip would go off the right edge
    if (left + tooltipRect.width > window.innerWidth) left = window.innerWidth - tooltipRect.width - 10;

    // Check if tooltip would go off the left edge
    if (left < 10) left = 10;

    // Check if tooltip would go off the bottom edge
    if (top + tooltipRect.height > window.innerHeight) top = iconRect.top - tooltipRect.height - 8;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  },
};

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
  Config.init();
});

module.exports = Config;
