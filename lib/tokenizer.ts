export function* tokenizeTemplate(input: string): Generator<{
  type: "literal" | "variable";
  value: string;
}> {
  let tmp = "";
  let state: "literal" | "variable" | "escape" = "literal";
  for (const ch of input) {
    if (state === "escape") {
      state = "literal";
      tmp += ch;
    }
    switch (ch) {
      case "{":
        if (state !== "literal") throw new Error("expect literal but got {");
        if (tmp) yield { type: "literal", value: tmp };
        tmp = "";
        state = "variable";
        break;
      case "}":
        if (state !== "variable") throw new Error("expect variable but got }");
        if (!tmp) throw new Error("variable name is empty");
        yield { type: "variable", value: tmp };
        tmp = "";
        state = "literal";
        break;
      case "\\":
        if (state !== "literal")
          throw new Error("cannot use \\ inside variable name");
        state = "escape";
        break;
      default:
        if (state === "variable") {
          if (!/[a-zA-Z0-9_]/.test(ch))
            throw new Error("invalid variable name: " + ch);
        }
        tmp += ch;
    }
  }
  switch (state) {
    case "escape":
      throw new Error("unexpected \\");
    case "literal":
      if (tmp) yield { type: "literal", value: tmp };
      break;
    case "variable":
      throw new Error("} expected");
  }
}

export function* tokenizeExpression(
  input: string
): Generator<{ type: "literal" | "variable"; value: string }> {
  let tmp = "";
  let state: "literal" | "variable" = "literal";
  for (const ch of input) {
    if (state === "literal") {
      if (ch === "$") {
        yield { type: "literal", value: tmp };
        tmp = "";
        state = "variable";
      } else {
        tmp += ch;
      }
    } else {
      if (!/[a-zA-Z0-9_]/.test(ch)) {
        if (!tmp) throw new Error("invalid variable name: " + ch);
        yield { type: "variable", value: tmp };
        tmp = "";
        state = "literal";
      } else {
        tmp += ch;
      }
    }
  }
  if (state === "literal") {
    if (tmp) yield { type: "literal", value: tmp };
  } else {
    throw new Error("unexpected eof");
  }
}
