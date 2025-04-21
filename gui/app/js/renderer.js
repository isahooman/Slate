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
