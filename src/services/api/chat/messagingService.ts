import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export interface PartnerMessage {
  id: number;
  text: string;
  senderId: number;
  receiverId: number;
  timestamp: number;
}

export const sendPartnerMessage = async (
  token: string | null,
  message: string
) => {
  if (!token) {
    return;
  }

  const response = await axios.post(
    `${BASE_URL}/partner-messages/send`,
    { message },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getPartnerMessages = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/partner-messages/messages`, {
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

export const deleteAllPartnerMessages = async (token: string) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/partner-messages/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      "Failed to delete messages: " + (error.response?.data || error.message)
    );
  }
};
