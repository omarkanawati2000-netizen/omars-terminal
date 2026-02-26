/* ═══════════════════════════════════════════
   DRAWING TOOLS SYSTEM
   Complete charting tools with persistence
   ═══════════════════════════════════════════ */

// Drawing state
let activeTool = null;
let drawings = {}; // per coin-timeframe key
let activeDrawing = null;
let selectedDrawing = null;
let drawingInProgress = false;

// Tool types
const TOOLS = {
  HLINE: 'hline',
  TRENDLINE: 'trendline',
  FIB_RET: 'fib_ret',
  FIB_EXT: 'fib_ext',
  RECTANGLE: 'rectangle',
  RULER: 'ruler',
  TEXT: 'text'
};

// Initialize drawings from localStorage
function loadDrawings() {
  try {
    const saved = localStorage.getItem('omar_terminal_drawings');
    if (saved) {
      drawings = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load drawings:', e);
    drawings = {};
  }
}

// Save drawings to localStorage
function saveDrawings() {
  try {
    localStorage.setItem('omar_terminal_drawings', JSON.stringify(drawings));
  } catch (e) {
    console.error('Failed to save drawings:', e);
  }
}

// Get current drawing key
function getDrawingKey() {
  return `${activeCoin}_${activeTF}`;
}

// Get or initialize drawings for current chart
function getCurrentDrawings() {
  const key = getDrawingKey();
  if (!drawings[key]) {
    drawings[key] = [];
  }
  return drawings[key];
}

// Set active tool
function setDrawingTool(tool) {
  activeTool = activeTool === tool ? null : tool;
  
  // Update toolbar button states
  document.querySelectorAll('.draw-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === activeTool);
  });
  
  // Change cursor
  const chartBody = document.getElementById('chartBody');
  if (activeTool) {
    chartBody.style.cursor = 'crosshair';
  } else {
    chartBody.style.cursor = 'default';
  }
}

// Create drawing object from mouse coordinates
function createDrawing(tool, x1, y1, x2, y2) {
  const drawing = {
    id: Date.now() + Math.random(),
    tool,
    x1, y1, x2, y2,
    color: '#ff8c00',
    lineWidth: 2,
    text: tool === TOOLS.TEXT ? 'Text' : null,
    timestamp: Date.now()
  };
  
  return drawing;
}

// Convert canvas coordinates to price/time
function canvasToPriceTime(canvas, canvasX, canvasY) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const candles = candleData[candleKey(activeCoin, activeTF)];
  if (!candles || candles.length < 2) return null;
  
  const mR = 80, mB = 30;
  const cW = rect.width - mR;
  const cH = rect.height - mB;
  
  // Calculate visible candles based on zoom/pan
  const visibleCount = Math.max(5, Math.floor(candles.length / chartZoomX));
  const startIdx = Math.max(0, candles.length - visibleCount - Math.floor(chartPanX));
  const endIdx = Math.min(candles.length, startIdx + visibleCount);
  const visibleCandles = candles.slice(startIdx, endIdx);
  
  if (visibleCandles.length < 1) return null;
  
  // Calculate price range
  const dataMin = Math.min(...visibleCandles.map(c => c.l));
  const dataMax = Math.max(...visibleCandles.map(c => c.h));
  const dataMid = (dataMax + dataMin) / 2;
  const dataRange = (dataMax - dataMin) || 1;
  const zr = dataRange / chartZoomY;
  const min = dataMid - zr / 2;
  const max = dataMid + zr / 2;
  const range = max - min || 1;
  
  // Convert canvas X to candle index
  const gap = cW / visibleCandles.length;
  const candleIdx = Math.floor(canvasX / gap);
  const time = visibleCandles[Math.min(candleIdx, visibleCandles.length - 1)]?.t || Date.now();
  
  // Convert canvas Y to price
  const price = max - (canvasY / cH) * range;
  
  return { price, time, candleIdx: startIdx + candleIdx };
}

// Convert price/time to canvas coordinates
function priceTimeToCanvas(canvas, price, candleIdx) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const candles = candleData[candleKey(activeCoin, activeTF)];
  if (!candles || candles.length < 2) return null;
  
  const mR = 80, mB = 30;
  const cW = rect.width - mR;
  const cH = rect.height - mB;
  
  // Calculate visible candles
  const visibleCount = Math.max(5, Math.floor(candles.length / chartZoomX));
  const startIdx = Math.max(0, candles.length - visibleCount - Math.floor(chartPanX));
  const endIdx = Math.min(candles.length, startIdx + visibleCount);
  const visibleCandles = candles.slice(startIdx, endIdx);
  
  if (visibleCandles.length < 1) return null;
  
  // Calculate price range
  const dataMin = Math.min(...visibleCandles.map(c => c.l));
  const dataMax = Math.max(...visibleCandles.map(c => c.h));
  const dataMid = (dataMax + dataMin) / 2;
  const dataRange = (dataMax - dataMin) || 1;
  const zr = dataRange / chartZoomY;
  const min = dataMid - zr / 2;
  const max = dataMid + zr / 2;
  const range = max - min || 1;
  
  // Convert price to canvas Y
  const y = cH - ((price - min) / range) * cH;
  
  // Convert candle index to canvas X
  const gap = cW / visibleCandles.length;
  const relIdx = candleIdx - startIdx;
  const x = relIdx * gap + gap / 2;
  
  return { x: Math.max(0, Math.min(cW, x)), y: Math.max(0, Math.min(cH, y)) };
}

