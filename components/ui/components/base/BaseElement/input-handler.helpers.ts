import { getNestedAttribute } from '../../../../../utils/object.utils.ts';
import { executeHandler } from '../../../../..';
import { RuntimeHelpers } from '../../../../../utils/runtime-helpers.ts';
import { isServer } from '../../../../../utils/envirement.ts';
import type { Ref } from "lit/directives/ref.js";
import EditorInstance from '../../../../../state/editor';

// Track executing handlers to prevent re-execution loops
const executingHandlers = new Set<string>();

export async function traitInputHandler(
  ctx: {
    component: any;
    item: any;
    resolvedInputs: Record<string, any>;
    callbacks?: Record<string, (val: any) => void>;
    errors?: Record<string, any>;
    ExecuteInstance: any;
    id?: string;
    uniqueUUID?: string;
  },
  input: any,
  inputName: string
): Promise<void> {
  if (isServer || !input) return;

  // Create a unique key for this handler execution
  const handlerKey = `${ctx.component.uuid || ctx.component.name}:${inputName}`;

  // Guard: Prevent re-execution if this handler is already executing
  if (executingHandlers.has(handlerKey)) {
    return;
  }

  const proxy = (ctx.ExecuteInstance.PropertiesProxy[ctx.component.name] ??= {});
  const setResult = (val: any) => {
    if (ctx.resolvedInputs[inputName] !== val) {
      ctx.resolvedInputs[inputName] = val;
      proxy[inputName] = val;
      ctx.callbacks?.[inputName]?.(val);
    }
  };

  // CHECK INSTANCE VALUE FIRST - Instance always wins over input handlers
  // This allows runtime values set via Component.value to take precedence
  const instanceValue = ctx.component.Instance?.[inputName];
  if (instanceValue !== undefined) {
    setResult(instanceValue);
    return;
  }

  // Check inputHandlers first (prioritize dynamic handlers over static input)
  const inputHandler = ctx.component?.inputHandlers?.[inputName];
  if (inputHandler) {
    try {
      // Mark this handler as executing
      executingHandlers.add(handlerKey);

      // Use unified executeHandler - it automatically detects context (micro-app vs global)
      const fn = executeHandler({...ctx.component, uniqueUUID : ctx.uniqueUUID}, inputHandler, undefined, { ...ctx.item });

      const result = RuntimeHelpers.isPromise(fn) ? await fn : fn;
      setResult(result);
      return; // Exit early - inputHandler takes precedence
    } catch (error: any) {
      ctx.errors[inputName] = { error: error.message };
      try {
        EditorInstance.Console.log(
          `<i style="cursor:pointer" data-uuid="${ctx.component.uuid}" data-application_uuid="${ctx.component.application_id}"><b>${ctx.component.name}</b><i> > inputHandlers > ${inputName} | component uuid > ${ctx.component.uuid}`)
        EditorInstance.Console.log(formatCodeWithErrorHighlight(inputHandler, error,))
      } catch (logError) {
        console.error('Error logging handler error:', logError);
      }
      return; // Exit early even on error to prevent fallback
    } finally {
      // Always remove the execution guard
      executingHandlers.delete(handlerKey);
    }
  }

  // Fall back to input property if no inputHandler exists
  if (input.type === "handler") {
    try {
      // Mark this handler as executing
      executingHandlers.add(handlerKey);

      const raw = getNestedAttribute(ctx.component, `input.${inputName}`).value;

      // Use unified executeHandler - it automatically detects context (micro-app vs global)
      const fn: any = executeHandler({...ctx.component, uniqueUUID : ctx.uniqueUUID}, raw, undefined, { ...ctx.item });

      const result = RuntimeHelpers.isPromise(fn) ? await fn : fn;
      setResult(result);
    } catch (error: any) {
      ctx.errors[inputName] = { error: error.message };
      try {
        const code = getNestedAttribute(ctx.component, `input.${inputName}`).value;
        EditorInstance.Console.log(
          `<i style="cursor:pointer" data-uuid="${ctx.component.uuid}" data-application_uuid="${ctx.component.application_id}"><b>${ctx.component.name}</b><i> > input > ${inputName} | component uuid > ${ctx.component.uuid}`)
        EditorInstance.Console.log(formatCodeWithErrorHighlight(code, error,))
      } catch (logError) {
        console.error('Error logging handler error:', logError);
      }
      return; // Exit early on error
    } finally {
      // Always remove the execution guard
      executingHandlers.delete(handlerKey);
    }
  } else {
    const { value } = input;
    setResult(value);
    if (inputName === "id") ctx.id = value;
  }
}

