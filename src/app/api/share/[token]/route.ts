import { NextResponse } from "next/server";
import { z } from "zod";

import { shareDataSchema } from "../route";

export const runtime = "nodejs";

const kvPayloadSchema = z.object({
  data: shareDataSchema,
  exp: z.number(),
});

const getKvConfig = () => {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error("KV configuration is missing");
  }

  return { url, token };
};

const fetchShareData = async (token: string) => {
  const { url, token: authToken } = getKvConfig();

  const response = await fetch(`${url}/get/${token}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load share data");
  }

  const json = await response.json();
  if (typeof json.result !== "string") {
    return null;
  }

  try {
    const parsed = kvPayloadSchema.safeParse(JSON.parse(json.result));

    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  } catch (error) {
    return null;
  }
};

export async function GET(_: Request, context: { params: { token: string } }) {
  try {
    const { token } = context.params;
    if (!token) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const kvData = await fetchShareData(token);

    if (!kvData) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (kvData.exp * 1000 <= Date.now()) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(kvData.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}