// Draw all drawings on canvas
function renderDrawings(canvas, ctx) {
  const currentDrawings = getCurrentDrawings();
  if (currentDrawings.length === 0 && !activeDrawing) return;
  
  const rect = canvas.parentElement.getBoundingClientRect();
  const mR = 80, mB = 30;
  const cW = rect.width - mR;
  const cH = rect.height - mB;
  
  ctx.save();
  
  // Draw saved drawings
  currentDrawings.forEach(drawing => {
    renderSingleDrawing(ctx, drawing, cW, cH, false);
  });
  
  // Draw active drawing being created
  if (activeDrawing) {
    renderSingleDrawing(ctx, activeDrawing, cW, cH, true);
  }
  
  ctx.restore();
}

// Render a single drawing
function renderSingleDrawing(ctx, drawing, cW, cH, isActive) {
  ctx.strokeStyle = isActive ? '#ffcc00' : drawing.color;
  ctx.fillStyle = isActive ? '#ffcc00' : drawing.color;
  ctx.lineWidth = drawing.lineWidth;
  ctx.font = '12px JetBrains Mono';
  
  const canvas = document.getElementById('chart');
  
  // Get canvas coordinates for drawing points
  const pt1 = canvasToPriceTime(canvas, drawing.x1, drawing.y1);
  const pt2 = canvasToPriceTime(canvas, drawing.x2, drawing.y2);
  
  if (!pt1 || !pt2) return;
  
  const coords1 = priceTimeToCanvas(canvas, pt1.price, pt1.candleIdx);
  const coords2 = priceTimeToCanvas(canvas, pt2.price, pt2.candleIdx);
  
  if (!coords1 || !coords2) return;
  
  const x1 = coords1.x, y1 = coords1.y;
  const x2 = coords2.x, y2 = coords2.y;
  
  switch (drawing.tool) {
    case TOOLS.HLINE:
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, y1);
      ctx.lineTo(cW, y1);
      ctx.stroke();
      
      // Price label
      ctx.fillStyle = drawing.color;
      ctx.fillRect(cW, y1 - 8, 72, 16);
      ctx.fillStyle = '#000';
      ctx.fillText(fmtPrice(pt1.price), cW + 4, y1 + 3);
      break;
      
    case TOOLS.TRENDLINE:
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Draw extension
      if (x2 !== x1) {
        const slope = (y2 - y1) / (x2 - x1);
        const extendX = x2 < x1 ? 0 : cW;
        const extendY = y2 + slope * (extendX - x2);
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(extendX, extendY);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
      }
      
      // Draw handles
      [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(pt => {
        ctx.fillStyle = drawing.color;
        ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
      });
      break;
      
    case TOOLS.FIB_RET:
      // Draw main line
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Fibonacci levels: 0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0
      const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
      const fibColors = ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a', '#4caf50', '#03a9f4', '#9c27b0'];
      
      fibLevels.forEach((level, i) => {
        const fibY = y1 + (y2 - y1) * level;
        const fibPrice = pt1.price + (pt2.price - pt1.price) * level;
        
        ctx.strokeStyle = fibColors[i] + '80';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(Math.min(x1, x2), fibY);
        ctx.lineTo(Math.max(x1, x2), fibY);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = fibColors[i];
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(
          (level * 100).toFixed(1) + '% - ' + fmtPrice(fibPrice),
          Math.max(x1, x2) + 5,
          fibY + 3
        );
      });
      
      ctx.setLineDash([]);
      
      // Draw handles
      ctx.fillStyle = drawing.color;
      ctx.fillRect(x1 - 4, y1 - 4, 8, 8);
      ctx.fillRect(x2 - 4, y2 - 4, 8, 8);
      break;
      
    case TOOLS.FIB_EXT:
      // Similar to retracement but extends beyond 100%
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      const fibExtLevels = [0, 0.236, 0.382, 0.5, 0.618, 1.0, 1.272, 1.618, 2.618];
      const fibExtColors = ['#f44336', '#ff5722', '#ff9800', '#ffc107', '#8bc34a', '#4caf50', '#009688', '#00bcd4', '#2196f3'];
      
      fibExtLevels.forEach((level, i) => {
        const fibY = y1 + (y2 - y1) * level;
        const fibPrice = pt1.price + (pt2.price - pt1.price) * level;
        
        if (fibY < 0 || fibY > cH) return; // Skip off-screen levels
        
        ctx.strokeStyle = fibExtColors[i] + '80';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(0, fibY);
        ctx.lineTo(cW, fibY);
        ctx.stroke();
        
        ctx.fillStyle = fibExtColors[i];
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(
          (level * 100).toFixed(1) + '% - ' + fmtPrice(fibPrice),
          cW - 120,
          fibY - 2
        );
      });
      
      ctx.setLineDash([]);
      ctx.fillStyle = drawing.color;
      ctx.fillRect(x1 - 4, y1 - 4, 8, 8);
      ctx.fillRect(x2 - 4, y2 - 4, 8, 8);
      break;
      
    case TOOLS.RECTANGLE:
      ctx.setLineDash([]);
      ctx.strokeRect(
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1)
      );
      
      // Fill with transparency
      ctx.fillStyle = drawing.color + '10';
      ctx.fillRect(
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1)
      );
      
      // Corner handles
      [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x1, y: y2 },
        { x: x2, y: y2 }
      ].forEach(pt => {
        ctx.fillStyle = drawing.color;
        ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
      });
      break;
      
    case TOOLS.RULER:
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Calculate distance
      const priceDiff = Math.abs(pt2.price - pt1.price);
      const pricePercent = ((pt2.price - pt1.price) / pt1.price * 100).toFixed(2);
      const timeDiff = Math.abs(pt2.candleIdx - pt1.candleIdx);
      
      // Draw measurement box
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(midX - 60, midY - 25, 120, 50);
      
      ctx.fillStyle = drawing.color;
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('Δ Price: ' + fmtPrice(priceDiff), midX, midY - 8);
      ctx.fillText(pricePercent + '%', midX, midY + 5);
      ctx.fillText('Δ Bars: ' + timeDiff, midX, midY + 18);
      ctx.textAlign = 'left';
      
      // Draw endpoints
      ctx.fillStyle = drawing.color;
      [[x1, y1], [x2, y2]].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
      
    case TOOLS.TEXT:
      // Draw text at position
      ctx.font = '600 14px JetBrains Mono';
      ctx.fillStyle = drawing.color;
      ctx.textBaseline = 'top';
      
      // Background for readability
      const textMetrics = ctx.measureText(drawing.text || 'Text');
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(x1 - 2, y1 - 2, textMetrics.width + 4, 18);
      
      ctx.fillStyle = drawing.color;
      ctx.fillText(drawing.text || 'Text', x1, y1);
      
      // Handle
      ctx.fillRect(x1 - 3, y1 - 3, 6, 6);
      break;
  }
}

