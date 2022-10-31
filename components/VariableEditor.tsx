import {
  AddIcon,
  Button,
  DeleteIcon,
  HStack,
  IconButton,
  Input,
  VStack,
} from "native-base";
import React, { FC } from "react";
import {
  Tree,
  useSubTree,
  useTreeArrayKeys,
  useTreeArrayUpdater,
  useTreeUpdater,
  useTreeValue,
} from "../hooks/tree-state";
import { Variable } from "../lib/types";

const TreeTextEditor: FC<{ tree: Tree<string>; placeholder: string }> = ({
  tree,
  placeholder,
}) => {
  const value = useTreeValue(tree);
  const setValue = useTreeUpdater(tree);
  return (
    <Input
      flex={1}
      placeholder={placeholder}
      value={value}
      onChangeText={setValue}
      padding={1}
    />
  );
};

const VariableEditor: FC<{ tree: Tree<Variable[]>; id: string }> = ({
  tree,
  id,
}) => {
  const variable = useSubTree(tree, id);
  const name = useSubTree(variable, "name");
  const defaultValue = useSubTree(variable, "defaultValue");
  const updater = useTreeArrayUpdater(tree);
  return (
    <HStack space={1}>
      <TreeTextEditor placeholder="variable name" tree={name} />
      <TreeTextEditor placeholder="default values" tree={defaultValue} />
      <IconButton
        colorScheme="danger"
        icon={<DeleteIcon />}
        size="sm"
        padding={1}
        onPress={() => updater.remove(id)}
      />
    </HStack>
  );
};

const VariableEditorList: FC<{ tree: Tree<Variable[]> }> = ({ tree }) => {
  const updater = useTreeArrayUpdater(tree);
  const keys = useTreeArrayKeys(tree);
  return (
    <VStack space={1}>
      {keys.map((key) => (
        <VariableEditor key={key} tree={tree} id={key} />
      ))}
      <Button
        onPress={() => {
          updater.insert({ name: "unknown", defaultValue: "" });
        }}
        leftIcon={<AddIcon />}
      >
        add variable
      </Button>
    </VStack>
  );
};

export default Object.assign(VariableEditor, { List: VariableEditorList });
