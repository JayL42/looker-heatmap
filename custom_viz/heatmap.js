/**
 * Custom Heatmap Visualization for Looker
 *
 * Upload this file to: Admin > Visualizations > Add Visualization
 *
 * Required query structure:
 * - First dimension: X-axis categories (columns)
 * - Second dimension: Y-axis categories (rows)
 * - First measure: Values for color intensity
 */

looker.plugins.visualizations.add({
  id: "custom_heatmap",
  label: "Custom Heatmap",

  // Configuration options shown in the visualization settings panel
  options: {
    // Color settings
    colorScheme: {
      section: "Colors",
      type: "string",
      label: "Color Scheme",
      display: "select",
      values: [
        { "Blue": "blue" },
        { "Green": "green" },
        { "Red": "red" },
        { "Purple": "purple" },
        { "Orange": "orange" },
        { "Blue-Red Diverging": "diverging" },
        { "Custom": "custom" }
      ],
      default: "blue",
      order: 1
    },
    lowColor: {
      section: "Colors",
      type: "string",
      label: "Low Value Color",
      display: "color",
      default: "#f7fbff",
      order: 2
    },
    highColor: {
      section: "Colors",
      type: "string",
      label: "High Value Color",
      display: "color",
      default: "#08519c",
      order: 3
    },
    midColor: {
      section: "Colors",
      type: "string",
      label: "Mid Value Color (Diverging)",
      display: "color",
      default: "#ffffff",
      order: 4
    },
    nullColor: {
      section: "Colors",
      type: "string",
      label: "Null/Zero Color",
      display: "color",
      default: "#f0f0f0",
      order: 5
    },

    // Cell settings
    cellPadding: {
      section: "Cells",
      type: "number",
      label: "Cell Padding (px)",
      default: 2,
      order: 1
    },
    cellRadius: {
      section: "Cells",
      type: "number",
      label: "Cell Border Radius (px)",
      default: 2,
      order: 2
    },
    showValues: {
      section: "Cells",
      type: "boolean",
      label: "Show Values in Cells",
      default: true,
      order: 3
    },
    valueFormat: {
      section: "Cells",
      type: "string",
      label: "Value Format",
      display: "select",
      values: [
        { "Auto": "auto" },
        { "Number": "number" },
        { "Percent": "percent" },
        { "Currency": "currency" },
        { "Compact (1K, 1M)": "compact" }
      ],
      default: "auto",
      order: 4
    },
    fontSize: {
      section: "Cells",
      type: "number",
      label: "Font Size (px)",
      default: 11,
      order: 5
    },

    // Label settings
    showXLabels: {
      section: "Labels",
      type: "boolean",
      label: "Show X-Axis Labels",
      default: true,
      order: 1
    },
    showYLabels: {
      section: "Labels",
      type: "boolean",
      label: "Show Y-Axis Labels",
      default: true,
      order: 2
    },
    xLabelRotation: {
      section: "Labels",
      type: "number",
      label: "X-Axis Label Rotation",
      default: -45,
      order: 3
    },
    labelFontSize: {
      section: "Labels",
      type: "number",
      label: "Label Font Size (px)",
      default: 11,
      order: 4
    },

    // Legend settings
    showLegend: {
      section: "Legend",
      type: "boolean",
      label: "Show Legend",
      default: true,
      order: 1
    },
    legendPosition: {
      section: "Legend",
      type: "string",
      label: "Legend Position",
      display: "select",
      values: [
        { "Right": "right" },
        { "Bottom": "bottom" },
        { "Top": "top" }
      ],
      default: "right",
      order: 2
    }
  },

  // Create the initial container
  create: function(element, config) {
    element.innerHTML = `
      <style>
        .heatmap-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
          width: 100%;
          height: 100%;
          display: flex;
          overflow: hidden;
        }
        .heatmap-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .heatmap-grid {
          flex: 1;
          overflow: auto;
        }
        .heatmap-table {
          border-collapse: separate;
          border-spacing: 0;
        }
        .heatmap-cell {
          text-align: center;
          vertical-align: middle;
          transition: opacity 0.2s;
          cursor: pointer;
        }
        .heatmap-cell:hover {
          opacity: 0.8;
          outline: 2px solid #333;
          outline-offset: -2px;
        }
        .heatmap-header {
          font-weight: 600;
          background: transparent;
          white-space: nowrap;
        }
        .heatmap-y-label {
          text-align: right;
          padding-right: 8px;
          font-weight: 500;
        }
        .heatmap-legend {
          display: flex;
          align-items: center;
          padding: 10px;
        }
        .heatmap-legend-vertical {
          flex-direction: column;
          width: 60px;
        }
        .heatmap-legend-horizontal {
          flex-direction: row;
          height: 40px;
          justify-content: center;
        }
        .heatmap-legend-gradient {
          background: linear-gradient(to top, var(--low-color), var(--high-color));
        }
        .heatmap-legend-gradient-horizontal {
          background: linear-gradient(to right, var(--low-color), var(--high-color));
        }
        .heatmap-legend-label {
          font-size: 10px;
          color: #666;
        }
        .heatmap-tooltip {
          position: fixed;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          pointer-events: none;
          z-index: 10000;
          max-width: 250px;
        }
        .heatmap-tooltip-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .heatmap-tooltip-value {
          font-size: 14px;
          font-weight: 700;
        }
      </style>
      <div class="heatmap-container">
        <div class="heatmap-main">
          <div class="heatmap-grid"></div>
        </div>
      </div>
      <div class="heatmap-tooltip" style="display: none;"></div>
    `;
    this.container = element.querySelector('.heatmap-container');
    this.grid = element.querySelector('.heatmap-grid');
    this.tooltip = element.querySelector('.heatmap-tooltip');
  },

  // Update visualization with data
  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Clear any errors
    this.clearErrors();

    // Validate query structure
    if (!queryResponse.fields.dimensions || queryResponse.fields.dimensions.length < 2) {
      this.addError({
        title: "Insufficient Dimensions",
        message: "This visualization requires at least 2 dimensions (X-axis and Y-axis)."
      });
      done();
      return;
    }

    if (!queryResponse.fields.measures || queryResponse.fields.measures.length < 1) {
      this.addError({
        title: "No Measure",
        message: "This visualization requires at least 1 measure for the heatmap values."
      });
      done();
      return;
    }

    // Extract field information
    const xField = queryResponse.fields.dimensions[0];
    const yField = queryResponse.fields.dimensions[1];
    const valueField = queryResponse.fields.measures[0];

    // Get unique X and Y values
    const xValues = [...new Set(data.map(row => row[xField.name].value))];
    const yValues = [...new Set(data.map(row => row[yField.name].value))];

    // Create data lookup map
    const dataMap = new Map();
    let minValue = Infinity;
    let maxValue = -Infinity;

    data.forEach(row => {
      const x = row[xField.name].value;
      const y = row[yField.name].value;
      const value = row[valueField.name].value;
      const rendered = row[valueField.name].rendered || String(value);

      dataMap.set(`${x}|${y}`, { value, rendered });

      if (value !== null && value !== undefined) {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    });

    // Handle edge cases
    if (minValue === Infinity) minValue = 0;
    if (maxValue === -Infinity) maxValue = 0;
    if (minValue === maxValue) {
      minValue = 0;
      maxValue = maxValue || 1;
    }

    // Color interpolation function
    const getColor = (value) => {
      if (value === null || value === undefined) {
        return config.nullColor || '#f0f0f0';
      }

      const ratio = (value - minValue) / (maxValue - minValue);

      // Get colors based on scheme
      let lowColor, highColor, midColor;

      switch (config.colorScheme) {
        case 'blue':
          lowColor = '#f7fbff';
          highColor = '#08519c';
          break;
        case 'green':
          lowColor = '#f7fcf5';
          highColor = '#006d2c';
          break;
        case 'red':
          lowColor = '#fff5f0';
          highColor = '#a50f15';
          break;
        case 'purple':
          lowColor = '#fcfbfd';
          highColor = '#54278f';
          break;
        case 'orange':
          lowColor = '#fff5eb';
          highColor = '#d94801';
          break;
        case 'diverging':
          lowColor = config.lowColor || '#2166ac';
          midColor = config.midColor || '#ffffff';
          highColor = config.highColor || '#b2182b';

          if (ratio < 0.5) {
            return interpolateColor(lowColor, midColor, ratio * 2);
          } else {
            return interpolateColor(midColor, highColor, (ratio - 0.5) * 2);
          }
        case 'custom':
        default:
          lowColor = config.lowColor || '#f7fbff';
          highColor = config.highColor || '#08519c';
      }

      return interpolateColor(lowColor, highColor, ratio);
    };

    // Color interpolation helper
    function interpolateColor(color1, color2, ratio) {
      const hex = (c) => parseInt(c, 16);
      const r1 = hex(color1.slice(1, 3));
      const g1 = hex(color1.slice(3, 5));
      const b1 = hex(color1.slice(5, 7));
      const r2 = hex(color2.slice(1, 3));
      const g2 = hex(color2.slice(3, 5));
      const b2 = hex(color2.slice(5, 7));

      const r = Math.round(r1 + (r2 - r1) * ratio);
      const g = Math.round(g1 + (g2 - g1) * ratio);
      const b = Math.round(b1 + (b2 - b1) * ratio);

      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    // Determine text color based on background
    function getTextColor(bgColor) {
      const hex = (c) => parseInt(c, 16);
      const r = hex(bgColor.slice(1, 3));
      const g = hex(bgColor.slice(3, 5));
      const b = hex(bgColor.slice(5, 7));
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#333333' : '#ffffff';
    }

    // Format value for display
    const formatValue = (value, rendered) => {
      if (value === null || value === undefined) return '-';
      if (config.valueFormat === 'auto') return rendered;

      switch (config.valueFormat) {
        case 'number':
          return value.toLocaleString();
        case 'percent':
          return (value * 100).toFixed(1) + '%';
        case 'currency':
          return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        case 'compact':
          if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
          if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
          return value.toLocaleString();
        default:
          return rendered;
      }
    };

    // Calculate cell dimensions
    const containerWidth = this.container.offsetWidth - (config.showLegend && config.legendPosition === 'right' ? 70 : 0);
    const containerHeight = this.container.offsetHeight - (config.showLegend && config.legendPosition !== 'right' ? 50 : 0);
    const yLabelWidth = config.showYLabels ? 100 : 0;
    const xLabelHeight = config.showXLabels ? 40 : 0;

    const cellWidth = Math.max(30, Math.floor((containerWidth - yLabelWidth) / xValues.length) - (config.cellPadding || 2));
    const cellHeight = Math.max(25, Math.floor((containerHeight - xLabelHeight) / yValues.length) - (config.cellPadding || 2));

    // Build HTML table
    let html = '<table class="heatmap-table">';

    // Header row (X labels)
    if (config.showXLabels !== false) {
      html += '<thead><tr>';
      html += `<th class="heatmap-header" style="width: ${yLabelWidth}px;"></th>`;

      xValues.forEach(x => {
        const rotation = config.xLabelRotation || -45;
        const transform = rotation !== 0 ? `transform: rotate(${rotation}deg);` : '';
        html += `<th class="heatmap-header" style="width: ${cellWidth}px; height: ${xLabelHeight}px; font-size: ${config.labelFontSize || 11}px;">
          <div style="${transform} white-space: nowrap;">${x}</div>
        </th>`;
      });

      html += '</tr></thead>';
    }

    // Data rows
    html += '<tbody>';
    yValues.forEach(y => {
      html += '<tr>';

      // Y label
      if (config.showYLabels !== false) {
        html += `<td class="heatmap-y-label" style="width: ${yLabelWidth}px; font-size: ${config.labelFontSize || 11}px;">${y}</td>`;
      }

      // Data cells
      xValues.forEach(x => {
        const key = `${x}|${y}`;
        const cellData = dataMap.get(key);
        const value = cellData ? cellData.value : null;
        const rendered = cellData ? cellData.rendered : null;
        const bgColor = getColor(value);
        const textColor = getTextColor(bgColor);
        const displayValue = config.showValues !== false ? formatValue(value, rendered) : '';

        html += `<td class="heatmap-cell"
          style="
            width: ${cellWidth}px;
            height: ${cellHeight}px;
            background-color: ${bgColor};
            color: ${textColor};
            font-size: ${config.fontSize || 11}px;
            border-radius: ${config.cellRadius || 2}px;
            padding: ${config.cellPadding || 2}px;
          "
          data-x="${x}"
          data-y="${y}"
          data-value="${value}"
          data-rendered="${rendered || value}"
        >${displayValue}</td>`;
      });

      html += '</tr>';
    });
    html += '</tbody></table>';

    this.grid.innerHTML = html;

    // Add legend
    if (config.showLegend !== false) {
      const legendHtml = this.buildLegend(config, minValue, maxValue, getColor);

      // Remove existing legend
      const existingLegend = this.container.querySelector('.heatmap-legend');
      if (existingLegend) existingLegend.remove();

      const legendDiv = document.createElement('div');
      legendDiv.innerHTML = legendHtml;

      if (config.legendPosition === 'right') {
        this.container.appendChild(legendDiv.firstChild);
      } else {
        const main = this.container.querySelector('.heatmap-main');
        if (config.legendPosition === 'top') {
          main.insertBefore(legendDiv.firstChild, this.grid);
        } else {
          main.appendChild(legendDiv.firstChild);
        }
      }
    }

    // Add tooltip handlers
    const cells = this.grid.querySelectorAll('.heatmap-cell');
    const tooltip = this.tooltip;
    const xFieldLabel = xField.label_short || xField.label || xField.name;
    const yFieldLabel = yField.label_short || yField.label || yField.name;
    const valueFieldLabel = valueField.label_short || valueField.label || valueField.name;

    cells.forEach(cell => {
      cell.addEventListener('mouseenter', (e) => {
        const x = cell.dataset.x;
        const y = cell.dataset.y;
        const rendered = cell.dataset.rendered;

        tooltip.innerHTML = `
          <div class="heatmap-tooltip-title">${xFieldLabel}: ${x}</div>
          <div class="heatmap-tooltip-title">${yFieldLabel}: ${y}</div>
          <div class="heatmap-tooltip-value">${valueFieldLabel}: ${rendered}</div>
        `;
        tooltip.style.display = 'block';
      });

      cell.addEventListener('mousemove', (e) => {
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
      });

      cell.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      // Drill on click
      cell.addEventListener('click', () => {
        const x = cell.dataset.x;
        const y = cell.dataset.y;

        LookerCharts.Utils.openDrillMenu({
          links: queryResponse.data.find(row =>
            row[xField.name].value === x && row[yField.name].value === y
          )?.[valueField.name]?.links || [],
          event: event
        });
      });
    });

    done();
  },

  // Build legend HTML
  buildLegend: function(config, minValue, maxValue, getColor) {
    const isVertical = config.legendPosition === 'right';
    const gradientClass = isVertical ? 'heatmap-legend-gradient' : 'heatmap-legend-gradient-horizontal';
    const containerClass = isVertical ? 'heatmap-legend-vertical' : 'heatmap-legend-horizontal';

    const lowColor = getColor(minValue);
    const highColor = getColor(maxValue);

    if (isVertical) {
      return `
        <div class="heatmap-legend ${containerClass}" style="--low-color: ${lowColor}; --high-color: ${highColor};">
          <span class="heatmap-legend-label">${this.formatLegendValue(maxValue)}</span>
          <div class="${gradientClass}" style="width: 20px; height: 100px; margin: 5px 0;"></div>
          <span class="heatmap-legend-label">${this.formatLegendValue(minValue)}</span>
        </div>
      `;
    } else {
      return `
        <div class="heatmap-legend ${containerClass}" style="--low-color: ${lowColor}; --high-color: ${highColor};">
          <span class="heatmap-legend-label" style="margin-right: 5px;">${this.formatLegendValue(minValue)}</span>
          <div class="${gradientClass}" style="width: 150px; height: 15px;"></div>
          <span class="heatmap-legend-label" style="margin-left: 5px;">${this.formatLegendValue(maxValue)}</span>
        </div>
      `;
    }
  },

  // Format legend values
  formatLegendValue: function(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toLocaleString();
  }
});
