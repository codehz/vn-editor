import React, { FC, useCallback, useState } from "react";
import { TextArea } from "native-base";
import { LensContext, useLens } from "../hooks/lenses-hooks";

export const AutoSizedTextArea: FC<{
  lens: LensContext<string>;
  placeholder: string;
}> = ({ lens, placeholder }) => {
  const [value, setValue] = useLens(lens);
  const [contentHeight, setContentHeight] = useState(0);
  return (
    <TextArea
      autoFocus
      autoCompleteType="none"
      placeholder={placeholder}
      value={value}
      totalLines={2}
      padding={1}
      onChangeText={setValue}
      h={contentHeight + 10}
      onContentSizeChange={(e) => {
        setContentHeight(e.nativeEvent.contentSize.height);
      }}
    />
  );
};
