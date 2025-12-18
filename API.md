# Nuraly Runtime API Quick Reference

Quick reference guide for developers working with Nuraly handler code.

## 🎯 Quick Start

Handler code runs in the context of a component and has access to all Runtime API functions.

```javascript
// Example handler code (no imports needed)
const count = GetVar('count') || 0;
SetVar('count', count + 1);
updateInput(Current, 'text', 'static', `Count: ${count + 1}`);
```

## 📦 Available Parameters

These are automatically available in all handler code:

- `Current` - The current component
- `Event` - The event object (for event handlers)
- `Item` - Item data (for collection/loop handlers)
- `Apps` - All applications by name
- `Vars` - Variables proxy
- `Components` - All components
- `Values` - Component values
- `Editor` - Editor utilities
- `Utils` - Helper utilities
- `console` - Logging functions

## 🔧 Variable Functions

### Global Variables

```javascript
// Set global variable
SetVar('username', 'John Doe');
SetVar('count', 42);
SetVar('theme', { primary: '#3b82f6' });

// Get global variable
const username = GetVar('username');
const count = GetVar('count') || 0;
```

### Context Variables (App-Scoped)

```javascript
// Set context variable
SetContextVar('currentPage', 'dashboard', Current);
SetContextVar('appData', { user: {...} }, Current);

// Get context variable
const page = GetContextVar('currentPage', null, Current);
const data = GetContextVar('appData', null, Current);
```

## 🧩 Component Functions

### Get Components

```javascript
// Get single component
const button = GetComponent('comp-id', 'app-id');

// Get multiple components
const buttons = GetComponents(['comp-1', 'comp-2', 'comp-3']);

// Access via Current
console.log(Current.name);
console.log(Current.uuid);
console.log(Current.parent);
console.log(Current.children);
```

### Add/Delete Components

```javascript
// Add component
AddComponent({
  application_id: 'app-id',
  pageId: 'page-id',
  componentType: 'Button',
  additionalData: { input: { text: 'Click Me' } }
});

// Delete component (with confirmation)
DeleteComponentAction(Current);
```

### Clipboard Operations

```javascript
// Copy component
CopyComponentToClipboard(Current);

// Paste component
PasteComponentFromClipboard();
```

## 🎨 Component Property Updates

### Update Input

```javascript
// Static value
updateInput(Current, 'text', 'static', 'Hello World');

// Handler value (dynamic - computed at runtime)
updateInput(Current, 'label', 'handler', "return GetVar('username')");
```

### Update Style

```javascript
// Basic style
updateStyle(Current, 'backgroundColor', '#3b82f6');
updateStyle(Current, 'fontSize', '16px');
updateStyle(Current, 'display', 'flex');

// Style with pseudo-state (if selected)
updateStyle(Current, 'backgroundColor', '#2563eb'); // Updates :hover if selected

// Style handlers
updateStyleHandlers(Current, 'color', "GetVar('theme').primaryColor");
```

### Update Events

```javascript
// Set event handler
updateEvent(Current, 'onClick', "NavigateToPage('Dashboard')");
updateEvent(Current, 'onChange', "SetVar('value', Event.target.value)");
```

### Update Name

```javascript
// Rename component
updateName(Current, 'PrimaryButton');
```

## 🗺️ Navigation Functions

### Navigate to Page

```javascript
// Navigate within app
NavigateToPage('Dashboard');
NavigateToPage('Profile');
```

### Navigate to URL

```javascript
// External URL
NavigateToUrl('https://example.com');

// Internal path
NavigateToUrl('/dashboard');
```

### Navigate to Hash

```javascript
// Jump to anchor
NavigateToHash('#section-about');
NavigateToHash('#top');
```

## 📄 Page Functions

### Add Page

```javascript
const newPage = await AddPage({
  name: 'Dashboard',
  application_id: 'app-id',
  route: '/dashboard'
});
```

### Update Page

```javascript
await UpdatePage({
  uuid: 'page-id',
  name: 'Updated Dashboard',
  route: '/dashboard-v2'
});
```

### Delete Page

```javascript
// Delete with confirmation
deletePage(currentPage);
```

## 📱 Application Functions

### Update Application

```javascript
UpdateApplication({
  uuid: 'app-id',
  name: 'New App Name',
  description: 'Updated description'
});
```

## 💾 Storage Functions

### Upload File

```javascript
// Single file
const fileInput = document.querySelector('input[type="file"]');
const result = await UploadFile(fileInput.files[0], 'images');
console.log(result.url);

// Multiple files
const results = await UploadFile([...fileInput.files], 'documents');
```

### Browse Files

```javascript
// List files in folder
const result = await BrowseFiles('images', { limit: 50 });
console.log(result.files);

// Pagination
if (result.continuation) {
  const nextPage = await BrowseFiles('images', { 
    continuation: result.continuation,
    limit: 50
  });
}
```

## 🔌 Backend Functions

### Invoke Function

```javascript
// Call backend function
const result = await InvokeFunction('getUserData', { userId: 123 });

// With error handling
try {
  const data = await InvokeFunction('riskyOperation', { param: 'value' });
  SetVar('result', data);
} catch (error) {
  console.error('Function failed:', error);
  SetVar('error', error.message);
}
```

