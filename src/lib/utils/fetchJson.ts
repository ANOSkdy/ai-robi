export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const getMessage = (status: number, fallback?: string) => {
  switch (status) {
    case 400:
      return "入力内容をご確認ください。";
    case 502:
      return "AI生成が混み合っています。しばらく待ってから再実行してください。";
    default:
      return fallback ?? "エラーが発生しました。";
  }
};

export async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(input, { ...init, headers });
  } catch (error) {
    throw new ApiError(0, "通信に失敗しました。ネットワークをご確認ください。", error);
  }

  let data: unknown = undefined;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as Record<string, unknown>).error)
        : undefined;
    throw new ApiError(response.status, getMessage(response.status, message), data);
  }

  return data as T;
}
