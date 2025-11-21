"use client";

import { useState, useRef, useEffect } from "react";

type BannerCropProps = {
  userId: string;
  onSave?: (imgUrl: string) => void;
  onCancel: () => void;
};

export default function BannerCrop({ userId, onSave, onCancel }: BannerCropProps) {
  const [loading, setLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [imgPosition, setImgPosition] = useState({ top: 0, left: 0 });

  // 16:9 crop
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 160, height: 90 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startCrop, setStartCrop] = useState({ width: 160, height: 90 });

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
      left: (container.clientWidth - w) / 2,
    });

    // Initialize 16:9 crop centered
    const cropHeight = h * 0.6;
    const cropWidth = cropHeight * (16 / 9);

    setCrop({
      x: (container.clientWidth - cropWidth) / 2,
      y: (container.clientHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    });
  };

  useEffect(() => {
    const resize = () => handleImgLoad();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [imgSrc]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("resize-handle")) {
      setResizing(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      setStartCrop({ width: crop.width, height: crop.height });
    } else {
      setDragging(true);
      setStartPos({ x: e.clientX - crop.x, y: e.clientY - crop.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) {
      let newX = e.clientX - startPos.x;
      let newY = e.clientY - startPos.y;

      const maxX = imgPosition.left + displaySize.width - crop.width;
      const maxY = imgPosition.top + displaySize.height - crop.height;

      if (newX < imgPosition.left) newX = imgPosition.left;
      if (newY < imgPosition.top) newY = imgPosition.top;
      if (newX > maxX) newX = maxX;
      if (newY > maxY) newY = maxY;

      setCrop({ ...crop, x: newX, y: newY });
    }

    if (resizing) {
      const delta = Math.max(e.clientX - startPos.x, e.clientY - startPos.y);

      let newHeight = startCrop.height + delta;
      let newWidth = newHeight * (16 / 9);

      newHeight = Math.max(newHeight, 90);
      newWidth = Math.max(newWidth, 160);

      const maxWidth = imgPosition.left + displaySize.width - crop.x;
      const maxHeight = imgPosition.top + displaySize.height - crop.y;

      if (crop.x + newWidth > imgPosition.left + displaySize.width) {
        newWidth = maxWidth;
        newHeight = newWidth * (9 / 16);
      }
      if (crop.y + newHeight > imgPosition.top + displaySize.height) {
        newHeight = maxHeight;
        newWidth = newHeight * (16 / 9);
      }

      setCrop({ ...crop, width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  useEffect(() => {
    if (!canvasRef.current || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Output resolution
    canvas.width = 1600;
    canvas.height = 900;

    const img = imgRef.current;

    const sx =
      ((crop.x - imgPosition.left) / displaySize.width) * imageSize.width;

    const sy =
      ((crop.y - imgPosition.top) / displaySize.height) * imageSize.height;

    const sWidth = (crop.width / displaySize.width) * imageSize.width;
    const sHeight = (crop.height / displaySize.height) * imageSize.height;

    ctx.clearRect(0, 0, 1600, 900);
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 1600, 900);
  }, [crop, imgSrc, displaySize, imageSize, imgPosition]);

  const handleSave = async () => {
    if(loading) return;
    setLoading(true);
    if (!canvasRef.current) return;

    const base64 = canvasRef.current.toDataURL("image/png"); // no compression

    try {
      const res = await fetch("/api/settings/uploadBanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, userId }),
      });

      const data = await res.json();

      if (data.url) {
        alert("Profile updated successfully");
        onSave?.(data.url);
      }
    } catch (err) {
      console.error("Failed to save image:", err);
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
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upload Banner</h2>
          <button onClick={onCancel} className="text-xl font-bold">
            ×
          </button>
        </div>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        {imgSrc && (
          <div
            ref={containerRef}
            className="relative mt-4 w-full h-64 overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              draggable={false}
              className="absolute select-none"
              style={{
                width: displaySize.width,
                height: displaySize.height,
                top: imgPosition.top,
                left: imgPosition.left,
              }}
              onLoad={handleImgLoad}
            />

            <div
              className="absolute border-2 border-blue-500"
              style={{
                top: crop.y,
                left: crop.x,
                width: crop.width,
                height: crop.height,
              }}
            >
              <div className="resize-handle absolute w-4 h-4 bg-blue-500 bottom-0 right-0 cursor-se-resize"></div>
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
            className={`px-6 py-2 bg-[#1F1E3D] text-white rounded-xl ${loading ? "opacity-70 cursor-wait" : ""}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}