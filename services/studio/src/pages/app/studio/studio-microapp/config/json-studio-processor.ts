/**
 * JSON-DRIVEN STUDIO MICROAPP PROCESSOR
 * 
 * This system takes a simple JSON configuration and generates the entire
 * studio microapp without any TypeScript factories or complex configurations.
 */

import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import studioConfig from "./studio-config.json";

// =============================================================================
// INTERFACES FOR JSON CONFIGURATION
// =============================================================================

interface StudioConfig {
  studioApp: {
    id: string;
    name: string;
    version: string;
    layout: LayoutConfig;
    componentPalette: ComponentPaletteConfig;
    propertyPanels: Record<string, PropertyPanelConfig>;
    eventPanels: Record<string, EventConfig[]>;
    themes: Record<string, ThemeConfig>;
    componentDefinitions: Record<string, ComponentDefinition>;
  };
}

interface LayoutConfig {
  type: "three-panel" | "two-panel";
  leftPanel: PanelConfig;
  centerPanel: PanelConfig;
  rightPanel: PanelConfig;
}

interface PanelConfig {
  width?: string;
  tabs?: TabConfig[];
  content?: string;
}

interface TabConfig {
  id: string;
  label: string;
  icon: string;
  content: string;
}

interface ComponentPaletteConfig {
  categories: CategoryConfig[];
}

interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  components: string[];
}

interface PropertyPanelConfig {
  groups: PropertyGroupConfig[];
}

interface PropertyGroupConfig {
  id: string;
  label: string;
  open: boolean;
  properties: PropertyConfig[];
}

interface PropertyConfig {
  name: string; // Property path like "style.backgroundColor"
  label: string;
  type: PropertyType;
  default: any;
  multiline?: boolean;
  min?: number;
  max?: number;
  unit?: string;
  options?: Array<{ value: any; label: string; icon?: string }>;
  condition?: ConditionConfig;
  validation?: ValidationConfig;
}

interface ConditionConfig {
  property: string;
  operator: "equals" | "not-equals" | "contains" | "greater-than" | "less-than";
  value: any;
}

interface ValidationConfig {
  required?: boolean;
  pattern?: string;
  min?: number;
  max?: number;
}

interface EventConfig {
  event: string;
  label: string;
  description: string;
  parameters: string[];
}

interface ThemeConfig {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

interface ComponentDefinition {
  componentType: string;
  webComponent: string;
  icon: string;
  category: string;
  defaultProps: any;
  allowsChildren?: boolean;
}

type PropertyType = 
  | "text" 
  | "number" 
  | "boolean" 
  | "color" 
  | "select" 
  | "size"
  | "spacing"
  | "border"
  | "shadow"
  | "icon";

// =============================================================================
// JSON TO STUDIO COMPONENTS PROCESSOR
// =============================================================================

export class JsonStudioProcessor {
  private static config: StudioConfig = studioConfig as StudioConfig;
  private static generatedComponents: any[] = [];

  /**
   * Generate the entire studio microapp from JSON configuration
   */
  static generateStudioApp(): any[] {
    this.generatedComponents = [];
    
    // Generate main layout
    this.generateLayout();
    
    // Generate component palette
    this.generateComponentPalette();
    
    // Generate property panels for each component type
    this.generatePropertyPanels();
    
    // Generate event panels
    this.generateEventPanels();
    
    return this.generatedComponents;
  }

  /**
   * Generate studio layout from JSON config
   */
  private static generateLayout(): void {
    const layout = this.config.studioApp.layout;
    
    // Main studio container
    this.addComponent({
      uuid: "studio_main_container",
      application_id: "1",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f8fafc"
      },
      childrenIds: ["left_panel", "center_panel", "right_panel"]
    });

    // Left panel
    this.generatePanel("left", layout.leftPanel);
    
    // Center panel (canvas)
    this.generatePanel("center", layout.centerPanel);
    
    // Right panel
    this.generatePanel("right", layout.rightPanel);
  }