## 🎯 Common Patterns

### Counter

```javascript
const count = GetVar('count') || 0;
SetVar('count', count + 1);
updateInput(Current, 'text', 'static', `Count: ${count + 1}`);
```

### Toggle

```javascript
const isOpen = GetVar('menuOpen') || false;
SetVar('menuOpen', !isOpen);
updateStyle(Current, 'display', isOpen ? 'none' : 'block');
```

### Form Handling

```javascript
// On input change
SetVar('form_email', Event.target.value);

// On submit
const formData = {
  email: GetVar('form_email'),
  message: GetVar('form_message')
};

const result = await InvokeFunction('submitForm', formData);

if (result.success) {
  NavigateToPage('ThankYou');
} else {
  SetVar('form_error', result.error);
}
```

### Conditional Rendering

```javascript
const isLoggedIn = GetVar('user_authenticated');

if (isLoggedIn) {
  const dashboard = GetComponent('dashboard-id', Current.application_id);
  updateStyle(dashboard, 'display', 'block');
  
  const loginForm = GetComponent('login-id', Current.application_id);
  updateStyle(loginForm, 'display', 'none');
} else {
  NavigateToPage('Login');
}
```

### List Filtering

```javascript
const searchTerm = GetVar('searchTerm') || '';
const allItems = GetVar('allItems') || [];

const filtered = allItems.filter(item => 
  item.title.toLowerCase().includes(searchTerm.toLowerCase())
);

SetVar('filteredItems', filtered);
```

### Theme Switching

```javascript
const currentTheme = GetVar('theme') || 'light';
const newTheme = currentTheme === 'light' ? 'dark' : 'light';

SetVar('theme', newTheme);

// Update all components
Components.forEach(component => {
  if (component.component_type === 'Container') {
    updateStyle(component, 'backgroundColor', 
      newTheme === 'dark' ? '#1a1a1a' : '#ffffff'
    );
  }
});
```

### Loading States

```javascript
// Start loading
SetVar('isLoading', true);
updateInput(Current, 'loading', 'static', true);

try {
  const data = await InvokeFunction('fetchData');
  SetVar('data', data);
} catch (error) {
  SetVar('error', error.message);
} finally {
  SetVar('isLoading', false);
  updateInput(Current, 'loading', 'static', false);
}
```

## 🎭 Event Handling

### Click Event

```javascript
// Handler code for onClick:
console.log('Clicked at:', Event.clientX, Event.clientY);

const count = GetVar('clickCount') || 0;
SetVar('clickCount', count + 1);
```

### Input Change

```javascript
// Handler code for onChange:
const value = Event.target.value;
SetVar('inputValue', value);

// Validate
if (value.length < 3) {
  SetVar('error', 'Too short');
} else {
  SetVar('error', null);
}
```

### Form Submit

```javascript
// Handler code for onSubmit:
Event.preventDefault();

const formData = {
  email: GetVar('form_email'),
  password: GetVar('form_password')
};

const result = await InvokeFunction('login', formData);

if (result.success) {
  SetVar('user', result.user);
  NavigateToPage('Dashboard');
}
```

## 🛠️ Utilities

### Console Logging

```javascript
console.log('Debug message', { data: someValue });
console.warn('Warning message');
console.error('Error message', error);
console.info('Info message');
```

### Component Instance State

```javascript
// Set component state
Current.Instance.clickCount = 0;
Current.Instance.isActive = true;
Current.Instance.userData = { name: 'John' };

// Get component state
const count = Current.Instance.clickCount || 0;
Current.Instance.clickCount++;

// State persists across renders
```

### Current Component Access

```javascript
// Component properties
console.log(Current.name);          // Component name
console.log(Current.uuid);          // Unique ID
console.log(Current.component_type); // Type (Button, Text, etc)
console.log(Current.application_id); // Parent app ID

// Hierarchy
console.log(Current.parent);        // Parent component
console.log(Current.children);      // Child components

// Input/Style/Event
console.log(Current.input.text);    // Input properties
console.log(Current.style.color);   // Style properties
console.log(Current.event.onClick); // Event handlers
```

## ⚡ Performance Tips

1. **Cache variables instead of repeated GetVar calls**
   ```javascript
   // ❌ Bad
   console.log(GetVar('user').name);
   console.log(GetVar('user').email);
   
   // ✅ Good
   const user = GetVar('user');
   console.log(user.name);
   console.log(user.email);
   ```

2. **Use component Instance for component-specific state**
   ```javascript
   // ✅ Good - scoped to component
   Current.Instance.localState = value;
   
   // ❌ Avoid global vars for component state
   SetVar(`${Current.uuid}_state`, value);
   ```

3. **Batch updates when possible**
   ```javascript
   // Update multiple things together
   const updates = {
     input: { text: 'New Text' },
     style: { color: 'red' }
   };
   ```

4. **Avoid unnecessary component queries**
   ```javascript
   // ❌ Bad - queries every time
   onClick: "const btn = GetComponent('id'); updateStyle(btn, ...)"
   
   // ✅ Good - query once, store reference
   onClick: "updateStyle(Current, ...)"
   ```

---

**Need More Help?** Check the full [README.md](./README.md) for comprehensive documentation.
