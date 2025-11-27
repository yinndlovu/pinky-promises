// external
import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// internal
import {
  addItem,
  clearCart,
  deleteItem,
} from "../../../services/api/gifts/cartService";
import { CartItem } from "../../../types/Cart";
import { useAuth } from "../../../contexts/AuthContext";
import useToken from "../../../hooks/useToken";
import { useCartItems, useCartTotal } from "../../../hooks/useCart";
import { useTheme } from "../../../theme/ThemeContext";

// content
import AlertModal from "../../../components/modals/output/AlertModal";
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

const CartScreen = () => {
  // variables
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemValue, setNewItemValue] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // use states (modals)
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationAction, setConfirmationAction] = useState<
    (() => void) | null
  >(null);

  // data
  const {
    data: cartItems,
    refetch: refetchCartItems,
    isLoading: cartItemsLoading,
  } = useCartItems(user?.id, token);
  const {
    data: cartTotal,
    refetch: refetchCartTotal,
    isLoading: cartTotalLoading,
  } = useCartTotal(user?.id, token);

    // use effects
  useEffect(() => {
    if (toastMessage) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // mutations
  const addItemMutation = useMutation({
    mutationFn: async ({ item, value }: { item: string; value: string }) => {
      if (!token) {
        setToastMessage("Your session expired. Log in again and retry.");
        return;
      }
      return await addItem(token, item, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartItems", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["cartTotal", user?.id] });

      setNewItemName("");
      setNewItemValue("");
      setAddItemModalVisible(false);
      setAlertTitle("Item Added");
      setAlertMessage("You have added an item to your cart");
      setShowSuccess(true);
    },
    onError: (error: any) => {
      setAlertTitle("Failed");
      setAlertMessage(
        error.response?.data?.error || "Failed to add item to cart"
      );
      setShowError(true);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await deleteItem(token, itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartItems", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["cartTotal", user?.id] });

      setConfirmationVisible(false);
      setToastMessage("Item deleted from cart");
    },
    onError: (error: any) => {
      setToastMessage(
        error.response?.data?.error || "Failed to remove item from cart"
      );
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        setToastMessage("Your session expired. Log in again and retry.");
        return;
      }
      return clearCart(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartItems", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["cartTotal", user?.id] });

      setConfirmationVisible(false);
      setAlertTitle("Cart Cleared");
      setAlertMessage("You have cleared your cart");
      setShowSuccess(true);
    },
    onError: (error: any) => {
      setConfirmationVisible(false);
      setAlertTitle("Failed");
      setAlertMessage(error.response?.data?.error || "Failed to clear cart");
      setShowError(true);
    },
  });

  /// handlers
  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemValue.trim()) {
      setAlertTitle("Missing Fields");
      setAlertMessage("Please fill in all fields");
      setShowError(true);

      return;
    }

    const value = parseFloat(newItemValue);
    if (isNaN(value) || value <= 0) {
      setAlertTitle("Invalid Price");
      setAlertMessage("Please enter a valid price");
      setShowError(true);

      return;
    }

    addItemMutation.mutate({ item: newItemName.trim(), value: newItemValue });
  };

  const handleRemoveItem = (itemId: string) => {
    setConfirmationMessage(
      "Are you sure you want to remove this item from your cart?"
    );

    setConfirmationAction(() => () => deleteItemMutation.mutate(itemId));
    setConfirmationVisible(true);
  };

  const handleClearCart = () => {
    setConfirmationMessage(
      "Are you sure you want to remove all items from your cart?"
    );

    setConfirmationAction(() => () => clearCartMutation.mutate());
    setConfirmationVisible(true);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(0)}`;
  };

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.item}</Text>
        <Text style={styles.itemValue}>{formatCurrency(item.value)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
        disabled={deleteItemMutation.isPending}
      >
        <Feather name="trash-2" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="shopping-cart" size={64} color={theme.colors.muted} />
      <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
      <Text style={styles.emptyStateSubtitle}>
        Add some items to get started
      </Text>
      <TouchableOpacity
        style={styles.emptyStateAddButton}
        onPress={() => setAddItemModalVisible(true)}
      >
        <Feather name="plus" size={20} color={theme.colors.text} />
        <Text style={styles.emptyStateAddButtonText}>Add your first item</Text>
      </TouchableOpacity>
    </View>
  );

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  if (cartItemsLoading || cartTotalLoading) {
    return (
      <View style={styles.centered}>
        <LoadingSpinner showMessage={false} size="medium" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {safeCartItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>CART ITEMS</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setAddItemModalVisible(true)}
                >
                  <Feather name="plus" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <Pressable
                android_ripple={{ color: theme.colors.ripple }}
                style={styles.cartItemsContainer}
              >
                {safeCartItems.map(renderCartItem)}
              </Pressable>
            </View>

            <Pressable
              android_ripple={{ color: theme.colors.ripple }}
              style={styles.totalSection}
            >
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(cartTotal)}
                </Text>
              </View>
            </Pressable>

            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearCart}
                disabled={clearCartMutation.isPending}
              >
                <Feather
                  name="trash-2"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.clearButtonText}>Clear cart</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
      <Modal visible={addItemModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setAddItemModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add new item</Text>
                  <TouchableOpacity
                    onPress={() => setAddItemModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Feather name="x" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <Text style={styles.label}>Item name</Text>
                  <TextInput
                    style={styles.input}
                    value={newItemName}
                    onChangeText={setNewItemName}
                    placeholder="e.g., Cute brown plushie"
                    placeholderTextColor={theme.colors.muted}
                    maxLength={50}
                  />

                  <Text style={styles.label}>How much is it?</Text>
                  <TextInput
                    style={styles.input}
                    value={newItemValue}
                    onChangeText={setNewItemValue}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.muted}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setAddItemModalVisible(false)}
                    disabled={addItemMutation.isPending}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      (!newItemName.trim() ||
                        !newItemValue.trim() ||
                        addItemMutation.isPending) &&
                        styles.saveButtonDisabled,
                    ]}
                    onPress={handleAddItem}
                    disabled={
                      !newItemName.trim() ||
                      !newItemValue.trim() ||
                      addItemMutation.isPending
                    }
                  >
                    <Text style={styles.saveButtonText}>
                      {addItemMutation.isPending ? "Adding..." : "Add item"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <AlertModal
        visible={showSuccess}
        type="success"
        title={alertTitle}
        message={alertMessage}
        buttonText="Great"
        onClose={() => setShowSuccess(false)}
      />

      <AlertModal
        visible={showError}
        type="error"
        title={alertTitle}
        message={alertMessage}
        buttonText="Close"
        onClose={() => setShowError(false)}
      />

      <ConfirmationModal
        visible={confirmationVisible}
        message={confirmationMessage}
        onConfirm={() => confirmationAction?.()}
        onCancel={() => setConfirmationVisible(false)}
        onClose={() => setConfirmationVisible(false)}
        confirmText="Confirm"
        cancelText="Cancel"
        loading={deleteItemMutation.isPending || clearCartMutation.isPending}
      />

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 100,
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    centered: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      color: theme.colors.text,
      fontSize: 16,
      marginTop: 12,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 10,
    },
    sectionTitle: {
      fontSize: 13,
      color: theme.colors.muted,
      letterSpacing: 1,
      textTransform: "uppercase",
      opacity: 0.7,
      fontWeight: "bold",
    },
    addButton: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      width: 26,
      height: 26,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    addButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 8,
    },
    cartItemsContainer: {
      marginTop: 16,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      overflow: "hidden",
    },
    cartItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.background,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    itemValue: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: "bold",
    },
    removeButton: {
      padding: 8,
      marginLeft: 12,
    },
    totalSection: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabel: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "bold",
    },
    totalValue: {
      color: theme.colors.primary,
      fontSize: 24,
      fontWeight: "bold",
    },
    actionsSection: {
      marginBottom: 24,
    },
    clearButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    clearButtonText: {
      color: theme.colors.primary,
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 8,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
    },
    emptyStateTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateSubtitle: {
      color: theme.colors.muted,
      fontSize: 16,
      textAlign: "center",
    },
    emptyStateAddButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      marginTop: 50,
      paddingHorizontal: 20,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    emptyStateAddButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 8,
    },
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 28,
      alignItems: "center",
      width: "80%",
      shadowColor: theme.colors.shadow,
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
      color: theme.colors.text,
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
      color: theme.colors.muted,
      fontSize: 14,
      marginBottom: 6,
      fontWeight: "bold",
    },
    input: {
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.text,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: 16,
      marginBottom: 16,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 8,
    },
    cancelButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 24,
      alignItems: "center",
      borderColor: theme.colors.muted,
      marginRight: 8,
      flex: 1,
    },
    cancelButtonText: {
      color: theme.colors.muted,
      fontWeight: "bold",
      fontSize: 15,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 24,
      alignItems: "center",
      flex: 1,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 15,
    },
    toast: {
      position: "absolute",
      bottom: 10,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.primary,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      zIndex: 100,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    toastText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default CartScreen;
