// import { Picker } from "@react-native-picker/picker";
import { Box, HStack, Input, Select, VStack, Text } from "native-base";
import React, { FC, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Tree, useSubTree, useTreeUpdater, useTreeValue } from "../hooks/tree-state";
import { Expression } from "../lib/types";

const ExpressionRenderer: FC<{
  value: Expression;
  prefix?: string;
}> = ({ value, prefix }) => {
  return (
    <View
      style={{
        borderRadius: 5,
        borderWidth: 1,
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      <Box
        bgColor="black"
        alignSelf="flex-start"
        padding={0.5}
        borderBottomRightRadius={5}
      >
        <Text color="white" fontSize={8}>
          {prefix}
          {value.type}
        </Text>
      </Box>
      <Box paddingX={1}>
        {value.type === "literal" ? (
          <Text color="black">{value.value}</Text>
        ) : value.type === "variable" ? (
          <Text>{value.name}</Text>
        ) : value.type === "builtin" ? (
          <Text>{value.name}</Text>
        ) : (
          <></>
        )}
      </Box>
    </View>
  );
};

const PlainTextEditor: FC<{ tree: Tree<string>; label: string }> = ({
  tree,
  label,
}) => {
  // const [value, setValue] = useLens(tree);
  const value = useTreeValue(tree);
  const setValue = useTreeUpdater(tree);
  return (
    <Input flex={1} placeholder={label} value={value} onChangeText={setValue} />
  );
};

const LiteralEditor: FC<{
  tree: Tree<Expression & { type: "literal" }>;
}> = ({ tree }) => (
  <PlainTextEditor tree={useSubTree(tree, "value")} label="literal" />
);

function getType(x: Expression) {
  return x.type;
}

const EditorCore: FC<{ tree: Tree<Expression> }> = ({ tree }) => {
  const value = useTreeValue(tree).type;
  return (
    <HStack space={1}>
      <Select selectedValue={value} minWidth={150} placeholder="choice type">
        <Select.Item label="literal value" value="literal" />
        <Select.Item label="variable reference" value="variable" />
        <Select.Item label="builtin function" value="builtin" />
      </Select>
      {value === "literal" ? <LiteralEditor tree={tree as any} /> : <></>}
    </HStack>
  );
};

const ExpressionEditor: FC<{
  tree: Tree<Expression>;
  prefix?: string;
}> = ({ tree, prefix }) => {
  const value = useTreeValue(tree);
  const [editMode, setEditMode] = useState(false);
  return (
    <VStack w="100%" space={1}>
      <TouchableOpacity onPress={() => setEditMode((x) => !x)}>
        <ExpressionRenderer value={value} prefix={prefix} />
      </TouchableOpacity>
      {editMode && <EditorCore tree={tree} />}
    </VStack>
  );
};

export default Object.assign(ExpressionEditor, {
  Renderer: ExpressionRenderer,
});
