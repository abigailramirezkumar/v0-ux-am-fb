// This script cannot run inside the v0 sandbox because scripts execute in
// an isolated /home/user/ environment that has no access to the project
// source tree.
//
// To run the tests locally after installing:
//
//   npx vitest run --reporter=verbose
//
// Or in watch mode:
//
//   npx vitest
//
console.log("Run tests with: npx vitest run --reporter=verbose");
