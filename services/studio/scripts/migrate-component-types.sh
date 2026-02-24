#!/bin/bash

# Component Type Migration Script
# This script updates all component_type string values from old naming conventions to snake_case
#
# Usage: ./scripts/migrate-component-types.sh
# Run from the services/studio directory

set -e

echo "Starting component_type migration..."
echo ""

cd "$(dirname "$0")/.."

# Function to replace in all .ts files
replace_component_type() {
  local old="$1"
  local new="$2"

  # Count occurrences before replacement
  count=$(grep -r "\"$old\"" src --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')

  if [ "$count" -gt 0 ]; then
    echo "Replacing \"$old\" -> \"$new\" ($count occurrences)"
    find src -name "*.ts" -type f -exec sed -i '' "s/\"$old\"/\"$new\"/g" {} \;
  fi
}

echo "=== PascalCase to snake_case ==="
replace_component_type "Collection" "collection"
replace_component_type "Table" "table"
replace_component_type "Datepicker" "date_picker"
replace_component_type "Icon" "icon"
replace_component_type "Image" "image"
replace_component_type "MicroApp" "micro_app"
replace_component_type "RadioButton" "radio_button"
replace_component_type "IconPicker" "icon_picker"
replace_component_type "RefComponent" "ref_component"
replace_component_type "UsersDropdown" "users_dropdown"
replace_component_type "InsertDropdown" "insert_dropdown"
replace_component_type "Collapse" "collapse"
replace_component_type "Handlers" "handlers"
replace_component_type "AI" "ai"
replace_component_type "Divider" "divider"
replace_component_type "ExportImport" "export_import"
replace_component_type "InvokeFunction" "invoke_function"
replace_component_type "Textarea" "textarea"
replace_component_type "Badge" "badge"
replace_component_type "Card" "card"
replace_component_type "Tag" "tag"
replace_component_type "Slider" "slider"
replace_component_type "Alert" "alert"
replace_component_type "Toast" "toast"
replace_component_type "Panel" "panel"
replace_component_type "FunctionsPanel" "functions_panel"

echo ""
echo "=== kebab-case to snake_case ==="
replace_component_type "container-block" "container"
replace_component_type "code-block" "code"
replace_component_type "rich-text" "rich_text"
replace_component_type "embed-url" "embed_url"
replace_component_type "file-upload" "file_upload"
replace_component_type "rich-text-editor" "rich_text_editor"
replace_component_type "modal-block" "modal"
replace_component_type "grid-row-block" "grid_row"
replace_component_type "grid-col-block" "grid_col"

echo ""
echo "=== Adding  suffix to input components ==="
replace_component_type "color_picker" "color_picker"
replace_component_type "\"select\"" "\"select\""
replace_component_type "\"checkbox\"" "\"checkbox\""
replace_component_type "\"dropdown\"" "\"dropdown\""

echo ""
echo "Migration complete!"
echo ""
echo "Note: Please review the changes and run your tests to ensure everything works correctly."
