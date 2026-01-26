/**
 * TopBar Dropdown Options
 *
 * Provides option configurations for the Insert, Edit, and Application dropdowns.
 * Converted from micro-app JS strings to native TypeScript.
 */

export interface DropdownOption {
  id?: string;
  label: string;
  value: any;
  icon?: string;
  options?: DropdownOption[];
}

/**
 * Get options for the Insert dropdown
 */
export function getInsertOptions(): DropdownOption[] {
  const inputOptions: DropdownOption[] = [
    {
      label: 'Text Input',
      value: {
        value: 'text_input',
        additionalData: { action: 'add', style: { width: '250px' } }
      },
      icon: 'text-cursor-input'
    },
    {
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
      label: 'Button',
      value: {
        value: 'button_input',
        additionalData: { action: 'add', style: { width: '120px' } }
      },
      icon: 'mouse'
    },
    {
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
      label: 'DatePicker',
      value: {
        value: 'date_picker',
        additionalData: { action: 'add', style: { width: '200px' } }
      },
      icon: 'calendar'
    },
    {
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
      label: 'File Upload',
      value: {
        value: 'file_upload',
        additionalData: { action: 'add', style: { width: '250px' } }
      },
      icon: 'file-up'
    },
    {
      label: 'Form',
      value: {
        value: 'form',
        additionalData: { action: 'add', style: { width: '400px' } }
      },
      icon: 'square-pen'
    }
  ];

  const displayOptions: DropdownOption[] = [
    {
      label: 'Text Label',
      value: {
        value: 'text_label',
        additionalData: { action: 'add', style: { width: 'auto' } }
      },
      icon: 'case-sensitive'
    },
    {
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
      label: 'Icon',
      value: {
        value: 'icon',
        additionalData: { action: 'add', style: { width: '50px' } }
      },
      icon: 'badge'
    },
    {
      label: 'Code',
      value: {
        value: 'code',
        additionalData: { action: 'add', style: { width: '100%', height: '100px' } }
      },
      icon: 'file-code'
    },
    {
      label: 'Embed URL',
      value: {
        value: 'embed_url',
        additionalData: { action: 'add', style: { width: '600px', height: '400px' } }
      },
      icon: 'file-code'
    }
  ];

  const layoutOptions: DropdownOption[] = [
    {
      label: 'Container',
      value: {
        value: 'container',
        additionalData: { action: 'add', style: { width: '300px' } }
      },
      icon: 'grip-vertical'
    },
    {
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
      label: 'Ref Component',
      value: {
        value: 'ref_component',
        additionalData: { action: 'add', style: { width: '250px' } }
      },
      icon: 'asterisk'
    },
    {
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
    }
  ];

  const dataOptions: DropdownOption[] = [
    {
      label: 'Table',
      value: {
        value: 'table',
        additionalData: { action: 'add', style: { width: '500px' } }
      },
      icon: 'table'
    },
    {
      label: 'Collection',
      value: {
        value: 'collection',
        additionalData: { action: 'add', style: { width: '400px' } }
      },
      icon: 'database'
    },
    {
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
      label: 'Image',
      value: {
        value: 'image',
        additionalData: { action: 'add', style: { width: '100px', height: '100px' } }
      },
      icon: 'image'
    },
    {
      label: 'Video',
      value: {
        value: 'video',
        additionalData: { action: 'add', style: { width: '400px', height: '400px' } }
      },
      icon: 'video'
    },
    {
      label: 'Document',
      value: {
        value: 'document',
        additionalData: { action: 'add', style: { width: '400px', height: '400px' } }
      },
      icon: 'asterisk'
    }
  ];

  return [
    { id: 'input', label: 'Input', options: inputOptions, icon: 'keyboard', value: '' },
    { id: 'display', label: 'Display', options: displayOptions, icon: 'tv-minimal', value: '' },
    { id: 'layout', label: 'Layout', options: layoutOptions, icon: 'columns', value: '' },
    { id: 'data', label: 'Data', options: dataOptions, icon: 'database', value: '' },
    { id: 'media', label: 'Media', options: mediaOptions, icon: 'image', value: '' }
  ];
}

/**
 * Get options for the Edit dropdown
 */
export function getEditOptions(): DropdownOption[] {
  return [
    { label: 'Copy', value: 'copy', icon: 'copy' },
    { label: 'Paste', value: 'paste', icon: 'clipboard' },
    { label: 'Delete', value: 'delete', icon: 'trash' },
    { label: 'Export', value: 'export', icon: 'file-down' },
    { label: 'Import', value: 'import', icon: 'file-up' }
  ];
}

/**
 * Get options for the Application dropdown
 */
export function getApplicationOptions(): DropdownOption[] {
  return [
    {
      label: 'Application Settings',
      value: { action: 'open-modal' },
      icon: 'settings'
    },
    {
      label: 'KV Storage',
      value: { action: 'open-kv-modal' },
      icon: 'database'
    },
    {
      label: 'Share',
      value: { action: 'share' },
      icon: 'share'
    },
    {
      label: 'New Workflow',
      value: {
        action: 'new-tab',
        tab: { id: 'flow-new', label: 'Workflows', type: 'flow' }
      },
      icon: 'workflow'
    },
    {
      label: 'Database',
      value: {
        action: 'new-tab',
        tab: { id: 'database', label: 'Database', type: 'database' }
      },
      icon: 'database'
    }
  ];
}