// Mouse event handlers for drawing
let drawStartX = 0, drawStartY = 0;

function initDrawingHandlers() {
  const chartBody = document.getElementById('chartBody');
  const canvas = document.getElementById('chart');
  
  chartBody.addEventListener('mousedown', (e) => {
    if (!activeTool || chartDragState) return;
    
    const rect = chartBody.getBoundingClientRect();
    drawStartX = e.clientX - rect.left;
    drawStartY = e.clientY - rect.top;
    
    // Check if clicking on an existing drawing handle (for editing)
    // For now, just start new drawing
    
    activeDrawing = createDrawing(
      activeTool,
      drawStartX,
      drawStartY,
      drawStartX,
      drawStartY
    );
    
    drawingInProgress = true;
    e.stopPropagation();
  });
  
  chartBody.addEventListener('mousemove', (e) => {
    if (!drawingInProgress || !activeDrawing) return;
    
    const rect = chartBody.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    activeDrawing.x2 = currentX;
    activeDrawing.y2 = currentY;
    
    renderChart(); // Redraw chart with active drawing
    e.stopPropagation();
  });
  
  chartBody.addEventListener('mouseup', (e) => {
    if (!drawingInProgress || !activeDrawing) return;
    
    const rect = chartBody.getBoundingClientRect();
    activeDrawing.x2 = e.clientX - rect.left;
    activeDrawing.y2 = e.clientY - rect.top;
    
    // Special handling for single-click tools
    if (activeTool === TOOLS.HLINE) {
      activeDrawing.x2 = rect.width;
    } else if (activeTool === TOOLS.TEXT) {
      // Prompt for text
      const text = prompt('Enter text:', 'Text');
      if (text) {
        activeDrawing.text = text;
      } else {
        activeDrawing = null;
        drawingInProgress = false;
        renderChart();
        return;
      }
    }
    
    // Save drawing
    getCurrentDrawings().push(activeDrawing);
    saveDrawings();
    
    activeDrawing = null;
    drawingInProgress = false;
    
    // Deactivate tool after single use (optional - comment out to keep tool active)
    // setDrawingTool(null);
    
    renderChart();
    e.stopPropagation();
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Delete selected drawing
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedDrawing !== null) {
        const drawings = getCurrentDrawings();
        drawings.splice(selectedDrawing, 1);
        selectedDrawing = null;
        saveDrawings();
        renderChart();
        e.preventDefault();
      }
    }
    
    // Clear all drawings (Ctrl+Shift+D)
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      if (confirm('Clear all drawings on this chart?')) {
        drawings[getDrawingKey()] = [];
        saveDrawings();
        renderChart();
      }
      e.preventDefault();
    }
    
    // Escape to cancel active tool
    if (e.key === 'Escape') {
      setDrawingTool(null);
      activeDrawing = null;
      drawingInProgress = false;
      selectedDrawing = null;
      renderChart();
    }
  });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  loadDrawings();
  initDrawingHandlers();
});
