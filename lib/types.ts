type Keyd = { key: string };
export type Variable = {
  name: string;
  defaultValue: string;
} & Keyd;
export type Modifier = {
  name: string;
  command: string;
  params: Expression[];
} & Keyd;
export type Case = {
  condition?: Expression;
  body: Statement[];
} & Keyd;
export type Choice = {
  text: TemplatedText;
  condition?: Expression;
  body: Statement[];
} & Keyd;
export type TemplatedText = {
  template: string;
  params: Record<string, Expression>;
};
export type Statement = (
  | {
      type: "text";
      text: TemplatedText;
      modifiers: Modifier[];
    }
  | { type: "action"; name: string; command: string; params: Expression[] }
  | { type: "assignment"; variable: string; value: Expression }
  | { type: "choices"; choices: Choice[] }
  | { type: "switch"; cases: Case[] }
  | { type: "loop"; condition: Expression; body: Statement[]; at_end: boolean }
  | { type: "void"; expr: Expression }
  | { type: "invoke"; target: string; params: Expression[] }
  | { type: "invoke_indirect"; target: Expression; params: Expression[] }
  | { type: "return"; value?: Expression }
) &
  Keyd;
export type Expression = (
  | { type: "literal"; value: string }
  | { type: "variable"; name: string }
  | { type: "builtin"; name: string; params: Expression[] }
  | { type: "invoke"; target: string; params: Expression[] }
  | { type: "invoke_indirect"; target: Expression; params: Expression[] }
  | { type: "expr"; template: string; params: Expression[] }
) &
  Keyd;
export type Procedure = {
  name: string;
  params: string[];
  variables: Variable[];
  body: Statement[];
} & Keyd;
export type Document = {
  variables: Variable[];
  procs: Procedure[];
  entrypoint: Statement[];
};
