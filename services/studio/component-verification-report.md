# Component Verification Report

Generated: 2025-11-21T22:53:10.980Z

## Summary

- Total Components: 21
- ✅ Fully Aligned: 2
- ⚠️  Minor Issues: 9
- ❌ Major Issues: 4
- 🔍 Missing Mapping: 6

## Detailed Results

### ✅ Fully Aligned Components

- **media/file-upload** → file-upload
  - Properties checked: 0
- **data/table** → table
  - Properties checked: 0

### ⚠️  Components with Minor Issues

#### inputs/checkbox → checkbox

Properties checked: 3, CSS variables: 0

**Warnings:**
- Property "label" exists in studio but not in NuralyUI component
  - Studio type: text, Default: Checkbox
- Property "id" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 
- Property "checked" exists in studio but not in NuralyUI component
  - Studio type: radio, Default: uncheck

**Info:**
- Property "name" exists in NuralyUI but not exposed in studio
  - Type: string, Default: undefined
- Property "value" exists in NuralyUI but not exposed in studio
  - Type: string, Default: undefined
- NuralyUI component does not have style.variables.ts file
  - CSS variables cannot be verified

#### inputs/select → select

Properties checked: 4, CSS variables: 0

**Warnings:**
- Type mismatch for property "options"
  - Studio: event, NuralyUI: SelectOption[]
- Property "defaultSelected" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 
- Property "selectionMode" exists in studio but not in NuralyUI component
  - Studio type: radio, Default: single

**Info:** 21 informational messages (omitted for brevity)

#### navigation/link → button

Properties checked: 1, CSS variables: 0

**Warnings:**
- Property "url" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 

**Info:** 9 informational messages (omitted for brevity)

#### navigation/dropdown → dropdown

Properties checked: 1, CSS variables: 0

**Warnings:**
- Property "options" exists in studio but not in NuralyUI component
  - Studio type: event, Default: 

**Info:**
- NuralyUI component does not have style.variables.ts file
  - CSS variables cannot be verified

#### media/icon → icon

Properties checked: 2, CSS variables: 0

**Warnings:**
- Property "icon" exists in studio but not in NuralyUI component
  - Studio type: icon, Default: 
- Property "iconColor" exists in studio but not in NuralyUI component
  - Studio type: color, Default: 

**Info:**
- Property "size" exists in NuralyUI but not exposed in studio
  - Type: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge', Default: undefined
- Property "color" exists in NuralyUI but not exposed in studio
  - Type: string, Default: undefined
- Property "width" exists in NuralyUI but not exposed in studio
  - Type: string, Default: undefined
- Property "height" exists in NuralyUI but not exposed in studio
  - Type: string, Default: undefined
- NuralyUI component does not have style.variables.ts file
  - CSS variables cannot be verified

#### media/image → image

Properties checked: 4, CSS variables: 0

**Warnings:**
- Property "src" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 
- Property "alt" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 
- Property "previewable" exists in studio but not in NuralyUI component
  - Studio type: boolean, Default: false

**Info:**
- Property "fit" exists in NuralyUI but not exposed in studio
  - Type: ImageFit, Default: undefined
- NuralyUI component does not have style.variables.ts file
  - CSS variables cannot be verified

#### media/video → video

Properties checked: 2, CSS variables: 0

**Warnings:**
- Property "src" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 
- Property "previewable" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 

**Info:**
- Property "poster" exists in NuralyUI but not exposed in studio
  - Type: string, Default: undefined
- Property "preload" exists in NuralyUI but not exposed in studio
  - Type: VideoPreload, Default: VideoPreload.Metadata
- NuralyUI component does not have style.variables.ts file
  - CSS variables cannot be verified

#### content/document → document

Properties checked: 2, CSS variables: 0

**Warnings:**
- Property "previewable" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 
- Property "src" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 

**Info:**
- Property "type" exists in NuralyUI but not exposed in studio
  - Type: DocumentType, Default: DocumentType.PDF
- NuralyUI component does not have style.variables.ts file
  - CSS variables cannot be verified

#### data/menu → menu

Properties checked: 3, CSS variables: 0

