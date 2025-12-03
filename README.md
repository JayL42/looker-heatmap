# Looker Custom Heatmap Visualization

A custom heatmap visualization for Looker that can be added via Admin > Visualizations.

## Quick Start

**Visualization URL:**
```
https://jayl42.github.io/looker-heatmap/heatmap.js
```

### Add to Looker

1. Go to **Admin** > **Visualizations**
2. Click **Add Visualization**
3. Enter:
   - **ID:** `custom_heatmap`
   - **Label:** `Custom Heatmap`
   - **Main:** `https://jayl42.github.io/looker-heatmap/heatmap.js`
4. Click **Save**

### Usage

In any Explore, structure your query as:

| Field Type | Purpose | Example |
|------------|---------|---------|
| 1st Dimension | X-axis (columns) | Day of Week |
| 2nd Dimension | Y-axis (rows) | Hour of Day |
| 1st Measure | Color intensity | Count, Sum, Average |

Then select **Custom Heatmap** from the visualization picker.

## Features

- **6 Color Schemes:** Blue, Green, Red, Purple, Orange, Diverging
- **Custom Colors:** Define your own low/high/mid colors
- **Cell Options:** Padding, border radius, show/hide values
- **Value Formats:** Auto, Number, Percent, Currency, Compact (1K/1M)
- **Labels:** Configurable axis labels with rotation
- **Legend:** Gradient legend with position options (right, bottom, top)
- **Tooltips:** Hover for full details
- **Drill Support:** Click cells to drill into data

## Configuration Options

### Colors
| Option | Description |
|--------|-------------|
| Color Scheme | Blue, Green, Red, Purple, Orange, Diverging, Custom |
| Low/High Color | Custom colors (when using Custom scheme) |
| Mid Color | Middle color for diverging schemes |
| Null Color | Color for missing/null values |

### Cells
| Option | Description |
|--------|-------------|
| Cell Padding | Space between cells (px) |
| Cell Border Radius | Rounded corners (px) |
| Show Values | Display values inside cells |
| Value Format | Auto, Number, Percent, Currency, Compact |
| Font Size | Cell value font size (px) |

### Labels
| Option | Description |
|--------|-------------|
| Show X Labels | Toggle column headers |
| Show Y Labels | Toggle row labels |
| X Label Rotation | Angle for column headers (-90 to 90) |
| Label Font Size | Axis label font size (px) |

### Legend
| Option | Description |
|--------|-------------|
| Show Legend | Toggle gradient legend |
| Legend Position | Right, Bottom, or Top |

## Project Structure

```
├── docs/
│   ├── heatmap.js      # Hosted visualization file
│   └── index.html      # Landing page
├── custom_viz/
│   ├── heatmap.js      # Source visualization
│   └── manifest.lkml   # LookML manifest (for self-hosting)
├── views/
│   └── heatmap_data.view.lkml  # Example LookML view
├── dashboards/
│   └── heatmap_dashboard.dashboard.lookml  # Example dashboard
├── heatmap.model.lkml  # Example LookML model
└── manifest.lkml       # Project manifest
```

## Self-Hosting

If you prefer to host the visualization on your own server:

1. Copy `custom_viz/heatmap.js` to your web server
2. Ensure the file is served with correct CORS headers
3. Use your server URL in Looker Admin > Visualizations

## License

MIT
