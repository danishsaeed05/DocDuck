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
  const modelViewerRef = useRef<any>(null);

  const getBodyPartFromY = (y: number, x: number): string => {
    const side = x < 0 ? 'Right' : 'Left';
    const absX = Math.abs(x);
    
    if (y > 1.62) return 'Head';
    if (y > 1.52) return 'Neck';
    
    if (y > 1.42) {
      if (absX > 0.12) return `${side} Shoulder`;
      return 'Upper Chest';
    }
    
    if (absX > 0.18) {
      if (y > 1.15) return `${side} Upper Arm`;
      if (y > 1.05) return `${side} Elbow`;
      if (y > 0.85) return `${side} Forearm`;
      if (y > 0.78) return `${side} Wrist`;
      if (y > 0.65) return `${side} Hand`;
    }

    if (y > 1.20) return 'Chest';
    if (y > 1.00) return 'Abdomen';
    if (y > 0.85) return 'Lower Abdomen / Pelvis';
    if (y > 0.72) return `${side} Hip`;
    
    if (y > 0.45) return `${side} Thigh`;
    if (y > 0.35) return `${side} Knee`;
    if (y > 0.08) return `${side} Calf`;
    
    return `${side} Foot`;
  };

  useEffect(() => {
    console.log('Selected Parts updated:', selectedParts);
  }, [selectedParts]);

  const handleModelClick = (event: { clientX: number, clientY: number, target?: any, isManual?: boolean }) => {
    const viewer = modelViewerRef.current;
    
    if (!viewer) {
      console.log('Hit test aborted: Viewer ref is null');
      return;
    }

    const rect = viewer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log(`Click at px: ${Math.round(x)}, ${Math.round(y)} on viewer ${Math.round(rect.width)}x${Math.round(rect.height)}`);

    // Check if we clicked a hotspot button (to avoid placing a new marker on top of an old one)
    if (!event.isManual) {
      const target = event.target as HTMLElement;
      if (target && target.closest('button[slot^="hotspot-"]')) {
        console.log('Clicked existing hotspot, skipping new marker');
        return;
      }
    }

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      console.log('Click outside viewer bounds');
      return;
    }

    try {
      let hit = null;
      
      // Only try 3D hit test if viewer is loaded and has the method
      if (viewer.loaded && typeof viewer.positionAndNormalFromPoint === 'function') {
        const dpr = window.devicePixelRatio || 1;
        
        // Try direct hit
        hit = viewer.positionAndNormalFromPoint(x, y);
        
        if (!hit && dpr !== 1) {
          hit = viewer.positionAndNormalFromPoint(x * dpr, y * dpr);
        }

        if (!hit) {
          const offsets = [[2, 0], [-2, 0], [0, 2], [0, -2], [5, 0], [-5, 0]];
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
        console.log(`3D HIT! Part: ${getBodyPartFromY(posY, posX)} at ${posX.toFixed(3)}, ${posY.toFixed(3)}, ${posZ.toFixed(3)}`);
      } else {
        // Fallback: Calculate position on the Z=0.1 plane based on screen coordinates
        // This allows clicking "anywhere" in the 3D space
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // factor = 2.2 is tuned for 3.5m distance and default FOV
        const factor = 2.2; 
        const aspect = rect.width / rect.height;
        
        const relX = (x - centerX) / rect.width;
        const relY = (centerY - y) / rect.height;
        
        // Invert relX because in model-viewer's default front view, 
        // positive screen X (right) corresponds to negative model X (anatomical left)
        posX = -relX * factor * aspect;
        posY = relY * factor + 0.9; // 0.9 is the camera target Y
        posZ = 0.1; // Slightly in front of the center plane
        normX = 0;
        normY = 0;
        normZ = 1;
        
        console.log(`FALLBACK HIT! Calculated: ${posX.toFixed(3)}, ${posY.toFixed(3)}, ${posZ.toFixed(3)}`);
      }

      const partName = getBodyPartFromY(posY, posX);
      
      // Check for duplicates
      if (selectedParts.some(p => p.name === partName)) {
        console.log(`Duplicate part: ${partName} already selected.`);
        return;
      }
      
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
      console.log('Model loaded successfully');
      if (viewer) {
        viewer.cameraTarget = "0m 0.9m 0m";
        viewer.cameraOrbit = "0deg 90deg 3.5m";
      }
    };

    // Ensure model-viewer is upgraded if it's a plain HTMLElement
    customElements.whenDefined('model-viewer').then(() => {
      if (viewer && viewer.constructor.name === 'HTMLElement') {
        console.log('Upgrading model-viewer element...');
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

      // If moved less than 10px, it's a click/tap
      if (diffX < 10 && diffY < 10) {
        const rect = viewer.getBoundingClientRect();
        
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
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
              camera-target="0m 0.9m 0m"
              camera-orbit="0deg 90deg 3.5m"
              min-camera-orbit="auto 90deg 3.5m"
              max-camera-orbit="auto 90deg 3.5m"
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
