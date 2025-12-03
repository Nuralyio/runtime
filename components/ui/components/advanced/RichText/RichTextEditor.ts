import { LitElement, html, css } from "lit-element";
import { customElement, property, state } from "lit/decorators.js";

// Define SVG icons as constants
const svgIcons = {
  format_clear: '<svg viewBox="0 0 24 24"><path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"></path></svg>',
  format_bold: '<svg viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"></path></svg>',
  format_italic: '<svg viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"></path></svg>',
  format_underlined: '<svg viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"></path></svg>',
  format_align_left: '<svg viewBox="0 0 24 24"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"></path></svg>',
  format_align_center: '<svg viewBox="0 0 24 24"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"></path></svg>',
  format_align_right: '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"></path></svg>',
  format_list_numbered: '<svg viewBox="0 0 24 24"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"></path></svg>',
  format_list_bulleted: '<svg viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"></path></svg>',
  format_quote: '<svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path></svg>',
  format_indent_decrease: '<svg viewBox="0 0 24 24"><path d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"></path></svg>',
  format_indent_increase: '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"></path></svg>',
  link_off: '<svg viewBox="0 0 24 24"><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4.01 1.41-1.41L3.41 2.86 2 4.27z"></path></svg>',
  add_link: '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path></svg>',
  format_color_text: '<svg viewBox="0 0 24 24"><path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z"></path></svg>',
  border_color: '<svg viewBox="0 0 24 24"><path d="M17.75 7L14 3.25l-10 10V17h3.75l10-10zm2.96-2.96c.39-.39.39-1.02 0-1.41L18.37.29c-.39-.39-1.02-.39-1.41 0L15 2.25 18.75 6l1.96-1.96z"></path></svg>',
  title: '<svg viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4z"></path></svg>',
  text_format: '<svg viewBox="0 0 24 24"><path d="M5 17v2h14v-2H5zm4.5-4.2h5l.9 2.2h2.1L12.75 4h-1.5L6.5 15h2.1l.9-2.2zM12 5.98L13.87 11h-3.74L12 5.98z"></path></svg>',
  format_size: '<svg viewBox="0 0 24 24"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"></path></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></svg>',
  redo: '<svg viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></svg>',
  content_cut: '<svg viewBox="0 0 24 24"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z"></path></svg>',
  content_copy: '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>',
  content_paste: '<svg viewBox="0 0 24 24"><path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"></path></svg>'
};

@customElement("rich-text-editor-block")
export class RichTextEditor extends LitElement {
  @property() content: string = "";
  @state() root: Element | null = null;

  static styles = css`
    :host {
      /* --editor-width: 600px; */
      /* --editor-height: 600px; */
      /* --editor-background: #f1f1f1; */
      --editor-toolbar-height: 33px;
      --editor-toolbar-background: #454545;
      --editor-toolbar-on-background: white;
      /* --editor-toolbar-on-active-background: #a4a4a4; */
    }
    main {
  width: var(--editor-width);
  height: var(--editor-height);
  display: grid;
  grid-template-areas:
    "toolbar toolbar"
    "editor editor";
  grid-template-rows: auto 1fr;
  grid-template-columns: auto auto;
}
    #editor-actions {
      grid-area: toolbar;
width: var(--editor-width);
/* height: var(--editor-toolbar-height); */
background-color: var(--editor-toolbar-background);
color: var(--editor-toolbar-on-background);
overscroll-behavior: contain;
/* overflow-y: auto; */
-ms-overflow-style: none;
scrollbar-width: none;
overflow:auto;

/* Add these lines for vertical alignment */
display: flex;
align-items: center; /* vertically center items */
    }
    #editor-actions::-webkit-scrollbar {
      display: none;
    }
    #editor {
      width: var(--editor-width);
      grid-area: editor;
      background-color: var(--editor-background);
      border: 1px solid var(--editor-toolbar-background);
    }
    #toolbar {
      width: 1080px;
      height: var(--editor-toolbar-height);
    }
    [contenteditable] {
      outline: 0px solid transparent;
    }
    .icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      color: var(--editor-toolbar-on-background);
    }
    .icon-button svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .icon-button.active {
      color: var(--editor-toolbar-on-active-background);
    }
    select {
      margin-top: -5px;
    height: calc(var(--editor-toolbar-height) - 10px);
    vertical-align: middle;
    }
    input[type="color"] {
      height: calc(var(--editor-toolbar-height) - 15px);
      -webkit-appearance: none;
      border: none;
      width: 22px;
    }
    input[type="color"]::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    input[type="color"]::-webkit-color-swatch {
      border: none;
    }
  `;

