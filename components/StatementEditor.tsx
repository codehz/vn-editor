import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import {
  VStack,
  Button,
  Icon,
  IconButton,
} from "native-base";
import React, { FC } from "react";
import {
  InsertPlace,
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
import { WithContextMenu } from "./ContextMenu";

const StatementEditor: FC<{ tree: Tree<Statement[]>; id: string }> = ({
  tree,
  id,
}) => {
  const stmt = useSubTree(tree, id);
  const type = useTreeValue(stmt, "type");
  if (type === "text") {
    return (
      <TreeProxy
        tree={stmt as any as Tree<Statement & { type: "text" }>}
        prop="text"
      >
        {(tree) => <TemplateEditor tree={tree} />}
      </TreeProxy>
    );
  } else if (type === "choices") {
    return (
      <TreeProxy
        tree={stmt as any as Tree<Statement & { type: "choices" }>}
        prop="choices"
      >
        {(tree) => <ChoiceEditor.List tree={tree} />}
      </TreeProxy>
    );
  }
  return <></>;
};

export const StatementContextMenu: FC<{
  tree: Tree<Statement[]>;
  place?: InsertPlace;
  embed?: true;
}> = ({ tree, place, embed }) => {
  const updater = useTreeArrayUpdater(tree);
  return (
    <Button.Group isAttached>
      <IconButton
        size={embed ? undefined : 6}
        variant={embed ? "ghost" : "solid"}
        icon={<Icon as={MaterialCommunityIcons} name="card-text" />}
        onPress={() => {
          updater.insert(
            {
              type: "text",
              text: { template: "", params: [] },
              modifiers: [],
            },
            place
          );
        }}
      />
      <IconButton
        size={embed ? undefined : 6}
        variant={embed ? "ghost" : "outline"}
        icon={<Icon as={MaterialCommunityIcons} name="arrow-decision" />}
        onPress={() => {
          updater.insert(
            {
              type: "choices",
              choices: [],
            },
            place
          );
        }}
      />
      <IconButton
        size={embed ? undefined : 6}
        variant={embed ? "ghost" : "outline"}
        icon={<Icon as={MaterialIcons} name="more-horiz" />}
      />
    </Button.Group>
  );
};

const StatementWrapper: FC<{ tree: Tree<Statement[]>; id: string }> = ({
  tree,
  id,
}) => {
  return (
    <WithContextMenu
      view={<StatementContextMenu tree={tree} place={{ after: id }} embed />}
    >
      <ArrayRemoveHandler key={id} tree={tree} id={id}>
        <StatementEditor tree={tree} id={id} />
      </ArrayRemoveHandler>
    </WithContextMenu>
  );
};

const StatementEditorList: FC<{ tree: Tree<Statement[]> }> = ({ tree }) => {
  const stmtkeys = useTreeArrayKeys(tree);
  const updater = useTreeArrayUpdater(tree);
  return (
    <VStack space={1} alignSelf="stretch">
      {stmtkeys.map((key) => (
        <StatementWrapper key={key} tree={tree} id={key} />
      ))}
      <StatementContextMenu tree={tree} />
    </VStack>
  );
};

export default Object.assign(StatementEditor, { List: StatementEditorList });
