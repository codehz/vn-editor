import React, { FC } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";
import {
  LensContext,
  useLens,
  useLensUpdater,
  useLensSnapshot,
} from "../hooks/lenses-hooks";
import { Variable } from "../lib/types";
import { arrayKeys, compareByJson, randomid } from "../lib/utils";

const VariableEditor: FC<{ lens: LensContext<Variable[]>; idx: number }> = ({
  lens,
  idx,
}) => {
  const [name, setName] = useLens(lens, idx, "name");
  const [defaultValue, setDefaultValue] = useLens(lens, idx, "defaultValue");
  return (
    <View style={styles.variableEditor}>
      <TextInput
        style={styles.variableTextInput}
        placeholder="variable name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.variableTextInput}
        value={defaultValue}
        placeholder="default values"
        onChangeText={setDefaultValue}
      />
    </View>
  );
};

const VariableEditorList: FC<{ lens: LensContext<Variable[]> }> = ({
  lens,
}) => {
  const update = useLensUpdater(lens);
  const snapshot = useLensSnapshot(lens, arrayKeys, compareByJson);
  return (
    <View>
      {snapshot.map((key, i) => (
        <VariableEditor key={key} lens={lens} idx={i} />
      ))}
      <Button
        onPress={() => {
          update((x) => [
            ...x,
            { key: randomid(), name: "unknown", defaultValue: "" },
          ]);
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
