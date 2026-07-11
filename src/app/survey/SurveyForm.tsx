"use client";

import { ArrowLeft, ArrowRight, Camera, Check, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import {
  cookingFrequencyOptions,
  dishwasherFrequencyOptions,
  emptySurveyDraft,
  energyUsageOptions,
  homeFeatureOptions,
  homeSizeOptions,
  homeTypeOptions,
  laundryLoadsOptions,
  parseSurveyDraft,
  showerDurationOptions,
  SURVEY_DRAFT_KEY,
  type SurveyDraft,
  type SurveyErrors,
  toggleHomeFeature,
  validateStep,
  washerTemperatureOptions,
} from "./survey-draft";

const steps = [
  { title: "Home Base", kicker: "Build your household profile", fields: ["zipCode", "homeType", "householdSize", "homeSize"] },
  { title: "Energy Style", kicker: "Map your everyday habits", fields: ["energyUsageHabits", "showerDuration", "cookingFrequency"] },
  { title: "Weekly Quests", kicker: "Tell us about recurring routines", fields: ["dishwasherFrequency", "laundryLoads", "washerTemperature"] },
  { title: "Power-Ups", kicker: "Add your household's major features", fields: ["homeFeatures"] },
] as const;

type SingleField = Exclude<keyof SurveyDraft, "zipCode" | "householdSize" | "homeFeatures">;

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} role="alert" className="mt-2 text-sm font-bold text-[#a33d32]">{message}</p>;
}

function RadioQuestion({
  field,
  legend,
  options,
  value,
  error,
  onChange,
}: {
  field: SingleField;
  legend: string;
  options: readonly SurveyDraft[SingleField][];
  value: SurveyDraft[SingleField];
  error?: string;
  onChange: (field: SingleField, value: SurveyDraft[SingleField]) => void;
}) {
  const errorId = `${field}-error`;
  return (
    <fieldset className="space-y-3" aria-describedby={error ? errorId : undefined}>
      <legend className="text-lg font-black leading-7">{legend} <span className="text-[#a33d32]" aria-label="required">*</span></legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option, index) => {
          const selected = value === option;
          return (
            <label key={option} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition focus-within:ring-4 focus-within:ring-[#ffd84d] ${selected ? "border-[#355e3b] bg-[#fff4b8] shadow-[3px_3px_0_#355e3b]" : "border-[#355e3b]/15 bg-white hover:border-[#355e3b]/40"}`}>
              <input id={`${field}-${index}`} type="radio" name={field} value={option} checked={selected} onChange={() => onChange(field, option)} className="size-4 shrink-0 accent-[#355e3b]" />
              <span className="flex-1">{option}</span>
              {selected && <Check className="size-4 shrink-0" aria-hidden="true" />}
            </label>
          );
        })}
      </div>
      <ErrorText id={errorId} message={error} />
    </fieldset>
  );
}

