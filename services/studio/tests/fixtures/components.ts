/**
 * Test fixtures for components
 */

export const mockButtonComponent = {
  id: 'button-1',
  name: 'Submit Button',
  type: 'Button',
  properties: {
    text: 'Submit',
    variant: 'primary',
    size: 'medium',
  },
  handlers: {
    onClick: 'console.log("Button clicked");',
  },
  children: [],
};

export const mockContainerComponent = {
  id: 'container-1',
  name: 'Main Container',
  type: 'Container',
  properties: {
    width: '100%',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  children: ['button-1', 'text-1'],
};

export const mockTextComponent = {
  id: 'text-1',
  name: 'Title Text',
  type: 'Text',
  properties: {
    text: 'Welcome to Nuraly',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  children: [],
};

export const mockFormComponent = {
  id: 'form-1',
  name: 'Login Form',
  type: 'Container',
  properties: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  children: ['input-email', 'input-password', 'button-submit'],
};

export const mockInputComponent = {
  id: 'input-email',
  name: 'Email Input',
  type: 'TextInput',
  properties: {
    placeholder: 'Enter your email',
    type: 'email',
    required: true,
  },
  handlers: {
    onChange: 'SetVar("email", event.target.value);',
  },
  children: [],
};

export const mockCollectionComponent = {
  id: 'collection-1',
  name: 'User List',
  type: 'Collections',
  properties: {
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
    itemTemplate: 'card-template',
  },
  children: [],
};

export const mockComponentHierarchy = {
  root: mockContainerComponent,
  children: [mockTextComponent, mockButtonComponent],
};
