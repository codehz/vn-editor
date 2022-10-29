import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Editor } from "./components/Editor";
import { TemplateEditor } from "./components/TemplateEditor";
import { createLens } from "./hooks/lenses-hooks";
import { Expression } from "./lib/types";
import { NativeBaseProvider, Box } from "native-base";
import { EditModeProvider } from "./components/EditMode";

export default function App() {
  const [lens] = useState(() =>
    createLens({
      template: "hello {world}",
      params: {
        world: { type: "literal", key: "lit", value: "world" },
      } as Record<string, Expression>,
    })
  );
  return (
    <NativeBaseProvider>
      <EditModeProvider>
        <Editor />
      </EditModeProvider>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
