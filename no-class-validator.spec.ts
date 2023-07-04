// myRule.test.ts
import { ESLintUtils } from "@typescript-eslint/utils";

import noClassValidator from "./no-class-validator";

const parserResolver = require.resolve("@typescript-eslint/parser");

const ruleTester = new ESLintUtils.RuleTester({
  parser: parserResolver as any,
});

const valid = `
import { IsString } from "class-validator";

class Foo {
  @IsString()
  xxx: string

  yyy: () => void = () => {}
}
`;

const invalid1 = `
import { Type } from "class-transformer";

class Foo {
  @Type(() => String)
  zzz: string
}
`;

const invalid2 = `
class Foo {
  xxx: string
}
`;

ruleTester.run("no-class-validator", noClassValidator, {
  valid: [valid],
  invalid: [
    {
      code: invalid1,
      errors: [{ messageId: "noClassValidator", line: 5 }],
    },
    {
      code: invalid2,
      errors: [{ messageId: "noClassValidator", line: 3 }],
    },
  ],
});
