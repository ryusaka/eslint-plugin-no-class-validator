// myRule.ts
import { AST_NODE_TYPES, TSESLint } from "@typescript-eslint/utils";

type MessageIds = "noClassValidator";

const noClassValidator: TSESLint.RuleModule<MessageIds> = {
  defaultOptions: [],
  meta: {
    type: "suggestion",
    messages: {
      noClassValidator: "Missing decorator of class-validator",
    },
    fixable: "code",
    schema: [], // no options
  },
  create: (context) => {
    const importedClassValidators: string[] = [];
    for (const v of context.getScope().variables) {
      for (const d of v.defs) {
        if (d.type !== "ImportBinding") continue;
        if (d.parent.importKind !== "value") continue;
        if (d.parent.type !== "ImportDeclaration") continue;
        if (d.parent.source.value !== "class-validator") continue;

        importedClassValidators.push(d.name.name);
      }
    }

    return {
      ImportDeclaration: (node) => {
        if (node.source.value !== "class-validator") return;
        for (const specifier of node.specifiers) {
          if (specifier.local.type === AST_NODE_TYPES.Identifier) {
            if (specifier.local.name) {
              importedClassValidators.push(specifier.local.name);
            }
          }
        }
      },
      ClassDeclaration: (node) => {
        if (!/\.(dto|entity)\.ts$/.test(context.getFilename())) return;

        for (const b of node.body.body) {
          /**
           * プロパティの定義かつ型定義があるかつ実態がない = 型定義のみ
           */
          if (
            b.type === AST_NODE_TYPES.PropertyDefinition &&
            !!b.typeAnnotation &&
            !b.value
          ) {
            const includesClassValidator = b.decorators?.some((d) => {
              if (d.expression.type === AST_NODE_TYPES.CallExpression) {
                const collee = d.expression.callee;
                if (collee.type === AST_NODE_TYPES.Identifier) {
                  if (importedClassValidators.includes(collee.name)) {
                    return true;
                  }
                }
              }
            });

            if (!includesClassValidator) {
              context.report({
                node: b,
                messageId: "noClassValidator",
              });
            }
          }
        }
      },
    };
  },
};

export default noClassValidator;
