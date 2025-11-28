import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function addItem(token: string, item: string, value: string) {
  const response = await axios.post(
    `${BASE_URL}/cart/add`,
    { item, value },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getItems(token: string) {
  const response = await axios.get(`${BASE_URL}/cart/items`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.items;
}

export async function getCartTotal(token: string) {
  const response = await axios.get(`${BASE_URL}/cart/total`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function clearCart(token: string) {
  const response = await axios.delete(`${BASE_URL}/cart/clear`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function deleteItem(token: string, itemId: string) {
  const response = await axios.delete(`${BASE_URL}/cart/item/${itemId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
