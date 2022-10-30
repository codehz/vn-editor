import React, { FC } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";
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
    <TextInput
      style={styles.variableTextInput}
      placeholder={placeholder}
      value={value}
      onChangeText={setValue}
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
  return (
    <View style={styles.variableEditor}>
      <TreeTextEditor placeholder="variable name" tree={name} />
      <TreeTextEditor placeholder="default values" tree={defaultValue} />
    </View>
  );
};

const VariableEditorList: FC<{ tree: Tree<Variable[]> }> = ({ tree }) => {
  const updater = useTreeArrayUpdater(tree);
  const keys = useTreeArrayKeys(tree);
  return (
    <View>
      {keys.map((key) => (
        <VariableEditor key={key} tree={tree} id={key} />
      ))}
      <Button
        onPress={() => {
          updater.insert({ name: "unknown", defaultValue: "" });
        }}
        title="add variable"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  variableEditor: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  variableTextInput: {
    width: "40%",
    borderWidth: 1,
    borderColor: "black",
  },
});

export default Object.assign(VariableEditor, { List: VariableEditorList });
