/**
 * Manual validation test
 * Run with: npx tsx test-validation-manual.ts
 */

import { validateHandlerCode, validateComponentHandlers } from './src/shared/utils/handler-validator';

console.log('Testing Handler Validation...\n');

// Test 1: Valid code
console.log('Test 1: Valid handler code');
const validCode = "const count = GetVar('count') || 0; SetVar('count', count + 1);";
const result1 = validateHandlerCode(validCode);
console.log('Result:', result1.valid ? '✅ PASS' : '❌ FAIL');
console.log('Errors:', result1.errors.length);
console.log('');

// Test 2: eval() - should be blocked
console.log('Test 2: Blocking eval()');
const evilCode = "eval('malicious code')";
const result2 = validateHandlerCode(evilCode);
console.log('Result:', !result2.valid ? '✅ PASS' : '❌ FAIL');
console.log('Errors:', result2.errors);
console.log('');

// Test 3: window access - should be blocked
console.log('Test 3: Blocking window access');
const windowCode = "window.location.href = 'evil.com'";
const result3 = validateHandlerCode(windowCode);
console.log('Result:', !result3.valid ? '✅ PASS' : '❌ FAIL');
console.log('Errors:', result3.errors);
console.log('');

// Test 4: __proto__ - should be blocked
console.log('Test 4: Blocking __proto__');
const protoCode = "obj.__proto__ = {}";
const result4 = validateHandlerCode(protoCode);
console.log('Result:', !result4.valid ? '✅ PASS' : '❌ FAIL');
console.log('Errors:', result4.errors);
console.log('');

// Test 5: Component validation
console.log('Test 5: Component validation with mixed handlers');
const component = {
  event: {
    onClick: "GetVar('count')", // valid
  },
  inputHandlers: {
    label: "eval('bad')", // invalid
  },
  styleHandlers: {
    color: "return 'red'", // valid
  }
};
const result5 = validateComponentHandlers(component);
console.log('Result:', !result5.valid ? '✅ PASS (correctly detected invalid handler)' : '❌ FAIL');
console.log('Errors:', result5.errors.length);
if (result5.errors.length > 0) {
  console.log('Error details:', result5.errors[0]);
}
console.log('');

console.log('All manual tests completed!');
