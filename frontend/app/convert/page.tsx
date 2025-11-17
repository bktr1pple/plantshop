"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  PointerEvent,
} from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import {
  Upload,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  SunMedium,
  Download,
  FileText,
  ImageIcon,
  Crop,
  Layers,
  X,
  LayoutTemplate,
} from "lucide-react";
import { jsPDF } from "jspdf";

type BinarizationMode = "soft" | "hard";

interface LayerTransform {
  scale: number; // относительный масштаб
  offsetX: number; // смещение по A4 в px
  offsetY: number;
  rotation: number; // градусы
  cropTop: number; // 0..0.5
  cropBottom: number;
  cropLeft: number;
  cropRight: number;
}

// Перспективная / свободная обрезка — 4 точки (0..1 относительно изображения)
interface PerspectiveQuad {
  tl: { x: number; y: number };
  tr: { x: number; y: number };
  br: { x: number; y: number };
  bl: { x: number; y: number };
}

interface ImageLayer {
  id: string;
  src: string;
  width: number;
  height: number;
  transform: LayerTransform;
  // 🔥 Новое: произвольная обрезка по 4 точкам в координатах изображения (0..1)
  perspectiveCrop?: PerspectiveQuad | null;
}

interface Page {
  id: string;
  layers: ImageLayer[];
}

interface FilterPreset {
  id: string;
  name: string;
  settings: {
    brightness: number;
    contrast: number;
    mode: BinarizationMode;
    threshold: number;
    invertColors: boolean;
  };
}

// ОДИН КАНОНИЧЕСКИЙ РАЗМЕР A4 ДЛЯ ВСЕГО (превью + экспорт)
const A4_WIDTH_PX = 2480;
const A4_HEIGHT_PX = 3508;

const DEFAULT_TRANSFORM: LayerTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  cropTop: 0,
  cropBottom: 0,
  cropLeft: 0,
  cropRight: 0,
};

const BUILTIN_FILTER_PRESETS: FilterPreset[] = [
  {
    id: "default",
    name: "За замовчуванням",
    settings: {
      brightness: 0,
      contrast: 20,
      mode: "hard",
      threshold: 180,
      invertColors: false,
    },
  },
  {
    id: "soft-scan",
    name: "Мʼякий скан",
    settings: {
      brightness: 5,
      contrast: 10,
      mode: "soft",
      threshold: 170,
      invertColors: false,
    },
  },
  {
    id: "hard-scan",
    name: "Сканер (контрастний)",
    settings: {
      brightness: 0,
      contrast: 45,
      mode: "hard",
      threshold: 185,
      invertColors: false,
    },
  },
  {
    id: "lntu-print",
    name: "LNTU print",
    settings: {
      brightness: 8,
      contrast: 55,
      mode: "hard",
      threshold: 175,
      invertColors: false,
    },
  },
];

