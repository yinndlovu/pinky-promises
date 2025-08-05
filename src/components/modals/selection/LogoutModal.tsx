// external
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { Feather } from "@expo/vector-icons";

// types
type Props = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

const LogoutModal: React.FC<Props> = ({
    visible,
    onClose,
    onConfirm,
}) => (
    <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={onClose}
    >
        <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.backdrop} onPress={onClose} />
            <View style={styles.modalContent}>
                <View style={styles.handle} />
                
                <View style={styles.iconContainer}>
                    <Feather name="log-out" size={32} color="#e03487" />
                </View>
                
                <Text style={styles.title}>Log out</Text>
                <Text style={styles.message}>
                    Are you sure you want to log out? You'll need to sign in again to access your account.
                </Text>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                        <Text style={styles.confirmText}>Log out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        </TouchableWithoutFeedback>
    </Modal>
);

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(5, 3, 12, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    backdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        backgroundColor: "#23243a",
        borderRadius: 20,
        paddingTop: 12,
        paddingBottom: 24,
        paddingHorizontal: 24,
        width: "100%",
        maxWidth: 320,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        alignItems: "center",
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: "#b0b3c6",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 20,
        opacity: 0.6,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(224, 52, 135, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    message: {
        color: "#b0b3c6",
        fontSize: 16,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    buttonContainer: {
        flexDirection: "row",
        width: "100%",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "rgba(176, 179, 198, 0.1)",
        alignItems: "center",
    },
    cancelText: {
        color: "#b0b3c6",
        fontSize: 16,
        fontWeight: "500",
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "#e03487",
        alignItems: "center",
    },
    confirmText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
});

export default LogoutModal;
