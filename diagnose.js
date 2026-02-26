// DIAGNOSTIC SCRIPT - Run this in the browser console

console.log('=== OMAR TERMINAL DIAGNOSTIC ===\n');

// 1. Check if tabs exist
const tabs = document.querySelectorAll('.tab');
console.log(`✓ Found ${tabs.length} tabs:`, tabs);

// 2. Check if tabs have event listeners (can't directly inspect, but we can test)
console.log('\n✓ Tab elements:');
tabs.forEach((tab, i) => {
  console.log(`  Tab ${i+1}:`, {
    text: tab.textContent.trim(),
    dataset: tab.dataset.tab,
    classList: Array.from(tab.classList),
    computedStyle: {
      pointerEvents: getComputedStyle(tab).pointerEvents,
      zIndex: getComputedStyle(tab).zIndex,
      position: getComputedStyle(tab).position,
      display: getComputedStyle(tab).display,
    }
  });
});

// 3. Check for overlays
console.log('\n✓ Checking for elements with higher z-index than tabs:');
const allElements = document.querySelectorAll('*');
let blockingElements = [];
allElements.forEach(el => {
  const style = getComputedStyle(el);
  const zIndex = parseInt(style.zIndex) || 0;
  if (zIndex > 50 && style.pointerEvents !== 'none') {
    blockingElements.push({
      element: el,
      zIndex: zIndex,
      className: el.className,
      tagName: el.tagName,
      pointerEvents: style.pointerEvents
    });
  }
});
console.log('  Elements with z-index > 50:', blockingElements);

// 4. Test if switchTab function exists
console.log('\n✓ Checking functions:');
console.log('  switchTab exists:', typeof window.switchTab);

// 5. Try to manually trigger a tab switch
console.log('\n✓ Testing manual tab switch to tab 2:');
try {
  if (typeof switchTab === 'function') {
    switchTab('analysis');
    console.log('  ✓ switchTab() executed successfully');
  } else {
    console.log('  ✗ switchTab() function not found');
  }
} catch (e) {
  console.log('  ✗ switchTab() error:', e.message);
}

// 6. Check pointer-events on parent containers
console.log('\n✓ Checking parent containers:');
const tabBar = document.getElementById('tabBar');
if (tabBar) {
  console.log('  tabBar:', {
    pointerEvents: getComputedStyle(tabBar).pointerEvents,
    zIndex: getComputedStyle(tabBar).zIndex,
  });
}

const app = document.querySelector('.app');
if (app) {
  console.log('  .app:', {
    pointerEvents: getComputedStyle(app).pointerEvents,
    zIndex: getComputedStyle(app).zIndex,
  });
}

// 7. Test click event
console.log('\n✓ Adding test click listener to first tab:');
if (tabs[0]) {
  tabs[0].addEventListener('click', () => {
    console.log('  ✓ CLICK EVENT RECEIVED ON TAB!');
  });
  console.log('  Try clicking tab 1 now...');
}

console.log('\n=== END DIAGNOSTIC ===');
