// hooks/usePartnerRequestStatus.ts
import { useState } from "react";
import {
  checkPendingRequest,
  getIncomingRequest,
  cancelPartnerRequest,
  acceptPartnerRequest,
  sendPartnerRequest,
} from "../services/api/profiles/partnerService";

export function usePartnerRequestStatus() {
  const [requestStatus, setRequestStatus] = useState<
    "pending" | "incoming" | "none"
  >("none");
  const [incomingRequestId, setIncomingRequestId] = useState<string | null>(
    null
  );

  const checkRequestStatus = async (token: string | null, userId: string) => {
    if (!token) {
      setRequestStatus("none");
      return;
    }

    try {
      const pendingResponse = await checkPendingRequest(token, userId);

      if (pendingResponse.hasPendingRequest) {
        setRequestStatus("pending");
        return;
      }

      const incomingResponse = await getIncomingRequest(token, userId);

      if (incomingResponse.hasIncomingRequest) {
        setRequestStatus("incoming");
        setIncomingRequestId(incomingResponse.requestId);
        return;
      }

      setRequestStatus("none");
    } catch {
      setRequestStatus("none");
    }
  };

  const cancelRequest = async (token: string | null, userId: string) => {
    if (!token) {
      setRequestStatus("none");
      return;
    }

    await cancelPartnerRequest(token, userId);
    setRequestStatus("none");
  };

  const acceptRequest = async (token: string | null, requestId: string) => {
    if (!token) {
      setRequestStatus("none");
      return;
    }

    await acceptPartnerRequest(token, requestId);
    setRequestStatus("none");
    setIncomingRequestId(null);
  };

  const sendRequest = async (token: string | null, userId: string) => {
    if (!token) {
      setRequestStatus("none");
      return;
    }

    await sendPartnerRequest(token, userId);
    setRequestStatus("pending");
  };

  return {
    requestStatus,
    incomingRequestId,
    checkRequestStatus,
    cancelRequest,
    acceptRequest,
    sendRequest,
  };
}
