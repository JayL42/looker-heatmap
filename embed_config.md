# Looker Heatmap Embed Configuration

## Project Structure

```
Heatmap/
├── manifest.lkml              # Project configuration
├── heatmap.model.lkml         # Model definition
├── views/
│   └── heatmap_data.view.lkml # View with dimensions and measures
├── dashboards/
│   └── heatmap_dashboard.dashboard.lookml  # Dashboard with heatmap tiles
└── custom_viz/
    ├── heatmap.js             # Custom visualization for Admin upload
    └── manifest.lkml          # Manifest for self-hosted viz
```

---

## Option 1: Custom Visualization (Admin > Visualizations)

### Upload Steps

1. Go to **Admin** > **Visualizations** in Looker Cloud
2. Click **Add Visualization**
3. Fill in the form:
   - **ID**: `custom_heatmap`
   - **Label**: `Custom Heatmap`
   - **Main File**: Upload `custom_viz/heatmap.js`
4. Click **Save**

### Using the Custom Visualization

1. Create or open any **Explore**
2. Add your query:
   - **First dimension**: X-axis categories (e.g., Day of Week)
   - **Second dimension**: Y-axis categories (e.g., Hour of Day)
   - **First measure**: Value for color intensity (e.g., Count)
3. Click **Run**
4. In the visualization picker, select **Custom Heatmap**
5. Configure options in the settings panel:
   - **Colors**: Color scheme, custom low/high colors
   - **Cells**: Padding, show values, font size
   - **Labels**: Show/hide axis labels, rotation
   - **Legend**: Position and visibility

### Configuration Options

| Section | Option | Description |
|---------|--------|-------------|
| Colors | Color Scheme | Blue, Green, Red, Purple, Orange, Diverging, Custom |
| Colors | Low/High Color | Custom colors when using Custom scheme |
| Colors | Null Color | Color for missing/null values |
| Cells | Cell Padding | Space between cells (px) |
| Cells | Show Values | Display values inside cells |
| Cells | Value Format | Auto, Number, Percent, Currency, Compact |
| Labels | Show X/Y Labels | Toggle axis labels |
| Labels | X Label Rotation | Angle for column headers |
| Legend | Show Legend | Toggle gradient legend |
| Legend | Position | Right, Bottom, or Top |

---

## Option 2: LookML Dashboard (Native Looker)

## Setup Instructions

### 1. Configure Database Connection

In `heatmap.model.lkml`, update the connection name:
```lkml
connection: "your_database_connection"
```

### 2. Update View with Your Data

In `views/heatmap_data.view.lkml`, update:
- `sql_table_name` to point to your actual table
- Column references (`x_axis_column`, `y_axis_column`, etc.)
- The derived table SQL in `activity_heatmap` view

### 3. Deploy to Looker

1. Create a new LookML project in Looker
2. Upload these files maintaining the folder structure
3. Configure the database connection
4. Validate LookML and deploy to production

## Embedding the Heatmap

### Private Embed (iframe)

```html
<iframe
  src="https://your-instance.looker.com/embed/dashboards/heatmap_dashboard"
  width="100%"
  height="800"
  frameborder="0"
></iframe>
```

### SSO Embed (Signed URL)

```javascript
// Server-side: Generate signed embed URL
const looker = require('@looker/sdk');

const embedUrl = looker.createSignedEmbedUrl({
  host: 'your-instance.looker.com',
  secret: 'your-embed-secret',
  user: {
    external_user_id: 'user-123',
    first_name: 'John',
    last_name: 'Doe',
    permissions: ['access_data', 'see_looks'],
    models: ['heatmap'],
    access_filters: {}
  },
  embed_url: '/embed/dashboards/heatmap_dashboard',
  session_length: 3600
});
```

### Embed SDK (Recommended)

```html
<script src="https://cdn.jsdelivr.net/npm/@looker/embed-sdk"></script>

<div id="heatmap-container"></div>

<script>
  LookerEmbedSDK.init('your-instance.looker.com', {
    auth_url: '/api/looker/auth'  // Your auth endpoint
  });

  LookerEmbedSDK.createDashboardWithId('heatmap_dashboard')
    .appendTo('#heatmap-container')
    .withFilters({
      'date_filter': '30 days'
    })
    .on('dashboard:loaded', (event) => {
      console.log('Heatmap loaded:', event);
    })
    .build()
    .connect();
</script>
```

## Heatmap Visualization Types

### 1. Grid with Cell Visualization (Recommended)
- Uses `looker_grid` with `series_cell_visualizations`
- Best for pivot tables showing X vs Y axis data
- Highly customizable color palettes

### 2. Native Heatmap
- Uses `looker_heatmap` visualization type
- Built-in heatmap functionality
- Good for simple category vs category analysis

### 3. Calendar Heatmap
- Week-by-day grid layout
- Great for showing activity over time
- Similar to GitHub contribution graphs

## Customizing Colors

### Sequential Gradient (Single Color)
```yaml
color_application:
  collection_id: looker-classic-colors
  palette_id: looker-sequential-gradient
```

### Diverging (Two Colors with Midpoint)
```yaml
color_application:
  collection_id: looker-classic-colors
  palette_id: looker-diverging-gradient
```

### Custom Palette
```yaml
series_cell_visualizations:
  measure_name:
    is_active: true
    palette:
      custom_colors:
        - "#f7fbff"
        - "#deebf7"
        - "#c6dbef"
        - "#9ecae1"
        - "#6baed6"
        - "#4292c6"
        - "#2171b5"
        - "#084594"
```

## Embed URL Parameters

| Parameter | Description |
|-----------|-------------|
| `embed_domain` | Allowed embed domain |
| `sdk=2` | Use SDK v2 features |
| `allow_login_screen=false` | Hide login for SSO |
| `theme=minimal` | Use minimal theme |

Example:
```
/embed/dashboards/heatmap_dashboard?embed_domain=https://yourapp.com&sdk=2&theme=minimal
```

## Responsive Design

For responsive embeds, use the Embed SDK with dynamic sizing:

```javascript
LookerEmbedSDK.createDashboardWithId('heatmap_dashboard')
  .withDynamicIFrameHeight()
  .appendTo('#container')
  .build()
  .connect();
```

## Security Considerations

1. Always use SSO embed for production
2. Configure allowed embed domains in Looker Admin
3. Use row-level security via `access_filters` for multi-tenant apps
4. Set appropriate session lengths for embed tokens
