// P2-4: Segment control additions for stepquest/steps.js
// Add this after main module initialization

const segmentInit = () => {
  // Render segment control UI
  const stepsScreen = document.getElementById('steps');
  if (!stepsScreen) return;

  const segmentsHTML = `
    <div class="sq-segments" style="display:flex; gap:8px; padding:16px; border-bottom:1px solid var(--line);">
      <button class="sq-seg active" data-segment="today">Today</button>
      <button class="sq-seg" data-segment="week">Week</button>
      <button class="sq-seg" data-segment="body">Body</button>
      <button class="sq-seg" data-segment="gear">Gear</button>
    </div>
  `;

  const stepsList = stepsScreen.querySelector('.sq-list') || stepsScreen.querySelector('[role="list"]');
  if (stepsList && stepsList.parentNode) {
    const container = document.createElement('div');
    container.innerHTML = segmentsHTML;
    stepsList.parentNode.insertBefore(container.firstElementChild, stepsList);
  }

  // Wire up segment control
  document.querySelectorAll('.sq-seg').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sq-seg').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const seg = btn.dataset.segment;
      console.log('Segment selected:', seg);
      // TODO: Load segment data (Today/Week) or navigate (Body/Gear)
    });
  });

  // Pause animations when tab not visible
  const stepsTab = document.getElementById('tab-steps') || document.getElementById('tab-todo');
  const observer = new MutationObserver(() => {
    const isOpen = stepsScreen.classList.contains('open');
    stepsScreen.classList.toggle('sq-hidden', !isOpen);
  });
  observer.observe(stepsScreen, { attributes: true, attributeFilter: ['class'] });
};

// Call on ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', segmentInit);
} else {
  segmentInit();
}