  render() {
    return html`<main>
    
      <div id="editor-actions">
        <div id="toolbar">
          ${toolbar(this.shadowRoot!, this.getSelection(), (command, val) => {
            document.execCommand(command, false, val);
            console.log("command", command, val);
          })}
            <input id="bg" type="color" style="display: none" />
            <input id="fg" type="color" style="display: none" />
        </div>
      </div>
      <div id="editor" @input=${
        (e)=> {
          this.dispatchEvent(new CustomEvent("content-change", {
            detail: {
              value: this.root?.innerHTML,
            },
          }));
        }
      }>${this.root}</div>
    </main> `;
  }

  async firstUpdated() {
    const elem = this.parentElement?.querySelector("rich-text-editor template");
    // this.content = elem?.innerHTML ?? "qsds";
    this.reset();
  }

  reset() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.content, "text/html");
    document.execCommand("defaultParagraphSeparator", false, "br");
    document.addEventListener("selectionchange", () => {
      this.requestUpdate();
    });
    const root :any = doc.querySelector("body");
    root!.setAttribute("contenteditable", "true");
    this.root = root;
    this.root.style.height = "100%";
  }

  getSelection(): Selection | null {
    if (this.shadowRoot?.getSelection) return this.shadowRoot?.getSelection();
    return null;
  }
}

function toolbar(
  shadowRoot: ShadowRoot,
  selection: Selection | null,
  command: (c: string, val: string | undefined) => void
) {
  const tags: string[] = [];
  if (selection?.type === "Range") {
    // @ts-ignore
    let parentNode = selection?.baseNode;
    if (parentNode) {
      const checkNode = () => {
        const parentTagName = parentNode?.tagName?.toLowerCase()?.trim();
        if (parentTagName) tags.push(parentTagName);
      };
      while (parentNode != null) {
        checkNode();
        parentNode = parentNode?.parentNode;
      }
    }
  }

  const commands: {
    icon: string;
    command: string | (() => void);
    active?: boolean;
    type?: string;
    values?: { value: string; name: string; font?: boolean }[];
    command_value?: string;
  }[] = [
    {
      icon: "format_clear",
      command: "removeFormat",
    },

    {
      icon: "format_bold",
      command: "bold",
      active: tags.includes("b"),
    },
    {
      icon: "format_italic",
      command: "italic",
      active: tags.includes("i"),
    },
    {
      icon: "format_underlined",
      command: "underline",
      active: tags.includes("u"),
    },
    {
      icon: "format_align_left",
      command: "justifyleft",
    },
    {
      icon: "format_align_center",
      command: "justifycenter",
    },
    {
      icon: "format_align_right",
      command: "justifyright",
    },
    {
      icon: "format_list_numbered",
      command: "insertorderedlist",
      active: tags.includes("ol"),
    },
    {
      icon: "format_list_bulleted",
      command: "insertunorderedlist",
      active: tags.includes("ul"),
    },
    {
      icon: "format_quote",
      command: "formatblock",
      command_value: "blockquote",
    },
    {
      icon: "format_indent_decrease",
      command: "outdent",
    },
    {
      icon: "format_indent_increase",
      command: "indent",
    },
    tags.includes("a")
      ? { icon: "link_off", command: "unlink" }
      : {
          icon: "add_link",
          command: () => {
            const newLink = prompt("Write the URL here", "http://");
            if (newLink && newLink != "" && newLink != "http://") {
              command("createlink", newLink);
            }
          },
        },
    {
      icon: "format_color_text",
      command: () => {
        const input = shadowRoot.querySelector("#fg")! as HTMLInputElement;
        input.addEventListener("input", (e: any) => {
          const val = e.target.value;
          command("forecolor", val);
        });
        input.click();
      },
      type: "color",
    },
    {
      icon: "border_color",
      command: () => {
        const input = shadowRoot.querySelector("#bg")! as HTMLInputElement;
        input.addEventListener("input", (e: any) => {
          const val = e.target.value;
          command("backcolor", val);
        });
        input.click();
      },
      type: "color",
    },
    // {
    //   icon: "title",
    //   command: "formatblock",
    //   values: [
    //     { name: "Normal Text", value: "--" },
    //     { name: "Heading 1", value: "h1" },
    //     { name: "Heading 2", value: "h2" },
    //     { name: "Heading 3", value: "h3" },
    //     { name: "Heading 4", value: "h4" },
    //     { name: "Heading 5", value: "h5" },
    //     { name: "Heading 6", value: "h6" },
    //     { name: "Paragraph", value: "p" },
    //     { name: "Pre-Formatted", value: "pre" },
    //   ],
    // },
    // {
    //   icon: "text_format",
    //   command: "fontname",
    //   values: [
    //     { name: "Font Name", value: "--" },
    //     ...[...checkFonts()].map((f) => ({
    //       name: f,
    //       value: f,
    //       font: true,
    //     })),
    //   ],
    // },
    {
      icon: "format_size",
      command: "fontsize",
      values: [
        { name: "Font Size", value: "--" },
        { name: "Very Small", value: "1" },
        { name: "Small", value: "2" },
        { name: "Normal", value: "3" },
        { name: "Medium Large", value: "4" },
        { name: "Large", value: "5" },
        { name: "Very Large", value: "6" },
        { name: "Maximum", value: "7" },
      ],
    },
    {
      icon: "undo",
      command: "undo",
    },
    {
      icon: "redo",
      command: "redo",
    },
    {
      icon: "content_cut",
      command: "cut",
    },
    {
      icon: "content_copy",
      command: "copy",
    },
    {
      icon: "content_paste",
      command: "paste",
    },
  ];

  return html`
    ${commands.map((n) => {
      if (n.values) {
        return html`
          <select
            id="${n.icon}"
            @change=${(e: any) => {
              const val = e.target.value;
              if (val === "--") {
                command("removeFormat", undefined);
              } else if (typeof n.command === "string") {
                command(n.command, val);
              }
            }}
          >
            ${n.values.map(
              (v) => html`<option value=${v.value}>${v.name}</option>`
            )}
          </select>
        `;
      } else {
        return html`
          <button
            class="icon-button ${n.active ? 'active' : ''}"
            @click=${() => {
              if (typeof n.command === "string") {
                command(n.command, n.command_value);
              } else {
                n.command();
              }
            }}
            .innerHTML=${svgIcons[n.icon]}
          ></button>
        `;
      }
    })}
  `;
}

