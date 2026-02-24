/**
 * Test fixtures for handlers
 */

export const validHandlers = {
  simpleLog: `console.log("Hello World");`,

  setVariable: `SetVar("username", "John Doe");`,

  getVariable: `const username = GetVar("username"); return username;`,

  updateComponent: `UpdateComponent("button-1", { text: "Updated Button" });`,

  navigateToPage: `NavigateToPage("Dashboard");`,

  showAlert: `ShowAlert("Operation completed successfully!");`,

  conditionalLogic: `
    const isLoggedIn = GetVar("isLoggedIn");
    if (isLoggedIn) {
      NavigateToPage("Dashboard");
    } else {
      NavigateToPage("Login");
    }
  `,

  asyncOperation: `
    const result = await InvokeFunction("getUserData", { userId: 123 });
    SetVar("userData", result);
    return result;
  `,

  eventHandler: `
    const value = event.target.value;
    SetVar("inputValue", value);
    Log("Input changed:", value);
  `,

  formSubmit: `
    event.preventDefault();
    const email = GetVar("email");
    const password = GetVar("password");

    if (!email || !password) {
      ShowAlert("Please fill in all fields");
      return;
    }

    const result = await InvokeFunction("login", { email, password });
    if (result.success) {
      SetVar("user", result.user);
      NavigateToPage("Dashboard");
    } else {
      ShowAlert(result.error);
    }
  `,

  multipleOperations: `
    SetVar("counter", GetVar("counter") + 1);
    const counter = GetVar("counter");
    UpdateComponent("counter-display", { text: counter.toString() });
    Log("Counter incremented to:", counter);
  `,
};

export const invalidHandlers = {
  syntaxError: `console.log("Missing closing quote);`,

  undefinedVariable: `console.log(nonExistentVariable);`,

  throwError: `throw new Error("Intentional error");`,

  invalidFunction: `InvalidFunction("This function does not exist");`,

  malformedCode: `}{][()`,
};

export const edgeCaseHandlers = {
  empty: ``,

  whitespaceOnly: `   \n\t   `,

  onlyComments: `// Just a comment\n/* Another comment */`,

  returnValue: `return 42;`,

  multipleStatements: `
    const a = 1;
    const b = 2;
    const c = a + b;
    return c;
  `,

  withParameters: {
    code: `return param1 + param2;`,
    params: ['param1', 'param2'],
  },
};

export const performanceHandlers = {
  largeLoop: `
    for (let i = 0; i < 10000; i++) {
      console.log(i);
    }
  `,

  nestedLoops: `
    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < 100; j++) {
        const result = i * j;
      }
    }
  `,

  recursion: `
    function factorial(n) {
      if (n <= 1) return 1;
      return n * factorial(n - 1);
    }
    return factorial(10);
  `,
};
