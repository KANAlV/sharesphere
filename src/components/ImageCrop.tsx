"use client";

import { useState, useRef, useEffect } from "react";

type ImageCropProps = {
  userId: string;
  onSave?: (imgUrl: string) => void; // optional callback if you want to update UI
  onCancel: () => void;
};

export default function ImageCrop({ userId, onSave, onCancel }: ImageCropProps) {
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
    setImgPosition({ top: (container.clientHeight - h) / 2, left: (container.clientWidth - w) / 2 });

    const size = Math.min(w, h);
    setCrop({ x: (container.clientWidth - size) / 2, y: (container.clientHeight - size) / 2, size });
  };

  useEffect(() => {
    const handleResize = () => handleImgLoad();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imgSrc]);

  useEffect(() => {
    if (!imgRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const img = imgRef.current;
    const sx = ((crop.x - imgPosition.left) / displaySize.width) * imageSize.width;
    const sy = ((crop.y - imgPosition.top) / displaySize.height) * imageSize.height;
    const sSize = (crop.size / displaySize.width) * imageSize.width;

    canvasRef.current.width = 100;
    canvasRef.current.height = 100;

    ctx.clearRect(0, 0, 100, 100);
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, 100, 100);
  }, [crop, imgSrc, displaySize, imageSize, imgPosition]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("resize-handle")) {
      setResizing(true);
      setStart({ x: e.clientX, y: e.clientY });
      setStartSize(crop.size);
    } else {
      setDragging(true);
      setStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) {
      let newX = e.clientX - start.x;
      let newY = e.clientY - start.y;

      const maxX = imgPosition.left + displaySize.width - crop.size;
      const maxY = imgPosition.top + displaySize.height - crop.size;

      if (newX < imgPosition.left) newX = imgPosition.left;
      if (newY < imgPosition.top) newY = imgPosition.top;
      if (newX > maxX) newX = maxX;
      if (newY > maxY) newY = maxY;

      setCrop({ ...crop, x: newX, y: newY });
    } else if (resizing) {
      const delta = Math.max(e.clientX - start.x, e.clientY - start.y);
      let newSize = startSize + delta;

      const maxSizeX = imgPosition.left + displaySize.width - crop.x;
      const maxSizeY = imgPosition.top + displaySize.height - crop.y;
      newSize = Math.min(newSize, maxSizeX, maxSizeY);
      newSize = Math.max(newSize, 50);

      setCrop({ ...crop, size: newSize });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;
    const base64 = canvasRef.current.toDataURL("image/jpeg", 0.9);

    try {
      const res = await fetch("/api/settings/uploadImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, userId }),
      });
      const data = await res.json();

      if (data.url) {
        alert("Profile updated successfully.");
        if (onSave) onSave(data.url); // optional callback
      }
    } catch (err) {
        console.error("Failed to save image:", err);
    }
  };

  return (
    <div onClick={onCancel} className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div
        className="bg-background p-6 rounded-xl shadow-xl w-11/12 max-w-md"
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Crop Image</h2>
          <button onClick={onCancel} className="text-xl font-bold hover:cursor-pointer">×</button>
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
              alt="To crop"
              draggable={false}
              className="absolute select-none"
              style={{ width: displaySize.width, height: displaySize.height, top: imgPosition.top, left: imgPosition.left }}
              onLoad={handleImgLoad}
            />
            <div
              className="absolute border-2 border-blue-500"
              style={{ top: crop.y, left: crop.x, width: crop.size, height: crop.size }}
            >
              <div className="resize-handle absolute w-4 h-4 bg-blue-500 bottom-0 right-0 cursor-se-resize" />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 border-2 border-gray-500 rounded-xl hover:bg-gray-400 hover:cursor-pointer">Cancel</button>
          <button type="button" onClick={handleSave} className="px-6 py-2 bg-[#1F1E3D] text-white rounded-xl hover:cursor-pointer">Save</button>
        </div>
      </div>
    </div>
  );
}