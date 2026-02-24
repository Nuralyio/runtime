/**
 * TopBar Dropdown Options
 *
 * Provides option configurations for the Insert, Edit, and Application dropdowns.
 * Converted from micro-app JS strings to native TypeScript.
 */

export interface DropdownOption {
  id: string;
  label: string;
  value?: any;
  icon?: string;
  options?: DropdownOption[];
}

/**
 * Get options for the Insert dropdown
 */
export function getInsertOptions(): DropdownOption[] {
  const inputOptions: DropdownOption[] = [
    {
      id: 'text_input',
      label: 'Text Input',
      value: {
        value: 'text_input',
        additionalData: { action: 'add', style: { width: '250px' } }
      },
      icon: 'text-cursor-input'
    },
    {
      id: 'textarea',
      label: 'Textarea',
      value: {
        value: 'textarea',
        additionalData: {
          action: 'add',
          input: {
            label: { type: 'value', value: 'Textarea' },
            placeholder: { type: 'value', value: 'Enter text...' }
          },
          style: { width: '300px', height: '150px' }
        }
      },
      icon: 'align-left'
    },
    {
      id: 'button_input',
      label: 'Button',
      value: {
        value: 'button_input',
        additionalData: { action: 'add', style: { width: '120px' } }
      },
      icon: 'mouse'
    },
    {
      id: 'checkbox',
      label: 'Checkbox',
      value: {
        value: 'checkbox',
        additionalData: {
          action: 'add',
          input: { label: { type: 'value', value: 'Checkbox' } },
          style: { width: '150px' }
        }
      },
      icon: 'square-check'
    },
    {
      id: 'select',
      label: 'Select',
      value: {
        value: 'select',
        additionalData: {
          action: 'add',
          style: { width: '200px' },
          input: {
            options: {
              type: 'handler',
              value: 'return [{ label: "Item 1", value: "item1" }, { label: "Item 2", value: "item2" }]'
            },
            placeholder: { type: 'value', value: 'Select item' }
          }
        }
      },
      icon: 'list-video'
    },
    {
      id: 'date_picker',
      label: 'DatePicker',
      value: {
        value: 'date_picker',
        additionalData: { action: 'add', style: { width: '200px' } }
      },
      icon: 'calendar'
    },
    {
      id: 'slider',
      label: 'Slider',
      value: {
        value: 'slider',
        additionalData: {
          action: 'add',
          input: {
            value: { type: 'value', value: 50 },
            min: { type: 'value', value: 0 },
            max: { type: 'value', value: 100 }
          },
          style: { width: '200px' }
        }
      },
      icon: 'sliders'
    },
    {
      id: 'file_upload',
      label: 'File Upload',
      value: {
        value: 'file_upload',
        additionalData: { action: 'add', style: { width: '250px' } }
      },
      icon: 'file-up'
    },
    {
      id: 'form',
      label: 'Form',
      value: {
        value: 'form',
        additionalData: { action: 'add', style: { width: '400px' } }
      },
      icon: 'square-pen'
    },
    {
      id: 'number_input',
      label: 'Number Input',
      value: {
        value: 'number_input',
        additionalData: { action: 'add', style: { width: '200px' } }
      },
      icon: 'hash'
    },
    {
      id: 'radio_button',
      label: 'Radio Button',
      value: {
        value: 'radio_button',
        additionalData: {
          action: 'add',
          input: {
            value: {
              type: 'json',
              value: {
                options: [
                  { label: 'Option 1', value: 'option1' },
                  { label: 'Option 2', value: 'option2' }
                ],
                currentValue: 'option1'
              }
            }
          },
          style: { width: '200px' }
        }
      },
      icon: 'circle-dot'
    },
    {
      id: 'color_picker',
      label: 'Color Picker',
      value: {
        value: 'color_picker',
        additionalData: { action: 'add', style: { width: '200px' } }
      },
      icon: 'palette'
    },
    {
      id: 'icon_button',
      label: 'Icon Button',
      value: {
        value: 'icon_button',
        additionalData: { action: 'add', style: { width: '50px' } }
      },
      icon: 'square-mouse-pointer'
    }
  ];

  const displayOptions: DropdownOption[] = [
    {
      id: 'text_label',
      label: 'Text Label',
      value: {
        value: 'text_label',
        additionalData: { action: 'add', style: { width: 'auto' } }
      },
      icon: 'case-sensitive'
    },
    {
      id: 'rich_text',
      label: 'Rich Text',
      value: {
        value: 'rich_text',
        additionalData: {
          action: 'add',
          input: { value: { type: 'string', value: '<h1>Rich Text</h1>' } },
          style: { width: '400px' }
        }
      },
      icon: 'whole-word'
    },
    {
      id: 'badge',
      label: 'Badge',
      value: {
        value: 'badge',
        additionalData: {
          action: 'add',
          input: { count: { type: 'value', value: 5 } },
          style: { width: '60px' }
        }
      },
      icon: 'badge'
    },
    {
      id: 'tag',
      label: 'Tag',
      value: {
        value: 'tag',
        additionalData: {
          action: 'add',
          input: { label: { type: 'value', value: 'Tag' } },
          style: { width: '80px' }
        }
      },
      icon: 'tag'
    },
    {
      id: 'card',
      label: 'Card',
      value: {
        value: 'card',
        additionalData: {
          action: 'add',
          input: { title: { type: 'value', value: 'Card Title' } },
          style: { width: '300px', height: '200px' }
        }
      },
      icon: 'credit-card'
    },
    {
      id: 'icon',
      label: 'Icon',
      value: {
        value: 'icon',
        additionalData: { action: 'add', style: { width: '50px' } }
      },
      icon: 'badge'
    },
    {
      id: 'code',
      label: 'Code',
      value: {
        value: 'code',
        additionalData: { action: 'add', style: { width: '100%', height: '100px' } }
      },
      icon: 'file-code'
    },
    {
      id: 'embed_url',
      label: 'Embed URL',
      value: {
        value: 'embed_url',
        additionalData: { action: 'add', style: { width: '600px', height: '400px' } }
      },
      icon: 'file-code'
    },
    {
      id: 'link',
      label: 'Link',
      value: {
        value: 'link',
        additionalData: {
          action: 'add',
          style: { width: 'auto' }
        }
      },
      icon: 'link'
    },
    {
      id: 'divider',
      label: 'Divider',
      value: {
        value: 'divider',
        additionalData: { action: 'add', style: { width: '100%' } }
      },
      icon: 'minus'
    }
  ];

  const layoutOptions: DropdownOption[] = [
    {
      id: 'container',
      label: 'Container',
      value: {
        value: 'container',
        additionalData: { action: 'add', style: { width: '300px' } }
      },
      icon: 'grip-vertical'
    },
    {
      id: 'modal',
      label: 'Modal',
      value: {
        value: 'modal',
        additionalData: {
          action: 'add',
          input: {
            open: { type: 'static', value: false },
            modalTitle: { type: 'static', value: 'Modal Title' },
            size: { type: 'static', value: 'medium' }
          },
          style: { width: 'auto' }
        }
      },
      icon: 'square-stack'
    },
    {
      id: 'grid_row',
      label: 'Grid Row',
      value: {
        value: 'grid_row',
        additionalData: {
          action: 'add',
          input: {
            gutter: { type: 'number', value: 16 },
            wrap: { type: 'boolean', value: true }
          },
          style: { width: '100%' }
        }
      },
      icon: 'rows-3'
    },
    {
      id: 'grid_col',
      label: 'Grid Col',
      value: {
        value: 'grid_col',
        additionalData: {
          action: 'add',
          input: { span: { type: 'number', value: 12 } },
          style: { minHeight: '60px' }
        }
      },
      icon: 'columns-3'
    },
    {
      id: 'ref_component',
      label: 'Ref Component',
      value: {
        value: 'ref_component',
        additionalData: { action: 'add', style: { width: '250px' } }
      },
      icon: 'asterisk'
    },
    {
      id: 'workflow_wrapper',
      label: 'Workflow',
      value: {
        value: 'workflow_wrapper',
        additionalData: {
          action: 'add',
          input: {
            workflowId: { type: 'static', value: '' },
            triggerType: { type: 'static', value: 'manual' },
            autoExecute: { type: 'static', value: false },
            showStatus: { type: 'static', value: true },
            timeout: { type: 'static', value: 30000 }
          },
          style: { width: '300px' }
        }
      },
      icon: 'workflow'
    },
    {
      id: 'chatbot_wrapper',
      label: 'Chatbot',
      value: {
        value: 'chatbot_wrapper',
        additionalData: {
          action: 'add',
          input: {
            floating: { type: 'static', value: false },
            draggable: { type: 'static', value: false },
            position: { type: 'static', value: 'center-bottom' },
            title: { type: 'static', value: 'Chat' },
            showMessages: { type: 'static', value: true },
            showCloseButton: { type: 'static', value: false },
            placeholder: { type: 'static', value: 'Type your message...' },
            size: { type: 'static', value: 'medium' },
            variant: { type: 'static', value: 'default' }
          },
          style: { width: '400px', height: '500px' }
        }
      },
      icon: 'message-circle'
    },
    {
      id: 'micro_app',
      label: 'Micro App',
      value: {
        value: 'micro_app',
        additionalData: { action: 'add', style: { width: '300px' } }
      },
      icon: 'component'
    },
    {
      id: 'tabs',
      label: 'Tabs',
      value: {
        value: 'tabs',
        additionalData: {
          action: 'add',
          input: {
            tabs: {
              type: 'json',
              value: [
                { label: { type: 'text', value: 'Tab 1' }, key: 'tab1' },
                { label: { type: 'text', value: 'Tab 2' }, key: 'tab2' }
              ]
            },
            size: { type: 'string', value: 'small' }
          },
          style: { width: '400px', height: '300px' }
        }
      },
      icon: 'panel-top'
    },
    {
      id: 'panel',
      label: 'Panel',
      value: {
        value: 'panel',
        additionalData: {
          action: 'add',
          input: {
            title: { type: 'value', value: 'Panel' },
            open: { type: 'static', value: true },
            collapsible: { type: 'static', value: true }
          },
          style: { width: '300px', height: '200px' }
        }
      },
      icon: 'panel-top-close'
    },
    {
      id: 'collapse',
      label: 'Collapse',
      value: {
        value: 'collapse',
        additionalData: {
          action: 'add',
          input: {
            components: {
              type: 'array',
              value: [
                { label: 'Section 1', blockName: '', open: true },
                { label: 'Section 2', blockName: '', open: false }
              ]
            }
          },
          style: { width: '300px' }
        }
      },
      icon: 'chevrons-down-up'
    }
  ];

  const dataOptions: DropdownOption[] = [
    {
      id: 'table',
      label: 'Table',
      value: {
        value: 'table',
        additionalData: { action: 'add', style: { width: '500px' } }
      },
      icon: 'table'
    },
    {
      id: 'collection',
      label: 'Collection',
      value: {
        value: 'collection',
        additionalData: { action: 'add', style: { width: '400px' } }
      },
      icon: 'database'
    },
    {
      id: 'menu',
      label: 'Menu',
      value: {
        value: 'menu',
        additionalData: {
          action: 'add',
          style: {
            '--nuraly-menu-border': 'none',
            width: '200px',
            '--nuraly-menu-font-size': '12px'
          },
          input: {
            options: {
              type: 'array',
              value: [
                { id: 'item1', icon: 'folder', text: 'Item 1', value: 'item1' },
                { id: 'item2', icon: 'folder', text: 'Item 2', value: 'item2' }
              ]
            }
          }
        }
      },
      icon: 'menu'
    },
    {
      id: 'dropdown',
      label: 'Dropdown',
      value: {
        value: 'dropdown',
        additionalData: {
          action: 'add',
          input: {
            label: { type: 'value', value: 'Dropdown' },
            mode: { type: 'value', value: 'options' },
            options: {
              type: 'handler',
              value: "return [{ label: 'Option 1', value: 'value1' }, { label: 'Option 2', value: 'value2' }]"
            }
          },
          style: { width: '150px' }
        }
      },
      icon: 'chevron-down'
    }
  ];

  const mediaOptions: DropdownOption[] = [
    {
      id: 'image',
      label: 'Image',
      value: {
        value: 'image',
        additionalData: { action: 'add', style: { width: '100px', height: '100px' } }
      },
      icon: 'image'
    },
    {
      id: 'video',
      label: 'Video',
      value: {
        value: 'video',
        additionalData: { action: 'add', style: { width: '400px', height: '400px' } }
      },
      icon: 'video'
    },
    {
      id: 'document',
      label: 'Document',
      value: {
        value: 'document',
        additionalData: { action: 'add', style: { width: '400px', height: '400px' } }
      },
      icon: 'asterisk'
    }
  ];

  return [
    { id: 'input', label: 'Input', options: inputOptions, icon: 'keyboard' },
    { id: 'display', label: 'Display', options: displayOptions, icon: 'tv-minimal' },
    { id: 'layout', label: 'Layout', options: layoutOptions, icon: 'columns' },
    { id: 'data', label: 'Data', options: dataOptions, icon: 'database' },
    { id: 'media', label: 'Media', options: mediaOptions, icon: 'image' }
  ];
}

