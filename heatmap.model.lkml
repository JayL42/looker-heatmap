connection: "your_database_connection"

# Include all view files
include: "/views/*.view.lkml"

# Include all dashboard files
include: "/dashboards/*.dashboard.lookml"

# Define the explore for heatmap visualization
explore: heatmap_data {
  label: "Heatmap Analysis"
  description: "Explore data for heatmap visualizations"
}