export async function traitStyleHandler(
  ctx: {
    component: any;
    stylesHandlersValue: Record<string, any>;
  },
  style: any,
  styleName: string
): Promise<void> {
  if (isServer || !style) return;

  const val = style.startsWith("return ")
    ? executeHandler(ctx.component, style)
    : style;

  if (val && ctx.stylesHandlersValue[styleName] !== val) {
    ctx.stylesHandlersValue[styleName] = val;
  }
}
/**
 * Generates text with highlighted error in code, with optional color formatting
 * @param {string} code - The original code that was evaluated
 * @param {Error} error - The error object caught during evaluation
 * @param {Object} options - Optional configuration
 * @param {boolean} options.useColors - Whether to use ANSI color codes (for terminal output)
 * @param {boolean} options.showErrorType - Whether to show error type in the message
 * @param {boolean} options.showFullStack - Whether to include full stack trace
 * @param {number} options.lineOffset - Adjust reported line numbers by this offset (e.g., -1 to align browser vs editor line numbers)
 * @returns {string} - Formatted text with highlighted error
 */
export function formatCodeWithErrorHighlight(code, error, options :any= {} ) {
    // Default options
    const {
      useColors = true,
      showErrorType = true,
      showFullStack = false,
      lineOffset = -2
    } = options;
    
    // ANSI color codes for terminal output
    const colors = {
      reset: useColors ? '\x1b[0m' : '',
      red: useColors ? '\x1b[31m' : '',
      green: useColors ? '\x1b[32m' : '',
      yellow: useColors ? '\x1b[33m' : '',
      blue: useColors ? '\x1b[34m' : '',
      magenta: useColors ? '\x1b[35m' : '',
      cyan: useColors ? '\x1b[36m' : '',
      gray: useColors ? '\x1b[90m' : '',
      bold: useColors ? '\x1b[1m' : '',
    };
    
    // Initialize result
    let result = '';
    
    try {
      // Split code into lines
      const lines = code.split('\n');
      
      // Different regex patterns for different error types
      let match = null;
      
      // Try to match different error stack formats
      const patterns = [
        /eval.*<anonymous>:(\d+):(\d+)/, // Standard eval errors
        /<anonymous>:(\d+):(\d+)/, // Some browsers provide simpler format
        /at line (\d+) column (\d+)/, // Some syntax errors
        /line (\d+), column (\d+)/, // Another syntax error format
        /at position (\d+)/, // Position-based syntax errors
        /in JSON at position (\d+)/ // JSON parse errors
      ];
      
      // Try each pattern in both stack and message
      for (const pattern of patterns) {
        match = error.stack?.match(pattern);
        if (match) break;
        
        match = error.message?.match(pattern);
        if (match) break;
      }
      
      // For position-based errors, convert to line/column
      if (match && match[0].includes('position') && !match[2]) {
        const position = parseInt(match[1], 10);
        let posCount = 0;
        let errorLine = 0;
        let errorColumn = 0;
        
        // Count characters to find line and column
        for (let i = 0; i < lines.length; i++) {
          if (posCount + lines[i].length + 1 > position) {
            errorLine = i + 1;
            errorColumn = position - posCount + 1; // +1 because positions are 1-indexed
            break;
          }
          posCount += lines[i].length + 1; // +1 for newline
        }
        
        if (errorLine > 0) {
          match = [null, errorLine.toString(), errorColumn.toString()];
        }
      }
      
      // If we found line and column information
      if (match && match[1]) {
        // Apply the line offset if provided (to adjust for differences between browser and editor line numbers)
        const lineNumber = parseInt(match[1], 10) + lineOffset;
        const columnNumber = parseInt(match[2] || '1', 10);
        
        // Show context around the error (5 lines before and after)
        const contextRange = 5;
        const startLine = Math.max(0, lineNumber - contextRange - 1);
        const endLine = Math.min(lines.length - 1, lineNumber + contextRange - 1);
        
        // Code context header
        result += `${colors.bold}Code (line ${lineNumber}, column ${columnNumber}):${colors.reset}\n`;
        
        // Add each line with context
        for (let i = startLine; i <= endLine; i++) {
          const currentLineNum = i + 1;
          const line = lines[i] || '';
          const isErrorLine = currentLineNum === lineNumber;
          
          // Colorize the line number based on whether it's an error line
          const lineNumColor = isErrorLine ? colors.red : colors.gray;
          const lineColor = isErrorLine ? colors.bold : '';
          
          // Add line number and content
          result += `${lineNumColor}${(currentLineNum-lineOffset).toString().padStart(3, ' ')}|${colors.reset} ${lineColor}${line}${colors.reset}\n`;
          
          // If this is the error line
          if (isErrorLine) {
            // Get the error type and message text
            const errorTypeText = showErrorType ? `${error.name}: ` : '';
            const errorMessageText = `${errorTypeText}${error.message}`;
            
            // Add the marker line with appropriate indentation
            result += `${colors.gray}    |${colors.reset} `;
            
            const offset = Math.max(0, columnNumber - 1); // Ensure offset is not negative
            
            // Try to determine the error token/word length
            let wordLength = 1; // Default to 1 character
            
            if (offset < line.length) {
              const restOfLine = line.slice(offset);
              // If error is at a word, highlight the whole word
              const wordMatch = restOfLine.match(/^\w+/);
              if (wordMatch) {
                wordLength = wordMatch[0].length;
              } 
              // If error is at a symbol like { } ( ) etc., highlight just the symbol
              else if (/^[^\w\s]/.test(restOfLine)) {
                wordLength = 1;
              }
              // If error is at the end of line (missing semicolon etc.)
              else if (offset >= line.length - 1) {
                wordLength = 1;
              }
            }
            
            // Add the marker with appropriate spacing and the error message on the same line
            result += ' '.repeat(offset) + `${colors.red}${'^'.repeat(wordLength)} ${errorMessageText}${colors.reset}\n`;
          }
        }
        
        // Add full stack trace if requested
        if (showFullStack && error.stack) {
          result += `\n${colors.gray}Stack trace:${colors.reset}\n`;
          const stackLines = error.stack.split('\n');
          // Skip the first line as it's usually the error message we've already shown
          for (let i = 1; i < stackLines.length; i++) {
            result += `${colors.gray}${stackLines[i]}${colors.reset}\n`;
          }
        }
      } else {
        // If we couldn't determine location, show all code with error at end
        result += `${colors.bold}Code:${colors.reset}\n`;
        
        for (let i = 0; i < lines.length; i++) {
          const currentLineNum = i + 1;
          result += `${colors.gray}${currentLineNum.toString().padStart(3, ' ')}|${colors.reset} ${lines[i]}\n`;
        }
        
        // Add error message at the end
        const errorTypeText = showErrorType ? `${error.name}: ` : '';
        result += `\n${colors.red}Error: ${errorTypeText}${error.message}${colors.reset}\n`;
        result += `${colors.gray}(Could not determine the exact error location)${colors.reset}\n`;
        
        // Add stack trace if requested
        if (showFullStack && error.stack) {
          result += `\n${colors.gray}Stack trace:${colors.reset}\n`;
          const stackLines = error.stack.split('\n');
          for (let i = 0; i < stackLines.length; i++) {
            result += `${colors.gray}${stackLines[i]}${colors.reset}\n`;
          }
        }
      }
    } catch (e) {
      // If our error handler fails, return a simple fallback
      result = code + '\n\n';
      result += `${colors.red}Error: ${error.message}${colors.reset}\n`;
      result += `${colors.gray}(Error processing error information: ${e.message})${colors.reset}`;
    }
    
    return result;
  }
  
  /**
   * Simplified function for basic error highlighting without colors
   * @param {string} code - The original code that was evaluated
   * @param {Error} error - The error object caught during evaluation
   * @returns {string} - Formatted text with highlighted error
   */
  function highlightCodeError(code, error) {
    return formatCodeWithErrorHighlight(code, error, {
      useColors: false,
      showErrorType: true,
      showFullStack: false
    });
  }
  
  // Example usage:
  // const myCode = `function add(a, b) {
  //   return a + b + c; // Error: c is not defined
  // }
  // add(1, 2);`;
  // 
  // try {
  //   eval(myCode);
  // } catch (err) {
  //   // Basic usage
  //   console.log(highlightCodeError(myCode, err));
  //   
  //   // With colors (for terminal/console)
  //   console.log(formatCodeWithErrorHighlight(myCode, err, { useColors: true }));
  // }



  export function scrollToTarget(ref: Ref<HTMLElement>) {
    ref.value?.scrollIntoView({ behavior: 'smooth' });
  }
  
  export function setupHashScroll(ref: Ref<HTMLElement>, id: string, scrollFn: () => void) {
    const handler = () => {
      const hash = window.location.hash.slice(1);
      if (hash && id === hash) scrollFn();
    };
    handler();
    window.addEventListener("hashchange", handler);
  }