export function checkFonts(): string[] {
  const fontCheck = new Set(
    [
      // Windows 10
      "Arial",
      "Arial Black",
      "Bahnschrift",
      "Calibri",
      "Cambria",
      "Cambria Math",
      "Candara",
      "Comic Sans MS",
      "Consolas",
      "Constantia",
      "Corbel",
      "Courier New",
      "Ebrima",
      "Franklin Gothic Medium",
      "Gabriola",
      "Gadugi",
      "Georgia",
      "HoloLens MDL2 Assets",
      "Impact",
      "Ink Free",
      "Javanese Text",
      "Leelawadee UI",
      "Lucida Console",
      "Lucida Sans Unicode",
      "Malgun Gothic",
      "Marlett",
      "Microsoft Himalaya",
      "Microsoft JhengHei",
      "Microsoft New Tai Lue",
      "Microsoft PhagsPa",
      "Microsoft Sans Serif",
      "Microsoft Tai Le",
      "Microsoft YaHei",
      "Microsoft Yi Baiti",
      "MingLiU-ExtB",
      "Mongolian Baiti",
      "MS Gothic",
      "MV Boli",
      "Myanmar Text",
      "Nirmala UI",
      "Palatino Linotype",
      "Segoe MDL2 Assets",
      "Segoe Print",
      "Segoe Script",
      "Segoe UI",
      "Segoe UI Historic",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
      "SimSun",
      "Sitka",
      "Sylfaen",
      "Symbol",
      "Tahoma",
      "Times New Roman",
      "Trebuchet MS",
      "Verdana",
      "Webdings",
      "Wingdings",
      "Yu Gothic",
      // macOS
      "American Typewriter",
      "Andale Mono",
      "Arial",
      "Arial Black",
      "Arial Narrow",
      "Arial Rounded MT Bold",
      "Arial Unicode MS",
      "Avenir",
      "Avenir Next",
      "Avenir Next Condensed",
      "Baskerville",
      "Big Caslon",
      "Bodoni 72",
      "Bodoni 72 Oldstyle",
      "Bodoni 72 Smallcaps",
      "Bradley Hand",
      "Brush Script MT",
      "Chalkboard",
      "Chalkboard SE",
      "Chalkduster",
      "Charter",
      "Cochin",
      "Comic Sans MS",
      "Copperplate",
      "Courier",
      "Courier New",
      "Didot",
      "DIN Alternate",
      "DIN Condensed",
      "Futura",
      "Geneva",
      "Georgia",
      "Gill Sans",
      "Helvetica",
      "Helvetica Neue",
      "Herculanum",
      "Hoefler Text",
      "Impact",
      "Lucida Grande",
      "Luminari",
      "Marker Felt",
      "Menlo",
      "Microsoft Sans Serif",
      "Monaco",
      "Noteworthy",
      "Optima",
      "Palatino",
      "Papyrus",
      "Phosphate",
      "Rockwell",
      "Savoye LET",
      "SignPainter",
      "Skia",
      "Snell Roundhand",
      "Tahoma",
      "Times",
      "Times New Roman",
      "Trattatello",
      "Trebuchet MS",
      "Verdana",
      "Zapfino",
    ].sort()
  );
  const fontAvailable = new Set<string>();
  // @ts-ignore
  for (const font of fontCheck.values()) {
    // @ts-ignore
    if (document.fonts.check(`12px "${font}"`)) {
      fontAvailable.add(font);
    }
  }
  // @ts-ignore
  return fontAvailable.values();
}