document.addEventListener('DOMContentLoaded', () => {
  const okButton = document.getElementById('ok-button');
  const messageElement = document.getElementById('alert-message');

  // Get message from main process
  window.api.alert.onMessage(message => {
    if (messageElement) messageElement.textContent = message;
  });

  // Close alert window
  function closeAlert() {
    window.api.alert.close();
  }

  // Close alert when clicking ok
  if (okButton) okButton.addEventListener('click', closeAlert);

  // Close alert when pressing Enter, Space, or Escape
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'Escape' ||
        (event.ctrlKey && event.key === 'w')) {
      event.preventDefault();
      closeAlert();
    }
  });

  // Auto-focus OK button
  if (okButton) okButton.focus();
});
