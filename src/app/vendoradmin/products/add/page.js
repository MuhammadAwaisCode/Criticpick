'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Crop,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Star,
  Check,
  X,
  Plus,
  Scissors,
  Film
} from 'lucide-react';
import { useVendorData, titles } from '../../context/VendorDataContext';

// Fix #3 / #4: strict per-file size cap and max attachment count
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB
const MAX_FILES = 5;

export default function ProductEnginePage() {
  const { publishProduct, triggerToast } = useVendorData();

  /* ==========================================================
     PRODUCT ENGINE FORM STATE (page-local: only this page needs it)
     ========================================================== */
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState('Beauty');
  const [crossBorder, setCrossBorder] = useState(false);
  const [variants, setVariants] = useState([
    { rowId: 1, size: '50ml', color: 'Rose Gold', sku: 'LB-SER-001-RG', stock: 42 }
  ]);
  const [variantCounter, setVariantCounter] = useState(1);

  /* ==========================================================
     IMAGE / VIDEO UPLOAD & CANVAS STUDIO STATE MATRIX
     ========================================================== */
  const imageInputRef = useRef(null);
  const editorCanvasRef = useRef(null);
  const cropOverlayRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cropDragStartRef = useRef(null);

  const [productImages, setProductImages] = useState([]);
  const [activeImageIdx, setActiveImageIdx] = useState(null);
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState(null); // { x, y, w, h } in internal canvas pixel space

  const [editorState, setEditorState] = useState({
    zoom: 100, rotate: 0, bright: 100, contrast: 100, sat: 100,
    flipH: false, flipV: false, offX: 0, offY: 0, isDragging: false
  });

  const activeMedia = activeImageIdx !== null ? productImages[activeImageIdx] : null;
  const activeIsVideo = activeMedia?.type === 'video';

  /* ==========================================================
     IMAGE / VIDEO MEDIA OPERATIONS PIPELINE
     ========================================================== */
  function handleImageFiles(files) {
    if (!files || files.length === 0) return;

    if (productImages.length + files.length > MAX_FILES) {
      triggerToast(`Maximum allocation pool limit is ${MAX_FILES} files.`, 'error');
      return;
    }

    [...files].forEach((f) => {
      const isImage = f.type.startsWith('image/');
      const isVideo = f.type.startsWith('video/');
      if (!isImage && !isVideo) return;

      // Fix #3: strict 3MB cap per file
      if (f.size > MAX_FILE_SIZE) {
        triggerToast(`"${f.name}" exceeds the 3MB limit and was skipped.`, 'error');
        return;
      }

      const url = URL.createObjectURL(f);

      if (isVideo) {
        setProductImages((prev) => {
          const next = [...prev, { img: null, url, name: f.name, editedUrl: null, type: 'video' }];
          if (next.length === 1) setActiveImageIdx(0);
          return next;
        });
        return;
      }

      // Image path — preload so the canvas editor can draw it immediately
      const img = new Image();
      img.onload = () => {
        setProductImages((prev) => {
          const next = [...prev, { img, url, name: f.name, editedUrl: null, type: 'image' }];
          if (next.length === 1) setActiveImageIdx(0);
          return next;
        });
      };
      img.onerror = () => {
        triggerToast(`"${f.name}" could not be read as an image.`, 'error');
      };
      img.src = url;
    });
  }

  function removeProductImage(i) {
    setProductImages((prev) => prev.filter((_, idx) => idx !== i));
    setActiveImageIdx((prev) => (prev === null ? null : prev >= i ? Math.max(0, prev - 1) : prev));
    if (primaryImageIdx === i) setPrimaryImageIdx(0);
  }

  function updateEditorState(key, val) {
    setEditorState((prev) => ({ ...prev, [key]: val }));
  }

  function resetEditor() {
    setEditorState({
      zoom: 100, rotate: 0, bright: 100, contrast: 100, sat: 100,
      flipH: false, flipV: false, offX: 0, offY: 0, isDragging: false
    });
  }

  function flipH() { setEditorState((s) => ({ ...s, flipH: !s.flipH })); }
  function flipV() { setEditorState((s) => ({ ...s, flipV: !s.flipV })); }

  function toggleCrop() {
    setCropMode((m) => {
      const next = !m;
      if (!next) setCropRect(null);
      return next;
    });
  }

  function applyEdits() {
    const canvas = editorCanvasRef.current;
    if (!canvas || activeIsVideo) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setProductImages((prev) => prev.map((img, i) =>
      i === activeImageIdx ? { ...img, editedUrl: dataUrl } : img
    ));
    triggerToast('Image edits applied.', 'success');
  }

  /* ==========================================================
     CANVAS PAN / ZOOM INTERACTION EVENT HANDLERS
     ========================================================== */
  const handleCanvasMouseDown = (e) => {
    if (cropMode || activeIsVideo) return;
    setEditorState((prev) => ({ ...prev, isDragging: true }));
    dragStartRef.current = { x: e.clientX - editorState.offX, y: e.clientY - editorState.offY };
  };

  const handleCanvasMouseMove = (e) => {
    if (!editorState.isDragging || cropMode || activeIsVideo) return;
    const nx = e.clientX - dragStartRef.current.x;
    const ny = e.clientY - dragStartRef.current.y;
    setEditorState((prev) => ({ ...prev, offX: nx, offY: ny }));
  };

  const handleCanvasMouseUp = () => {
    setEditorState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleCanvasWheel = (e) => {
    if (activeIsVideo) return;
    e.preventDefault();
    const step = e.deltaY < 0 ? 8 : -8;
    setEditorState((prev) => ({
      ...prev,
      zoom: Math.max(10, Math.min(300, prev.zoom + step))
    }));
  };

  /* ==========================================================
     CROP OVERLAY INTERACTION EVENT HANDLERS (Fix #5)
     ========================================================== */
  function getCanvasCoords(e, canvasEl) {
    const rect = canvasEl.getBoundingClientRect();
    const scaleX = canvasEl.width / rect.width;
    const scaleY = canvasEl.height / rect.height;
    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;
    return {
      x: Math.max(0, Math.min(canvasEl.width, rawX)),
      y: Math.max(0, Math.min(canvasEl.height, rawY))
    };
  }

  const handleCropMouseDown = (e) => {
    if (!cropMode || !cropOverlayRef.current) return;
    const pos = getCanvasCoords(e, cropOverlayRef.current);
    cropDragStartRef.current = pos;
    setCropRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handleCropMouseMove = (e) => {
    if (!cropMode || !cropDragStartRef.current || !cropOverlayRef.current) return;
    const pos = getCanvasCoords(e, cropOverlayRef.current);
    const start = cropDragStartRef.current;
    setCropRect({
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      w: Math.abs(pos.x - start.x),
      h: Math.abs(pos.y - start.y)
    });
  };

  const handleCropMouseUp = () => {
    cropDragStartRef.current = null;
  };

  function cancelCrop() {
    setCropRect(null);
    setCropMode(false);
  }

  function applyCrop() {
    if (!cropRect || cropRect.w < 8 || cropRect.h < 8) {
      triggerToast('Draw a larger crop box before applying.', 'error');
      return;
    }
    const canvas = editorCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const x = Math.round(cropRect.x);
    const y = Math.round(cropRect.y);
    const w = Math.round(cropRect.w);
    const h = Math.round(cropRect.h);

    let imageData;
    try {
      imageData = ctx.getImageData(x, y, w, h);
    } catch (err) {
      triggerToast('Crop failed — try selecting within the image bounds.', 'error');
      return;
    }

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = w;
    cropCanvas.height = h;
    cropCanvas.getContext('2d').putImageData(imageData, 0, 0);
    const dataUrl = cropCanvas.toDataURL('image/jpeg', 0.92);

    const newImg = new Image();
    newImg.onload = () => {
      setProductImages((prev) => prev.map((im, i) =>
        i === activeImageIdx ? { ...im, img: newImg, editedUrl: dataUrl, url: dataUrl } : im
      ));
      resetEditor();
      setCropMode(false);
      setCropRect(null);
      triggerToast('Crop applied.', 'success');
    };
    newImg.src = dataUrl;
  }

  /* ==========================================================
     GRAPHICS RENDERING LIFECYCLE EFFECT LOOP (main image canvas)
     ========================================================== */
  useEffect(() => {
    if (activeImageIdx === null) return;
    const im = productImages[activeImageIdx];
    if (!im || im.type === 'video' || !im.img) return;
    const canvas = editorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { zoom, rotate, bright, contrast, sat, flipH, flipV, offX, offY } = editorState;
    const W = canvas.width = 800, H = canvas.height = 600;

    ctx.clearRect(0, 0, W, H);
    ctx.filter = `brightness(${bright}%) contrast(${contrast}%) saturate(${sat}%)`;
    ctx.save();
    ctx.translate(W / 2 + offX, H / 2 + offY);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale((flipH ? -1 : 1) * (zoom / 100), (flipV ? -1 : 1) * (zoom / 100));

    const src = im.img;
    const scale = Math.min(W / src.naturalWidth, H / src.naturalHeight);
    ctx.drawImage(
      src,
      (-src.naturalWidth * scale) / 2,
      (-src.naturalHeight * scale) / 2,
      src.naturalWidth * scale,
      src.naturalHeight * scale
    );
    ctx.restore();
    ctx.filter = 'none';
  }, [editorState, activeImageIdx, productImages]);

  /* ==========================================================
     CROP OVERLAY RENDERING LOOP (Fix #5)
     ========================================================== */
  useEffect(() => {
    const overlay = cropOverlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    const W = overlay.width = 800, H = overlay.height = 600;
    ctx.clearRect(0, 0, W, H);

    if (!cropMode) return;

    // Dim everything, then punch a clear window over the selection
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(0, 0, W, H);

    if (cropRect && cropRect.w > 0 && cropRect.h > 0) {
      ctx.clearRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
      ctx.restore();
    }
  }, [cropMode, cropRect]);

  /* ==========================================================
     BUSINESS ENGINE RUNTIME EVENT HANDLERS
     ========================================================== */
  const handleAddVariantRow = () => {
    const nextId = variantCounter + 1;
    setVariantCounter(nextId);
    setVariants((prev) => [
      ...prev,
      { rowId: nextId, size: '', color: '', sku: `VAR-${1000 + nextId}`, stock: 0 }
    ]);
  };

  const handleUpdateVariantField = (rowId, field, value) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.rowId === rowId ? { ...v, [field]: field === 'stock' ? Number(value) : value } : v
      )
    );
  };

  const handleRemoveVariantRow = (rowId) => {
    setVariants((prev) => prev.filter((v) => v.rowId !== rowId));
  };

  const handleOriginalFormReset = () => {
    setProdTitle('');
    setProdCategory('Beauty');
    setCrossBorder(false);
    setVariants([]);
    setProductImages([]);
    setActiveImageIdx(null);
    setPrimaryImageIdx(0);
    setCropMode(false);
    setCropRect(null);
    resetEditor();
  };

  const handleResetProductForm = () => {
    handleOriginalFormReset();
    triggerToast('Product form cleared.', 'info');
  };

  const handlePublishProduct = (e) => {
    e.preventDefault();
    const title = prodTitle.trim();
    if (!title) {
      triggerToast('Enter a product title before publishing.', 'error');
      return;
    }

    // Shared-state write: pushes the new SKU into inventory via context
    // so the Inventory Matrix and Overview pages pick it up immediately.
    publishProduct({ title, category: prodCategory, variants });
    handleOriginalFormReset();
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-lg font-black tracking-tight text-slate-900 mb-6">{titles.engine}</h1>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 animate-fade-in">
        <form onSubmit={handlePublishProduct} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Core Title</label>
              <input
                type="text" required
                value={prodTitle}
                onChange={(e) => setProdTitle(e.target.value)}
                placeholder="e.g. Advanced Retinol Rejuvenator Serum"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-orange-500 outline-none mt-1.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxonomy Group</label>
              <select
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-orange-500 outline-none mt-1.5 bg-white"
              >
                <option value="Beauty">Beauty Matrix</option>
                <option value="Wellness">Wellness Operations</option>
                <option value="Skincare">Skincare Core</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border border-slate-100 rounded-xl p-3 bg-slate-50/40">
            <div>
              <p className="text-xs font-bold text-slate-800">Automated Cross Border Distribution</p>
              <p className="text-[11px] text-slate-400 font-medium">Auto-convert pricing logs to active regional centers globally (USD/EUR/GBP).</p>
            </div>
            <button
              type="button" onClick={() => setCrossBorder(!crossBorder)}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${crossBorder ? 'bg-orange-500' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-xs transform transition-transform duration-300 ${crossBorder ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* ── Product Image & Video Upload / Editor Node Module ── */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product Images & Videos</h3>
              <span className="text-[10px] text-slate-400">
                {productImages.length}/{MAX_FILES} files · Primary:{' '}
                <span className="font-bold text-slate-600">
                  {productImages[primaryImageIdx]?.name ?? 'none'}
                </span>
              </span>
            </div>

            {/* Drag and Drop Zone Block — Fix #2: images + videos, Fix #4: 5 file / 3MB copy */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageFiles(e.dataTransfer.files); }}
              onClick={() => imageInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-colors ${
                dragOver ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
              }`}
            >
              <input
                ref={imageInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
                onChange={(e) => { handleImageFiles(e.target.files); e.target.value = ''; }}
              />
              <UploadCloud className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-semibold text-slate-500">Drop images or videos here or <span className="text-orange-600">browse</span></p>
              <p className="text-[10px] text-slate-400">Images &amp; Videos — up to 3 MB each</p>
            </div>

            {/* Thumbnail Previews List */}
            {productImages.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {productImages.map((item, i) => (
                  <div
                    key={i} onClick={() => setActiveImageIdx(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all group bg-slate-900 ${
                      i === activeImageIdx ? 'border-orange-500' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <>
                        <video src={item.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Film className="w-5 h-5 text-white drop-shadow" />
                        </div>
                      </>
                    ) : (
                      <img src={item.editedUrl || item.url} alt={item.name} className="w-full h-full object-cover" />
                    )}
                    {i === primaryImageIdx && (
                      <div className="absolute bottom-1 left-1 bg-black/60 p-0.5 rounded-full">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeProductImage(i); }}
                      className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Media Studio Context Layer */}
            {activeMedia && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white animate-fade-in">
                {activeIsVideo ? (
                  /* Fix #2: videos get plain playback, no canvas editor */
                  <div className="p-4 space-y-3">
                    <div className="bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center" style={{ maxHeight: 400 }}>
                      <video src={activeMedia.url} controls className="max-h-[400px] w-full" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Video playback only — cropping and filters apply to images.
                    </p>
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setPrimaryImageIdx(activeImageIdx)} className="text-[11px] font-bold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" /> Set primary
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Fix #1: canvas + sliders side by side on a grid, canvas capped at max-h-[400px] */
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-0">
                    <div className="relative bg-slate-900 flex items-center justify-center" style={{ maxHeight: 400, minHeight: 260 }}>
                      <div className="relative w-full" style={{ maxHeight: 400, aspectRatio: '4/3' }}>
                        <canvas
                          ref={editorCanvasRef} className="w-full h-full block"
                          style={{ maxHeight: 400, cursor: cropMode ? 'crosshair' : 'grab' }}
                          onMouseDown={handleCanvasMouseDown}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseLeave={handleCanvasMouseUp}
                          onWheel={handleCanvasWheel}
                        />
                        <canvas
                          ref={cropOverlayRef}
                          className="absolute inset-0 w-full h-full"
                          style={{ cursor: cropMode ? 'crosshair' : 'default', pointerEvents: cropMode ? 'auto' : 'none' }}
                          onMouseDown={handleCropMouseDown}
                          onMouseMove={handleCropMouseMove}
                          onMouseUp={handleCropMouseUp}
                          onMouseLeave={handleCropMouseUp}
                        />
                      </div>
                    </div>

                    <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                      {cropMode ? (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            Drag directly on the image to draw a crop box, then apply it.
                          </p>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={applyCrop} className="text-[11px] font-bold bg-slate-900 text-white px-4 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1.5">
                              <Scissors className="w-3.5 h-3.5" /> Apply Crop
                            </button>
                            <button type="button" onClick={cancelCrop} className="text-[11px] font-bold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {[
                            { label: 'Zoom',       key: 'zoom',    min: 10,  max: 300, unit: '%' },
                            { label: 'Rotate',     key: 'rotate',  min: -180, max: 180, unit: '°' },
                            { label: 'Brightness', key: 'bright',  min: 0,   max: 200, unit: '%' },
                            { label: 'Contrast',   key: 'contrast', min: 0,   max: 200, unit: '%' },
                            { label: 'Saturation', key: 'sat',      min: 0,   max: 200, unit: '%' },
                          ].map(({ label, key, min, max, unit }) => (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-[11px] font-semibold text-slate-400 w-16 flex-shrink-0">{label}</span>
                              <input
                                type="range" min={min} max={max} step={1}
                                value={editorState[key]}
                                onChange={(e) => updateEditorState(key, Number(e.target.value))}
                                className="flex-1 accent-orange-500"
                              />
                              <span className="text-[11px] font-bold text-slate-600 w-10 text-right">
                                {Math.round(editorState[key])}{unit}
                              </span>
                            </div>
                          ))}

                          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
                            <button type="button" onClick={flipH} className="text-[11px] font-bold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                              <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
                            </button>
                            <button type="button" onClick={flipV} className="text-[11px] font-bold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                              <FlipVertical className="w-3.5 h-3.5" /> Flip V
                            </button>
                            <button type="button" onClick={toggleCrop} className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5">
                              <Crop className="w-3.5 h-3.5" /> Crop
                            </button>
                            <button type="button" onClick={resetEditor} className="text-[11px] font-bold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                              <RotateCcw className="w-3.5 h-3.5" /> Reset
                            </button>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button type="button" onClick={() => setPrimaryImageIdx(activeImageIdx)} className="text-[11px] font-bold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5" /> Set primary
                            </button>
                            <button type="button" onClick={applyEdits} className="text-[11px] font-bold bg-slate-900 text-white px-4 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1.5 ml-auto">
                              <Check className="w-3.5 h-3.5" /> Apply
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sub-table Variation Management Layers Grid */}
          <div className="space-y-2 border-t border-slate-100 pt-5">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product Variant Matrix Configurations</h3>
              <button
                type="button" onClick={handleAddVariantRow}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Append Variant Line
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold">
                    <th className="p-3">Dimensions / Vol</th>
                    <th className="p-3">Palette / Hue</th>
                    <th className="p-3">Assigned SKU Label</th>
                    <th className="p-3">Initial Stock</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {variants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-5 text-center text-slate-400">No variant configurations added to processing array yet.</td>
                    </tr>
                  ) : (
                    variants.map((v) => (
                      <tr key={v.rowId} className="hover:bg-slate-50/30">
                        <td className="p-2">
                          <input
                            type="text" required value={v.size} placeholder="e.g. 50ml"
                            onChange={(e) => handleUpdateVariantField(v.rowId, 'size', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text" required value={v.color} placeholder="e.g. Rose Gold"
                            onChange={(e) => handleUpdateVariantField(v.rowId, 'color', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text" required value={v.sku}
                            onChange={(e) => handleUpdateVariantField(v.rowId, 'sku', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number" min="0" required value={v.stock}
                            onChange={(e) => handleUpdateVariantField(v.rowId, 'stock', e.target.value)}
                            className="w-20 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button" onClick={() => handleRemoveVariantRow(v.rowId)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button" onClick={handleResetProductForm}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Clear Changes
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
            >
              Commit & Publish Catalog Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}