const logContainer = document.getElementById('log');

function appendLog(activity) {
  const div = document.createElement('div');
  div.textContent = `[${activity.timestamp}] ${activity.type} - ${activity.details}`;
  logContainer.appendChild(div);
}

// log activity from renderer
document.addEventListener('click', () => {
  const activity = { type: 'click', details: 'Mouse click', timestamp: new Date().toISOString() };
  appendLog(activity);
  window.activityAPI.logActivity(activity); 
});

document.addEventListener('scroll', () => {
  const activity = { type: 'scroll', details: 'Scroll detected', timestamp: new Date().toISOString() };
  appendLog(activity);
  window.activityAPI.logActivity(activity); 
});

document.addEventListener('keydown', (e) => {
  const activity = { type: 'keydown', details: `Key: ${e.key}`, timestamp: new Date().toISOString() };
  appendLog(activity);
  window.activityAPI.logActivity(activity); 
});

// Listen for active window logs from the main process
window.activityAPI.onActivity((activity) => {
  appendLog(activity);
});
