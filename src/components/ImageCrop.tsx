"use client";

import { useState, useRef, useEffect } from "react";

type ImageCropProps = {
  userId: string;
  onSave?: (imgUrl: string) => void;
  onCancel: () => void;
};

export default function ImageCrop({ userId, onSave, onCancel }: ImageCropProps) {
  const [loading, setLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [imgPosition, setImgPosition] = useState({ top: 0, left: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 100 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState(100);

  // Unified function for mouse + touch
  const getPoint = (e: any) => {
    if (e.touches) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImgLoad = () => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

    const containerRatio = container.clientWidth / container.clientHeight;
    const imgRatio = img.naturalWidth / img.naturalHeight;

    let w = container.clientWidth;
    let h = container.clientHeight;

    if (imgRatio > containerRatio) {
      h = container.clientWidth / imgRatio;
    } else {
      w = container.clientHeight * imgRatio;
    }

    setDisplaySize({ width: w, height: h });
    setImgPosition({ 
      top: (container.clientHeight - h) / 2, 
      left: (container.clientWidth - w) / 2 
    });

    const size = Math.min(w, h);
    setCrop({
      x: (container.clientWidth - size) / 2,
      y: (container.clientHeight - size) / 2,
      size,
    });
  };

  useEffect(() => {
    const handleResize = () => handleImgLoad();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imgSrc]);

  const startAction = (e: any) => {
    const point = getPoint(e);

    if ((e.target as HTMLElement).classList.contains("resize-handle")) {
      setResizing(true);
      setStart(point);
      setStartSize(crop.size);
    } else {
      setDragging(true);
      setStart({ x: point.x - crop.x, y: point.y - crop.y });
    }
  };

  const moveAction = (e: any) => {
    const point = getPoint(e);

    if (dragging) {
      let newX = point.x - start.x;
      let newY = point.y - start.y;

      const maxX = imgPosition.left + displaySize.width - crop.size;
      const maxY = imgPosition.top + displaySize.height - crop.size;

      newX = Math.max(imgPosition.left, Math.min(newX, maxX));
      newY = Math.max(imgPosition.top, Math.min(newY, maxY));

      setCrop({ ...crop, x: newX, y: newY });
    }

    if (resizing) {
      const delta = Math.max(point.x - start.x, point.y - start.y);
      let newSize = startSize + delta;

      const maxX = imgPosition.left + displaySize.width - crop.x;
      const maxY = imgPosition.top + displaySize.height - crop.y;

      newSize = Math.min(newSize, maxX, maxY);
      newSize = Math.max(newSize, 50);

      setCrop({ ...crop, size: newSize });
    }
  };

  const endAction = () => {
    setDragging(false);
    setResizing(false);
  };

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    if (!canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 100;
    canvas.height = 100;

    const img = imgRef.current;

    const sx = ((crop.x - imgPosition.left) / displaySize.width) * imageSize.width;
    const sy = ((crop.y - imgPosition.top) / displaySize.height) * imageSize.height;
    const sSize = (crop.size / displaySize.width) * imageSize.width;

    ctx.clearRect(0, 0, 100, 100);
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, 100, 100);

    const base64 = canvas.toDataURL("image/jpeg", 0.9);

    try {
      const res = await fetch("/api/settings/uploadImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, userId }),
      });

      const data = await res.json();

      if (data.url) {
        alert("Profile updated successfully.");
        onSave?.(data.url);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 flex items-center justify-center bg-black/20 z-50"
    >
      <div
        className="bg-background p-6 rounded-xl shadow-xl w-11/12 max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upload Profile</h2>
          <button onClick={onCancel} className="text-xl font-bold">×</button>
        </div>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        {imgSrc && (
          <div
            ref={containerRef}
            className="relative mt-4 w-full h-64 overflow-hidden"
            onMouseDown={startAction}
            onMouseMove={moveAction}
            onMouseUp={endAction}
            onMouseLeave={endAction}
            onTouchStart={startAction}
            onTouchMove={moveAction}
            onTouchEnd={endAction}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              draggable={false}
              className="absolute select-none"
              onLoad={handleImgLoad}
              style={{
                width: displaySize.width,
                height: displaySize.height,
                top: imgPosition.top,
                left: imgPosition.left,
              }}
            />

            <div
              className="absolute border-2 border-blue-500"
              style={{
                top: crop.y,
                left: crop.x,
                width: crop.size,
                height: crop.size,
              }}
            >
              <div className="resize-handle absolute w-4 h-4 bg-blue-500 bottom-0 right-0"></div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border-2 border-gray-500 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`px-6 py-2 bg-[#1F1E3D] text-white rounded-xl ${
              loading ? "opacity-70 cursor-wait" : ""
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}