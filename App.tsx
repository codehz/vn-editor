import { StyleSheet } from "react-native";
import { Editor } from "./components/Editor";
import { NativeBaseProvider } from "native-base";
import { EditModeProvider } from "./components/EditMode";

export default function App() {
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
