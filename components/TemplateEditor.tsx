import {
  Input,
  Text,
  Button,
  VStack,
  HStack,
  IconButton,
  AddIcon,
  Box,
  CheckIcon,
  DeleteIcon,
} from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { InputAccessoryView, TouchableOpacity, Button as NativeButton } from "react-native";
import {
  LensContext,
  useDeriveLens,
  useLens,
  useLensUpdater,
  useLensSnapshot,
  inspectLens,
} from "../hooks/lenses-hooks";
import { tokenizeTemplate } from "../lib/tokenizer";
import { Expression, TemplatedText } from "../lib/types";
import { compareByJson, randomid } from "../lib/utils";
import { useRemoveHandler } from "./ArrayHelper";
import { AutoSizedTextArea } from "./AutoSizedTextArea";
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

const VariableRenderer: FC<{ name: string; value: Expression | undefined }> = ({
  name,
  value,
}) => {
  if (!value)
    return (
      <Box borderRadius={5} paddingX={1} borderWidth={1} borderColor="red.500">
        <Text color="red.500">{name}</Text>
      </Box>
    );
  return <ExpressionEditor.Renderer value={value} />;
};

const Renderer: FC<{ lens: LensContext<TemplatedText>; embed: boolean }> = ({
  lens,
  embed,
}) => {
  const [value] = useLens(lens);
  const { tokens, error } = useMemo(() => {
    try {
      const tokens = [...tokenizeTemplate(value.template)];
      return { tokens };
    } catch (error) {
      return { error };
    }
  }, [value.template]);
  if (error)
    return (
      <Box borderRadius={5} paddingX={1} borderWidth={1} borderColor="red.500">
        <Text color="red.500">{error + ""}</Text>
      </Box>
    );
  const content = (
    <Text>
      {tokens!.map((token, i) =>
        token.type === "literal" ? (
          <Text fontSize={12} key={i}>
            {token.value}
          </Text>
        ) : (
          <VariableRenderer
            key={i}
            name={token.value}
            value={value.params[token.value]}
          />
        )
      )}
    </Text>
  );
  return embed ? (
    <Box padding={1}>{content}</Box>
  ) : (
    <Box
      borderRadius={5}
      paddingX={1}
      paddingTop={1}
      borderWidth={1}
      borderColor="gray.400"
    >
      {content}
    </Box>
  );
};

const EditTemplate: FC<{
  lens: LensContext<string>;
  inputAccessoryViewID: string;
}> = ({ lens, inputAccessoryViewID }) => {
  const [value, setValue] = useLens(lens);
  return (
    <Input
      value={value}
      onChangeText={setValue}
      autoFocus
      padding={1}
      multiline
      inputAccessoryViewID={inputAccessoryViewID}
    />
  );
};

const EditParameter: FC<{
  lens: LensContext<Record<string, Expression>>;
  name: string;
}> = ({ lens, name }) => {
  const exprlens = useDeriveLens(lens, name);
  return <ExpressionEditor lens={exprlens} prefix={name + ": "} />;
};

const EditParameterWrapper: FC<{
  lens: LensContext<Record<string, Expression>>;
  name: string;
}> = ({ lens, name }) => {
  const exists = useLensSnapshot(
    lens,
    useCallback((obj: object) => name in obj, [name])
  );
  const update = useLensUpdater(lens);
  if (exists) {
    return <EditParameter lens={lens} name={name} />;
  } else {
    return (
      <Button
        variant="subtle"
        startIcon={<AddIcon />}
        size="xs"
        onPress={() =>
          update((x) => ({
            ...x,
            [name]: { type: "literal", key: randomid(), value: "" },
          }))
        }
      >
        {name}
      </Button>
    );
  }
};

const EditorCore: FC<{
  lens: LensContext<TemplatedText>;
  onExit(): void;
  embed: boolean;
}> = ({ lens, onExit, embed }) => {
  const template = useDeriveLens(lens, "template");
  const params = useDeriveLens(lens, "params");
  const [keys] = useLensSnapshot(
    template,
    getVariablesFromTemplate,
    compareByJson
  );
  const remove = useRemoveHandler();
  const [id] = useState(() => randomid());
  return (
    <VStack w="100%" space={1} padding={embed ? 1 : 0}>
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
      <EditTemplate lens={template} inputAccessoryViewID={id} />
      {keys.map((x) => (
        <EditParameterWrapper key={x} lens={params} name={x} />
      ))}
    </VStack>
  );
};

function isEmpty(text: TemplatedText) {
  return text.template === "";
}

export const TemplateEditor: FC<{
  lens: LensContext<TemplatedText>;
  embed?: boolean;
}> = ({ lens, embed = false }) => {
  const [editMode, setEditMode] = useEditMode(() =>
    update((tmp) => {
      const [variables, error] = getVariablesFromTemplate(tmp.template);
      if (error) return tmp;
      const params = Object.fromEntries(
        Object.entries(tmp.params).filter(([k]) => variables.includes(k))
      );
      return { ...tmp, params };
    })
  );
  const update = useLensUpdater(lens);
  useEffect(() => {
    if (inspectLens(lens, "template") === "") setEditMode(true);
  }, []);
  return editMode ? (
    <EditorCore lens={lens} embed={embed} onExit={() => setEditMode(false)} />
  ) : (
    <TouchableOpacity onPress={() => setEditMode(true)}>
      <Renderer lens={lens} embed={embed} />
    </TouchableOpacity>
  );
};
