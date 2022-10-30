import React, { FC } from "react";
import { View } from "react-native";
import { Tree, useTreeArrayKeys } from "../hooks/tree-state";
import { Procedure } from "../lib/types";

const ProcedureEditor: FC<{ tree: Tree<Procedure[]>; idx: number }> = ({
  tree,
  idx,
}) => {
  return <></>;
};

const ProcedureEditorList: FC<{ tree: Tree<Procedure[]> }> = ({ tree }) => {
  const keys = useTreeArrayKeys(tree);
  return (
    <View>
      {keys.map((key, idx) => (
        <ProcedureEditor key={key} tree={tree} idx={idx} />
      ))}
    </View>
  );
};

export default Object.assign(ProcedureEditor, { List: ProcedureEditorList });