type AddMode = "new-pages" | "current-page";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")}_${String(
    now.getHours(),
  ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function ConvertPage() {
  // ---------- страницы и слои ----------
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    null,
  );

  // Карта layer.id -> HTMLImageElement
  const imageElementsRef = useRef<Record<string, HTMLImageElement>>({});

  // ---------- глобальные фильтры ----------
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(20);
  const [mode, setMode] = useState<BinarizationMode>("hard");
  const [threshold, setThreshold] = useState(180);
  const [invertColors, setInvertColors] = useState(false);

  // пресеты фильтров
  const [customPresets, setCustomPresets] = useState<FilterPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>("default");

  // ---------- upload режим ----------
  const [addMode, setAddMode] = useState<AddMode>("new-pages");

  // ---------- локальное управление трансформом выбранного слоя ----------
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const draggingRef = useRef(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // чтобы удобнее читать — геттеры
  const currentPage: Page | null =
    pages.length > 0 ? pages[currentPageIndex] ?? pages[0] ?? null : null;

  const selectedLayer: ImageLayer | null = useMemo(() => {
    if (!currentPage) return null;
    if (!selectedLayerId && currentPage.layers[0]) {
      return currentPage.layers[0];
    }
    return (
      currentPage.layers.find((l) => l.id === selectedLayerId) ??
      currentPage.layers[0] ??
      null
    );
  }, [currentPage, selectedLayerId]);

  // При смене страницы — авто-select первого слоя
  useEffect(() => {
    if (!currentPage) {
      setSelectedLayerId(null);
      return;
    }
    if (
      !selectedLayerId ||
      !currentPage.layers.some((l) => l.id === selectedLayerId)
    ) {
      setSelectedLayerId(currentPage.layers[0]?.id ?? null);
    }
  }, [currentPage, selectedLayerId]);

  // ---------- загрузка кастомных пресетов ----------
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("scanFilterPresets");
      if (!raw) return;
      const parsed = JSON.parse(raw) as FilterPreset[];
      setCustomPresets(parsed);
    } catch {
      // ignore
    }
  }, []);

  const saveCustomPresets = (presets: FilterPreset[]) => {
    setCustomPresets(presets);
    if (typeof window !== "undefined") {
      localStorage.setItem("scanFilterPresets", JSON.stringify(presets));
    }
  };

  // применить пресет
  const applyFilterPreset = (preset: FilterPreset) => {
    setBrightness(preset.settings.brightness);
    setContrast(preset.settings.contrast);
    setMode(preset.settings.mode);
    setThreshold(preset.settings.threshold);
    setInvertColors(preset.settings.invertColors);
    setActivePresetId(preset.id);
  };

  // ---------- загрузка файлов ----------
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const loadedLayers: ImageLayer[] = [];

    await Promise.all(
      files.map(
        (file) =>
          new Promise<void>((resolve) => {
            if (!file.type.startsWith("image/")) return resolve();
            const reader = new FileReader();
            reader.onload = () => {
              const src = reader.result as string;
              const img = new Image();
              img.onload = () => {
                const id = createId();
                imageElementsRef.current[id] = img;

                const baseTransform: LayerTransform = {
                  ...DEFAULT_TRANSFORM,
                };

                loadedLayers.push({
                  id,
                  src,
                  width: img.width,
                  height: img.height,
                  transform: baseTransform,
                });

                resolve();
              };
              img.src = src;
            };
            reader.readAsDataURL(file);
          }),
      ),
    );

    if (!loadedLayers.length) return;

    setPages((prev) => {
      let updatedPages: Page[] = [...prev];

      if (addMode === "new-pages" || !prev.length) {
        // каждый файл = новая страница
        const newPagesFromLayers = loadedLayers.map((layer) => {
          const pageId = createId();
          // инициализируем трансформ под A4
          const fittedLayer = fitLayerToA4(layer, prev.length === 0);
          return {
            id: pageId,
            layers: [fittedLayer],
          };
        });
        updatedPages = [...prev, ...newPagesFromLayers];
        if (!prev.length) {
          setCurrentPageIndex(0);
          setSelectedLayerId(newPagesFromLayers[0]?.layers[0]?.id ?? null);
        }
      } else {
        // addMode === "current-page" — загружаем как слои на текущую страницу
        if (!currentPage && prev.length === 0) {
          // если страниц ещё нет — создаём одну
          const first = loadedLayers[0];
          const pageId = createId();
          const fittedFirst = fitLayerToA4(first, true);
          updatedPages = [
            {
              id: pageId,
              layers: [fittedFirst],
            },
          ];
          if (loadedLayers.length > 1) {
            // остальные — как доп. слои на эту же страницу, поменьше
            const page0 = updatedPages[0];
            for (let i = 1; i < loadedLayers.length; i++) {
              const fitted = fitLayerToA4(loadedLayers[i], false);
              page0.layers.push(fitted);
            }
          }
          setCurrentPageIndex(0);
          setSelectedLayerId(updatedPages[0].layers[0].id);
        } else if (currentPage) {
          const idx = updatedPages.findIndex(
            (p) => p.id === currentPage.id,
          );
          if (idx >= 0) {
            const page = { ...updatedPages[idx] };
            const newLayers = loadedLayers.map((layer, i) =>
              fitLayerToA4(layer, i === 0 && page.layers.length === 0),
            );
            page.layers = [...page.layers, ...newLayers];
            updatedPages[idx] = page;
            setSelectedLayerId(
              newLayers[newLayers.length - 1]?.id ??
                page.layers[0]?.id ??
                null,
            );
          }
        }
      }

      return updatedPages;
    });

    // очистим input, чтобы можно было повторно выбрать те же файлы
    e.target.value = "";
  };

  // подогнать слой под A4 (первый и дополнительные — по-разному)
  const fitLayerToA4 = (layer: ImageLayer, isMain: boolean): ImageLayer => {
    const { width, height } = layer;
    const fitRatio = Math.min(
      (A4_WIDTH_PX * (isMain ? 0.9 : 0.45)) / width,
      (A4_HEIGHT_PX * (isMain ? 0.9 : 0.45)) / height,
    );
    const transform: LayerTransform = {
      ...DEFAULT_TRANSFORM,
      scale: fitRatio,
      offsetX: isMain ? 0 : (Math.random() - 0.5) * (A4_WIDTH_PX * 0.2),
      offsetY: isMain ? 0 : (Math.random() - 0.5) * (A4_HEIGHT_PX * 0.2),
    };
    return {
      ...layer,
      transform,
    };
  };

  // ---------- построение страницы на канве ----------
  const buildProcessedCanvasForPage = useCallback(
    (page: Page, outW: number, outH: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // белый фон
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);

      // нарисуем все слои (в координатах одного и того же A4)
      for (const layer of page.layers) {
        const img = imageElementsRef.current[layer.id];
        if (!img) continue;

        const t = layer.transform;
        const cropTop = clamp(t.cropTop, 0, 0.5);
        const cropBottom = clamp(t.cropBottom, 0, 0.5);
        const cropLeft = clamp(t.cropLeft, 0, 0.5);
        const cropRight = clamp(t.cropRight, 0, 0.5);

        const srcX = cropLeft * img.width;
        const srcY = cropTop * img.height;
        const srcW = Math.max(10, img.width * (1 - cropLeft - cropRight));
        const srcH = Math.max(10, img.height * (1 - cropTop - cropBottom));

        const destW = srcW * t.scale;
        const destH = srcH * t.scale;

        const centerX = outW / 2 + t.offsetX;
        const centerY = outH / 2 + t.offsetY;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((t.rotation * Math.PI) / 180);

        // 🔥 Если есть свободная обрезка по 4 точкам — делаем clip по многоугольнику
        const quad = layer.perspectiveCrop;
        if (quad) {
          const mapPoint = (p: { x: number; y: number }) => {
            const imgX = p.x * img.width;
            const imgY = p.y * img.height;

            const nx = (imgX - srcX) / srcW; // 0..1 внутри текущего srcRect
            const ny = (imgY - srcY) / srcH;

            const dx = (nx - 0.5) * destW;
            const dy = (ny - 0.5) * destH;

            return { dx, dy };
          };

          const pts = [quad.tl, quad.tr, quad.br, quad.bl].map(mapPoint);

          ctx.beginPath();
          ctx.moveTo(pts[0].dx, pts[0].dy);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].dx, pts[i].dy);
          }
          ctx.closePath();
          ctx.clip();
        }

        ctx.drawImage(
          img,
          srcX,
          srcY,
          srcW,
          srcH,
          -destW / 2,
          -destH / 2,
          destW,
          destH,
        );
        ctx.restore();
      }

      // применим ч/б фильтр ко всей странице
      const imageData = ctx.getImageData(0, 0, outW, outH);
      const data = imageData.data;

      const b = brightness;
      const c = contrast;
      const brightnessOffset = (b / 100) * 255;
      const contrastFactor =
        (259 * (c + 255)) / (255 * (259 - c || 1));
      const th = threshold;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const bl = data[i + 2];

        let gray = 0.299 * r + 0.587 * g + 0.114 * bl;
        gray = gray + brightnessOffset;
        gray = contrastFactor * (gray - 128) + 128;

        if (mode === "hard") {
          gray = gray >= th ? 255 : 0;
        } else {
          gray = Math.max(0, Math.min(255, gray));
        }

        let v = Math.max(0, Math.min(255, gray));
        if (invertColors) {
          v = 255 - v;
        }

        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      }

      ctx.putImageData(imageData, 0, 0);

      return canvas;
    },
    [brightness, contrast, mode, threshold, invertColors],
  );

  // ---------- превью A4 ----------
  const renderPreview = useCallback(() => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas || !currentPage) return;

    setIsRendering(true);
    const processed = buildProcessedCanvasForPage(
      currentPage,
      A4_WIDTH_PX,
      A4_HEIGHT_PX,
    );
    if (!processed) {
      setIsRendering(false);
      return;
    }

    previewCanvas.width = A4_WIDTH_PX;
    previewCanvas.height = A4_HEIGHT_PX;
    const ctx = previewCanvas.getContext("2d");
    if (!ctx) {
      setIsRendering(false);
      return;
    }

    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    ctx.drawImage(processed, 0, 0);
    setIsRendering(false);
  }, [currentPage, buildProcessedCanvasForPage]);

  useEffect(() => {
    if (!currentPage) return;
    renderPreview();
  }, [
    currentPage,
    pages,
    renderPreview,
    brightness,
    contrast,
    mode,
    threshold,
    invertColors,
  ]);

  // ---------- drag страницы (перемещение активного слоя) ----------
  const handlePreviewPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!selectedLayer || !currentPage) return;
    draggingRef.current = true;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      offsetX: selectedLayer.transform.offsetX,
      offsetY: selectedLayer.transform.offsetY,
    };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePreviewPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (
      !draggingRef.current ||
      !dragStartRef.current ||
      !selectedLayer ||
      !currentPage
    )
      return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const dx = currentX - dragStartRef.current.x;
    const dy = currentY - dragStartRef.current.y;

    const newOffsetX = dragStartRef.current.offsetX + dx;
    const newOffsetY = dragStartRef.current.offsetY + dy;

    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPage.id
          ? {
              ...p,
              layers: p.layers.map((l) =>
                l.id === selectedLayer.id
                  ? {
                      ...l,
                      transform: {
                        ...l.transform,
                        offsetX: newOffsetX,
                        offsetY: newOffsetY,
                      },
                    }
                  : l,
              ),
            }
          : p,
      ),
    );
  };

  const handlePreviewPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    dragStartRef.current = null;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  // ---------- zoom / reset selected layer ----------
  const updateSelectedLayerTransform = (
    patch: Partial<LayerTransform>,
  ) => {
    if (!selectedLayer || !currentPage) return;
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPage.id
          ? {
              ...p,
              layers: p.layers.map((l) =>
                l.id === selectedLayer.id
                  ? {
                      ...l,
                      transform: {
                        ...l.transform,
                        ...patch,
                      },
                    }
                  : l,
              ),
            }
          : p,
      ),
    );
  };

  const handleZoomIn = () => {
    if (!selectedLayer) return;
    const nextScale = Math.min(
      selectedLayer.transform.scale + 0.1,
      4,
    );
    updateSelectedLayerTransform({ scale: nextScale });
  };

  const handleZoomOut = () => {
    if (!selectedLayer) return;
    const nextScale = Math.max(
      selectedLayer.transform.scale - 0.1,
      0.2,
    );
    updateSelectedLayerTransform({ scale: nextScale });
  };

  const handleResetLayerPosition = () => {
    if (!selectedLayer || !currentPage) return;
    const img = imageElementsRef.current[selectedLayer.id];
    if (!img) return;

    const isMain =
      currentPage.layers.length === 1 ||
      currentPage.layers[0].id === selectedLayer.id;
    const fitted = fitLayerToA4(
      {
        ...selectedLayer,
        width: img.width,
        height: img.height,
      },
      isMain,
    );
    // при сбросе позиции заодно убираем свободную обрезку
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPage.id
          ? {
              ...p,
              layers: p.layers.map((l) =>
                l.id === selectedLayer.id
                  ? {
                      ...l,
                      transform: fitted.transform,
                      perspectiveCrop: null,
                    }
                  : l,
              ),
            }
          : p,
      ),
    );
  };

  // ---------- сброс фильтров ----------
  const handleResetFilters = () => {
    const preset = BUILTIN_FILTER_PRESETS.find(
      (p) => p.id === "default",
    );
    if (preset) applyFilterPreset(preset);
  };

  // ---------- управление страницами и слоями ----------
  const handleRemovePage = (pageId: string) => {
    setPages((prev) => {
      if (prev.length <= 1) {
        setSelectedLayerId(null);
        setCurrentPageIndex(0);
        return [];
      }
      const idx = prev.findIndex((p) => p.id === pageId);
      const updated = prev.filter((p) => p.id !== pageId);
      let newIndex = currentPageIndex;
      if (idx === currentPageIndex) {
        newIndex = Math.min(updated.length - 1, currentPageIndex);
      } else if (idx < currentPageIndex) {
        newIndex = Math.max(0, currentPageIndex - 1);
      }
      setCurrentPageIndex(newIndex);
      const newPage = updated[newIndex];
      setSelectedLayerId(newPage?.layers[0]?.id ?? null);
      return updated;
    });
  };

  const handleRemoveLayer = (layerId: string) => {
    if (!currentPage) return;
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPage.id
          ? {
              ...p,
              layers: p.layers.filter((l) => l.id !== layerId),
            }
          : p,
      ),
    );
    // обновим выбранный слой
    const page = pages.find((p) => p.id === currentPage.id);
    if (page) {
      const remaining = page.layers.filter((l) => l.id !== layerId);
      setSelectedLayerId(remaining[0]?.id ?? null);
    }
  };

  // ---------- скачивание PNG / PDF ----------
  const handleDownloadPng = () => {
    if (!currentPage) return;
    const canvas = buildProcessedCanvasForPage(
      currentPage,
      A4_WIDTH_PX,
      A4_HEIGHT_PX,
    );
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `scan_page_${currentPageIndex + 1}_${createTimestamp()}.png`;
    a.click();
  };

  const handleDownloadPdf = () => {
    if (!pages.length) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    pages.forEach((page, idx) => {
      if (idx > 0) pdf.addPage();
      const canvas = buildProcessedCanvasForPage(
        page,
        A4_WIDTH_PX,
        A4_HEIGHT_PX,
      );
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    });

    pdf.save(`scan_${createTimestamp()}.pdf`);
  };

  // ---------- пресеты страницы (паспорт / квитанция) ----------
  const applyPagePresetPassport = () => {
    if (!currentPage) return;
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== currentPage.id) return p;
        if (!p.layers.length) return p;

        const firstTwo = p.layers.slice(0, 2);
        const rest = p.layers.slice(2);

        const updatedFirstTwo = firstTwo.map((layer, index) => {
          const img = imageElementsRef.current[layer.id];
          const baseScaleImg = img ?? { width: layer.width, height: layer.height };
          const fitRatio = Math.min(
            (A4_WIDTH_PX * 0.4) / baseScaleImg.width,
            (A4_HEIGHT_PX * 0.8) / baseScaleImg.height,
          );
          const offsetX =
            index === 0 ? -A4_WIDTH_PX * 0.25 : A4_WIDTH_PX * 0.25;
          const offsetY = 0;

          return {
            ...layer,
            transform: {
              ...layer.transform,
              scale: fitRatio,
              offsetX,
              offsetY,
            },
          };
        });

        return {
          ...p,
          layers: [...updatedFirstTwo, ...rest],
        };
      }),
    );
  };

  const applyPagePresetReceipt = () => {
    if (!currentPage) return;
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== currentPage.id) return p;
        if (!p.layers.length) return p;

        const main = p.layers[0];
        const img = imageElementsRef.current[main.id];
        const base = img ?? { width: main.width, height: main.height };

        const fitRatio = Math.min(
          (A4_WIDTH_PX * 0.8) / base.width,
          (A4_HEIGHT_PX * 0.7) / base.height,
        );

        const updatedMain: ImageLayer = {
          ...main,
          transform: {
            ...main.transform,
            scale: fitRatio,
            offsetX: 0,
            offsetY: -A4_HEIGHT_PX * 0.05,
            rotation: 0,
          },
        };

        // остальные слои сделаем поменьше и внизу справа
        const rest = p.layers.slice(1).map((layer, i) => {
          const img2 = imageElementsRef.current[layer.id];
          const base2 = img2 ?? {
            width: layer.width,
            height: layer.height,
          };
          const ratio = Math.min(
            (A4_WIDTH_PX * 0.3) / base2.width,
            (A4_HEIGHT_PX * 0.2) / base2.height,
          );
          return {
            ...layer,
            transform: {
              ...layer.transform,
              scale: ratio,
              offsetX: A4_WIDTH_PX * 0.3,
              offsetY: A4_HEIGHT_PX * 0.3 + i * 40,
            },
          };
        });

        return { ...p, layers: [updatedMain, ...rest] };
      }),
    );
  };

  // ---------- пресеты фильтров (кастомные) ----------
  const handleSaveCustomPreset = () => {
    const name = window.prompt(
      "Назва для нового пресету (наприклад, «Мій скан»):",
      "Мій скан",
    );
    if (!name) return;

    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      settings: {
        brightness,
        contrast,
        mode,
        threshold,
        invertColors,
      },
    };

    const newList = [...customPresets, newPreset];
    saveCustomPresets(newList);
    setActivePresetId(newPreset.id);
  };

  const handleDeleteCustomPreset = (id: string) => {
    const newList = customPresets.filter((p) => p.id !== id);
    saveCustomPresets(newList);
    if (activePresetId === id) {
      setActivePresetId("default");
      const preset = BUILTIN_FILTER_PRESETS.find(
        (p) => p.id === "default",
      );
      if (preset) applyFilterPreset(preset);
    }
  };

  // ---------- свободная обрезка по 4 точкам ----------
  const [isPerspectiveOpen, setIsPerspectiveOpen] = useState(false);
  const [perspectiveQuad, setPerspectiveQuad] =
    useState<PerspectiveQuad | null>(null);
  const perspectiveWrapperRef = useRef<HTMLDivElement | null>(null);
  const [dragHandle, setDragHandle] = useState<
    keyof PerspectiveQuad | null
  >(null);

  const openPerspective = () => {
    if (!selectedLayer) return;
    setIsPerspectiveOpen(true);

    // если уже есть ранее сохранённая обрезка — подставим её
    if (selectedLayer.perspectiveCrop) {
      setPerspectiveQuad(selectedLayer.perspectiveCrop);
      return;
    }

    // дефолтный четырёхугольник в центре кадра
    setPerspectiveQuad({
      tl: { x: 0.15, y: 0.15 },
      tr: { x: 0.85, y: 0.16 },
      br: { x: 0.86, y: 0.85 },
      bl: { x: 0.14, y: 0.84 },
    });
  };

  const closePerspective = () => {
    setIsPerspectiveOpen(false);
    setDragHandle(null);
  };

  // ESC для закрытия модалки
  useEffect(() => {
    if (!isPerspectiveOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePerspective();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPerspectiveOpen]);

  const handlePerspectivePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    handle: keyof PerspectiveQuad,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDragHandle(handle);
  };

  const handlePerspectivePointerMove = (
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!dragHandle || !perspectiveQuad || !isPerspectiveOpen) return;
    const wrapper = perspectiveWrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setPerspectiveQuad((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [dragHandle]: {
          x: clamp(x, 0, 1),
          y: clamp(y, 0, 1),
        },
      };
    });
  };

  const handlePerspectivePointerUp = () => {
    setDragHandle(null);
  };

  // 🔥 Применяем свободную обрезку: просто сохраняем 4 точки в слой, без деформации изображения
  const applyPerspectiveCropForSelectedLayer = () => {
    if (!selectedLayer || !perspectiveQuad || !currentPage) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPage.id
          ? {
              ...p,
              layers: p.layers.map((l) =>
                l.id === selectedLayer.id
                  ? {
                      ...l,
                      perspectiveCrop: perspectiveQuad,
                    }
                  : l,
              ),
            }
          : p,
      ),
    );
    closePerspective();
  };

  // ---------- UI ----------
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950/20 text-gray-900 dark:text-gray-100">
        <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-24">
          {/* Header */}
          <header className="flex flex-col gap-3 sm:gap-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/40 dark:text-emerald-200"
            >
              <FileText className="h-3.5 w-3.5" />
              Віртуальний сканер A4 • multi-page & multi-layer
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
              className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            >
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                  Конвертація фото в чорно-білий «скан» з кількома
                  зображеннями на сторінці
                </h1>
                <p className="max-w-2xl text-sm text-gray-600 sm:text-base dark:text-gray-300">
                  Завантажуйте фото, викладайте кілька зображень на один
                  аркуш, обрізайте фон прямокутником або по контурі і
                  зберігайте як PDF або PNG для друку.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <ImageIcon className="h-4 w-4" />
                <span>
                  Найкраще працює з рівним освітленням та мінімальними тінями
                </span>
              </div>
            </m.div>
          </header>

          {/* Основной блок */}
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
            {/* Левая панель */}
            <m.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
              className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/90"
            >
              {/* 1. Загрузка + режим добавления */}
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    1. Завантаження фото документів
                  </h2>
                  <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <Layers className="h-3 w-3" />
                    <span>Підтримка декількох зображень на сторінці</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Режим додавання файлів:</span>
                  <label className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
                    <input
                      type="radio"
                      name="addMode"
                      value="new-pages"
                      checked={addMode === "new-pages"}
                      onChange={() => setAddMode("new-pages")}
                      className="h-3 w-3 accent-emerald-500"
                    />
                    <span>Кожен файл → окрема сторінка</span>
                  </label>
                  <label className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
                    <input
                      type="radio"
                      name="addMode"
                      value="current-page"
                      checked={addMode === "current-page"}
                      onChange={() => setAddMode("current-page")}
                      className="h-3 w-3 accent-emerald-500"
                    />
                    <span>Нові файли → на поточну сторінку як шари</span>
                  </label>
                </div>

                <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/70 px-4 py-6 text-center text-gray-600 transition hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/30">
                  <Upload className="h-7 w-7 text-emerald-500 group-hover:scale-105 transition-transform" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      Оберіть одне або кілька зображень
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      JPEG, PNG • можна додавати сторінки чи шари по черзі
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 2. Список страниц и слоев */}
              {pages.length > 0 && (
                <div className="space-y-3 border-t border-dashed border-gray-200 pt-3 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                      Cторінки документу
                    </h2>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {pages.length} сторінок
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pages.map((page, idx) => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => setCurrentPageIndex(idx)}
                        className={`group inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${
                          idx === currentPageIndex
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-400 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-emerald-400 dark:hover:text-emerald-200"
                        }`}
                      >
                        <span>Стор. {idx + 1}</span>
                        <span className="text-[10px] text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400">
                          {page.layers.length} шар(и)
                        </span>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleRemovePage(page.id);
                          }}
                          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-black/5 text-gray-400 hover:bg-black/10 hover:text-gray-700 dark:bg-white/5 dark:text-gray-500 dark:hover:bg-white/10 dark:hover:text-gray-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </button>
                    ))}
                  </div>

                  {currentPage && (
                    <div className="space-y-2 rounded-xl bg-gray-50/70 p-3 text-xs text-gray-700 dark:bg-gray-900/80 dark:text-gray-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          <Layers className="h-3 w-3" />
                          Шари на сторінці {currentPageIndex + 1}
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {currentPage.layers.length} активн.
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {currentPage.layers.map((layer, idx) => (
                          <button
                            key={layer.id}
                            type="button"
                            onClick={() => setSelectedLayerId(layer.id)}
                            className={`group inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${
                              selectedLayer?.id === layer.id
                                ? "border-emerald-500 bg-white text-emerald-700 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200"
                                : "border-gray-200 bg-white/80 text-gray-700 hover:border-emerald-400 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-emerald-400 dark:hover:text-emerald-200"
                            }`}
                          >
                            <span className="font-medium">
                              Шар {idx + 1}
                            </span>
                            <span className="text-[10px] text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400">
                              {layer.width}×{layer.height}
                            </span>
                            {layer.perspectiveCrop && (
                              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
                                4-точ. обрізка
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                handleRemoveLayer(layer.id);
                              }}
                              className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-black/5 text-gray-400 hover:bg-black/10 hover:text-gray-700 dark:bg-white/5 dark:text-gray-500 dark:hover:bg-white/10 dark:hover:text-gray-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Позиционирование активного слоя */}
              <div className="space-y-3 border-t border-dashed border-gray-200 pt-3 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  2. Позиціонування вибраного шару на A4
                </h2>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Оберіть шар вище та перетягуйте його прямо в превʼю A4. Тут
                  можна підлаштувати масштаб, положення та «вирівнювання».
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={!selectedLayer}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                    Менше
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={!selectedLayer}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                    Більше
                  </button>
                  <button
                    type="button"
                    onClick={handleResetLayerPosition}
                    disabled={!selectedLayer}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Скинути позицію & 4-точ. обрізку
                  </button>
                  <div className="ml-auto inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <Move className="h-3 w-3" />
                    Перетягуйте в превʼю для зміщення
                  </div>
                </div>

                {/* масштаб */}
                <div className="flex items-center gap-3">
                  <span className="w-14 text-[11px] text-gray-500 dark:text-gray-400">
                    Масштаб
                  </span>
                  <input
                    type="range"
                    min={0.2}
                    max={3}
                    step={0.05}
                    disabled={!selectedLayer}
                    value={selectedLayer?.transform.scale ?? 1}
                    onChange={(e) =>
                      updateSelectedLayerTransform({
                        scale: parseFloat(e.target.value),
                      })
                    }
                    className="h-1 w-full cursor-pointer rounded-full bg-gray-200 accent-emerald-500 dark:bg-gray-700"
                  />
                  <span className="w-10 text-right text-[11px] text-gray-500 dark:text-gray-400">
                    {selectedLayer
                      ? (selectedLayer.transform.scale * 100).toFixed(0)
                      : "100"}
                    %
                  </span>
                </div>

                {/* поворот */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Поворот (вирівнювання)
                    </span>
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        disabled={!selectedLayer}
                        onClick={() =>
                          updateSelectedLayerTransform({
                            rotation: clamp(
                              (selectedLayer?.transform.rotation ?? 0) - 1,
                              -25,
                              25,
                            ),
                          })
                        }
                        className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        −1°
                      </button>
                      <button
                        type="button"
                        disabled={!selectedLayer}
                        onClick={() =>
                          updateSelectedLayerTransform({
                            rotation: clamp(
                              (selectedLayer?.transform.rotation ?? 0) + 1,
                              -25,
                              25,
                            ),
                          })
                        }
                        className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        +1°
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-20 text-[11px] text-gray-500 dark:text-gray-400">
                      Кут
                    </span>
                    <input
                      type="range"
                      min={-25}
                      max={25}
                      step={0.5}
                      disabled={!selectedLayer}
                      value={selectedLayer?.transform.rotation ?? 0}
                      onChange={(e) =>
                        updateSelectedLayerTransform({
                          rotation: Number(e.target.value),
                        })
                      }
                      className="h-1 w-full cursor-pointer rounded-full bg-gray-200 accent-emerald-500 dark:bg-gray-700"
                    />
                    <span className="w-10 text-right text-[11px] text-gray-500 dark:text-gray-400">
                      {selectedLayer?.transform.rotation.toFixed(1) ??
                        "0.0"}
                      °
                    </span>
                  </div>
                </div>

                {/* обрезка по сторонам */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Обрізка фону (простий режим)
                    </span>
                    <button
                      type="button"
                      disabled={!selectedLayer}
                      onClick={() =>
                        updateSelectedLayerTransform({
                          cropTop: 0,
                          cropBottom: 0,
                          cropLeft: 0,
                          cropRight: 0,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Скинути обрізку
                    </button>
                  </div>

                  {["top", "bottom", "left", "right"].map((side) => {
                    const labelMap: Record<string, string> = {
                      top: "Зверху",
                      bottom: "Знизу",
                      left: "Зліва",
                      right: "Справа",
                    };
                    const key =
                      side === "top"
                        ? "cropTop"
                        : side === "bottom"
                        ? "cropBottom"
                        : side === "left"
                        ? "cropLeft"
                        : "cropRight";
                    const value =
                      (selectedLayer?.transform as any)?.[key] ?? 0;
                    return (
                      <div
                        key={side}
                        className="flex items-center gap-3"
                      >
                        <span className="w-20 text-[11px] text-gray-500 dark:text-gray-400">
                          Обрізати {labelMap[side]}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={40}
                          step={1}
                          disabled={!selectedLayer}
                          value={value * 100}
                          onChange={(e) =>
                            updateSelectedLayerTransform({
                              [key]:
                                Number(e.target.value) / 100,
                            } as any)
                          }
                          className="h-1 w-full cursor-pointer rounded-full bg-gray-200 accent-emerald-500 dark:bg-gray-700"
                        />
                        <span className="w-10 text-right text-[11px] text-gray-500 dark:text-gray-400">
                          {(value * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* кнопка свободной обрезки по точкам */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!selectedLayer}
                    onClick={openPerspective}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-100 dark:hover:bg-emerald-900/70"
                  >
                    <Crop className="h-3.5 w-3.5" />
                    Вільна обрізка (4 точки)
                  </button>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Обрізка як ползунками, але по довільному контуру в
                    перспективі.
                  </span>
                </div>
              </div>

              {/* 4. Пресеты страницы */}
              <div className="space-y-3 border-t border-dashed border-gray-200 pt-3 dark:border-gray-800">
                <div className="flex items-center justify между gap-2">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    3. Макет сторінки (пресети)
                  </h2>
                  <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <LayoutTemplate className="h-3 w-3" />
                    Швидке розташування шарів
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!currentPage || currentPage.layers.length === 0}
                    onClick={applyPagePresetPassport}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Пресет «Паспорт» (2 фото на сторінці)
                  </button>
                  <button
                    type="button"
                    disabled={!currentPage || currentPage.layers.length === 0}
                    onClick={applyPagePresetReceipt}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Пресет «Квитанція»
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  «Паспорт» розкладає два шари поруч, «Квитанція» робить один
                  шар великим, а додаткові — меншими внизу.
                </p>
              </div>

              {/* 5. Фильтры */}
              <div className="space-y-3 border-t border-dashed border-gray-200 pt-3 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  4. Чорно-білий режим & пресети фільтрів
                </h2>

                {/* выбор пресета */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <SunMedium className="h-3 w-3" />
                    Готові профілі (в т.ч. «LNTU print»)
                  </div>

                  <select
                    value={activePresetId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setActivePresetId(id);
                      const preset =
                        BUILTIN_FILTER_PRESETS.find(
                          (p) => p.id === id,
                        ) ||
                        customPresets.find((p) => p.id === id);
                      if (preset) applyFilterPreset(preset);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  >
                    <optgroup label="Стандартні">
                      {BUILTIN_FILTER_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </optgroup>
                    {customPresets.length > 0 && (
                      <optgroup label="Мої пресети">
                        {customPresets.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={handleSaveCustomPreset}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Зберегти як пресет
                  </button>
                </div>

                {customPresets.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Мої пресети:</span>
                    {customPresets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleDeleteCustomPreset(p.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <span>{p.name}</span>
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* слайдеры фильтров */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-[11px] text-gray-500 dark:text-gray-400">
                      Яскравість
                    </span>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      step={5}
                      value={brightness}
                      onChange={(e) =>
                        setBrightness(parseInt(e.target.value, 10))
                      }
                      className="h-1 w-full cursor-pointer rounded-full bg-gray-200 accent-emerald-500 dark:bg-gray-700"
                    />
                    <span className="w-10 text-right text-[11px] text-gray-500 dark:text-gray-400">
                      {brightness > 0 ? `+${brightness}` : brightness}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-16 text-[11px] text-gray-500 dark:text-gray-400">
                      Контраст
                    </span>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      step={5}
                      value={contrast}
                      onChange={(e) =>
                        setContrast(parseInt(e.target.value, 10))
                      }
                      className="h-1 w-full cursor-pointer rounded-full bg-gray-200 accent-emerald-500 dark:bg-gray-700"
                    />
                    <span className="w-10 text-right text-[11px] text-gray-500 dark:text-gray-400">
                      {contrast > 0 ? `+${contrast}` : contrast}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Режим ч/б
                    </span>
                    <div className="inline-flex gap-1 rounded-full bg-gray-100 p-1 text-[11px] dark:bg-gray-800">
                      <button
                        type="button"
                        onClick={() => setMode("soft")}
                        className={`rounded-full px-2 py-0.5 ${
                          mode === "soft"
                            ? "bg-white text-emerald-700 shadow-sm dark:bg-gray-900 dark:text-emerald-300"
                            : "text-gray-500 dark:text-gray-300"
                        }`}
                      >
                        Мʼякий
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("hard")}
                        className={`rounded-full px-2 py-0.5 ${
                          mode === "hard"
                            ? "bg-white text-emerald-700 shadow-sm dark:bg-gray-900 dark:text-emerald-300"
                            : "text-gray-500 dark:text-gray-300"
                        }`}
                      >
                        Сканер
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setInvertColors((prev) => !prev)
                      }
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${
                        invertColors
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200"
                          : "border-gray-200 bg-white text-gray-600 hover:border-emerald-400 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-emerald-400 dark:hover:text-emerald-200"
                      }`}
                    >
                      <SunMedium className="h-3 w-3" />
                      Invert background
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Скинути фільтри
                    </button>
                  </div>

                  {mode === "hard" && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-[11px] text-gray-500 dark:text-gray-400">
                        Поріг «чорного»
                      </span>
                      <input
                        type="range"
                        min={80}
                        max={230}
                        step={1}
                        value={threshold}
                        onChange={(e) =>
                          setThreshold(
                            parseInt(e.target.value, 10),
                          )
                        }
                        className="h-1 w-full cursor-pointer rounded-full bg-gray-200 accent-emerald-500 dark:bg-gray-700"
                      />
                      <span className="w-10 text-right text-[11px] text-gray-500 dark:text-gray-400">
                        {threshold}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Скачивание */}
              <div className="flex flex-col gap-2 border-t border-dashed border-gray-200 pt-3 dark:border-gray-800">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!pages.length}
                    onClick={handleDownloadPdf}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {pages.length > 1
                      ? "Завантажити PDF (усі сторінки)"
                      : "Завантажити як PDF"}
                  </button>
                  <button
                    type="button"
                    disabled={!currentPage}
                    onClick={handleDownloadPng}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    <Download className="h-4 w-4" />
                    PNG поточної сторінки
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  PDF — у форматі A4 з усіма сторінками, PNG — окремий аркуш
                  для швидкого друку чи відправки.
                </p>
              </div>
            </m.div>

            {/* Правая колонка — превью A4 */}
            <m.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  Превʼю аркуша A4
                </h2>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Тут видно результат з урахуванням усіх шарів, обрізки та
                  чорно-білого режиму
                </span>
              </div>

              <div className="flex flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50/70 p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
                {!currentPage ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-center text-gray-500 dark:text-gray-400">
                    <FileText className="h-8 w-8" />
                    <p className="text-sm font-medium">
                      Завантажте зображення, щоб побачити превʼю скану
                    </p>
                    <p className="max-w-xs text-xs">
                      Тут зʼявиться віртуальний аркуш A4 з усіма шарами
                      поточної сторінки.
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full max-w-[420px] aspect-[210/297] rounded-[18px] border border-gray-300 bg-white shadow-xl shadow-gray-300/40 dark:border-gray-700 dark:bg-white">
                    <div
                      className="absolute inset-3 overflow-hidden rounded-[14px] bg-white"
                      onPointerDown={handlePreviewPointerDown}
                      onPointerMove={handlePreviewPointerMove}
                      onPointerUp={handlePreviewPointerUp}
                      onPointerLeave={(e) => {
                        if (draggingRef.current) {
                          handlePreviewPointerUp(
                            e as unknown as PointerEvent<HTMLDivElement>,
                          );
                        }
                      }}
                    >
                      <canvas
                        ref={previewCanvasRef}
                        className="h-full w-full"
                      />
                      {isRendering && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/60 text-xs text-gray-500">
                          Обробка…
                        </div>
                      )}
                    </div>

                    <div className="pointer-events-none абсолют inset-3 rounded-[14px] border border-dashed border-gray-300/80" />

                    <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-gray-100/90 px-2 py-0.5 text-[10px] font-medium text-gray-500 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                      A4 · 210 × 297 мм
                    </div>
                  </div>
                )}
              </div>

              {currentPage && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <span>
                    Поточна сторінка: {currentPageIndex + 1} /{" "}
                    {pages.length} • {currentPage.layers.length} шар(и)
                  </span>
                  {selectedLayer && (
                    <>
                      <span className="h-2 w-px bg-gray-300 dark:bg-gray-700" />
                      <span>
                        Обраний шар:{" "}
                        {selectedLayer.width}×{selectedLayer.height} px
                      </span>
                      {selectedLayer.perspectiveCrop && (
                        <>
                          <span className="h-2 w-px bg-gray-300 dark:bg-gray-700" />
                          <span>Вільна обрізка активна (4 точки)</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </m.div>
          </section>
        </main>

        {/* ───────── Модалка вільної обрізки (4 точки) ───────── */}
        {isPerspectiveOpen && selectedLayer && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onPointerMove={handlePerspectivePointerMove}
            onPointerUp={handlePerspectivePointerUp}
            onPointerLeave={handlePerspectivePointerUp}
          >
            <div
              className="absolute inset-0"
              onClick={closePerspective}
            />
            <m.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative z-[81] flex max-h-[90vh] w-full max-w-5xl flex-col gap-3 rounded-2xl border border-gray-700/60 bg-gray-950/90 p-4 shadow-2xl shadow-black/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Вільна обрізка шару (4 точки)
                  </p>
                  <p className="text-sm text-gray-200">
                    Поставте 4 точки по контуру документа. Усе, що всередині
                    цього контуру, буде збережено, решта — приховано. Це як
                    обрізка ползунками, але по довільній формі в перспективі.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePerspective}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-white/15 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-xl bg-black/60 p-3">
                <div className="flex flex-1 items-center justify-center">
                  <div className="relative max-h-[70vh] w-full max-w-4xl">
                    <div
                      ref={perspectiveWrapperRef}
                      className="relative mx-auto inline-block max-h-[70vh] max-w-full"
                    >
                      <img
                        src={selectedLayer.src}
                        alt="Perspective crop"
                        className="max-h-[70vh] max-w-full rounded-lg shadow-xl shadow-black/50"
                      />
                      {perspectiveQuad && (
                        <>
                          {/* Линии контура */}
                          <svg
                            className="pointer-events-none absolute inset-0"
                            viewBox="0 0 1000 1000"
                            preserveAspectRatio="none"
                          >
                            <polyline
                              points={[
                                perspectiveQuad.tl,
                                perspectiveQuad.tr,
                                perspectiveQuad.br,
                                perspectiveQuad.bl,
                                perspectiveQuad.tl,
                              ]
                                .map(
                                  (p) =>
                                    `${p.x * 1000},${p.y * 1000}`,
                                )
                                .join(" ")}
                              fill="none"
                              stroke="#22c55e"
                              strokeWidth={18}
                              strokeDasharray="40 24"
                            />
                          </svg>

                          {/* Хэндлы */}
                          {(
                            [
                              "tl",
                              "tr",
                              "br",
                              "bl",
                            ] as (keyof PerspectiveQuad)[]
                          ).map((key) => {
                            const pt = perspectiveQuad[key];
                            return (
                              <div
                                key={key}
                                className="pointer-events-auto absolute"
                                style={{
                                  left: `${pt.x * 100}%`,
                                  top: `${pt.y * 100}%`,
                                  transform: "translate(-50%, -50%)",
                                }}
                                onPointerDown={(e) =>
                                  handlePerspectivePointerDown(e, key)
                                }
                              >
                                <div className="h-4 w-4 rounded-md border border-white bg-emerald-500 shadow-md shadow-emerald-500/40" />
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-[11px] text-gray-300">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                      <Crop className="h-3 w-3 text-emerald-300" />
                      Потягніть кожну точку до кута документа
                    </span>
                    <span className="hidden sm:inline text-gray-400">
                      Esc — закрити без змін
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={closePerspective}
                      className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-white/10"
                    >
                      Відмінити
                    </button>
                    <button
                      type="button"
                      onClick={applyPerspectiveCropForSelectedLayer}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
                    >
                      Застосувати вільну обрізку
                    </button>
                  </div>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </div>
    </LazyMotion>
  );
}
