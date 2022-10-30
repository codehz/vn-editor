import { StyleSheet } from "react-native";
import { Editor } from "./components/Editor";
import { NativeBaseProvider } from "native-base";
import { EditModeProvider } from "./components/EditMode";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

export default function App() {
  return (
    <NativeBaseProvider>
      <ActionSheetProvider>
        <EditModeProvider>
          <Editor />
        </EditModeProvider>
      </ActionSheetProvider>
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
