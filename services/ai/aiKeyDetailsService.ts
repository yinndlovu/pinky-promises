import axios from "axios";
import { BASE_URL } from "../../configuration/config";

export async function saveKeyDetail(record: {
  type: string;
  key: string;
  value: string;
  userId: string;
  partnerId: string;
  token: string;
}) {
  const { token, ...data } = record;
  return axios.post(`${BASE_URL}api/ai/record-detail`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchKeyDetails(token: string) {
  const res = await axios.get(`${BASE_URL}api/ai/records`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.records;
}
