import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  VStack,
  Button,
  Icon,
  ThreeDotsIcon,
  IconButton,
  HStack,
} from "native-base";
import React, { FC } from "react";
import {
  LensContext,
  useLens,
  useLensUpdater,
  useLensSnapshot,
  useDeriveLens,
} from "../hooks/lenses-hooks";
import { Statement } from "../lib/types";
import { arrayKeys, compareByJson, randomid } from "../lib/utils";
import { ArrayRemoveHandler } from "./ArrayHelper";
import ChoiceEditor from "./ChoiceEditor";
import { LensProxy } from "./LensProxy";
import { TemplateEditor } from "./TemplateEditor";

function getType<T>(x: { type: T }): T {
  return x.type;
}

const StatementEditor: FC<{ lens: LensContext<Statement[]>; idx: number }> = ({
  lens,
  idx,
}) => {
  const stmt = useDeriveLens(lens, idx);
  console.log(stmt + "", idx);
  const type = useLensSnapshot(stmt, getType);
  if (type === "text") {
    return (
      <LensProxy
        lens={stmt as any as LensContext<Statement & { type: "text" }>}
        props={["text"]}
      >
        {(lens) => <TemplateEditor lens={lens} />}
      </LensProxy>
    );
  } else if (type === "choices") {
    return (
      <LensProxy
        lens={stmt as any as LensContext<Statement & { type: "choices" }>}
        props={["choices"]}
      >
        {(lens) => <ChoiceEditor.List lens={lens} />}
      </LensProxy>
    );
  }
  return <></>;
};

const StatementEditorList: FC<{ lens: LensContext<Statement[]> }> = ({
  lens,
}) => {
  const stmtkeys = useLensSnapshot(lens, arrayKeys, compareByJson);
  const update = useLensUpdater(lens);
  return (
    <VStack space={1} alignSelf="stretch">
      {stmtkeys.map((key, idx) => (
        <ArrayRemoveHandler key={key} lens={lens} idx={idx}>
          <StatementEditor lens={lens} idx={idx} />
        </ArrayRemoveHandler>
      ))}
      <Button.Group isAttached>
        <IconButton
          size={6}
          variant="solid"
          icon={<Icon as={MaterialCommunityIcons} name="card-text" />}
          onPress={() => {
            update((x) => [
              ...x,
              {
                key: randomid(),
                type: "text",
                text: { template: "", params: {} },
                modifiers: [],
              },
            ]);
          }}
        />
        <IconButton
          size={6}
          variant="outline"
          icon={<Icon as={MaterialCommunityIcons} name="arrow-decision" />}
          onPress={() => {
            update((x) => [
              ...x,
              {
                key: randomid(),
                type: "choices",
                choices: [],
              },
            ]);
          }}
        />
        <IconButton size={6} variant="outline" icon={<ThreeDotsIcon />} />
      </Button.Group>
    </VStack>
  );
};

export default Object.assign(StatementEditor, { List: StatementEditorList });