/**
 * Get options for the Edit dropdown
 */
export function getEditOptions(): DropdownOption[] {
  return [
    { id: 'copy', label: 'Copy', value: 'copy', icon: 'copy' },
    { id: 'paste', label: 'Paste', value: 'paste', icon: 'clipboard' },
    { id: 'delete', label: 'Delete', value: 'delete', icon: 'trash' },
    { id: 'export', label: 'Export', value: 'export', icon: 'file-down' },
    { id: 'import', label: 'Import', value: 'import', icon: 'file-up' }
  ];
}

/**
 * Get options for the Application dropdown
 */
export function getApplicationOptions(): DropdownOption[] {
  return [
    {
      id: 'app-settings',
      label: 'Application Settings',
      value: { action: 'open-modal' },
      icon: 'settings'
    },
    {
      id: 'kv-storage',
      label: 'KV Storage',
      value: { action: 'open-kv-modal' },
      icon: 'database'
    },
    {
      id: 'share',
      label: 'Share',
      value: { action: 'share' },
      icon: 'share'
    },
    {
      id: 'new-workflow',
      label: 'New Workflow',
      value: {
        action: 'new-tab',
        tab: { id: 'flow-new', label: 'Workflows', type: 'flow' }
      },
      icon: 'workflow'
    },
    {
      id: 'database',
      label: 'Database',
      value: {
        action: 'new-tab',
        tab: { id: 'database', label: 'Database', type: 'database' }
      },
      icon: 'database'
    },
    {
      id: 'journal',
      label: 'Journal',
      value: {
        action: 'new-tab',
        tab: { id: 'journal', label: 'Journal', type: 'journal' }
      },
      icon: 'scroll-text'
    },
    {
      id: 'functions',
      label: 'Functions',
      value: {
        action: 'new-tab',
        tab: { id: 'functions', label: 'Functions', type: 'function' }
      },
      icon: 'function-square'
    }
  ];
}
