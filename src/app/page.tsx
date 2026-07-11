"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [activeApplianceToScan, setActiveApplianceToScan] = useState<string | null>(null);

  // Core Display Health States
  const [displayRedHearts, setDisplayRedHearts] = useState(10);
  const [displayGoldHearts, setDisplayGoldHearts] = useState(0);

  // Track previous counts to know when to trigger animations
  const prevRedRef = useRef(10);
  const prevGoldRef = useRef(0);

  // Scan state managers
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [shatteredParticles, setShatteredParticles] = useState<{ id: number; char: string; left: string }[]>([]);
  const [popTrigger, setPopTrigger] = useState(false);

  const [formData, setFormData] = useState({
    zipCode: '',
    homeType: '',
    householdSize: '',
    homeSize: '',
    energyHabits: '',
    showerTime: '',
    cookingFrequency: '',
    dishwasherFrequency: '',
    laundryLoads: '',
    laundryTemp: '',
    appliances: [] as string[]
  });

  // MINECRAFT ABSORPTION SHIELD ENGINE + SHATTER EFFECT
  useEffect(() => {
    let baseHealth = 10;
    let absorptionShield = 0;

    // --- PHASE 1: REWARDS (GOLD HEARTS) ---
    if (formData.homeType === 'Apartment') absorptionShield += 2;
    if (formData.homeSize === 'Under 1k sq ft') absorptionShield += 2;
    if (formData.energyHabits === 'Conservative') absorptionShield += 4;
    if (formData.showerTime === 'Under 5 min') absorptionShield += 2;
    if (formData.dishwasherFrequency === 'Eco (1-3)') absorptionShield += 1;
    if (formData.laundryTemp === 'Cold (Eco)') absorptionShield += 2;
    if (formData.appliances.includes('None')) absorptionShield += 2;

    // --- PHASE 2: DAMAGE INFLICTED ---
    let totalDamage = 0;
    if (formData.homeType === 'Single-family') totalDamage += 1;
    if (formData.homeSize === '3k+ sq ft') totalDamage += 2;
    if (formData.energyHabits === 'HVAC Blasting') totalDamage += 4;
    if (formData.showerTime === '20+ min') totalDamage += 3;
    if (formData.cookingFrequency === 'Takeout/Cold (0-5)') totalDamage += 1;
    if (formData.dishwasherFrequency === 'Daily (4+)') totalDamage += 1;
    if (formData.laundryTemp === 'Warm/Hot') totalDamage += 2;
    if (formData.appliances.includes('Pool/Hot Tub')) totalDamage += 1;
    if (formData.appliances.includes('Electric Heater')) totalDamage += 1;

    // --- PHASE 3: ABSORPTION RESOLUTION ---
    if (totalDamage > 0) {
      if (absorptionShield >= totalDamage) {
        absorptionShield -= totalDamage;
      } else {
        const leftoverDamage = totalDamage - absorptionShield;
        absorptionShield = 0;
        baseHealth = Math.max(1, baseHealth - leftoverDamage);
      }
    }

    // --- PHASE 4: DETECT LOSS & GAIN TO TRIGGER EFFECTS ---
    const redLost = prevRedRef.current - baseHealth;
    const goldLost = prevGoldRef.current - absorptionShield;
    const redGained = baseHealth - prevRedRef.current;
    const goldGained = absorptionShield - prevGoldRef.current;

    if (redLost > 0 || goldLost > 0) {
      const newParticles: { id: number; char: string; left: string }[] = [];
      const totalLost = Math.max(redLost, 0) + Math.max(goldLost, 0);
      
      for (let i = 0; i < totalLost; i++) {
        newParticles.push({
          id: Math.random(),
          char: '💔',
          left: `${35 + Math.random() * 30}%`
        });
      }
      setShatteredParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => {
        setShatteredParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 1000);
    }

    if (redGained > 0 || goldGained > 0) {
      setPopTrigger(true);
      setTimeout(() => setPopTrigger(false), 400);
    }

    prevRedRef.current = baseHealth;
    prevGoldRef.current = absorptionShield;
    setDisplayRedHearts(baseHealth);
    setDisplayGoldHearts(absorptionShield);
  }, [formData]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (appliance: string) => {
    setFormData(prev => {
      const current = prev.appliances;
      if (appliance === 'None') return { ...prev, appliances: ['None'] };
      const filtered = current.filter(item => item !== 'None');
      
      if (filtered.includes(appliance)) {
        return { ...prev, appliances: filtered.filter(item => item !== appliance) };
      } else {
        // Toggle camera capture screen only on first select click
        setActiveApplianceToScan(appliance);
        setIsScanning(true);
        setImagePreview(null);
        return { ...prev, appliances: [...filtered, appliance] };
      }
    });
  };

  // CLIENT-SIDE IMAGE COMPRESSION
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
        setImagePreview(compressedBase64);
        toast.success("Artifact optimized for database slot!");
      };
    };
  };

  const triggerUploadClick = () => fileInputRef.current?.click();

  const runDiagnosticScan = () => {
    if (!imagePreview) return;
    setIsProcessingScan(true);
    
    setTimeout(() => {
      setIsProcessingScan(false);
      setIsScanning(false);
      toast.success(`${activeApplianceToScan} Core Linked to Diagnostic Profile!`);
    }, 2000);
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("QUEST COMPLETE! Routing Summary Matrix...");
    
    // Jump straight to the results screen directory index
    setTimeout(() => {
      router.push('/results');
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen w-screen p-6 bg-[#355E3B] text-white font-mono select-none overflow-hidden relative">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customHeartPop {
          0% { transform: scale(0.4); opacity: 0.5; }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes customShatterFall {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          15% { transform: translateY(-20px) scale(1.1) rotate(15deg); opacity: 1; }
          100% { transform: translateY(90vh) scale(0.6) rotate(-180deg); opacity: 0; }
        }
        .custom-animate-pop { animation: customHeartPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .custom-animate-shatter { animation: customShatterFall 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      `}} />

      <div className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-hidden">
        {shatteredParticles.map(p => (
          <div key={p.id} className="custom-animate-pop custom-animate-shatter text-2xl absolute drop-shadow-[0_4px_0_rgba(0,0,0,1)]" style={{ left: p.left, top: '80px' }}>
            {p.char}
          </div>
        ))}
      </div>

      {/* ARCADE HEADER HUD PANEL */}
      <div className="w-full max-w-lg mt-2 flex flex-col items-center space-y-3 z-10">
        <h1 className="text-[#FFD700] text-2xl font-black tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
          ENERGY QUEST
        </h1>

        <div className="w-full space-y-1">
          <div className="flex justify-between text-[10px] uppercase font-bold text-[#FFD700]">
            <span>{isScanning ? "Scanning Target Device" : "Level Progress"}</span>
            <span>{isScanning ? "CAMERA INTERACTION" : `Zone {step} / 5`}</span>
          </div>
          <div className="w-full bg-black/40 h-3 border border-[#FFD700] p-[2px]">
            <div className="bg-[#FFC200] h-full transition-all duration-300" style={{ width: isScanning ? '100%' : `${(step / 5) * 100}%` }} />
          </div>
        </div>

        {/* HEALTH CONTROLLER HUD CONTAINER */}
        <div className="w-full space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#FFD700] flex justify-between">
            <span>Eco-Vitality (Health)</span>
            {displayGoldHearts > 0 && <span className="text-[#FFC200] text-[9px] font-black animate-pulse">✨ ABSORPTION ACTIVE ✨</span>}
          </div>
          <div className="flex flex-wrap gap-1 bg-black/30 p-2 border border-black/40 min-h-[44px] items-center relative">
            {[...Array(displayRedHearts)].map((_, i) => (
              <span key={`red-${i}`} className={`text-xl drop-shadow-[1px_2px_0px_rgba(0,0,0,1)] inline-block ${popTrigger ? 'custom-animate-pop' : ''}`}>❤️</span>
            ))}
            {[...Array(10 - displayRedHearts)].map((_, i) => (
              <span key={`empty-${i}`} className="text-xl opacity-20 filter grayscale inline-block">❤️</span>
            ))}
            {[...Array(displayGoldHearts)].map((_, i) => (
              <span key={`gold-${i}`} className={`text-xl drop-shadow-[1px_2px_0px_rgba(0,0,0,1)] inline-block ${popTrigger ? 'custom-animate-pop' : ''}`}>💛</span>
            ))}
          </div>
        </div>
      </div>

      {/* CENTRAL RENDER STAGE FRAME */}
      {isScanning ? (
        <div className="w-full max-w-md my-auto z-10 bg-black/40 border-4 border-[#FFD700] p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h2 className="text-[#FFD700] text-sm font-black uppercase tracking-wide border-b border-[#FFD700]/20 pb-1">
              📷 UPLOAD SCANNER: {activeApplianceToScan}
            </h2>
            <div className="w-full h-44 bg-black border-2 border-[#FFD700]/40 flex flex-col items-center justify-center relative overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Scanned view" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4 space-y-2 cursor-pointer" onClick={triggerUploadClick}>
                  <span className="text-3xl block filter drop-shadow-[0_2px_0_rgba(0,0,0,1)] hover:scale-110 transition-transform">📷</span>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Tap viewfinder to take picture / upload</p>
                </div>
              )}
              {isProcessingScan && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center space-y-2 z-20">
                  <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent animate-spin rounded-full" />
                  <p className="text-[9px] text-[#FFD700] font-black uppercase tracking-widest animate-pulse">Analyzing System Footprint...</p>
                </div>
              )}
            </div>
          </div>

          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

          <div className="space-y-2 pt-1">
            {imagePreview ? (
              <Button type="button" onClick={runDiagnosticScan} disabled={isProcessingScan} className="w-full bg-[#FFD700] hover:bg-[#FFC200] text-black font-black uppercase rounded-none border-2 border-black text-xs h-10">
                CONFIRM & LINK ARTIFACT
              </Button>
            ) : (
              <Button type="button" onClick={triggerUploadClick} className="w-full bg-transparent border-2 border-[#FFD700] hover:bg-black/30 text-[#FFD700] font-black rounded-none text-xs h-10">
                CHOOSE IMAGE TARGET
              </Button>
            )}
            <Button type="button" onClick={() => setIsScanning(false)} disabled={isProcessingScan} className="w-full bg-transparent text-gray-500 hover:text-white font-bold text-[9px] uppercase h-6">
              🛑 Skip Diagnostics
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md my-auto z-10 max-h-[60vh] flex flex-col justify-between space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-[#FFD700] uppercase tracking-wide border-b border-[#FFD700]/30 pb-2">📍 REGION INITIALIZATION</h2>
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="font-bold text-xs text-[#FFC200] uppercase">1. What's your ZIP code?</Label>
                <Input id="zipCode" maxLength={5} placeholder="33620" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value.replace(/\D/g,''))} className="bg-black/40 border-2 border-[#FFD700] text-white font-bold rounded-none h-10 text-sm focus:border-[#FFC200]" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="householdSize" className="font-bold text-xs text-[#FFC200] uppercase">2. Household Party Size?</Label>
                <Input id="householdSize" type="number" placeholder="3" value={formData.householdSize} onChange={(e) => handleInputChange('householdSize', e.target.value)} className="bg-black/40 border-2 border-[#FFD700] text-white font-bold rounded-none h-10 max-w-[120px] focus:border-[#FFC200]" required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-black text-[#FFD700] uppercase tracking-wide border-b border-[#FFD700]/30 pb-2">🏠 HOME TYPE & SCALE</h2>
              <div className="space-y-2">
                <Label className="font-bold text-xs text-[#FFC200] uppercase">3. What structure do you live in?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Apartment', 'Townhouse / Condo', 'Single-family', 'Mobile home', 'Other'].map((type) => (
                    <button type="button" key={type} onClick={() => handleInputChange('homeType', type)} className={`p-2 text-left font-bold border-2 text-xs rounded-none transition-all ${formData.homeType === type ? 'bg-[#FFD700] text-black border-black font-black' : 'bg-black/40 border-[#FFD700] hover:bg-black/60'}`}>{formData.homeType === type ? '▶ ' : '  '} {type}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs text-[#FFC200] uppercase">4. How big is your home footprint?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Under 1k sq ft', '1k–2k sq ft', '2k–3k sq ft', '3k+ sq ft'].map((size) => (
                    <button type="button" key={size} onClick={() => handleInputChange('homeSize', size)} className={`p-2 text-left text-xs font-bold border-2 rounded-none transition-all ${formData.homeSize === size ? 'bg-[#FFD700] text-black border-black font-black' : 'bg-black/40 border-[#FFD700] hover:bg-black/60'}`}>{size}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-base font-black text-[#FFD700] uppercase tracking-wide border-b border-[#FFD700]/30 pb-2">🌊 CONSUMPTION PROFILES</h2>
              <div className="space-y-2">
                <Label className="font-bold text-xs text-[#FFC200] uppercase">5. Describe your energy usage habits:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['HVAC Blasting', 'Conservative', 'Middle', 'No Idea'].map((habit) => (
                    <button type="button" key={habit} onClick={() => handleInputChange('energyHabits', habit)} className={`p-2 text-center text-xs font-bold border-2 rounded-none ${formData.energyHabits === habit ? 'bg-[#FFD700] text-black font-black' : 'bg-black/40 border-[#FFD700]'}`}>{habit}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs text-[#FFC200] uppercase">6. Average daily shower length per person?</Label>
                <div className="flex flex-col gap-2">
                  {['Under 5 min', '10–20 min', '20+ min'].map((time) => (
                    <button type="button" key={time} onClick={() => handleInputChange('showerTime', time)} className={`p-2 text-left text-xs font-bold border-2 rounded-none ${formData.showerTime === time ? 'bg-[#FFD700] text-black font-black' : 'bg-black/40 border-[#FFD700]'}`}>{time}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-base font-black text-[#FFD700] uppercase tracking-wide border-b border-[#FFD700]/30 pb-2">🍳 KITCHEN & UTILITY LOADS</h2>
              <div className="space-y-2">
                <Label className="font-bold text-xs text-[#FFC200] uppercase">7. Hot meals cooked at home weekly?</Label>
                <div className="flex flex-col gap-2">
                  {['Takeout/Cold (0-5)', 'Dinners (6-12)', 'Heavy Cook (13+)'].map((freq) => (
                    <button type="button" key={freq} onClick={() => handleInputChange('cookingFrequency', freq)} className={`p-2 text-left text-xs font-bold border-2 rounded-none ${formData.cookingFrequency === freq ? 'bg-[#FFD700] text-black font-black' : 'bg-black/40 border-[#FFD700]'}`}>{freq}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs text-[#FFC200] uppercase">8. Weekly dishwasher runs?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['Hand-Wash', 'Eco (1-3)', 'Daily (4+)'].map((dw) => (
                    <button type="button" key={dw} onClick={() => handleInputChange('dishwasherFrequency', dw)} className={`p-2 text-center text-[11px] font-bold border-2 rounded-none ${formData.dishwasherFrequency === dw ? 'bg-[#FFD700] text-black font-black' : 'bg-black/40 border-[#FFD700]'}`}>{dw}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-[#FFD700] uppercase tracking-wide border-b border-[#FFD700]/30 pb-2">🔌 HEAVY VOLTAGE ARTIFACTS</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-[11px] text-[#FFC200] uppercase">9. Laundry Loads</Label>
                  <div className="flex flex-col gap-1.5">
                    {['1-3 loads', '4-7 loads', '8+ loads'].map((ld) => (
                      <button type="button" key={ld} onClick={() => handleInputChange('laundryLoads', ld)} className={`p-1.5 text-center text-xs border-2 font-bold rounded-none ${formData.laundryLoads === ld ? 'bg-[#FFD700] text-black' : 'bg-black/40 border-[#FFD700]'}`}>{ld}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[11px] text-[#FFC200] uppercase">10. Wash Temp</Label>
                  <div className="flex flex-col gap-1.5">
                    {['Cold (Eco)', 'Warm/Hot'].map((tmp) => (
                      <button type="button" key={tmp} onClick={() => handleInputChange('laundryTemp', tmp)} className={`p-1.5 text-center text-xs border-2 font-bold rounded-none ${formData.laundryTemp === tmp ? 'bg-[#FFD700] text-black' : 'bg-black/40 border-[#FFD700]'}`}>{tmp}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="font-bold text-[11px] text-[#FFC200] uppercase">11. High-Voltage Ecosystem (Select to Scan)</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['EV Charger', 'Pool/Hot Tub', 'Electric Heater', 'Gaming Rig', 'Electric Dryer', 'None'].map((appliance) => {
                    const isChecked = formData.appliances.includes(appliance);
                    return (
                      <button type="button" key={appliance} onClick={() => handleCheckboxChange(appliance)} className={`p-1.5 text-left text-[11px] border-2 font-bold rounded-none ${isChecked ? 'bg-[#FFD700] text-black border-black font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-black/40 border-[#FFD700]'}`}>
                        {isChecked ? '●' : '○'} {appliance}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTON CONTROLS */}
          <div className="flex gap-4 pt-4 border-t border-[#FFD700]/20">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="bg-transparent border-2 border-[#FFD700] hover:bg-black/40 text-[#FFD700] font-bold rounded-none text-xs h-10 px-6">
                BACK
              </button>
            )}
            {step < 5 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="flex-1 bg-[#FFD700] hover:bg-[#FFC200] text-black font-black uppercase rounded-none border-2 border-black text-xs h-10 tracking-wider"
              >
                NEXT ZONE ➔
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleFormSubmit}
                className="flex-1 bg-[#FFD700] hover:bg-[#FFC200] text-black font-black uppercase rounded-none border-2 border-black text-xs h-10 tracking-widest animate-bounce shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                LOCK BASELINE 🔌
              </button>
            )}
          </div>
        </div>
      )}

      {/* HUD DESIGN LOG */}
      <div className="w-full text-center text-[10px] font-bold text-[#FFC200]/40 z-10 uppercase tracking-widest">
        © 2026 OneEthos Arcade Engine
      </div>
    </div>
  );
}