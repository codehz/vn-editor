// import { Picker } from "@react-native-picker/picker";
import { Box, HStack, Input, Select, VStack, Text } from "native-base";
import React, { FC, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import {
  LensContext,
  useDeriveLens,
  useLens,
  useLensSnapshot,
} from "../hooks/lenses-hooks";
import { Expression } from "../lib/types";

const ExpressionRenderer: FC<{
  value: Expression;
  prefix?: string;
}> = ({ value, prefix }) => {
  return (
    <View
      style={{
        borderRadius: 5,
        borderWidth: 1,
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      <Box
        bgColor="black"
        alignSelf="flex-start"
        padding={0.5}
        borderBottomRightRadius={5}
      >
        <Text color="white" fontSize={8}>
          {prefix}
          {value.type}
        </Text>
      </Box>
      <Box paddingX={1}>
        {value.type === "literal" ? (
          <Text color="black">{value.value}</Text>
        ) : value.type === "variable" ? (
          <Text>{value.name}</Text>
        ) : value.type === "builtin" ? (
          <Text>{value.name}</Text>
        ) : (
          <></>
        )}
      </Box>
    </View>
  );
};

const PlainTextEditor: FC<{ lens: LensContext<string>; label: string }> = ({
  lens,
  label,
}) => {
  const [value, setValue] = useLens(lens);
  return (
    <Input flex={1} placeholder={label} value={value} onChangeText={setValue} />
  );
};

const LiteralEditor: FC<{
  lens: LensContext<Expression & { type: "literal" }>;
}> = ({ lens }) => (
  <PlainTextEditor lens={useDeriveLens(lens, "value")} label="literal" />
);

function getType(x: Expression) {
  return x.type;
}

const EditorCore: FC<{ lens: LensContext<Expression> }> = ({ lens }) => {
  const value = useLensSnapshot(lens, getType);
  return (
    <HStack space={1}>
      <Select selectedValue={value} minWidth={150} placeholder="choice type">
        <Select.Item label="literal value" value="literal" />
        <Select.Item label="variable reference" value="variable" />
        <Select.Item label="builtin function" value="builtin" />
      </Select>
      {value === "literal" ? <LiteralEditor lens={lens as any} /> : <></>}
    </HStack>
  );
};

const ExpressionEditor: FC<{
  lens: LensContext<Expression>;
  prefix?: string;
}> = ({ lens, prefix }) => {
  const value = useLensSnapshot(lens);
  const [editMode, setEditMode] = useState(false);
  return (
    <VStack w="100%" space={1}>
      <TouchableOpacity onPress={() => setEditMode((x) => !x)}>
        <ExpressionRenderer value={value} prefix={prefix} />
      </TouchableOpacity>
      {editMode && <EditorCore lens={lens} />}
    </VStack>
  );
};

export default Object.assign(ExpressionEditor, {
  Renderer: ExpressionRenderer,
});
