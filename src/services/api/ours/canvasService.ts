import axios from "axios";
import { BASE_URL } from "../../../configuration/config";
import { Canvas } from "../../../types/Canvas";

export async function getCanvases(token: string): Promise<Canvas[]> {
  const res = await axios.get(`${BASE_URL}/canvas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.canvases;
}

export async function getCanvas(token: string, canvasId: number): Promise<Canvas> {
  const res = await axios.get(`${BASE_URL}/canvas/${canvasId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.canvas;
}

export async function createCanvas(token: string, title: string): Promise<Canvas> {
  const res = await axios.post(
    `${BASE_URL}/canvas`,
    { title },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.canvas;
}

export async function updateCanvasContent(
  token: string,
  canvasId: number,
  content: string
): Promise<Canvas> {
  const res = await axios.put(
    `${BASE_URL}/canvas/${canvasId}/content`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.canvas;
}

export async function updateCanvasTitle(
  token: string,
  canvasId: number,
  title: string
): Promise<Canvas> {
  const res = await axios.put(
    `${BASE_URL}/canvas/${canvasId}/title`,
    { title },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.canvas;
}

export async function deleteCanvas(token: string, canvasId: number): Promise<void> {
  await axios.delete(`${BASE_URL}/canvas/${canvasId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

