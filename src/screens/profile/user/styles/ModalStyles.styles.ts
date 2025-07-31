import { StyleSheet } from "react-native";

const modalStyles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 3, 12, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#23243a",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "95%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
    justifyContent: "space-between",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  form: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    color: "#b0b3c6",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#18192b",
    color: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 160,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: "#393a4a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderColor: "#b0b3c6",
    marginLeft: 8,
    flex: 1,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    flex: 1,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default modalStyles;