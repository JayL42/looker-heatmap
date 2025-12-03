view: heatmap_data {
  # Update this to your actual table or derived table
  sql_table_name: your_schema.your_table ;;

  # ============================================
  # DIMENSIONS - Define the X and Y axes for heatmap
  # ============================================

  # X-Axis Dimension (e.g., Day of Week, Hour, Category)
  dimension: x_axis_category {
    type: string
    sql: ${TABLE}.x_axis_column ;;
    label: "X Axis"
    description: "Horizontal axis for heatmap"
  }

  # Y-Axis Dimension (e.g., Hour of Day, Product Category)
  dimension: y_axis_category {
    type: string
    sql: ${TABLE}.y_axis_column ;;
    label: "Y Axis"
    description: "Vertical axis for heatmap"
  }

  # ============================================
  # TIME-BASED DIMENSIONS (Common for heatmaps)
  # ============================================

  dimension_group: event {
    type: time
    timeframes: [
      raw,
      time,
      date,
      week,
      month,
      quarter,
      year,
      hour_of_day,
      day_of_week,
      day_of_week_index,
      month_name
    ]
    sql: ${TABLE}.event_timestamp ;;
  }

  # Day of week (useful for time-based heatmaps)
  dimension: day_of_week_name {
    type: string
    sql: ${event_day_of_week} ;;
    order_by_field: event_day_of_week_index
    label: "Day of Week"
  }

  # Hour of day (useful for time-based heatmaps)
  dimension: hour_of_day {
    type: number
    sql: ${event_hour_of_day} ;;
    label: "Hour of Day"
    value_format: "00"
  }

  # ============================================
  # MEASURES - The values that determine heatmap intensity
  # ============================================

  measure: count {
    type: count
    drill_fields: [detail*]
    label: "Count"
    description: "Total count - use for heatmap intensity"
  }

  measure: total_value {
    type: sum
    sql: ${TABLE}.value_column ;;
    label: "Total Value"
    description: "Sum of values - use for heatmap intensity"
    value_format_name: decimal_2
  }

  measure: average_value {
    type: average
    sql: ${TABLE}.value_column ;;
    label: "Average Value"
    description: "Average value - use for heatmap intensity"
    value_format_name: decimal_2
  }

  # Percentage measure (useful for heatmaps showing distribution)
  measure: percent_of_total {
    type: percent_of_total
    sql: ${count} ;;
    label: "Percent of Total"
    value_format_name: percent_1
  }

  # ============================================
  # DRILL FIELDS
  # ============================================

  set: detail {
    fields: [
      x_axis_category,
      y_axis_category,
      event_date,
      count,
      total_value
    ]
  }
}

# ============================================
# EXAMPLE: Activity Heatmap View
# Shows activity by day of week and hour
# ============================================

view: activity_heatmap {
  derived_table: {
    sql:
      SELECT
        DAYNAME(event_timestamp) as day_of_week,
        DAYOFWEEK(event_timestamp) as day_index,
        HOUR(event_timestamp) as hour_of_day,
        COUNT(*) as activity_count,
        SUM(value) as total_value
      FROM your_schema.your_events_table
      GROUP BY 1, 2, 3
    ;;
  }

  dimension: day_of_week {
    type: string
    sql: ${TABLE}.day_of_week ;;
    order_by_field: day_index
    label: "Day of Week"
  }

  dimension: day_index {
    type: number
    sql: ${TABLE}.day_index ;;
    hidden: yes
  }

  dimension: hour_of_day {
    type: number
    sql: ${TABLE}.hour_of_day ;;
    label: "Hour of Day"
    value_format: "00"
  }

  measure: activity_count {
    type: sum
    sql: ${TABLE}.activity_count ;;
    label: "Activity Count"
  }

  measure: total_value {
    type: sum
    sql: ${TABLE}.total_value ;;
    label: "Total Value"
    value_format_name: decimal_0
  }
}