**Warnings:**
- Property "value" exists in studio but not in NuralyUI component
  - Studio type: text, Default: undefined
- Property "id" exists in studio but not in NuralyUI component
  - Studio type: text, Default: undefined
- Property "options" exists in studio but not in NuralyUI component
  - Studio type: event, Default: undefined

**Info:**
- Property "items" exists in NuralyUI but not exposed in studio
  - Type: IMenu[], Default: []
- Property "size" exists in NuralyUI but not exposed in studio
  - Type: MenuSize | string, Default: MenuSize.Medium
- Property "arrowPosition" exists in NuralyUI but not exposed in studio
  - Type: IconPosition | string, Default: IconPosition.Right
- NuralyUI component does not have style.variables.ts file
  - CSS variables cannot be verified

### ❌ Components with Major Issues

#### inputs/text-label → label

Properties checked: 5, CSS variables: 18

**Warnings:**
- Property "value" exists in studio but not in NuralyUI component
  - Studio type: text, Default: Text label
- Property "variant" missing options in studio config
  - Missing: success, warning, error (from LabelVariant type)
- Property "variant" has extra options in studio config
  - Extra: primary (not in LabelVariant type)
- Property "required" exists in studio but not in NuralyUI component
  - Studio type: boolean, Default: false

#### inputs/datepicker → datepicker

Properties checked: 5, CSS variables: 0

**Warnings:**
- Property "value" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 
- Property "label" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 
- Property "helperText" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 
- Property "locale" exists in studio but not in NuralyUI component
  - Studio type: select, Default: en
- Property "format" exists in studio but not in NuralyUI component
  - Studio type: select, Default: DD/MM/YYYY
- Missing many CSS variables in studio theme.json
  - Count: 73 (too many to list)

#### navigation/button → button

Properties checked: 6, CSS variables: 0

**Warnings:**
- Property "label" exists in studio but not in NuralyUI component
  - Studio type: text, Default: Button
- Property "id" exists in studio but not in NuralyUI component
  - Studio type: text, Default: 
- Property "type" missing options in studio config
  - Missing: tertiary, text, link (from ButtonType type)
- Type mismatch for property "iconPosition"
  - Studio: string, NuralyUI: IconPosition
- Type mismatch for property "icon"
  - Studio: string, NuralyUI: ButtonIcons
- Property "state" exists in studio but not in NuralyUI component
  - Studio type: radio, Default: enabled

#### layout/container → flex

Properties checked: 4, CSS variables: 0

**Warnings:**
- Type mismatch for property "direction"
  - Studio: string, NuralyUI: FlexDirection
- Property "direction" missing options in studio config
  - Missing: row, row-reverse, column, column-reverse (from FlexDirection type)
- Property "direction" has extra options in studio config
  - Extra: vertical, horizontal (not in FlexDirection type)
- Property "alignment" exists in studio but not in NuralyUI component
  - Studio type: select, Default: default
- Type mismatch for property "gap"
  - Studio: number, NuralyUI: Gap
- Property "layout" exists in studio but not in NuralyUI component
  - Studio type: select, Default: default

### 🔍 Missing Mappings

#### inputs/text-input → input

- Studio config.json not found
  - /home/user/studio/src/features/studio/params/inputs/text-input/config.json

#### inputs/textarea → textarea

- Studio config.json not found
  - /home/user/studio/src/features/studio/params/inputs/textarea/config.json

#### inputs/slider → slider-input

- Studio config.json not found
  - /home/user/studio/src/features/studio/params/inputs/slider/config.json

#### layout/card → card

- Studio config.json not found
  - /home/user/studio/src/features/studio/params/layout/card/config.json

#### display/badge → badge

- Studio config.json not found
  - /home/user/studio/src/features/studio/params/display/badge/config.json

#### display/tag → tag

- Studio config.json not found
  - /home/user/studio/src/features/studio/params/display/tag/config.json

## Issue Statistics by Category

| Category | Errors | Warnings | Info |
|----------|--------|----------|------|
| property | 0 | 31 | 54 |
| type | 0 | 10 | 0 |
| css-variable | 0 | 1 | 13 |
| mapping | 6 | 0 | 0 |

---

*This report was automatically generated by the component verification script.*
