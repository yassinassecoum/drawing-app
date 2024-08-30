import React, { useState, useRef, useEffect } from "react";
import { UndoIcon, RedoIcon, Trash2Icon, DownloadIcon } from "lucide-react";

interface DrawingHistory {
  dataURL: string;
  strokeWidth: number;
  color: string;
}

const Drawing: React.FC = () => {
  const [strokeWidth, setStrokeWidth] = useState<number>(8);
  const [color, setColor] = useState<string>("#000000");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<DrawingHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const colors: string[] = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#A52A2A",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, []);

  const getMousePos = (
    canvas: HTMLCanvasElement,
    evt: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const pos = getMousePos(canvas, e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setIsDrawing(true);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const pos = getMousePos(canvas, e);
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = color;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const endDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setIsDrawing(false);
      const newHistory: DrawingHistory = {
        dataURL: canvas.toDataURL(),
        strokeWidth,
        color,
      };
      setHistory([...history.slice(0, historyIndex + 1), newHistory]);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      loadHistoryState(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      loadHistoryState(historyIndex + 1);
    }
  };

  const loadHistoryState = (index: number) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.src = history[index].dataURL;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        setStrokeWidth(history[index].strokeWidth);
        setColor(history[index].color);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHistory([]);
        setHistoryIndex(-1);
      }
    }
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "symptom-drawing.png";
      link.href = dataURL;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-4 max-w-6xl mx-auto mt-6">
      <div className="text-3xl font-bold mb-4">Drawing App</div>
      <div className="flex flex-col md:flex-row w-full">
        <div className="mt-24 flex flex-col justify-between items-center md:items-start md:mr-4 mb-4 md:mb-0">
          {colors.map((c) => (
            <button
              key={c}
              className="w-12 h-12 rounded-full mb-2"
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="flex-grow mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <label htmlFor="strokeWidth" className="mr-2 font-bold">
                Stroke Width:
              </label>
              <input
                type="range"
                id="strokeWidth"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-32 accent-black"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={undo}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center items-center font-medium"
              >
                <UndoIcon className="mr-3" size={20} /> Undo
              </button>
              <button
                onClick={redo}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center items-center font-medium"
              >
                <RedoIcon className="mr-3" size={20} /> Redo
              </button>
              <button
                onClick={clearCanvas}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center items-center font-medium"
              >
                <Trash2Icon className="mr-3" size={20} /> Clear Canvas
              </button>
              <button
                onClick={downloadPNG}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center items-center font-medium"
              >
                <DownloadIcon className="mr-3" size={20} /> Download PNG
              </button>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseOut={endDrawing}
            className="border border-gray-300 w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Drawing;
