import React, { FC } from "react";
import { View } from "react-native";
import {
  LensContext,
  useLensUpdater,
  useLensSnapshot,
} from "../hooks/lenses-hooks";
import { Procedure } from "../lib/types";
import { arrayKeys, compareByJson } from "../lib/utils";

const ProcedureEditor: FC<{ lens: LensContext<Procedure[]>; idx: number }> = ({
  lens,
  idx,
}) => {
  return <></>;
};

const ProcedureEditorList: FC<{ lens: LensContext<Procedure[]> }> = ({
  lens,
}) => {
  const keys = useLensSnapshot(lens, arrayKeys, compareByJson);
  const update = useLensUpdater(lens);
  return (
    <View>
      {keys.map((key, idx) => (
        <ProcedureEditor key={key} lens={lens} idx={idx} />
      ))}
    </View>
  );
};

export default Object.assign(ProcedureEditor, { List: ProcedureEditorList });
