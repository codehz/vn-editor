import React, { FC } from "react";
import { View } from "react-native";
import { Tree, useTreeArrayKeys } from "../hooks/tree-state";
import { Procedure } from "../lib/types";

const ProcedureEditor: FC<{ lens: Tree<Procedure[]>; idx: number }> = ({
  lens,
  idx,
}) => {
  return <></>;
};

const ProcedureEditorList: FC<{ lens: Tree<Procedure[]> }> = ({ lens }) => {
  const keys = useTreeArrayKeys(lens);
  return (
    <View>
      {keys.map((key, idx) => (
        <ProcedureEditor key={key} lens={lens} idx={idx} />
      ))}
    </View>
  );
};

export default Object.assign(ProcedureEditor, { List: ProcedureEditorList });
