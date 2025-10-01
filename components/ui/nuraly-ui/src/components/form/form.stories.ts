import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import './index.js';
import '../input/index.js';
import '../button/index.js';
import '../checkbox/index.js';
import '../select/index.js';
import '../icon/index.js';
const meta: Meta = {
  title: 'Data Entry/Form',
  component: 'nr-form',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Form component with comprehensive API for validation and data management'
      }
    }
  },
  argTypes: {
    validateOnChange: {
      control: 'boolean',
      description: 'Enable real-time validation on field changes'
    },
    validateOnBlur: {
      control: 'boolean', 
      description: 'Enable validation on field blur'
    },
    preventInvalidSubmission: {
      control: 'boolean',
      description: 'Prevent form submission if validation fails'
    },
    resetOnSuccess: {
      control: 'boolean',
      description: 'Reset form after successful submission'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the entire form'
    }
  },
};

export default meta;
type Story = StoryObj;

/**
 * Real-time form with data retrieval and error display
 */
export const RealTimeFormData: Story = {
  args: {
    validateOnChange: false,  // Only validate on blur, not on change
    validateOnBlur: true,
    preventInvalidSubmission: true,
    resetOnSuccess: false,
    disabled: false
  },
  render: (args) => {
    const handleSubmitSuccess = action('nr-form-submit-success');
    const handleSubmitError = action('nr-form-submit-error');
    const handleFieldChanged = action('nr-form-field-changed');
    const handleValidationChanged = action('nr-form-validation-changed');

    return html`
      <div style="max-width: 1200px; margin: 0 auto;">
        <h3>Real-time Form Data & Error Display</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
          <!-- Form Section -->
          <div>
            <nr-form 
              id="realtime-form"
              ?validate-on-change="${args.validateOnChange}"
              ?validate-on-blur="${args.validateOnBlur}"
              ?prevent-invalid-submission="${args.preventInvalidSubmission}"
              ?reset-on-success="${args.resetOnSuccess}"
              ?disabled="${args.disabled}"
              @nr-form-submit-success="${handleSubmitSuccess}"
              @nr-form-submit-error="${handleSubmitError}"
              @nr-form-field-changed="${handleFieldChanged}"
              @nr-form-validation-changed="${handleValidationChanged}"
            >
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <div>
                  <label style="display: block; margin-bottom: 4px; font-weight: 500;">Username *</label>
                  <nr-input 
                    name="username" 
                    placeholder="Enter username (try: admin, test for errors)"
                    required
                    validate-on-change="false"
                    validate-on-blur="true"
                    .rules="${[
                      { required: true, message: 'Username is required' },
                      { min: 3, message: 'Username must be at least 3 characters' },
                      { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' },
                      { 
                        validator: async (rule: any, value: any) => {
                          if (!value) return Promise.resolve();
                          await new Promise(resolve => setTimeout(resolve, 500));
                          const unavailable = ['admin', 'root', 'test', 'user'];
                          if (unavailable.includes(value.toLowerCase())) {
                            return Promise.reject(new Error('Username is already taken'));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}"
                    has-feedback
                    validation-debounce="300"
                    style="width: 100%;"
                  ></nr-input>
                </div>

                <div>
                  <label style="display: block; margin-bottom: 4px; font-weight: 500;">Email *</label>
                  <nr-input 
                    name="email" 
                    type="email"
                    placeholder="Enter email address"
                    required
                    validate-on-change="false"
                    validate-on-blur="true"
                    .rules="${[
                      { required: true, message: 'Email is required' },
                      { type: 'email', message: 'Please enter a valid email address' }
                    ]}"
                    has-feedback
                    style="width: 100%;"
                  ></nr-input>
                </div>

                <div>
                  <label style="display: block; margin-bottom: 4px; font-weight: 500;">Password *</label>
                  <nr-input 
                    name="password" 
                    type="password"
                    placeholder="Enter password"
                    required
                    validate-on-change="false"
                    validate-on-blur="true"
                    .rules="${[
                      { required: true, message: 'Password is required' },
                      { min: 8, message: 'Password must be at least 8 characters' },
                      { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Password must contain uppercase, lowercase, and number' }
                    ]}"
                    has-feedback
                    style="width: 100%;"
                  ></nr-input>
                </div>

                <div>
                  <label style="display: block; margin-bottom: 4px; font-weight: 500;">Age</label>
                  <nr-input 
                    name="age" 
                    type="number"
                    placeholder="Enter your age"
                    min="18"
                    max="120"
                    validate-on-change="false"
                    validate-on-blur="true"
                    .rules="${[
                      { type: 'number', min: 18, max: 120, message: 'Age must be between 18 and 120' }
                    ]}"
                    style="width: 100%;"
                  ></nr-input>
                </div>

                <div>
                  <label style="display: block; margin-bottom: 4px; font-weight: 500;">Bio</label>
                  <nr-input 
                    name="bio" 
                    placeholder="Tell us about yourself"
                    maxlength="100"
                    show-count
                    validate-on-change="false"
                    validate-on-blur="true"
                    .rules="${[
                      { max: 100, message: 'Bio cannot exceed 100 characters' }
                    ]}"
                    style="width: 100%;"
                  ></nr-input>
                </div>                <div style="margin-top: 16px;">
                  <nr-checkbox name="terms" required>
                    I agree to the Terms of Service *
                  </nr-checkbox>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 8px;">
                  <nr-button type="submit" variant="primary">Submit</nr-button>
                  <nr-button type="button" onclick="resetForm()">Reset</nr-button>
                  <nr-button type="button" onclick="fillSampleData()">Fill Sample</nr-button>
                </div>
              </div>
            </nr-form>
          </div>

          <!-- Real-time Data Display Section -->
          <div>
            <div style="margin-bottom: 24px;">
              <h4 style="margin-bottom: 8px;">📊 Real-time Form Data</h4>
              <div style="background: #f5f5f5; border-radius: 8px; padding: 16px;">
                <pre id="form-data-display" style="margin: 0; font-size: 12px; overflow: auto; max-height: 200px;">No data yet...</pre>
              </div>
            </div>

            <div style="margin-bottom: 24px;">
              <h4 style="margin-bottom: 8px;">🎯 Form State</h4>
              <div style="background: #e6f7ff; border-radius: 8px; padding: 16px;">
                <pre id="form-state-display" style="margin: 0; font-size: 12px; overflow: auto; max-height: 150px;">Loading...</pre>
              </div>
            </div>

            <div style="margin-bottom: 24px;">
              <h4 style="margin-bottom: 8px;">❌ Field Errors</h4>
              <div style="background: #fff2f0; border-radius: 8px; padding: 16px; min-height: 80px;">
                <div id="error-display">No errors</div>
              </div>
            </div>

            <div>
              <h4 style="margin-bottom: 8px;">🔧 Programmatic Controls</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <nr-button size="small" onclick="validateAll()">Validate All</nr-button>
                <nr-button size="small" onclick="validateSpecific()">Validate Username/Email</nr-button>
                <nr-button size="small" onclick="getFieldValue()">Get Username</nr-button>
                <nr-button size="small" onclick="setFieldValue()">Set Email</nr-button>
                <nr-button size="small" onclick="resetSpecific()">Reset Password</nr-button>
                <nr-button size="small" onclick="scrollToError()">Scroll to Error</nr-button>
              </div>
            </div>
          </div>
        </div>

        <script>
          // Sample data
          const sampleData = {
            username: 'john_doe',
            email: 'john@example.com',
            password: 'SecurePass123',
            age: '25',
            bio: 'Software developer with 5+ years experience',
            terms: true
          };

          // Form manipulation functions
          window.resetForm = function() {
            const form = document.getElementById('realtime-form');
            form.reset();
            updateAllDisplays();
          };

          window.fillSampleData = function() {
            const form = document.getElementById('realtime-form');
            form.setFieldsValue(sampleData);
            updateAllDisplays();
          };

          window.validateAll = async function() {
            const form = document.getElementById('realtime-form');
            try {
              const values = await form.validateFields();
              alert('✅ All fields are valid!\\n\\n' + JSON.stringify(values, null, 2));
            } catch (error) {
              alert('❌ Validation failed:\\n\\n' + error.message);
            }
            updateAllDisplays();
          };

          window.validateSpecific = async function() {
            const form = document.getElementById('realtime-form');
            try {
              const values = await form.validateFields(['username', 'email']);
              alert('✅ Username and Email are valid!\\n\\n' + JSON.stringify(values, null, 2));
            } catch (error) {
              alert('❌ Username/Email validation failed:\\n\\n' + error.message);
            }
            updateAllDisplays();
          };

          window.getFieldValue = function() {
            const form = document.getElementById('realtime-form');
            const username = form.getFieldValue('username');
            alert('Username value: ' + (username || 'empty'));
          };

          window.setFieldValue = function() {
            const form = document.getElementById('realtime-form');
            const randomEmail = 'user' + Math.floor(Math.random() * 1000) + '@example.com';
            form.setFieldValue('email', randomEmail);
            alert('Email set to: ' + randomEmail);
            updateAllDisplays();
          };

          window.resetSpecific = function() {
            const form = document.getElementById('realtime-form');
            form.resetFields(['password']);
            alert('Password field has been reset');
            updateAllDisplays();
          };

          window.scrollToError = function() {
            const form = document.getElementById('realtime-form');
            const scrolled = form.scrollToField();
            if (!scrolled) {
              alert('No error field found to scroll to');
            }
          };

          // Display update functions
          function updateAllDisplays() {
            updateFormData();
            updateFormState();
            updateErrorDisplay();
          }

          function updateFormData() {
            const form = document.getElementById('realtime-form');
            const display = document.getElementById('form-data-display');
            if (!form || !display) return;

            const data = form.getFieldsValue();
            display.textContent = JSON.stringify(data, null, 2);
          }

          function updateFormState() {
            const form = document.getElementById('realtime-form');
            const display = document.getElementById('form-state-display');
            if (!form || !display) return;

            const state = form.getFormState();
            display.textContent = JSON.stringify(state, null, 2);
          }

          function updateErrorDisplay() {
            const form = document.getElementById('realtime-form');
            const display = document.getElementById('error-display');
            if (!form || !display) return;

            const errors = form.getFieldsError();
            const errorEntries = Object.entries(errors).filter(([_, error]) => error);
            
            if (errorEntries.length === 0) {
              display.innerHTML = '<span style="color: #52c41a;">✅ No errors</span>';
            } else {
              const errorHtml = errorEntries.map(([field, error]) => 
                \`<div style="margin-bottom: 8px;">
                  <strong>\${field}:</strong> 
                  <span style="color: #ff4d4f;">\${error}</span>
                </div>\`
              ).join('');
              display.innerHTML = errorHtml;
            }
          }

          // Set up real-time updates
          setTimeout(() => {
            const form = document.getElementById('realtime-form');
            if (form) {
              // Initial update
              updateAllDisplays();

              // Listen for all form events
              ['input', 'change', 'blur', 'focus'].forEach(eventType => {
                form.addEventListener(eventType, updateAllDisplays, true);
              });
              
              // Listen for custom form events
              form.addEventListener('nr-form-field-changed', updateAllDisplays);
              form.addEventListener('nr-form-validation-changed', updateAllDisplays);
            }
          }, 100);
        </script>
      </div>
    `;
  }
};

