"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getCroppedImageDataURL, type CropArea } from "@/lib/image/cropAndCompress";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_IMAGE_LENGTH = 200;

const clamp = (value: number, min: number, max: number) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

type Dimensions = { width: number; height: number };

type LoadedImage = Dimensions & { src: string };

type PhotoUploaderProps = {
  value?: string;
  onChange: (dataUrl: string) => void;
  aspect?: number;
  output?: { width: number; height: number; quality?: number };
  className?: string;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  origin: { x: number; y: number };
};

export default function PhotoUploader({
  value,
  onChange,
  aspect = 4 / 3,
  output = { width: 800, height: 600, quality: 0.9 },
  className,
}: PhotoUploaderProps) {
  const [source, setSource] = useState<LoadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [containerSize, setContainerSize] = useState<Dimensions>({ width: 0, height: 0 });

  const outputConfig = useMemo(() => ({
    width: output.width,
    height: output.height,
    quality: output.quality ?? 0.9,
  }), [output.height, output.quality, output.width]);

  useEffect(() => {
    if (!source) return;
    const element = containerRef.current;
    if (!element) return;

    const updateSize = () => {
      setContainerSize({ width: element.clientWidth, height: element.clientHeight });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [source]);

  const constraints = useMemo(() => {
    if (!source || containerSize.width === 0 || containerSize.height === 0) {
      return null;
    }

    const baseScale = Math.max(
      containerSize.width / source.width,
      containerSize.height / source.height
    );
    const scale = baseScale * zoom;
    const displayWidth = source.width * scale;
    const displayHeight = source.height * scale;
    const maxX = Math.max(0, (displayWidth - containerSize.width) / 2);
    const maxY = Math.max(0, (displayHeight - containerSize.height) / 2);

    return { baseScale, scale, displayWidth, displayHeight, maxX, maxY };
  }, [containerSize.height, containerSize.width, source, zoom]);

  useEffect(() => {
    if (!constraints) return;
    setOffset((prev) => ({
      x: clamp(prev.x, -constraints.maxX, constraints.maxX),
      y: clamp(prev.y, -constraints.maxY, constraints.maxY),
    }));
  }, [constraints]);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください。");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズが大きすぎます（5MB以下を推奨）。");
    }

    const dataUrl = await readFileAsDataUrl(file);
    try {
      const image = await loadImageDimensions(dataUrl);
      if (Math.min(image.width, image.height) < MIN_IMAGE_LENGTH) {
        setError("画像サイズが小さすぎます（200px以上推奨）。");
      }
      setSource({ src: dataUrl, width: image.width, height: image.height });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    } catch {
      setError("画像の読み込みに失敗しました。");
    }
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void handleFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    void handleFile(file);
  };

  const beginDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!constraints) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        origin: { ...offset },
      };
    },
    [constraints, offset]
  );

  const moveDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = dragRef.current;
      if (!state || state.pointerId !== event.pointerId || !constraints) return;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      setOffset({
        x: clamp(state.origin.x + dx, -constraints.maxX, constraints.maxX),
        y: clamp(state.origin.y + dy, -constraints.maxY, constraints.maxY),
      });
    },
    [constraints]
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      dragRef.current = null;
    }
  }, []);

  const handleCrop = async () => {
    if (!source || !constraints || containerSize.width === 0 || containerSize.height === 0) {
      return;
    }

    const visibleLeft = (constraints.displayWidth - containerSize.width) / 2 - offset.x;
    const visibleTop = (constraints.displayHeight - containerSize.height) / 2 - offset.y;
    const baseArea: CropArea = {
      x: visibleLeft / constraints.scale,
      y: visibleTop / constraints.scale,
      width: containerSize.width / constraints.scale,
      height: containerSize.height / constraints.scale,
    };

    const adjustedArea = normalizeCropArea(baseArea, source.width, source.height);
    const dataUrl = await getCroppedImageDataURL(
      source.src,
      adjustedArea,
      outputConfig.width,
      outputConfig.height,
      outputConfig.quality
    );
    onChange(dataUrl);
    setSource(null);
  };

  const handleRemove = () => {
    onChange("");
  };

  const hasValue = Boolean(value && value.trim() !== "");

  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <div className="h-24 w-32 overflow-hidden rounded border bg-slate-50">
          {hasValue ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="プロフィール写真" className="photo-4x3 h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">4:3</div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2" data-hide-on-print>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-1 text-sm text-slate-700">
            <span>画像を選択</span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleSelect} />
          </label>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if ((event.key === "Enter" || event.key === " ") && event.currentTarget instanceof HTMLElement) {
                const input = event.currentTarget.previousElementSibling?.querySelector<HTMLInputElement>("input[type='file']");
                input?.click();
              }
            }}
            className="rounded border px-3 py-1 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="ここに画像ファイルをドラッグ＆ドロップ"
          >
            ここにドラッグ&ドロップ
          </div>
          {hasValue ? (
            <button
              type="button"
              className="rounded border px-3 py-1 text-sm text-slate-700"
              onClick={handleRemove}
            >
              削除
            </button>
          ) : null}
        </div>
        <p className="text-xs text-slate-500" data-hide-on-print>
          ※5MB以下推奨。アップロード後に表示されるプレビューで位置や拡大率を調整できます。
        </p>
        {error ? <p className="text-xs text-red-600" data-hide-on-print>{error}</p> : null}
      </div>

      {source ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" data-hide-on-print>
          <div className="w-full max-w-3xl rounded-lg bg-white p-4 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">画像のトリミング</h2>
            <p className="mt-1 text-sm text-slate-600">ドラッグで位置を調整し、スライダーで拡大・縮小してください。</p>
            <div className="mt-4 flex flex-col gap-4">
              <div
                ref={containerRef}
                className="relative w-full overflow-hidden rounded-lg bg-slate-900/80"
                style={{ aspectRatio: `${aspect}` }}
              >
                {constraints ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={source.src}
                    alt="編集中の画像"
                    draggable={false}
                    className="absolute left-1/2 top-1/2 select-none"
                    style={{
                      width: `${constraints.displayWidth}px`,
                      height: `${constraints.displayHeight}px`,
                      transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                    }}
                  />
                ) : null}
                <div
                  className="absolute inset-0 cursor-grab touch-none"
                  onPointerDown={beginDrag}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onPointerLeave={(event) => {
                    if (dragRef.current?.pointerId === event.pointerId) {
                      endDrag(event);
                    }
                  }}
                  aria-label="トリミング領域"
                  role="presentation"
                />
              </div>
              <label className="flex items-center gap-3">
                <span className="text-sm text-slate-700">拡大率</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="flex-1"
                  aria-label="拡大率"
                />
                <span className="w-12 text-right text-sm text-slate-700">{zoom.toFixed(2)}×</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded border px-4 py-2 text-sm text-slate-700"
                onClick={() => setSource(null)}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                onClick={handleCrop}
              >
                この範囲で切り抜く
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImageDimensions(src: string): Promise<Dimensions> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => reject(new Error("Image load error"));
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

function normalizeCropArea(area: CropArea, imageWidth: number, imageHeight: number): CropArea {
  const width = Math.min(area.width, imageWidth);
  const height = Math.min(area.height, imageHeight);
  const x = clamp(area.x, 0, Math.max(0, imageWidth - width));
  const y = clamp(area.y, 0, Math.max(0, imageHeight - height));
  return { x, y, width, height };
}
