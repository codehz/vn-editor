import {
  AddIcon,
  Badge,
  Box,
  DeleteIcon,
  HStack,
  IconButton,
  Spacer,
  VStack,
} from "native-base";
import React, { FC } from "react";
import { Choice } from "../lib/types";
import { TreeProxy } from "./TreeProxy";
import { ArrayRemoveHandler, useRemoveHandler } from "./ArrayHelper";
import StatementEditor from "./StatementEditor";
import { TemplateEditor } from "./TemplateEditor";
import {
  Tree,
  useSubTree,
  useTreeArrayKeys,
  useTreeArrayUpdater,
} from "../hooks/tree-state";

const ChoiceEditor: FC<{ tree: Tree<Choice> }> = ({ tree }) => {
  const text = useSubTree(tree, "text");
  const body = useSubTree(tree, "body");
  return (
    <VStack borderWidth={1} borderColor="gray.200" borderRadius={5}>
      <TemplateEditor tree={text} embed />
      <Box padding={1}>
        <StatementEditor.List tree={body} />
      </Box>
    </VStack>
  );
};

const ChoiceEditorList: FC<{ tree: Tree<Choice[]> }> = ({ tree }) => {
  const keys = useTreeArrayKeys(tree);
  const updater = useTreeArrayUpdater(tree);
  const removeChoiceStatement = useRemoveHandler();
  return (
    <VStack
      space={1}
      padding={1}
      borderWidth={1}
      borderColor="gray.400"
      borderRadius={5}
    >
      <HStack space={1} alignItems="center">
        <IconButton
          size={6}
          icon={<AddIcon />}
          onPress={() =>
            updater.insert({
              body: [],
              text: { template: "", params: [] },
            })
          }
        />
        <Badge>Choice</Badge>
        <Spacer />
        <IconButton
          size={6}
          colorScheme="danger"
          icon={<DeleteIcon />}
          onPress={removeChoiceStatement}
        />
      </HStack>
      {keys.map((key) => (
        <ArrayRemoveHandler key={key} tree={tree} id={key}>
          <TreeProxy tree={tree} prop={key}>
            {(tree) => <ChoiceEditor tree={tree} />}
          </TreeProxy>
        </ArrayRemoveHandler>
      ))}
    </VStack>
  );
};

export default Object.assign(ChoiceEditor, { List: ChoiceEditorList });