/**
 * Programmatic form manipulation
 */
export const ProgrammaticFormAPI: Story = {
  render: () => {
    return html`
      <div style="max-width: 800px; margin: 0 auto;">
        <h3>Programmatic Form Control</h3>
        
        <div style="margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 8px;">
          <nr-button onclick="fillForm()" size="small">Fill Form</nr-button>
          <nr-button onclick="clearForm()" size="small">Clear Form</nr-button>
          <nr-button onclick="setSpecificFields()" size="small">Set Username & Email</nr-button>
          <nr-button onclick="validateSpecificFields()" size="small">Validate Username & Email</nr-button>
          <nr-button onclick="resetSpecificFields()" size="small">Reset Password Fields</nr-button>
          <nr-button onclick="checkFieldStates()" size="small">Check Field States</nr-button>
          <nr-button onclick="submitWithFinish()" size="small">Submit with finish()</nr-button>
        </div>

        <nr-form 
          id="programmatic-form"
          validate-on-change
          validate-on-blur
        >
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Username *</label>
              <nr-input 
                name="username" 
                placeholder="Enter username"
                required
                .rules="${[
                  { required: true, message: 'Username is required' },
                  { min: 3, message: 'Username must be at least 3 characters' }
                ]}"
                has-feedback
                style="width: 100%;"
              ></nr-input>
            </div>

            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Email *</label>
              <nr-input 
                name="email" 
                type="email"
                placeholder="Enter email"
                required
                .rules="${[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}"
                has-feedback
                style="width: 100%;"
              ></nr-input>
            </div>

            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Password *</label>
              <nr-input 
                name="password" 
                type="password"
                placeholder="Enter password"
                required
                .rules="${[
                  { required: true, message: 'Password is required' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}"
                has-feedback
                style="width: 100%;"
              ></nr-input>
            </div>

            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Confirm Password *</label>
              <nr-input 
                name="confirmPassword" 
                type="password"
                placeholder="Confirm password"
                required
                .rules="${[
                  { required: true, message: 'Please confirm password' }
                ]}"
                has-feedback
                style="width: 100%;"
              ></nr-input>
            </div>
          </div>

          <div style="margin: 24px 0;">
            <nr-button type="submit" variant="primary">Submit</nr-button>
          </div>
        </nr-form>

        <!-- API Output Display -->
        <div style="margin-top: 32px;">
          <h4>API Call Results</h4>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 16px;">
            <pre id="programmatic-output" style="margin: 0; font-size: 12px; overflow: auto; min-height: 200px; white-space: pre-wrap;">Click buttons above to see API results...</pre>
          </div>
        </div>

        <script>
          function logResult(operation, result) {
            const output = document.getElementById('programmatic-output');
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = \`[\${timestamp}] \${operation}:\\n\${JSON.stringify(result, null, 2)}\\n\\n\`;
            output.textContent = logEntry + output.textContent;
          }

          window.fillForm = function() {
            const form = document.getElementById('programmatic-form');
            const data = {
              username: 'jane_doe',
              email: 'jane@example.com',
              password: 'SecurePass123',
              confirmPassword: 'SecurePass123'
            };
            form.setFieldsValue(data);
            logResult('form.setFieldsValue()', data);
          };

          window.clearForm = function() {
            const form = document.getElementById('programmatic-form');
            form.resetFields();
            logResult('form.resetFields()', 'All fields reset');
          };

          window.setSpecificFields = function() {
            const form = document.getElementById('programmatic-form');
            const data = {
              username: 'admin_user',
              email: 'admin@company.com'
            };
            form.setFieldsValue(data);
            logResult('form.setFieldsValue() - specific fields', data);
          };

          window.validateSpecificFields = async function() {
            const form = document.getElementById('programmatic-form');
            try {
              const values = await form.validateFields(['username', 'email']);
              logResult('form.validateFields([username, email]) - SUCCESS', values);
            } catch (error) {
              logResult('form.validateFields([username, email]) - ERROR', error.message);
            }
          };

          window.resetSpecificFields = function() {
            const form = document.getElementById('programmatic-form');
            form.resetFields(['password', 'confirmPassword']);
            logResult('form.resetFields([password, confirmPassword])', 'Password fields reset');
          };

          window.checkFieldStates = function() {
            const form = document.getElementById('programmatic-form');
            const states = {
              'Form Values': form.getFieldsValue(),
              'Form State': form.getFormState(),
              'Field Errors': form.getFieldsError(),
              'Touched Fields': ['username', 'email', 'password', 'confirmPassword'].filter(name => 
                form.isFieldTouched(name)
              ),
              'Dirty Fields': ['username', 'email', 'password', 'confirmPassword'].filter(name => 
                form.isFieldDirty(name)
              ),
              'Username Error': form.getFieldError('username'),
              'Email Error': form.getFieldError('email')
            };
            logResult('Form State Check', states);
          };

          window.submitWithFinish = async function() {
            const form = document.getElementById('programmatic-form');
            try {
              const values = await form.finish();
              logResult('form.finish() - SUCCESS', values);
            } catch (error) {
              logResult('form.finish() - ERROR', error.message);
            }
          };

          // Set up form event listeners
          setTimeout(() => {
            const form = document.getElementById('programmatic-form');
            if (form) {
              form.addEventListener('nr-form-submit-success', (e) => {
                logResult('FORM SUBMIT SUCCESS', e.detail);
              });
              
              form.addEventListener('nr-form-submit-error', (e) => {
                logResult('FORM SUBMIT ERROR', e.detail);
              });
            }
          }, 100);
        </script>
      </div>
    `;
  }
};

