import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export const sendChatMessage = async (
  token: string | null,
  inputText: string
) => {
  if (!token) {
    return;
  }

  const response = await axios.post(
    `${BASE_URL}/chat/ai/send`,
    { message: inputText },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getChatMessages = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/chat/ai/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      "Failed to fetch messages: " + (error.response?.data || error.message)
    );
  }
};

export const deleteAllChatMessages = async (token: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/chat/ai/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      "Failed to delete messages: " + (error.response?.data || error.message)
    );
  }
};
