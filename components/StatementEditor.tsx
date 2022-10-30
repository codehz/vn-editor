import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  VStack,
  Button,
  Icon,
  ThreeDotsIcon,
  IconButton,
} from "native-base";
import React, { FC } from "react";
import {
  Tree,
  useSubTree,
  useTreeArrayKeys,
  useTreeArrayUpdater,
  useTreeValue,
} from "../hooks/tree-state";
import { Statement } from "../lib/types";
import { ArrayRemoveHandler } from "./ArrayHelper";
import ChoiceEditor from "./ChoiceEditor";
import { TreeProxy } from "./TreeProxy";
import { TemplateEditor } from "./TemplateEditor";

function getType<T>(x: { type: T }): T {
  return x.type;
}

const StatementEditor: FC<{ lens: Tree<Statement[]>; id: string }> = ({
  lens,
  id,
}) => {
  const stmt = useSubTree(lens, id);
  // console.log(stmt + "", id);
  // const type = use(stmt, getType);
  const type = useTreeValue(stmt, "type");
  if (type === "text") {
    return (
      <TreeProxy
        tree={stmt as any as Tree<Statement & { type: "text" }>}
        prop="text"
      >
        {(lens) => <TemplateEditor lens={lens} />}
      </TreeProxy>
    );
  } else if (type === "choices") {
    return (
      <TreeProxy
        tree={stmt as any as Tree<Statement & { type: "choices" }>}
        prop="choices"
      >
        {(lens) => <ChoiceEditor.List lens={lens} />}
      </TreeProxy>
    );
  }
  return <></>;
};

const StatementEditorList: FC<{ lens: Tree<Statement[]> }> = ({ lens }) => {
  const stmtkeys = useTreeArrayKeys(lens);
  const updater = useTreeArrayUpdater(lens);
  return (
    <VStack space={1} alignSelf="stretch">
      {stmtkeys.map((key, idx) => (
        <ArrayRemoveHandler key={key} lens={lens} id={key}>
          <StatementEditor lens={lens} id={key} />
        </ArrayRemoveHandler>
      ))}
      <Button.Group isAttached>
        <IconButton
          size={6}
          variant="solid"
          icon={<Icon as={MaterialCommunityIcons} name="card-text" />}
          onPress={() => {
            updater.insert({
              type: "text",
              text: { template: "", params: [] },
              modifiers: [],
            });
          }}
        />
        <IconButton
          size={6}
          variant="outline"
          icon={<Icon as={MaterialCommunityIcons} name="arrow-decision" />}
          onPress={() => {
            updater.insert({
              type: "choices",
              choices: [],
            });
          }}
        />
        <IconButton size={6} variant="outline" icon={<ThreeDotsIcon />} />
      </Button.Group>
    </VStack>
  );
};

export default Object.assign(StatementEditor, { List: StatementEditorList });
