import {
  Input,
  Text,
  Button,
  VStack,
  AddIcon,
  Box,
  CheckIcon,
  DeleteIcon,
} from "native-base";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { InputAccessoryView, TouchableOpacity } from "react-native";
import {
  Tree,
  useSubTree,
  useTreeArrayUpdater,
  useTreeSnapshot,
  useTreeUpdater,
  useTreeValue,
} from "../hooks/tree-state";
import { tokenizeTemplate } from "../lib/tokenizer";
import { Expression, TemplatedText } from "../lib/types";
import { compareByJson, randomid } from "../lib/utils";
import { useRemoveHandler } from "./ArrayHelper";
import { useEditMode } from "./EditMode";
import ExpressionEditor from "./ExpressionEditor";

export function getVariablesFromTemplate(input: string): [string[], any] {
  const variables: Set<string> = new Set<string>();
  let error: any = undefined;
  try {
    for (const item of tokenizeTemplate(input)) {
      if (item.type === "variable") variables.add(item.value);
    }
  } catch (e) {
    error = e;
  }
  return [[...variables], error];
}

const VariableRendererInner: FC<{ name: string; tree: Tree<Expression[]> }> = ({
  tree,
  name,
}) => {
  const value = useSubTree(tree, name);
  return <ExpressionEditor.Renderer expr={value} />;
};

const VariableRenderer: FC<{ name: string; tree: Tree<Expression[]> }> = ({
  name,
  tree,
}) => {
  const exists = useTreeSnapshot(
    tree,
    useCallback(
      (value: Expression[]) => value.some((x) => x.key === name),
      [name]
    )
  );
  if (!exists)
    return (
      <Box borderRadius={5} paddingX={1} borderWidth={1} borderColor="red.500">
        <Text color="red.500">{name}</Text>
      </Box>
    );
  return <VariableRendererInner tree={tree} name={name} />;
};

const Renderer: FC<{ tree: Tree<TemplatedText>; embed: boolean }> = ({
  tree,
  embed,
}) => {
  const template = useTreeValue(tree, "template");
  const params = useSubTree(tree, "params");
  const { tokens, error } = useMemo(() => {
    try {
      const tokens = [...tokenizeTemplate(template)];
      return { tokens };
    } catch (error) {
      return { error };
    }
  }, [template]);
  if (error)
    return (
      <Box borderRadius={5} paddingX={1} borderWidth={1} borderColor="red.500">
        <Text color="red.500">{error + ""}</Text>
      </Box>
    );
  const content = (
    <Text lineHeight="auto">
      {tokens!.map((token, i) =>
        token.type === "literal" ? (
          <Text fontSize={12} key={i}>
            {token.value}
          </Text>
        ) : (
          <VariableRenderer key={i} name={token.value} tree={params} />
        )
      )}
    </Text>
  );
  return embed ? (
    <Box padding={1}>{content}</Box>
  ) : (
    <Box borderRadius={5} padding={1} borderWidth={1} borderColor="gray.400">
      {content}
    </Box>
  );
};

const EditTemplate: FC<{
  tree: Tree<string>;
  inputAccessoryViewID: string;
}> = ({ tree, inputAccessoryViewID }) => {
  const value = useTreeValue(tree);
  const setValue = useTreeUpdater(tree);
  return (
    <Input
      value={value}
      onChangeText={setValue}
      autoFocus
      padding={1}
      multiline
      scrollEnabled={false}
      inputAccessoryViewID={inputAccessoryViewID}
    />
  );
};

const EditParameter: FC<{
  tree: Tree<Expression[]>;
  name: string;
}> = ({ tree, name }) => {
  const exprlens = useSubTree(tree, name);
  return <ExpressionEditor tree={exprlens} prefix={name + ": "} />;
};

const EditParameterWrapper: FC<{
  tree: Tree<Expression[]>;
  name: string;
}> = ({ tree, name }) => {
  const exists = useTreeSnapshot(
    tree,
    useCallback(
      (value: Expression[]) => value.some((x) => x.key === name),
      [name]
    )
  );
  const updater = useTreeArrayUpdater(tree);
  if (exists) {
    return <EditParameter tree={tree} name={name} />;
  } else {
    return (
      <Button
        variant="subtle"
        startIcon={<AddIcon />}
        size="xs"
        onPress={() =>
          updater.insert({
            key: name,
            type: "literal",
            value: "",
          })
        }
      >
        {name}
      </Button>
    );
  }
};

const EditorCore: FC<{
  tree: Tree<TemplatedText>;
  onExit(): void;
  embed: boolean;
}> = ({ tree, onExit, embed }) => {
  const template = useSubTree(tree, "template");
  const params = useSubTree(tree, "params");
  const [variables] = useTreeSnapshot(
    template,
    getVariablesFromTemplate,
    compareByJson
  );
  const remove = useRemoveHandler();
  const [id] = useState(() => randomid());
  return (
    <>
      <InputAccessoryView nativeID={id} backgroundColor="white">
        <Button.Group isAttached bgColor="white" justifyContent="flex-end">
          <Button
            colorScheme="danger"
            variant="ghost"
            leftIcon={<DeleteIcon />}
            onPress={remove}
          >
            REMOVE
          </Button>
          <Button variant="ghost" leftIcon={<CheckIcon />} onPress={onExit}>
            DONE
          </Button>
        </Button.Group>
      </InputAccessoryView>
      <VStack w="100%" space={1} padding={embed ? 1 : 0}>
        <EditTemplate tree={template} inputAccessoryViewID={id} />
        {variables.map((x) => (
          <EditParameterWrapper key={x} tree={params} name={x} />
        ))}
      </VStack>
    </>
  );
};

export const TemplateEditor: FC<{
  tree: Tree<TemplatedText>;
  embed?: boolean;
}> = ({ tree, embed = false }) => {
  const [editMode, setEditMode] = useEditMode(() =>
    updater.update((arr) => {
      const [variables, error] = getVariablesFromTemplate(tree.value.template);
      if (error) return undefined;
      return variables.filter((it) => arr.some((x) => x.key === it));
    })
  );
  const updater = useTreeArrayUpdater(tree, "params");
  useEffect(() => {
    if (tree.value.template === "") setEditMode(true);
  }, []);
  return editMode ? (
    <EditorCore tree={tree} embed={embed} onExit={() => setEditMode(false)} />
  ) : (
    <TouchableOpacity onPress={() => setEditMode(true)}>
      <Renderer tree={tree} embed={embed} />
    </TouchableOpacity>
  );
};
