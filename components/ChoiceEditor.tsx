import {
  AddIcon,
  Badge,
  Box,
  Button,
  DeleteIcon,
  HStack,
  IconButton,
  Pressable,
  Spacer,
  VStack,
} from "native-base";
import React, { FC } from "react";
import {
  LensContext,
  useDeriveLens,
  useLens,
  useLensSnapshot,
  useLensUpdater,
} from "../hooks/lenses-hooks";
import { Choice } from "../lib/types";
import { arrayKeys, compareByJson, randomid } from "../lib/utils";
import { LensProxy } from "./LensProxy";
import { ArrayRemoveHandler, useRemoveHandler } from "./ArrayHelper";
import StatementEditor from "./StatementEditor";
import { TemplateEditor } from "./TemplateEditor";
import { useEditMode, useNestedEditModeProvider } from "./EditMode";

const ChoiceEditor: FC<{ lens: LensContext<Choice> }> = ({ lens }) => {
  const text = useDeriveLens(lens, "text");
  const body = useDeriveLens(lens, "body");
  return (
    <VStack borderWidth={1} borderColor="gray.200" borderRadius={5}>
      <TemplateEditor lens={text} embed />
      <Box padding={1}>
        <StatementEditor.List lens={body} />
      </Box>
    </VStack>
  );
};

const ChoiceEditorList: FC<{ lens: LensContext<Choice[]> }> = ({ lens }) => {
  const keys = useLensSnapshot(lens, arrayKeys, compareByJson);
  const update = useLensUpdater(lens);
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
            update((list) => [
              ...list,
              {
                key: randomid(),
                body: [],
                text: { template: "", params: {} },
              },
            ])
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
      {keys.map((key, i) => (
        <ArrayRemoveHandler key={key} lens={lens} idx={i}>
          <LensProxy lens={lens} props={[i]}>
            {(lens) => <ChoiceEditor lens={lens} />}
          </LensProxy>
        </ArrayRemoveHandler>
      ))}
    </VStack>
  );
};

export default Object.assign(ChoiceEditor, { List: ChoiceEditorList });
