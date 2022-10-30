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

const ChoiceEditor: FC<{ lens: Tree<Choice> }> = ({ lens }) => {
  const text = useSubTree(lens, "text");
  const body = useSubTree(lens, "body");
  return (
    <VStack borderWidth={1} borderColor="gray.200" borderRadius={5}>
      <TemplateEditor lens={text} embed />
      <Box padding={1}>
        <StatementEditor.List lens={body} />
      </Box>
    </VStack>
  );
};

const ChoiceEditorList: FC<{ lens: Tree<Choice[]> }> = ({ lens }) => {
  const keys = useTreeArrayKeys(lens);
  const updater = useTreeArrayUpdater(lens);
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
      {/* <Badge>Choice</Badge> */}
      {keys.map((key) => (
        <ArrayRemoveHandler key={key} lens={lens} id={key}>
          <TreeProxy tree={lens} prop={key}>
            {(lens) => <ChoiceEditor lens={lens} />}
          </TreeProxy>
        </ArrayRemoveHandler>
      ))}
    </VStack>
  );
};

export default Object.assign(ChoiceEditor, { List: ChoiceEditorList });
