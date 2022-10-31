import { VStack, Button, ScrollView, Box } from "native-base";
import React, { FC, useCallback, useState } from "react";
import { Document, Variable } from "../lib/types";
import StatementEditor from "./StatementEditor";
import VariableEditor from "./VariableEditor";
import {
  SubTree,
  TreeRoot,
  useSubTree,
  useTreeUpdater,
} from "../hooks/tree-state";
import { WithVariableContext } from "./VariableContext";

export const Editor: FC = () => {
  const [root] = useState(
    () =>
      new TreeRoot<Document>({
        variables: [],
        entrypoint: [],
        procs: [],
      })
  );
  const update = useTreeUpdater(root);
  const variables = useSubTree(root, "variables");
  const entrypoint = useSubTree(root, "entrypoint");
  return (
    <Box safeArea>
      <ScrollView
        style={{ width: "100%", height: "100%" }}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="interactive"
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
          <WithVariableContext name="Global" tree={variables}>
            <VariableEditor.List tree={variables} />
            <StatementEditor.List tree={entrypoint} />
          </WithVariableContext>
        </VStack>
      </ScrollView>
    </Box>
  );
};
