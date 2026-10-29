// Zero-dependency pure SVG/Canvas Chart Engine (Crisp, Retina-ready, 100% offline)

class ChartEngine {
  // 1. Horas por dia (Últimos 7 dias)
  renderDailyChart(container, data, goalHours, isDark) {
    if (!container) return;
    const width = container.clientWidth || 600;
    const height = 240;
    const padding = { top: 25, right: 25, bottom: 35, left: 45 };

    const maxVal = Math.max(goalHours * 1.3, ...data.map(d => d.hours), 5);
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const barWidth = Math.min(36, (plotWidth / data.length) * 0.55);

    // Grid lines count
    const gridSteps = 4;
    let gridLinesSvg = '';
    for (let i = 0; i <= gridSteps; i++) {
      const val = (maxVal / gridSteps) * i;
      const y = padding.top + plotHeight - (val / maxVal) * plotHeight;
      const strokeColor = isDark ? '#334155' : '#e2e8f0';
      const textColor = isDark ? '#94a3b8' : '#64748b';

      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${strokeColor}" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${padding.left - 8}" y="${y + 4}" fill="${textColor}" font-size="11" text-anchor="end" font-family="system-ui">${val.toFixed(1)}h</text>
      `;
    }

    // Goal line
    const goalY = padding.top + plotHeight - (goalHours / maxVal) * plotHeight;
    const goalLineSvg = `
      <line x1="${padding.left}" y1="${goalY}" x2="${width - padding.right}" y2="${goalY}" stroke="#f59e0b" stroke-dasharray="4,4" stroke-width="2" opacity="0.8" />
      <text x="${width - padding.right - 4}" y="${goalY - 6}" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="end" font-family="system-ui">Meta (${goalHours}h)</text>
    `;

    // Bars
    let barsSvg = '';
    const stepX = plotWidth / data.length;

    data.forEach((d, i) => {
      const centerX = padding.left + i * stepX + stepX / 2;
      const barH = (d.hours / maxVal) * plotHeight;
      const barY = padding.top + plotHeight - barH;
      const barX = centerX - barWidth / 2;
      const textColor = isDark ? '#94a3b8' : '#64748b';

      barsSvg += `
        <g class="chart-bar-group" data-val="${d.hours}h" data-label="${d.day}">
          <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barH}" rx="6" fill="#6366f1" class="chart-bar-rect">
            <title>${d.day}: ${d.hours} horas</title>
          </rect>
          <text x="${centerX}" y="${height - 12}" fill="${textColor}" font-size="11" text-anchor="middle" font-family="system-ui">${d.dayShort}</text>
          ${d.hours > 0 ? `<text x="${centerX}" y="${barY - 6}" fill="${isDark ? '#e2e8f0' : '#1e293b'}" font-size="10" font-weight="bold" text-anchor="middle" font-family="system-ui">${d.hours}h</text>` : ''}
        </g>
      `;
    });

    container.innerHTML = `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
        ${gridLinesSvg}
        ${goalLineSvg}
        ${barsSvg}
      </svg>
    `;
  }

  // 2. Distribuição por Matéria (Donut Chart)
  renderDonutChart(container, subjectsData, isDark) {
    if (!container) return;
    const size = 200;
    const cx = size / 2;
    const cy = size / 2;
    const r = 75;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * r;

    const totalHours = subjectsData.reduce((acc, s) => acc + s.hours, 0);

    if (totalHours === 0) {
      container.innerHTML = `<div class="chart-empty text-muted">Nenhum dado de estudo no período.</div>`;
      return;
    }

    let offset = 0;
    let paths = '';

    subjectsData.forEach(s => {
      const ratio = s.hours / totalHours;
      const dash = ratio * circumference;
      paths += `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="${-offset}" opacity="0.9" class="donut-segment">
          <title>${s.name}: ${s.hours}h (${Math.round(ratio * 100)}%)</title>
        </circle>
      `;
      offset += dash;
    });

    const textColor = isDark ? '#ffffff' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
          ${paths}
          <g style="transform: rotate(90deg); transform-origin: center;">
            <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="${textColor}" font-size="22" font-weight="800" font-family="system-ui">${totalHours.toFixed(1)}h</text>
            <text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="${subTextColor}" font-size="11" font-weight="600" font-family="system-ui">Total</text>
          </g>
        </svg>
      </div>
    `;
  }

  // 3. Comparativo: Planejado vs Real (Grouped Bar Chart)
  renderComparisonChart(container, comparisonData, isDark) {
    if (!container) return;
    const width = container.clientWidth || 600;
    const height = 260;
    const padding = { top: 25, right: 25, bottom: 50, left: 45 };

    const maxVal = Math.max(10, ...comparisonData.map(d => Math.max(d.realHours, d.plannedHours)));
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Grid
    const gridSteps = 4;
    let gridLinesSvg = '';
    for (let i = 0; i <= gridSteps; i++) {
      const val = (maxVal / gridSteps) * i;
      const y = padding.top + plotHeight - (val / maxVal) * plotHeight;
      const strokeColor = isDark ? '#334155' : '#e2e8f0';
      const textColor = isDark ? '#94a3b8' : '#64748b';

      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${strokeColor}" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${padding.left - 8}" y="${y + 4}" fill="${textColor}" font-size="11" text-anchor="end" font-family="system-ui">${val.toFixed(0)}h</text>
      `;
    }

    const stepX = plotWidth / comparisonData.length;
    const singleBarWidth = Math.min(18, stepX * 0.3);
    let barsSvg = '';

    comparisonData.forEach((d, i) => {
      const groupCenterX = padding.left + i * stepX + stepX / 2;

      // Planned Bar
      const plannedH = (d.plannedHours / maxVal) * plotHeight;
      const plannedY = padding.top + plotHeight - plannedH;
      const plannedX = groupCenterX - singleBarWidth - 2;

      // Real Bar
      const realH = (d.realHours / maxVal) * plotHeight;
      const realY = padding.top + plotHeight - realH;
      const realX = groupCenterX + 2;

      const plannedColor = isDark ? '#475569' : '#cbd5e1';
      const realColor = d.color || '#8b5cf6';
      const textColor = isDark ? '#94a3b8' : '#64748b';

      const shortName = d.name.length > 14 ? d.name.substring(0, 12) + '...' : d.name;

      barsSvg += `
        <g>
          <!-- Planned Bar -->
          <rect x="${plannedX}" y="${plannedY}" width="${singleBarWidth}" height="${plannedH}" rx="4" fill="${plannedColor}">
            <title>${d.name} - Planejado: ${d.plannedHours}h</title>
          </rect>
          <!-- Real Bar -->
          <rect x="${realX}" y="${realY}" width="${singleBarWidth}" height="${realH}" rx="4" fill="${realColor}">
            <title>${d.name} - Real: ${d.realHours}h</title>
          </rect>
          <text x="${groupCenterX}" y="${height - 20}" fill="${textColor}" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui">${shortName}</text>
        </g>
      `;
    });

    container.innerHTML = `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
        ${gridLinesSvg}
        ${barsSvg}
      </svg>
    `;
  }
}

window.chartEngine = new ChartEngine();
