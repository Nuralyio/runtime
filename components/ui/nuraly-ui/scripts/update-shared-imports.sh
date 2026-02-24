#!/bin/bash

# Script to update all shared imports to use @nuralyui/common package

echo "🔄 Updating shared imports to @nuralyui/common..."

# Find all TypeScript files in components
find /Users/Shared/project/hybrid-ui-library/hybrid-ui/src/components -name "*.ts" -type f | while read file; do
  # Skip if file doesn't contain shared imports
  if ! grep -q "from ['\"].*shared/" "$file"; then
    continue
  fi
  
  echo "📝 Updating: $file"
  
  # Update base-mixin imports
  sed -i '' "s|from ['\"].*shared/base-mixin.js['\"]|from '@nuralyui/common/mixins'|g" "$file"
  
  # Update theme-mixin imports
  sed -i '' "s|from ['\"].*shared/theme-mixin.js['\"]|from '@nuralyui/common/mixins'|g" "$file"
  
  # Update dependency-mixin imports
  sed -i '' "s|from ['\"].*shared/dependency-mixin.js['\"]|from '@nuralyui/common/mixins'|g" "$file"
  
  # Update event-handler-mixin imports
  sed -i '' "s|from ['\"].*shared/event-handler-mixin.js['\"]|from '@nuralyui/common/mixins'|g" "$file"
  
  # Update controller imports
  sed -i '' "s|from ['\"].*shared/controllers/dropdown.controller.js['\"]|from '@nuralyui/common/controllers'|g" "$file"
  sed -i '' "s|from ['\"].*shared/controllers/dropdown.interface.js['\"]|from '@nuralyui/common/controllers'|g" "$file"
  sed -i '' "s|from ['\"].*shared/controllers/theme.controller.js['\"]|from '@nuralyui/common/controllers'|g" "$file"
  sed -i '' "s|from ['\"].*shared/controllers/index.js['\"]|from '@nuralyui/common/controllers'|g" "$file"
  
  # Update theme imports
  sed -i '' "s|from ['\"].*shared/themes/index.js['\"]|from '@nuralyui/common/themes'|g" "$file"
  
  # Update utils imports
  sed -i '' "s|from ['\"].*shared/utils.js['\"]|from '@nuralyui/common/utils'|g" "$file"
  
  # Update constants imports
  sed -i '' "s|from ['\"].*shared/constants.js['\"]|from '@nuralyui/common/constants'|g" "$file"
  
  # Update validation types imports
  sed -i '' "s|from ['\"].*shared/validation.types.js['\"]|from '@nuralyui/common/mixins'|g" "$file"
done

echo "✅ Import updates complete!"
echo ""
echo "🔍 Checking remaining shared imports..."
remaining=$(grep -r "from ['\"].*shared/" /Users/Shared/project/hybrid-ui-library/hybrid-ui/src/components --include="*.ts" | wc -l)
echo "Remaining imports: $remaining"

if [ "$remaining" -eq "0" ]; then
  echo "✅ All shared imports successfully updated!"
else
  echo "⚠️  Some shared imports still remain. Manual review needed:"
  grep -r "from ['\"].*shared/" /Users/Shared/project/hybrid-ui-library/hybrid-ui/src/components --include="*.ts"
fi
