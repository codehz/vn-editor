import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Box,
  HStack,
  Input,
  VStack,
  Text,
  IconButton,
  Icon,
  Button,
  Actionsheet,
  ScrollView,
  Flex,
  Pressable,
} from "native-base";
import React, { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Keyboard, View } from "react-native";
import {
  SubTree,
  Tree,
  useTreeArrayKeys,
  useTreeSnapshot,
  useTreeUpdater,
  useTreeValue,
} from "../hooks/tree-state";
import { Expression, Variable } from "../lib/types";
import { TreeProxy } from "./TreeProxy";
import { useVariableContext, VariableSection } from "./VariableContext";

const typenames: Record<Expression["type"], string> = {
  literal: "lit",
  variable: "$",
  builtin: "@",
  expr: "=",
  invoke: "f()",
  invoke_indirect: "*f()",
};

const FoundedVariable: FC<{
  tree: SubTree<Variable[], [string]>;
  scope: string;
  prefix?: string;
  id: string;
  fallback: ReactNode;
}> = ({ tree, scope, prefix, id, fallback }) => {
  const valid = useTreeSnapshot(
    tree.parent,
    useCallback((list: Variable[]) => list.some((x) => x.key === id), [id])
  );
  const value = useTreeValue(tree, "name");
  if (!valid) return <>{fallback}</>;
  return (
    <>
      {prefix}
      {scope}::{value}
    </>
  );
};

const VariableNameResolver: FC<{
  id: string;
  prefix?: string;
  fallback?: ReactNode;
}> = ({ id, prefix, fallback = <Text color="danger.400">not found</Text> }) => {
  const { find } = useVariableContext();
  const found = useMemo(() => (id ? find(id) : undefined), [id]);
  if (found) {
    return (
      <FoundedVariable
        tree={found[1]}
        scope={found[0]}
        prefix={prefix}
        id={id}
        fallback={fallback}
      />
    );
  }
  return <>{fallback}</>;
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
          <Text fontSize={12}>
            <VariableNameResolver id={name} />
          </Text>
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

const VariableNameButton: FC<{
  tree: Tree<Variable[]>;
  onSelect(key: string): void;
  id: string;
}> = ({ tree, onSelect, id }) => {
  const name = useTreeValue(tree, id, "name");
  return (
    <Pressable
      _pressed={{ bgColor: "primary.400" }}
      paddingX={0.5}
      margin={0.5}
      bgColor="primary.200"
      borderRadius={5}
      onPress={() => onSelect(id)}
    >
      <Text>{name}</Text>
    </Pressable>
  );
};

const VariableList: FC<{
  tree: Tree<Variable[]>;
  onSelect(key: string): void;
}> = ({ tree, onSelect }) => {
  const keys = useTreeArrayKeys(tree);
  return (
    <Flex flexWrap="wrap" direction="row">
      {keys.map((key) => (
        <VariableNameButton
          key={key}
          tree={tree}
          id={key}
          onSelect={onSelect}
        />
      ))}
    </Flex>
  );
};

const VariableSectionList: FC<{
  list: VariableSection[];
  onSelect(key: string): void;
}> = ({ list, onSelect }) => {
  return (
    <VStack space={1}>
      {list.map(({ title, tree }) => (
        <>
          <Text fontSize={20}>{title}</Text>
          <VariableList tree={tree} onSelect={onSelect} />
        </>
      ))}
    </VStack>
  );
};

const VariableSelector: FC<{ tree: Tree<string> }> = ({ tree }) => {
  const value = useTreeValue(tree);
  const setValue = useTreeUpdater(tree);
  const [state, setState] = useState<VariableSection[] | undefined>();
  const [open, setOpen] = useState(false);
  const { list } = useVariableContext();
  const onSelect = useCallback((value: string) => {
    setValue(value);
    setOpen(false);
  }, []);
  return (
    <>
      <Button
        focusable
        padding={1}
        variant="subtle"
        onPress={() => {
          Keyboard.dismiss();
          setState(list);
          setOpen(true);
        }}
      >
        <Text>
          {<VariableNameResolver id={value} fallback={<>select</>} />}
        </Text>
      </Button>
      <Actionsheet
        size="full"
        isOpen={state && open}
        onClose={() => setOpen(false)}
      >
        <Actionsheet.Content>
          <ScrollView w="100%" overScrollMode="never" bounces={false}>
            <VariableSectionList list={state ?? []} onSelect={onSelect} />
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
    </>
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