  /**
   * Generate a panel from config
   */
  private static generatePanel(position: string, config: PanelConfig): void {
    const panelId = `${position}_panel`;
    
    this.addComponent({
      uuid: panelId,
      application_id: "1",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        width: config.width || (position === "center" ? "1fr" : "300px"),
        height: "100%",
        backgroundColor: position === "center" ? "#ffffff" : "#f9fafb",
        borderRight: position === "left" ? "1px solid #e5e7eb" : undefined,
        borderLeft: position === "right" ? "1px solid #e5e7eb" : undefined,
        overflow: "auto"
      },
      childrenIds: config.tabs ? [`${panelId}_tabs`] : [`${panelId}_content`]
    });

    if (config.tabs) {
      this.generateTabs(panelId, config.tabs);
    } else if (config.content) {
      this.generatePanelContent(panelId, config.content);
    }
  }

  /**
   * Generate tabs for a panel
   */
  private static generateTabs(panelId: string, tabs: TabConfig[]): void {
    // Tab container
    this.addComponent({
      uuid: `${panelId}_tabs`,
      application_id: "1",
      component_type: ComponentType.Tabs,
      ...COMMON_ATTRIBUTES,
      style: {
        width: "100%",
        height: "100%"
      },
      input: {
        tabs: {
          type: "array",
          value: tabs.map(tab => ({
            label: { type: "string", value: tab.label },
            icon: { type: "string", value: tab.icon },
            content: { type: "componentId", value: `${panelId}_${tab.id}_content` }
          }))
        }
      }
    });

    // Generate content for each tab
    tabs.forEach(tab => {
      this.generatePanelContent(`${panelId}_${tab.id}`, tab.content);
    });
  }

  /**
   * Generate content for a panel
   */
  private static generatePanelContent(panelId: string, contentType: string): void {
    const contentId = `${panelId}_content`;
    
    switch (contentType) {
      case "componentPalette":
        this.generateComponentPaletteContent(contentId);
        break;
      case "pageManager":
        this.generatePageManagerContent(contentId);
        break;
      case "functionEditor":
        this.generateFunctionEditorContent(contentId);
        break;
      case "canvas":
        this.generateCanvasContent(contentId);
        break;
      case "propertyPanel":
        this.generatePropertyPanelContent(contentId);
        break;
      case "eventPanel":
        this.generateEventPanelContent(contentId);
        break;
      default:
        this.generateDefaultContent(contentId, contentType);
    }
  }

  /**
   * Generate component palette from JSON config
   */
  private static generateComponentPalette(): void {
    // This will be called by generateComponentPaletteContent
  }

  private static generateComponentPaletteContent(contentId: string): void {
    const palette = this.config.studioApp.componentPalette;
    
    // Main palette container
    this.addComponent({
      uuid: contentId,
      application_id: "1",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      },
      childrenIds: palette.categories.map(cat => `category_${cat.id}`)
    });

    // Generate each category
    palette.categories.forEach(category => {
      this.generateComponentCategory(category);
    });
  }

  /**
   * Generate a component category
   */
  private static generateComponentCategory(category: CategoryConfig): void {
    const categoryId = `category_${category.id}`;
    
    // Category collapse container
    this.addComponent({
      uuid: categoryId,
      application_id: "1",
      component_type: ComponentType.Collapse,
      ...COMMON_ATTRIBUTES,
      style: {
        width: "100%",
        marginBottom: "8px"
      },
      input: {
        title: { type: "string", value: category.label },
        icon: { type: "string", value: category.icon },
        open: { type: "boolean", value: true }
      },
      childrenIds: [`${categoryId}_components`]
    });

    // Components container
    this.addComponent({
      uuid: `${categoryId}_components`,
      application_id: "1",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
        gap: "8px",
        padding: "8px"
      },
      childrenIds: category.components.map(comp => `component_${comp}_palette_item`)
    });

    // Generate component items
    category.components.forEach(componentId => {
      this.generateComponentPaletteItem(componentId);
    });
  }

  /**
   * Generate a draggable component item in the palette
   */
  private static generateComponentPaletteItem(componentId: string): void {
    const definition = this.config.studioApp.componentDefinitions[componentId];
    if (!definition) return;

    this.addComponent({
      uuid: `component_${componentId}_palette_item`,
      application_id: "1",
      component_type: ComponentType.Button,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        fontSize: "12px",
        minHeight: "80px"
      },
      input: {
        icon: { type: "string", value: definition.icon },
        value: { type: "string", value: componentId.replace(/_/g, " ") }
      },
      event: {
        onDragStart: `
          setDragData({
            type: "component",
            componentType: "${definition.componentType}",
            defaultProps: ${JSON.stringify(definition.defaultProps)}
          });
        `,
        onClick: `
          addComponentToCanvas("${definition.componentType}", ${JSON.stringify(definition.defaultProps)});
        `
      }
    });
  }

  /**
   * Generate property panels from JSON config
   */
  private static generatePropertyPanels(): void {
    Object.entries(this.config.studioApp.propertyPanels).forEach(([componentType, config]) => {
      this.generatePropertyPanel(componentType, config);
    });
  }

  /**
   * Generate property panel for a specific component type
   */
  private static generatePropertyPanel(componentType: string, config: PropertyPanelConfig): void {
    const panelId = `property_panel_${componentType}`;
    
    // Main property panel container
    this.addComponent({
      uuid: panelId,
      application_id: "1",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "16px"
      },
      childrenIds: config.groups.map(group => `${panelId}_group_${group.id}`)
    });

    // Generate each property group
    config.groups.forEach(group => {
      this.generatePropertyGroup(panelId, group);
    });
  }

  /**
   * Generate a property group (collapse section)
   */
  private static generatePropertyGroup(panelId: string, group: PropertyGroupConfig): void {
    const groupId = `${panelId}_group_${group.id}`;
    
    // Group collapse container
    this.addComponent({
      uuid: groupId,
      application_id: "1",
      component_type: ComponentType.Collapse,
      ...COMMON_ATTRIBUTES,
      style: {
        width: "100%",
        marginBottom: "8px",
        border: "1px solid #e5e7eb",
        borderRadius: "6px"
      },
      input: {
        title: { type: "string", value: group.label },
        open: { type: "boolean", value: group.open }
      },
      childrenIds: group.properties.map(prop => `${groupId}_prop_${prop.name.replace(/[.\[\]]/g, "_")}`)
    });

    // Generate each property input
    group.properties.forEach(property => {
      this.generatePropertyInput(groupId, property);
    });
  }

  /**
   * Generate a property input
   */
  private static generatePropertyInput(groupId: string, property: PropertyConfig): void {
    const propId = `${groupId}_prop_${property.name.replace(/[.\[\]]/g, "_")}`;
    const inputId = `${propId}_input`;
    
    // Property container
    this.addComponent({
      uuid: propId,
      application_id: "1",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px",
        marginBottom: "4px"
      },
      childrenIds: [`${propId}_label`, inputId],
      // Add conditional visibility if specified
      ...(property.condition && {
        input: {
          visible: {
            type: "handler",
            value: this.generateConditionalVisibility(property.condition)
          }
        }
      })
    });

    // Property label
    this.addComponent({
      uuid: `${propId}_label`,
      application_id: "1",
      component_type: ComponentType.TextLabel,
      ...COMMON_ATTRIBUTES,
      style: {
        fontSize: "14px",
        color: "#374151",
        width: "40%"
      },
      input: {
        value: { type: "string", value: property.label }
      }
    });

    // Property input
    this.addComponent({
      uuid: inputId,
      application_id: "1",
      component_type: this.getInputComponentType(property.type),
      ...COMMON_ATTRIBUTES,
      style: { width: "55%" },
      input: this.generatePropertyInputConfig(property),
      event: {
        onChange: this.generatePropertyChangeHandler(property)
      }
    });
  }

  /**
   * Get the appropriate input component type for a property type
   */
  private static getInputComponentType(type: PropertyType): ComponentType {
    const typeMap = {
      text: ComponentType.TextInput,
      number: ComponentType.NumberInput,
      size: ComponentType.NumberInput,
      boolean: ComponentType.Checkbox,
      color: ComponentType.ColorPicker,
      select: ComponentType.Select,
      spacing: ComponentType.NumberInput,
      border: ComponentType.TextInput,
      shadow: ComponentType.TextInput,
      icon: ComponentType.IconPicker
    };
    
    return typeMap[type] || ComponentType.TextInput;
  }

  /**
   * Generate input configuration for a property
   */
  private static generatePropertyInputConfig(property: PropertyConfig): any {
    const config: any = {
      value: {
        type: "handler",
        value: `return getNestedProperty(GetVar("selectedComponent"), "${property.name}") || ${JSON.stringify(property.default)}`
      }
    };

    // Add type-specific configuration
    if (property.options) {
      config.options = { type: "array", value: property.options };
    }
    
    if (property.min !== undefined) {
      config.min = { type: "number", value: property.min };
    }
    
    if (property.max !== undefined) {
      config.max = { type: "number", value: property.max };
    }
    
    if (property.unit) {
      config.unit = { type: "string", value: property.unit };
    }
    
    if (property.multiline) {
      config.multiline = { type: "boolean", value: property.multiline };
    }

    return config;
  }

  /**
   * Generate change handler for a property
   */
  private static generatePropertyChangeHandler(property: PropertyConfig): string {
    let handler = `
      const component = GetVar("selectedComponent");
      if (!component) return;
      
      let value = EventData.value;
    `;

    // Add validation if specified
    if (property.validation) {
      if (property.validation.required) {
        handler += `
          if (!value || value === "") {
            showValidationError("${property.name}", "This field is required");
            return;
          }
        `;
      }
      
      if (property.validation.min !== undefined) {
        handler += `
          if (Number(value) < ${property.validation.min}) {
            showValidationError("${property.name}", "Value must be at least ${property.validation.min}");
            return;
          }
        `;
      }
      
      if (property.validation.max !== undefined) {
        handler += `
          if (Number(value) > ${property.validation.max}) {
            showValidationError("${property.name}", "Value must be at most ${property.validation.max}");
            return;
          }
        `;
      }
    }

    handler += `
      // Update the component property
      setNestedProperty(component, "${property.name}", value);
      
      // Trigger component update
      updateComponent(component);
    `;

    return handler;
  }

  /**
   * Generate conditional visibility logic
   */
  private static generateConditionalVisibility(condition: ConditionConfig): string {
    return `
      const component = GetVar("selectedComponent");
      if (!component) return false;
      
      const conditionValue = getNestedProperty(component, "${condition.property}");
      const targetValue = ${JSON.stringify(condition.value)};
      
      switch ("${condition.operator}") {
        case "equals": return conditionValue === targetValue;
        case "not-equals": return conditionValue !== targetValue;
        case "contains": return String(conditionValue).includes(String(targetValue));
        case "greater-than": return Number(conditionValue) > Number(targetValue);
        case "less-than": return Number(conditionValue) < Number(targetValue);
        default: return true;
      }
    `;
  }

  // Placeholder methods for other panel types
  private static generateEventPanels(): void {
    // Implementation for event panels
  }

  private static generatePageManagerContent(contentId: string): void {
    // Implementation for page manager
  }

  private static generateFunctionEditorContent(contentId: string): void {
    // Implementation for function editor
  }

  private static generateCanvasContent(contentId: string): void {
    // Implementation for canvas
  }

  private static generatePropertyPanelContent(contentId: string): void {
    // Implementation for dynamic property panel switching
  }

  private static generateEventPanelContent(contentId: string): void {
    // Implementation for event panel
  }

  private static generateDefaultContent(contentId: string, contentType: string): void {
    this.addComponent({
      uuid: contentId,
      application_id: "1",
      component_type: ComponentType.TextLabel,
      ...COMMON_ATTRIBUTES,
      input: {
        value: { type: "string", value: `${contentType} content` }
      }
    });
  }

  /**
   * Helper method to add component to the generated list
   */
  private static addComponent(component: any): void {
    this.generatedComponents.push(component);
  }

  /**
   * Get the generated studio components
   */
  static getGeneratedComponents(): any[] {
    return this.generatedComponents;
  }

  /**
   * Load configuration from external JSON file
   */
  static async loadConfiguration(configUrl: string): Promise<void> {
    try {
      const response = await fetch(configUrl);
      this.config = await response.json();
      console.log("✅ Studio configuration loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load studio configuration:", error);
      throw error;
    }
  }

  /**
   * Hot reload configuration in development
   */
  static async hotReloadConfiguration(): Promise<void> {
    if (import.meta.env.DEV) {
      await this.loadConfiguration(`./studio-config.json?t=${Date.now()}`);
      // Trigger studio regeneration
      document.dispatchEvent(new CustomEvent("studio-config-reload"));
    }
  }
}

// Export the processor and generate the studio app
export default JsonStudioProcessor.generateStudioApp();