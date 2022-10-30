// import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Box,
  HStack,
  Input,
  Select,
  VStack,
  Text,
  Badge,
  IconButton,
  Icon,
} from "native-base";
import React, { FC, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import {
  Tree,
  useSubTree,
  useTreeUpdater,
  useTreeValue,
} from "../hooks/tree-state";
import { Expression } from "../lib/types";

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

const LiteralEditor: FC<{
  tree: Tree<Expression & { type: "literal" }>;
}> = ({ tree }) => (
  <PlainTextEditor tree={useSubTree(tree, "value")} label="literal" />
);

const EditorCore: FC<{ tree: Tree<Expression>; prefix?: string }> = ({
  tree,
  prefix,
}) => {
  const type = useTreeValue(tree, "type");
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
        />
      </HStack>
      {type === "literal" ? <LiteralEditor tree={tree as any} /> : <></>}
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
