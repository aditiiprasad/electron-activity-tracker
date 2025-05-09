function addLog(id, message, type = '') {
  const list = document.getElementById(id);
  if (!list) return;

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  const date = now.toLocaleDateString();

  const li = document.createElement('li');
  li.innerHTML = `
    <span class="badge type ${type.toLowerCase()}">${type}</span>
    <span class="log-message">${message}</span>
    <div class="badge-container">
      <span class="badge date">${date}</span>
      <span class="badge time">${time}</span>
    </div>
  `;
  list.appendChild(li);
}

// Mouse, Keyboard, Scroll 
document.addEventListener('mousedown', (e) => {
  addLog('activityList', `Mouse clicked at (${e.clientX}, ${e.clientY})`, 'Mouse');
});

document.addEventListener('keydown', (e) => {
  addLog('activityList', `Key pressed: ${e.key}`, 'Keyboard');
});

window.addEventListener('wheel', (e) => {
  const direction = e.deltaY > 0 ? 'down' : 'up';
  const amount = Math.abs(e.deltaY);
  addLog('activityList', `Scrolled ${direction} by ${amount.toFixed(0)}px`, 'Scroll');
});

// Log window activity 
if (window.api) {
  window.api.onActiveAppChange((appName) => {
    addLog('windowList', `Active App: ${appName}`, 'Window');
  });

  window.api.onTopAppsUpdate((apps) => {
    updateTopApps(apps);
  });
}

// Format time for dashboard
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// Update the Top Apps dashboard
function updateTopApps(apps) {
  const container = document.getElementById('topApps');
  if (!container) return;

  container.innerHTML = '';
  apps.forEach(app => {
    const card = document.createElement('div');
    card.className = 'app-card';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'app-name';
    nameDiv.textContent = app.name;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'app-time';
    timeDiv.textContent = formatTime(app.time);

    card.appendChild(nameDiv);
    card.appendChild(timeDiv);
    container.appendChild(card);
  });
}

//  Filter & Clear 
function filterLogs(type) {
  const items = document.querySelectorAll('#activityList li');
  items.forEach(item => {
    const badge = item.querySelector('.badge.type');
    if (!badge) return;
    if (type === 'all' || badge.textContent === type) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

function clearLogs() {
  const list = document.getElementById('activityList');
  if (list) list.innerHTML = '';
}
