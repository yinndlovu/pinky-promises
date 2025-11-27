import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function addItem(token: string, item: string, value: string) {
  const res = await axios.post(
    `${BASE_URL}/cart/add`,
    { item, value },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function getItems(token: string) {
  const res = await axios.get(`${BASE_URL}/cart/items`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.items;
}

export async function getCartTotal(token: string) {
  const res = await axios.get(`${BASE_URL}/cart/total`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

export async function clearCart(token: string) {
  const res = await axios.delete(`${BASE_URL}/cart/clear`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

export async function deleteItem(token: string | null, itemId: string) {
  const res = await axios.delete(`${BASE_URL}/cart/item/delete/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
