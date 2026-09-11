import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/themed-text";

interface PhotoPreviewModalProps {
  visible: boolean;
  photoUri: string | null;
  onClose: () => void;
}

export function PhotoPreviewModal({
  visible,
  photoUri,
  onClose,
}: PhotoPreviewModalProps) {
  const { width, height } = Dimensions.get("window");

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[styles.overlay]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <ThemedText style={styles.closeText}>×</ThemedText>
        </TouchableOpacity>
        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            style={{ width, height: height * 0.9 }}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 40,
    color: "#FFF",
    fontWeight: "bold",
  },
});