/**
 * Async validation with loading states
 */
export const AsyncValidationWithErrors: Story = {
  render: () => {
    return html`
      <div style="max-width: 600px; margin: 0 auto;">
        <h3>Async Validation & Error Handling</h3>
        <p style="color: #666; margin-bottom: 24px;">
          Try usernames: admin, root, test (will fail) or emails: admin@test.com (blacklisted)
        </p>

        <nr-form 
          id="async-form"
          validate-on-change
          validate-on-blur
        >
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Username *</label>
              <nr-input 
                name="username" 
                placeholder="Try: admin, root, test (will fail)"
                required
                .rules="${[
                  { required: true, message: 'Username is required' },
                  { min: 3, message: 'Username must be at least 3 characters' },
                  { 
                    validator: async (rule: any, value: any) => {
                      if (!value) return Promise.resolve();
                      
                      // Show loading state
                      const field = document.querySelector('#async-form [name="username"]');
                      if (field) field.setAttribute('loading', 'true');
                      
                      // Simulate async validation delay
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      
                      // Remove loading state
                      if (field) field.removeAttribute('loading');
                      
                      const unavailable = ['admin', 'root', 'test', 'user'];
                      if (unavailable.includes(value.toLowerCase())) {
                        return Promise.reject(new Error('❌ Username is already taken'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}"
                has-feedback
                validation-debounce="500"
                style="width: 100%;"
              ></nr-input>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                🔍 Real-time availability check with 500ms debounce
              </div>
            </div>

            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Email *</label>
              <nr-input 
                name="email" 
                type="email"
                placeholder="Try: admin@test.com (blacklisted)"
                required
                .rules="${[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Please enter a valid email' },
                  {
                    validator: async (rule: any, value: any) => {
                      if (!value || !value.includes('@')) return Promise.resolve();
                      
                      // Show loading state
                      const field = document.querySelector('#async-form [name="email"]');
                      if (field) field.setAttribute('loading', 'true');
                      
                      // Simulate server validation
                      await new Promise(resolve => setTimeout(resolve, 800));
                      
                      // Remove loading state
                      if (field) field.removeAttribute('loading');
                      
                      if (value === 'admin@test.com') {
                        return Promise.reject(new Error('🚫 This email is blacklisted'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}"
                has-feedback
                validation-debounce="400"
                style="width: 100%;"
              ></nr-input>
            </div>

            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Phone Number</label>
              <nr-input 
                name="phone" 
                placeholder="Enter phone number"
                .rules="${[
                  { 
                    pattern: /^[\\+]?[1-9][\\d]{0,15}$/, 
                    message: '📱 Please enter a valid phone number' 
                  }
                ]}"
                style="width: 100%;"
              ></nr-input>
            </div>

            <div style="margin-top: 16px; display: flex; gap: 8px;">
              <nr-button type="submit" variant="primary">Submit</nr-button>
              <nr-button type="button" onclick="forceAsyncValidation()">Force Validation</nr-button>
              <nr-button type="button" onclick="showValidationSummary()">Show Summary</nr-button>
            </div>
          </div>
        </nr-form>

        <!-- Error summary -->
        <div id="error-summary" style="margin-top: 24px; padding: 16px; background: #fff2f0; border: 1px solid #ffccc7; border-radius: 8px; display: none;">
          <h4 style="margin: 0 0 8px 0; color: #cf1322;">🚨 Validation Errors</h4>
          <ul id="error-list" style="margin: 0; padding-left: 20px; color: #cf1322;"></ul>
        </div>

        <!-- Validation status -->
        <div style="margin-top: 16px; padding: 16px; background: #f6ffed; border-radius: 8px;">
          <h4 style="margin-top: 0;">📈 Real-time Validation Status</h4>
          <div id="validation-status" style="font-family: monospace; font-size: 12px;"></div>
        </div>

        <script>
          window.forceAsyncValidation = async function() {
            const form = document.getElementById('async-form');
            try {
              await form.validateFields();
              alert('✅ All fields are valid!');
            } catch (error) {
              alert('❌ Validation failed:\\n\\n' + error.message);
            }
            updateAsyncValidationStatus();
          };

          window.showValidationSummary = function() {
            const form = document.getElementById('async-form');
            const summary = {
              'All Values': form.getFieldsValue(),
              'Validation State': form.getFormState(),
              'All Errors': form.getFieldsError(),
              'Has Errors': form.hasErrors(),
              'Error Count': form.getFieldsWithErrors().length
            };
            alert('📋 Validation Summary:\\n\\n' + JSON.stringify(summary, null, 2));
          };

          function updateAsyncValidationStatus() {
            const form = document.getElementById('async-form');
            const statusDiv = document.getElementById('validation-status');
            const errorSummary = document.getElementById('error-summary');
            const errorList = document.getElementById('error-list');
            
            if (!form || !statusDiv) return;

            const state = form.getFormState();
            const errors = form.getFieldsError();
            
            // Update status with emojis for better visual feedback
            statusDiv.innerHTML = \`
              <div>📊 Form Valid: \${state.isValid ? '✅ Yes' : '❌ No'}</div>
              <div>🚨 Has Errors: \${state.hasErrors ? '❌ Yes' : '✅ No'}</div>
              <div>🔢 Error Count: \${state.errorCount}</div>
              <div>📝 Field Count: \${state.fieldCount}</div>
              <div>👆 Touched Fields: [\${state.touchedFields.join(', ')}]</div>
              <div>✏️ Dirty Fields: [\${state.dirtyFields.join(', ')}]</div>
              <div>❌ Invalid Fields: [\${state.invalidFields.join(', ')}]</div>
              <div>⏱️ Last Update: \${new Date().toLocaleTimeString()}</div>
            \`;

            // Update error summary
            const errorEntries = Object.entries(errors).filter(([_, error]) => error);
            
            if (errorEntries.length > 0) {
              errorList.innerHTML = errorEntries.map(([field, error]) => 
                \`<li><strong>\${field}:</strong> \${error}</li>\`
              ).join('');
              errorSummary.style.display = 'block';
            } else {
              errorSummary.style.display = 'none';
            }
          }

          // Set up real-time status updates
          setTimeout(() => {
            updateAsyncValidationStatus();
            
            const form = document.getElementById('async-form');
            if (form) {
              ['input', 'change', 'blur', 'focus'].forEach(eventType => {
                form.addEventListener(eventType, updateAsyncValidationStatus, true);
              });
              
              form.addEventListener('nr-form-field-changed', updateAsyncValidationStatus);
              form.addEventListener('nr-form-validation-changed', updateAsyncValidationStatus);
              
              form.addEventListener('nr-form-submit-success', (e) => {
                alert('🎉 Form submitted successfully!\\n\\n' + JSON.stringify(e.detail, null, 2));
              });
              
              form.addEventListener('nr-form-submit-error', (e) => {
                alert('💥 Form submission failed!\\n\\n' + JSON.stringify(e.detail, null, 2));
              });
            }
          }, 100);
        </script>
      </div>
    `;
  }
};
