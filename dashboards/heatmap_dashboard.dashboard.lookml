---
- dashboard: heatmap_dashboard
  title: "Heatmap Visualization Dashboard"
  layout: newspaper
  preferred_viewer: dashboards-next
  description: "Heatmap visualization optimized for Looker embed"

  # Dashboard filters
  filters:
    - name: date_filter
      title: "Date Range"
      type: date_filter
      default_value: "30 days"
      allow_multiple_values: true
      required: false
      ui_config:
        type: relative_timeframes
        display: inline

  # Embed settings
  embed_style:
    background_color: "#ffffff"
    show_title: true
    title_color: "#3a4245"
    show_filters_bar: true
    tile_text_color: "#3a4245"
    text_tile_text_color: "#3a4245"

  elements:
    # ============================================
    # HEATMAP TILE - Day of Week by Hour
    # ============================================
    - title: "Activity Heatmap by Day and Hour"
      name: activity_heatmap
      model: heatmap
      explore: heatmap_data
      type: looker_grid   # Use table with conditional formatting for heatmap effect

      fields:
        - heatmap_data.day_of_week_name
        - heatmap_data.hour_of_day
        - heatmap_data.count

      pivots:
        - heatmap_data.hour_of_day

      sorts:
        - heatmap_data.day_of_week_name
        - heatmap_data.hour_of_day

      # Heatmap-style conditional formatting
      series_cell_visualizations:
        heatmap_data.count:
          is_active: true
          palette:
            palette_id: looker-sequential-gradient
            collection_id: looker-classic-colors
          value_display: true

      # Styling for embed
      show_view_names: false
      show_row_numbers: false
      transpose: false
      truncate_text: false
      hide_totals: false
      hide_row_totals: false
      size_to_fit: true
      table_theme: white
      limit_displayed_rows: false
      enable_conditional_formatting: true
      header_text_alignment: center
      header_font_size: '12'
      rows_font_size: '12'

      conditional_formatting:
        - type: along a scale...
          value:
          background_color:
          font_color:
          color_application:
            collection_id: looker-classic-colors
            palette_id: looker-sequential-gradient
            options:
              constraints:
                min:
                  type: minimum
                mid:
                  type: middle
                max:
                  type: maximum
              mirror: false
              reverse: false
              stepped: false
          bold: false
          italic: false
          strikethrough: false
          fields:
            - heatmap_data.count

      row: 0
      col: 0
      width: 24
      height: 10

    # ============================================
    # ALTERNATIVE: Native Heatmap using looker_heatmap
    # ============================================
    - title: "Native Heatmap Visualization"
      name: native_heatmap
      model: heatmap
      explore: heatmap_data
      type: looker_heatmap

      fields:
        - heatmap_data.x_axis_category
        - heatmap_data.y_axis_category
        - heatmap_data.count

      sorts:
        - heatmap_data.x_axis_category
        - heatmap_data.y_axis_category

      # Heatmap-specific settings
      color_application:
        collection_id: looker-classic-colors
        palette_id: looker-sequential-gradient
        options:
          steps: 10
          reverse: false

      show_view_names: false
      show_row_numbers: false
      show_null_labels: false
      show_totals_labels: false
      show_silhouette: false
      totals_color: "#808080"

      # Label settings
      label_type: labPer
      x_axis_gridlines: false
      y_axis_gridlines: false
      show_x_axis_label: true
      show_x_axis_ticks: true
      show_y_axis_label: true
      show_y_axis_ticks: true

      row: 10
      col: 0
      width: 24
      height: 10

    # ============================================
    # CALENDAR HEATMAP STYLE
    # ============================================
    - title: "Calendar Heatmap"
      name: calendar_heatmap
      model: heatmap
      explore: heatmap_data
      type: looker_grid

      fields:
        - heatmap_data.event_week
        - heatmap_data.event_day_of_week
        - heatmap_data.count

      pivots:
        - heatmap_data.event_day_of_week

      sorts:
        - heatmap_data.event_week desc

      series_cell_visualizations:
        heatmap_data.count:
          is_active: true
          palette:
            palette_id: looker-sequential-gradient
            collection_id: looker-classic-colors

      show_view_names: false
      show_row_numbers: false
      size_to_fit: true
      table_theme: white

      row: 20
      col: 0
      width: 24
      height: 8