export function SurveyForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<SurveyDraft>(emptySurveyDraft);
  const [errors, setErrors] = useState<SurveyErrors>({});
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const restoreDraft = window.setTimeout(() => {
      const saved = parseSurveyDraft(window.sessionStorage.getItem(SURVEY_DRAFT_KEY));
      if (saved) setDraft(saved);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restoreDraft);
  }, []);

  useEffect(() => {
    if (hydrated) window.sessionStorage.setItem(SURVEY_DRAFT_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const updateField = <K extends keyof SurveyDraft>(field: K, value: SurveyDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const focusFirstError = (nextErrors: SurveyErrors) => {
    const firstField = steps[step].fields.find((field) => nextErrors[field]);
    if (!firstField) return;
    window.requestAnimationFrame(() => {
      const targetId = firstField === "zipCode" || firstField === "householdSize"
        ? firstField
        : `${firstField}-0`;
      document.getElementById(targetId)?.focus();
    });
  };

  const validateCurrentStep = () => {
    const nextErrors = validateStep(draft, step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !validateCurrentStep()) return;
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    // Temporary hackathon handoff: keep the validated draft only for this
    // browser tab until the teammate-owned capture/API workflow replaces it.
    window.sessionStorage.setItem(SURVEY_DRAFT_KEY, JSON.stringify(draft));
    router.push("/capture");
  };

  const goBack = () => {
    setErrors({});
    if (step > 0) {
      setStep((current) => current - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/challenge");
    }
  };

  const toggleFeature = (feature: (typeof homeFeatureOptions)[number]) => {
    updateField("homeFeatures", toggleHomeFeature(draft.homeFeatures, feature));
  };

  const progress = (step + 1) / steps.length * 100;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a7f6e]">Quest {step + 1} of {steps.length}</p><h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{steps[step].title}</h1><p className="mt-2 font-medium text-[#657568]">{steps[step].kicker}</p></div><span className="hidden rounded-full bg-[#fff4b8] px-3 py-2 text-xs font-black sm:inline-flex">{Math.round(progress)}% through survey</span></div>
      <div className="mb-8 h-3 overflow-hidden rounded-full bg-[#dfe9e1]" role="progressbar" aria-label="Survey progress" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length}><div className="h-full rounded-full bg-[#ffd84d] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div>

      <form onSubmit={handleSubmit} noValidate className="rounded-[2rem] border-2 border-[#355e3b] bg-white p-5 shadow-[7px_8px_0_#355e3b] sm:p-8">
        <div key={step} className="space-y-9">
          {step === 0 && <>
            <div><label htmlFor="zipCode" className="text-lg font-black">What&apos;s your ZIP code? <span className="text-[#a33d32]" aria-label="required">*</span></label><p id="zip-help" className="mt-1 text-sm text-[#657568]">Use the 5-digit ZIP for your home. We do not verify it against a live location service here.</p><input id="zipCode" name="zipCode" type="text" inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="33620" value={draft.zipCode} onChange={(event) => updateField("zipCode", event.target.value.replace(/\D/g, "").slice(0, 5))} aria-describedby={`zip-help${errors.zipCode ? " zipCode-error" : ""}`} aria-invalid={Boolean(errors.zipCode)} className="mt-3 min-h-12 w-full rounded-xl border-2 border-[#355e3b]/25 bg-[#fffdf7] px-4 text-lg font-bold outline-none focus:border-[#355e3b] focus:ring-4 focus:ring-[#ffd84d]" /><ErrorText id="zipCode-error" message={errors.zipCode} /></div>
            <RadioQuestion field="homeType" legend="What type of home do you live in?" options={homeTypeOptions} value={draft.homeType} error={errors.homeType} onChange={updateField} />
            <div><label htmlFor="householdSize" className="text-lg font-black">How many people live in your household? <span className="text-[#a33d32]" aria-label="required">*</span></label><input id="householdSize" name="householdSize" type="text" inputMode="numeric" maxLength={3} value={draft.householdSize} onChange={(event) => updateField("householdSize", event.target.value.replace(/\D/g, "").slice(0, 3))} aria-describedby={errors.householdSize ? "householdSize-error" : undefined} aria-invalid={Boolean(errors.householdSize)} className="mt-3 min-h-12 w-full rounded-xl border-2 border-[#355e3b]/25 bg-[#fffdf7] px-4 text-lg font-bold outline-none focus:border-[#355e3b] focus:ring-4 focus:ring-[#ffd84d]" /><ErrorText id="householdSize-error" message={errors.householdSize} /></div>
            <RadioQuestion field="homeSize" legend="How big is your home?" options={homeSizeOptions} value={draft.homeSize} error={errors.homeSize} onChange={updateField} />
          </>}

          {step === 1 && <>
            <RadioQuestion field="energyUsageHabits" legend="How would you describe your energy usage habits?" options={energyUsageOptions} value={draft.energyUsageHabits} error={errors.energyUsageHabits} onChange={updateField} />
            <RadioQuestion field="showerDuration" legend="On average, how long does each person in your household spend in the shower?" options={showerDurationOptions} value={draft.showerDuration} error={errors.showerDuration} onChange={updateField} />
            <RadioQuestion field="cookingFrequency" legend="How many times a week does your household cook hot meals at home?" options={cookingFrequencyOptions} value={draft.cookingFrequency} error={errors.cookingFrequency} onChange={updateField} />
          </>}

          {step === 2 && <>
            <RadioQuestion field="dishwasherFrequency" legend="How many times a week does the household dishwasher run?" options={dishwasherFrequencyOptions} value={draft.dishwasherFrequency} error={errors.dishwasherFrequency} onChange={updateField} />
            <RadioQuestion field="laundryLoads" legend="How many total loads of laundry does the household run per week?" options={laundryLoadsOptions} value={draft.laundryLoads} error={errors.laundryLoads} onChange={updateField} />
            <RadioQuestion field="washerTemperature" legend="When running the washer, what is the household's default temperature choice?" options={washerTemperatureOptions} value={draft.washerTemperature} error={errors.washerTemperature} onChange={updateField} />
          </>}

          {step === 3 && <>
            <fieldset aria-describedby={`features-help${errors.homeFeatures ? " homeFeatures-error" : ""}`}>
              <legend className="text-lg font-black">Which of these do you have at home? <span className="text-[#a33d32]" aria-label="required">*</span></legend><p id="features-help" className="mt-1 text-sm text-[#657568]">Select all that apply.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">{homeFeatureOptions.map((option, index) => { const selected = draft.homeFeatures.includes(option); return <label key={option} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition focus-within:ring-4 focus-within:ring-[#ffd84d] ${selected ? "border-[#355e3b] bg-[#fff4b8] shadow-[3px_3px_0_#355e3b]" : "border-[#355e3b]/15 bg-white hover:border-[#355e3b]/40"}`}><input id={`homeFeatures-${index}`} type="checkbox" name="homeFeatures" value={option} checked={selected} onChange={() => toggleFeature(option)} className="size-4 shrink-0 accent-[#355e3b]" /><span className="flex-1">{option}</span>{selected && <Check className="size-4" aria-hidden="true" />}</label>; })}</div>
              <ErrorText id="homeFeatures-error" message={errors.homeFeatures} />
            </fieldset>
            <aside className="rounded-3xl border-2 border-[#ffd84d] bg-[#fff9d8] p-5 sm:p-6" aria-labelledby="camera-preview"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#355e3b] text-[#ffd84d]"><Camera className="size-6" aria-hidden="true" /></span><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#6a7f6e]">Next step</p><h2 id="camera-preview" className="mt-1 text-xl font-black">Scan your appliances</h2><p className="mt-2 text-sm font-medium leading-6 text-[#657568]">On the next step, you can take a photo of your kitchen or household appliances to help Panelly personalize your energy profile.</p></div></div></aside>
          </>}
        </div>

        <div className="mt-10 flex flex-col-reverse justify-between gap-3 border-t border-[#355e3b]/15 pt-6 sm:flex-row">
          <button type="button" onClick={goBack} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-[#355e3b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd84d]"><ArrowLeft className="size-4" aria-hidden="true" /> {step === 0 ? "Back to Challenge" : "Back"}</button>
          <button type="submit" disabled={submitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#355e3b] px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0_#ffd84d] transition motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd84d] disabled:cursor-wait disabled:opacity-65">{submitting ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : step === steps.length - 1 ? <Camera className="size-4" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />}{submitting ? "Saving your draft…" : step === steps.length - 1 ? "Continue to Appliance Scan" : "Continue"}{!submitting && <ArrowRight className="size-4" aria-hidden="true" />}</button>
        </div>
      </form>
      <p className="mt-6 flex items-start justify-center gap-2 text-center text-xs font-medium leading-5 text-[#657568]"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> Your answers help estimate household energy habits. They do not produce guaranteed savings.</p>
    </div>
  );
}
