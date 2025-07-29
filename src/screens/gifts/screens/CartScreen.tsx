// external
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// types
type CartItem = {
  id: string;
  name: string;
  value: number;
};

type Props = NativeStackScreenProps<any>;

const CartScreen: React.FC<Props> = ({ navigation }) => {
  // variables
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 60;

  // use states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemValue, setNewItemValue] = useState("");
  const [loading, setLoading] = useState(false);

  // use effects
  useEffect(() => {
    loadCartItems();
  }, []);

  // handlers
  const loadCartItems = async () => {
    try {
      const savedItems = await AsyncStorage.getItem("cartItems");

      if (savedItems) {
        setCartItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error("Error loading cart items:", error);
    }
  };

  const saveCartItems = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem("cartItems", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart items:", error);
    }
  };

  const addItemToCart = async () => {
    if (!newItemName.trim() || !newItemValue.trim()) {
      return;
    }

    const value = parseFloat(newItemValue);
    if (isNaN(value) || value <= 0) {
      return;
    }

    const newItem: CartItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      value: value,
    };

    const updatedItems = [...cartItems, newItem];
    setCartItems(updatedItems);
    await saveCartItems(updatedItems);

    setNewItemName("");
    setNewItemValue("");
    setAddItemModalVisible(false);
  };

  const removeItemFromCart = async (itemId: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedItems);
    await saveCartItems(updatedItems);
  };

  const clearCart = () => {
    Alert.alert(
      "Clear cart",
      "Are you sure you want to remove all items from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setCartItems([]);
            await saveCartItems([]);
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.value, 0);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemValue}>{formatCurrency(item.value)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItemFromCart(item.id)}
      >
        <Feather name="trash-2" size={18} color="#e03487" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="shopping-cart" size={64} color="#b0b3c6" />
      <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
      <Text style={styles.emptyStateSubtitle}>
        Add some items to get started
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length === 0 ? (
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
                  <Feather name="plus" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.cartItemsContainer}>
                {cartItems.map(renderCartItem)}
              </View>
            </View>

            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(calculateTotal())}
                </Text>
              </View>
            </View>

            <View style={styles.actionsSection}>
              <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                <Feather name="trash-2" size={18} color="#e03487" />
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
                    <Feather name="x" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <Text style={styles.label}>Item name</Text>
                  <TextInput
                    style={styles.input}
                    value={newItemName}
                    onChangeText={setNewItemName}
                    placeholder="e.g., Cute brown plushie"
                    placeholderTextColor="#b0b3c6"
                    maxLength={50}
                  />

                  <Text style={styles.label}>Value ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={newItemValue}
                    onChangeText={setNewItemValue}
                    placeholder="0.00"
                    placeholderTextColor="#b0b3c6"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setAddItemModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      (!newItemName.trim() || !newItemValue.trim()) &&
                        styles.saveButtonDisabled,
                    ]}
                    onPress={addItemToCart}
                    disabled={!newItemName.trim() || !newItemValue.trim()}
                  >
                    <Text style={styles.saveButtonText}>Add item</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
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
    color: "#b0b3c6",
    letterSpacing: 1,
    textTransform: "uppercase",
    opacity: 0.7,
    fontWeight: "bold",
  },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e03487",
    borderRadius: 16,
    width: 26,
    height: 26,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  cartItemsContainer: {
    marginTop: 16,
    backgroundColor: "#1b1c2e",
    borderRadius: 16,
    overflow: "hidden",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#23243a",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemValue: {
    color: "#e03487",
    fontSize: 18,
    fontWeight: "bold",
  },
  removeButton: {
    padding: 8,
    marginLeft: 12,
  },
  totalSection: {
    backgroundColor: "#1b1c2e",
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    color: "#e03487",
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
    borderColor: "#e03487",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  clearButtonText: {
    color: "#e03487",
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
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: "#b0b3c6",
    fontSize: 16,
    textAlign: "center",
  },
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
    padding: 28,
    alignItems: "center",
    width: "80%",
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
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: "#393a4a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    borderColor: "#b0b3c6",
    marginRight: 8,
    flex: 1
  },
  cancelButtonText: {
    color: "#b0b3c6",
    fontWeight: "bold",
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    flex: 1
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

export default CartScreen;
