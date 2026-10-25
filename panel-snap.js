// P2-3: Panel snap states (peek/half/full)
const panel = document.getElementById('panel');
if (!panel) {
  console.warn('Panel not found for snap behavior');
} else {
  const SNAP_STATES = {
    peek: { height: 120, label: 'peek' },
    half: { height: '50vh', label: 'half' },
    full: { height: '80vh', label: 'full' },
  };

  let currentState = 'peek';
  let isDragging = false;
  let startY = 0;

  const panelHandle = panel.querySelector('#panel-handle') || panel.querySelector('.panel-handle');
  if (!panelHandle) {
    console.warn('Panel handle not found');
  } else {
    panelHandle.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dy = startY - e.clientY;
    });

    window.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const dy = startY - e.clientY;

      if (currentState === 'peek') {
        if (dy > 60) snapTo('half');
      } else if (currentState === 'half') {
        if (dy > 100) snapTo('full');
        else if (dy < -60) snapTo('peek');
      } else if (currentState === 'full') {
        if (dy < -100) snapTo('half');
      }
    });

    const statusPill = document.getElementById('status-pill');
    if (statusPill) {
      statusPill.addEventListener('click', () => {
        const next = currentState === 'peek' ? 'half' : currentState === 'half' ? 'full' : 'peek';
        snapTo(next);
      });
    }
  }

  function snapTo(state) {
    if (!SNAP_STATES[state]) return;
    currentState = state;
    const h = SNAP_STATES[state].height;
    panel.style.height = typeof h === 'number' ? h + 'px' : h;
    panel.setAttribute('data-snap', state);
  }

  snapTo('peek');
}
