// P2-5/P2-6/P2-7: Expenses enhancements for expenses/expenses.js
// Add these functions and initializations to the main expenses module

// P2-5: Monthly hero card
async function renderHeroCard() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Simulate data fetch - in production, read from Firestore
  let thisMonthTotal = 0;
  let lastMonthTotal = 0;
  let target = 5000;

  const delta = thisMonthTotal - lastMonthTotal;
  const deltaPercent = lastMonthTotal ? Math.round((delta / lastMonthTotal) * 100) : 0;

  const card = document.createElement('div');
  card.className = 'ex-hero';
  card.innerHTML = `
    <div class="ex-hero-value">${thisMonthTotal.toFixed(2)}</div>
    <div class="ex-hero-label">This month</div>
    <div class="ex-hero-target">Target: ${target}</div>
    <div class="ex-hero-delta ${delta >= 0 ? 'up' : 'down'}">
      ${delta >= 0 ? '+' : ''}${deltaPercent}% vs last month
    </div>
    <svg class="ex-hero-sparkline" viewBox="0 0 100 30">
      <polyline points="0,20 10,18 20,22 30,15 40,19 50,12 60,16 70,10 80,14 90,8 100,11"
                fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>
  `;
  return card;
}

// P2-6: Swipe-to-delete with Undo
function wireExpenseSwipe(row) {
  let startX = 0;
  let dx = 0;

  row.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
  });

  row.addEventListener('pointermove', (e) => {
    dx = e.clientX - startX;
    if (dx < 0) {
      row.style.transform = `translateX(${Math.min(0, dx)}px)`;
      row.style.transition = 'none';
    }
  });

  row.addEventListener('pointerup', () => {
    row.style.transition = 'transform 300ms var(--ease)';
    if (dx < -80) {
      deleteExpenseWithUndo(row);
    } else {
      row.style.transform = 'translateX(0)';
    }
    dx = 0;
  });
}

function deleteExpenseWithUndo(row) {
  const expenseId = row.dataset.id;
  row.style.transform = 'translateX(-100%)';
  row.style.opacity = '0.5';

  showUndoSnackbar('Expense deleted', () => {
    row.style.transform = 'translateX(0)';
    row.style.opacity = '1';
  });

  const undoTimeout = setTimeout(() => {
    row.remove();
    console.log('Permanently delete expense:', expenseId);
  }, 8000);
}

function showUndoSnackbar(message, onUndo) {
  const snackbar = document.createElement('div');
  snackbar.className = 'ex-undo-snackbar';
  snackbar.innerHTML = `
    <span>${message}</span>
    <button class="ex-undo-btn">Undo</button>
  `;

  document.body.appendChild(snackbar);

  snackbar.querySelector('.ex-undo-btn').addEventListener('click', () => {
    onUndo();
    snackbar.remove();
  });

  setTimeout(() => {
    if (snackbar.parentNode) snackbar.remove();
  }, 8000);
}

// P2-7: Frequent categories
async function getFrequentCategories() {
  // In production, read from meta/expenses_cfg or count recent transactions
  return ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities'];
}

async function renderCategoryPicker() {
  const frequent = await getFrequentCategories();

  const picker = document.createElement('div');
  picker.className = 'ex-category-picker';

  const frequentContainer = document.createElement('div');
  frequentContainer.className = 'ex-categories-frequent';

  frequent.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'ex-category-btn';
    btn.textContent = cat;
    btn.addEventListener('click', () => selectCategory(cat));
    frequentContainer.appendChild(btn);
  });

  picker.appendChild(frequentContainer);

  const moreBtn = document.createElement('button');
  moreBtn.className = 'ex-category-more';
  moreBtn.textContent = 'More (...)';
  moreBtn.addEventListener('click', expandCategoryPicker);
  picker.appendChild(moreBtn);

  return picker;
}

function expandCategoryPicker() {
  const modal = document.createElement('div');
  modal.className = 'overlay menu';
  modal.innerHTML = `
    <div class="menu-card">
      <h3>Categories</h3>
      <div class="ex-all-categories">
        <!-- Load all categories from Firestore -->
      </div>
      <button data-close="category-modal">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function selectCategory(category) {
  console.log('Selected category:', category);
  // Dispatch or emit selection event
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const expenseList = document.querySelector('.ex-list') || document.getElementById('expenses');
    if (expenseList) {
      // Add hero card
      renderHeroCard().then(card => {
        expenseList.insertBefore(card, expenseList.firstChild);
      });

      // Wire swipe-to-delete
      document.querySelectorAll('.ex-row').forEach(wireExpenseSwipe);
    }
  });
} else {
  const expenseList = document.querySelector('.ex-list') || document.getElementById('expenses');
  if (expenseList) {
    renderHeroCard().then(card => {
      expenseList.insertBefore(card, expenseList.firstChild);
    });
    document.querySelectorAll('.ex-row').forEach(wireExpenseSwipe);
  }
}
