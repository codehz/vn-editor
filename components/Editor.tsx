import { VStack, Button, ScrollView, Box } from "native-base";
import React, { FC } from "react";
import { Document } from "../lib/types";
import StatementEditor from "./StatementEditor";
import VariableEditor from "./VariableEditor";
import { TreeRoot, useSubTree, useTreeUpdater } from "../hooks/tree-state";

const EditorLens = new TreeRoot<Document>({
  variables: [],
  entrypoint: [],
  procs: [],
});

export const Editor: FC = () => {
  const update = useTreeUpdater(EditorLens);
  const variables = useSubTree(EditorLens, "variables");
  const entrypoint = useSubTree(EditorLens, "entrypoint");
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
