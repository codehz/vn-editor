import { VStack, Button, ScrollView, Box } from "native-base";
import React, { FC, useCallback, useEffect, useState } from "react";
import { Keyboard } from "react-native";
import {
  createLens,
  LensContext,
  useDeriveLens,
  useLens,
  useLensUpdater,
  useLensSnapshot,
} from "../hooks/lenses-hooks";
import { Document, Statement, Variable } from "../lib/types";
import { arrayKeys, compareByJson, randomid } from "../lib/utils";
import StatementEditor from "./StatementEditor";
import VariableEditor from "./VariableEditor";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const EditorLens = createLens<Document>({
  variables: [],
  entrypoint: [],
  procs: [],
});

export const Editor = () => {
  const update = useLensUpdater(EditorLens);
  const variables = useDeriveLens(EditorLens, "variables");
  const entrypoint = useDeriveLens(EditorLens, "entrypoint");
  return (
    <Box safeArea>
      <ScrollView
        style={{ width: "100%", height: "100%" }}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="always"
      >
        <VStack w="100%" paddingX={1}>
          <Button
            onPress={() =>
              update({
                variables: [],
                entrypoint: [],
                procs: [],
              })
            }
          >
            reset
          </Button>
          <VariableEditor.List lens={variables} />
          <StatementEditor.List lens={entrypoint} />
        </VStack>
      </ScrollView>
    </Box>
  );
};
