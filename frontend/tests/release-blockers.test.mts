import assert from "node:assert/strict";
import test from "node:test";
import { adminInitialsFromName } from "../src/constants/adminAuth.ts";
import { forgotPasswordCopy, loginCopy } from "../src/constants/login.ts";
import { adminOverviewCopy } from "../src/constants/admin.ts";
import * as adminAuth from "../src/constants/adminAuth.ts";

test("customer login credentials error is neutral", () => {
  assert.equal(loginCopy.credentialsError, "Invalid email or password.");
  assert.equal(/demo/i.test(loginCopy.credentialsError), false);
});

test("forgot password success copy has no demo marker", () => {
  assert.equal(/demo/i.test(forgotPasswordCopy.successLede), false);
  assert.match(forgotPasswordCopy.successLede, /If an account exists/i);
});

test("adminAuth does not export demoAdmin", () => {
  assert.equal("demoAdmin" in adminAuth, false);
});

test("adminInitialsFromName derives session initials", () => {
  assert.equal(adminInitialsFromName("Alex Rivera"), "AR");
  assert.equal(adminInitialsFromName("Ada"), "AD");
  assert.equal(adminInitialsFromName("  "), "AD");
});

test("admin overview status copy is not demo-facing", () => {
  assert.equal(/demo/i.test(adminOverviewCopy.statusLede), false);
});
