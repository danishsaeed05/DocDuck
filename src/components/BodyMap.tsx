import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import '@google/model-viewer';
import { useData } from '../data/dataStore';

// Define the structure for a selected body part
interface SelectedPart {
  id: string;
  name: string;
  position: string; // 3D position string for model-viewer hotspot
  normal?: string;
  coords?: { x: number; y: number; z: number };
  intensity?: number;
}

export default function BodyMap() {
  const navigate = useNavigate();
  const { addLog } = useData();
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [painDescription, setPainDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const modelBoundsRef = useRef({ min: 0, max: 1.8 });
  const modelViewerRef = useRef<any>(null);

  const getBodyPartFromY = (y: number, x: number): string => {
    const { min, max } = modelBoundsRef.current;
    const range = max - min;
    if (range <= 0) return 'Body';
    
    const sY = ((y - min) / range) * 1.8;
    const sX = (x / range) * 1.8;
    
    const side = sX < 0 ? 'Right' : 'Left';
    const absX = Math.abs(sX);
    
    console.log(`Mapping: y=${y.toFixed(3)} (bounds: ${min.toFixed(2)}-${max.toFixed(2)}) -> sY=${sY.toFixed(3)}, x=${x.toFixed(3)} -> sX=${sX.toFixed(3)} (${side})`);

    if (sY > 1.68) return 'Head';
    if (sY > 1.58) return 'Neck';
    
    if (sY > 1.45) {
      if (absX > 0.15) return `${side} Shoulder`;
      return 'Upper Chest';
    }
    
    if (absX > 0.22) {
      if (sY > 1.15) return `${side} Upper Arm`;
      if (sY > 1.00) return `${side} Elbow`;
      if (sY > 0.80) return `${side} Forearm`;
      if (sY > 0.70) return `${side} Wrist`;
      if (sY > 0.55) return `${side} Hand`;
    }

    if (sY > 1.25) return 'Chest';
    if (sY > 1.05) return 'Abdomen';
    if (sY > 0.85) return 'Lower Abdomen / Pelvis';
    if (sY > 0.72) return `${side} Hip`;
    
    if (sY > 0.42) return `${side} Thigh`;
    if (sY > 0.30) return `${side} Knee`;
    if (sY > 0.10) return `${side} Calf`;
    
    return `${side} Foot`;
  };

  const handleModelClick = (event: { clientX: number, clientY: number, target?: any, isManual?: boolean }) => {
    const viewer = modelViewerRef.current;
    
    if (!viewer) return;

    const rect = viewer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if we clicked a hotspot button
    if (!event.isManual) {
      const target = event.target as HTMLElement;
      if (target && target.closest('button[slot^="hotspot-"]')) {
        return;
      }
    }

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

    try {
      let hit = null;
      
      if (viewer.loaded && typeof viewer.positionAndNormalFromPoint === 'function') {
        const dpr = window.devicePixelRatio || 1;
        hit = viewer.positionAndNormalFromPoint(x, y);
        
        if (!hit && dpr !== 1) {
          hit = viewer.positionAndNormalFromPoint(x * dpr, y * dpr);
        }

        if (!hit) {
          const offsets = [[2, 0], [-2, 0], [0, 2], [0, -2]];
          for (const [ox, oy] of offsets) {
            hit = viewer.positionAndNormalFromPoint(x + ox, y + oy);
            if (hit) break;
          }
        }
      }

      let posX, posY, posZ, normX, normY, normZ;

      if (hit && hit.position) {
        const { position, normal } = hit;
        posX = Number(position.x);
        posY = Number(position.y);
        posZ = Number(position.z);
        normX = Number(normal.x);
        normY = Number(normal.y);
        normZ = Number(normal.z);
      } else {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const { min, max } = modelBoundsRef.current;
        const range = max - min;
        const modelCenterY = (max + min) / 2;
        const factor = 1.22 * (range > 0 ? range : 1.8); 
        const aspect = rect.width / rect.height;
        
        const relX = (x - centerX) / rect.width;
        const relY = (centerY - y) / rect.height;
        
        posX = relX * factor * aspect;
        posY = relY * factor + modelCenterY; 
        posZ = 0.1 * (range > 0 ? (range / 1.8) : 1);
        normX = 0;
        normY = 0;
        normZ = 1;
      }

      const partName = getBodyPartFromY(posY, posX);
      
      if (selectedParts.some(p => p.name === partName)) return;
      
      const newPart: SelectedPart = {
        id: `part-${Date.now()}`,
        name: partName,
        position: `${posX}m ${posY}m ${posZ}m`,
        normal: `${normX}m ${normY}m ${normZ}m`,
        coords: { x: posX, y: posY, z: posZ },
        intensity: 5
      };

      setSelectedParts(prev => [...prev, newPart]);
      
    } catch (err) {
      console.error('Error during hit test:', err);
    }
  };

  useEffect(() => {
    const viewer = modelViewerRef.current;
    
    const handleLoad = () => {
      if (viewer) {
        const dimensions = viewer.getDimensions();
        const target = viewer.getCameraTarget();
        
        if (dimensions && dimensions.y > 0 && target) {
          const height = dimensions.y;
          const minY = target.y - height / 2;
          const maxY = target.y + height / 2;
          modelBoundsRef.current = { min: minY, max: maxY };
          console.log(`Bounds set: ${minY.toFixed(2)} to ${maxY.toFixed(2)}`);
        }

        // Change model color to a soft blue-gray
        const model = viewer.model;
        if (model && model.materials) {
          for (const material of model.materials) {
            // Set color to a soft blue-gray [R, G, B, A]
            material.pbrMetallicRoughness.setBaseColorFactor([0.53, 0.6, 0.67, 1.0]);
          }
        }

        viewer.cameraTarget = "auto auto auto";
        viewer.cameraOrbit = "auto 90deg auto";
      }
    };

    customElements.whenDefined('model-viewer').then(() => {
      if (viewer && viewer.constructor.name === 'HTMLElement') {
        customElements.upgrade(viewer);
      }
    });

    let startX = 0;
    let startY = 0;

    const onPointerDown = (e: PointerEvent) => {
      startX = e.clientX;
      startY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!viewer) return;
      const diffX = Math.abs(e.clientX - startX);
      const diffY = Math.abs(e.clientY - startY);

      if (diffX < 10 && diffY < 10) {
        const rect = viewer.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          handleModelClick(e);
        }
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    if (viewer) {
      viewer.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      if (viewer) {
        viewer.removeEventListener('load', handleLoad);
      }
    };
  }, [selectedParts]);

  const removePart = (id: string) => {
    setSelectedParts(prev => prev.filter(p => p.id !== id));
  };

  const clearAll = () => {
    setSelectedParts([]);
    setPainDescription('');
  };

  const handleNext = () => {
    // Navigate to Symptoms & Mood page with the current selection
    navigate('/how-i-feel/symptoms-mood', { 
      state: { 
        flaggedBodyParts: selectedParts.map(p => String(p.name)),
        bodyMarkers: selectedParts.map(p => ({
          name: String(p.name),
          coords: p.coords ? { 
            x: Number(p.coords.x), 
            y: Number(p.coords.y), 
            z: Number(p.coords.z) 
          } : undefined,
          position: String(p.position)
        })),
        painDescription: String(painDescription)
      } 
    });
  };

  return (
    <div className="space-y-8 mx-auto max-w-4xl px-6 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start bg-surface-container rounded-3xl p-6 md:p-8 shadow-inner border border-surface-container-highest">
        {/* 3D Model Section */}
        <div className="lg:col-span-3 flex flex-col gap-4 w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-surface-container-highest w-full h-[500px] relative group">
            <model-viewer
              ref={modelViewerRef}
              id="body-model"
              src="/FemaleBaseMesh.glb"
              alt="3D Body Model"
              camera-controls
              disable-zoom
              disable-pan
              loading="eager"
              reveal="auto"
              camera-target="auto auto auto"
              camera-orbit="auto 90deg auto"
              min-camera-orbit="auto 90deg auto"
              max-camera-orbit="auto 90deg auto"
              interaction-prompt="none"
              shadow-intensity="0"
              environment-image="neutral"
              auto-rotate={false}
              style={{ width: '100%', height: '100%', backgroundColor: '#f0f4f8', border: 'none' }}
            >
              {selectedParts.map((part) => (
                <button
                  key={part.id}
                  slot={`hotspot-${part.id}`}
                  data-position={part.position}
                  data-normal={part.normal || "0m 1m 0m"}
                  className="w-3 h-3 bg-tertiary-fixed border-2 border-white rounded-full shadow-lg animate-pulse cursor-pointer group"
                  style={{ transform: 'translate(-50%, -50%)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removePart(part.id);
                  }}
                >
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {part.name}
                  </div>
                </button>
              ))}
            </model-viewer>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant bg-white/50 py-2 rounded-full border border-surface-container-highest">
            <span className="material-symbols-outlined text-sm">info</span>
            <p>Drag to rotate • Click to mark pain points • Tap markers to remove</p>
          </div>
        </div>

        {/* Form Details Section */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-container-highest flex-grow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center shadow-lg shadow-tertiary-fixed/20">
                <span className="material-symbols-outlined text-white">edit</span>
              </div>
              <h3 className="font-bold text-lg text-on-surface">Pain Details</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-outline">Selected Areas</p>
                  {selectedParts.length > 0 && (
                    <button 
                      onClick={() => setSelectedParts([])}
                      className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-surface-container rounded-xl border border-dashed border-outline-variant">
                  <AnimatePresence>
                    {selectedParts.length === 0 ? (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-on-surface-variant italic self-center w-full text-center"
                      >
                        Tap the model to select areas...
                      </motion.span>
                    ) : (
                      selectedParts.map((part) => (
                        <motion.span
                          key={part.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="inline-flex flex-col gap-0.5 px-2 py-1 bg-tertiary-fixed text-white rounded-lg text-[10px] font-bold shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{part.name}</span>
                            <button 
                              onClick={() => removePart(part.id)}
                              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </div>
                          {part.coords && (
                            <div className="text-[10px] opacity-70 font-mono">
                              {part.coords.x.toFixed(2)}, {part.coords.y.toFixed(2)}, {part.coords.z.toFixed(2)}
                            </div>
                          )}
                        </motion.span>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-outline mb-3">Description</p>
                <textarea
                  value={painDescription}
                  onChange={(e) => setPainDescription(e.target.value)}
                  className="w-full bg-surface-container border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all min-h-[120px] placeholder:text-outline-variant"
                  placeholder="Is it sharp, dull, throbbing? Does it radiate anywhere else?"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={clearAll}
                  className="flex-1 py-4 px-4 rounded-xl bg-surface-container-highest text-on-surface text-sm font-bold flex items-center justify-center gap-2 hover:bg-surface-dim transition-all"
                >
                  Clear
                </button>
                <button 
                  onClick={handleNext}
                  className="flex-[2] py-4 px-4 rounded-xl bg-primary text-white text-sm font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-center gap-2">
                    Next
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Insight Card */}
          <div className="bg-secondary-fixed/30 rounded-2xl p-5 flex gap-4 border border-secondary-fixed">
            <div className="bg-white rounded-full p-2 h-fit shadow-sm">
              <span className="material-symbols-outlined text-secondary">lightbulb</span>
            </div>
            <p className="text-sm text-on-secondary-fixed-variant leading-relaxed">
              <span className="font-bold">Pro Tip:</span> Marking specific spots helps us track if your pain is localized or spreading over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
