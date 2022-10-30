import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Box,
  HStack,
  Input,
  VStack,
  Text,
  IconButton,
  Icon,
} from "native-base";
import React, { FC, useCallback } from "react";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { View } from "react-native";
import {
  Tree,
  useSubTree,
  useTreeUpdater,
  useTreeValue,
} from "../hooks/tree-state";
import { Expression } from "../lib/types";
import { TreeProxy } from "./TreeProxy";

const typenames: Record<Expression["type"], string> = {
  literal: "lit",
  variable: "$",
  builtin: "@",
  expr: "=",
  invoke: "f()",
  invoke_indirect: "*f()",
};

const ExpressionRenderer: FC<{
  expr: Tree<Expression>;
}> = ({ expr }) => {
  const type = useTreeValue(expr, "type");
  const value = useTreeValue(expr, "value") as string;
  const name = useTreeValue(expr, "name") as string;
  return (
    <View
      style={{
        borderRadius: 5,
        borderWidth: 1,
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      {type !== "literal" && (
        <Box
          bgColor="black"
          alignSelf="flex-start"
          padding={0.5}
          borderBottomRightRadius={5}
        >
          <Text color="white" fontSize={8}>
            {typenames[type]}
          </Text>
        </Box>
      )}
      <Box paddingX={1}>
        {type === "literal" ? (
          <Text color="black" fontSize={12}>
            {value}
          </Text>
        ) : type === "variable" ? (
          <Text>{name}</Text>
        ) : type === "builtin" ? (
          <Text>{name}</Text>
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
  const value = useTreeValue(tree);
  const setValue = useTreeUpdater(tree);
  return (
    <Input
      flex={1}
      placeholder={label}
      padding={1}
      value={value}
      onChangeText={setValue}
    />
  );
};

const VariableSelector: FC<{ tree: Tree<string> }> = ({ tree }) => {
  const value = useTreeValue(tree);
  const setValue = useTreeUpdater(tree);
  return (
    <Input
      flex={1}
      placeholder={"choose a variable"}
      padding={1}
      value={value}
      onChangeText={setValue}
    />
  );
};

const EditorCore: FC<{ tree: Tree<Expression>; prefix?: string }> = ({
  tree,
  prefix,
}) => {
  const type = useTreeValue(tree, "type");
  const update = useTreeUpdater(tree);
  const actionSheet = useActionSheet();
  const changeType = useCallback(() => {
    actionSheet.showActionSheetWithOptions(
      {
        title: "Choose a type",
        options: ["Cancel", "Literal", "Variable"],
        disabledButtonIndices: [
          ["", "literal", "variable"].findIndex((x) => x === tree.value.type),
        ],
        cancelButtonIndex: 0,
      },
      (i) => {
        switch (i) {
          case 1:
            update(({ key }) => ({ key, type: "literal", value: "" }));
            break;
          case 2:
            update(({ key }) => ({ key, type: "variable", name: "" }));
            break;
        }
      }
    );
  }, [actionSheet]);
  return (
    <VStack space={1}>
      <HStack alignItems="center" space={1}>
        <Text>
          {prefix}
          {type}
        </Text>
        <IconButton
          icon={<Icon as={MaterialCommunityIcons} name="swap-horizontal" />}
          size={5}
          padding={1}
          onPress={changeType}
        />
      </HStack>
      {type === "literal" ? (
        <TreeProxy
          tree={tree as Tree<Expression & { type: "literal" }>}
          prop="value"
        >
          {(tree) => <PlainTextEditor tree={tree} label="literal" />}
        </TreeProxy>
      ) : (
        <TreeProxy
          tree={tree as Tree<Expression & { type: "variable" }>}
          prop="name"
        >
          {(tree) => <VariableSelector tree={tree} />}
        </TreeProxy>
      )}
    </VStack>
  );
};

const ExpressionEditor: FC<{
  tree: Tree<Expression>;
  prefix?: string;
}> = ({ tree, prefix }) => {
  return (
    <VStack w="100%" space={1}>
      <EditorCore tree={tree} prefix={prefix} />
    </VStack>
  );
};

export default Object.assign(ExpressionEditor, {
  Renderer: ExpressionRenderer,
});
