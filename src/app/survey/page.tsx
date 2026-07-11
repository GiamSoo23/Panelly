"use client";

// NOTE(connie): functional placeholder so the survey → save → history flow
// works end-to-end. Adriana owns this page — replace the UI freely; just keep
// posting a SurveyInputSchema-shaped payload to /api/survey. The question
// options come from the *_OPTIONS lists in @/lib/schemas/survey.

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DISHWASHER_OPTIONS,
  HOME_FEATURE_OPTIONS,
  HOME_SIZE_OPTIONS,
  HOME_TYPE_OPTIONS,
  HOT_MEALS_OPTIONS,
  LAUNDRY_LOADS_OPTIONS,
  SHOWER_TIME_OPTIONS,
  USAGE_HABITS_OPTIONS,
  WASHER_TEMP_OPTIONS,
} from "@/lib/schemas/survey";

type Option = { readonly value: string; readonly label: string };

function RadioQuestion({
  name,
  question,
  options,
  value,
  onChange,
}: {
  name: string;
  question: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">{question}</legend>
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            required
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

export default function SurveyPage() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [homeType, setHomeType] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [homeSize, setHomeSize] = useState("");
  const [usageHabits, setUsageHabits] = useState("");
  const [showerTime, setShowerTime] = useState("");
  const [hotMeals, setHotMeals] = useState("");
  const [dishwasherRuns, setDishwasherRuns] = useState("");
  const [laundryLoads, setLaundryLoads] = useState("");
  const [washerTemp, setWasherTemp] = useState("");
  const [homeFeatures, setHomeFeatures] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  function toggleFeature(value: string) {
    setHomeFeatures((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }
      // "None of these" clears the rest, and picking anything clears "none".
      if (value === "none") {
        return ["none"];
      }
      return [...current.filter((item) => item !== "none"), value];
    });
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (homeFeatures.length === 0) {
      setStatus("Pick at least one option in the last question (or “None of these”).");
      return;
    }

    setStatus("Saving your survey…");

    // /api/survey takes the SurveyInput object directly as the body.
    const payload = {
      zip,
      homeType,
      householdSize: Number(householdSize),
      homeSize,
      usageHabits,
      showerTime,
      hotMeals,
      dishwasherRuns,
      laundryLoads,
      washerTemp,
      homeFeatures,
    };

    const response = await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Submission failed.");
      return;
    }

    router.push(`/results/${data.submissionId}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          OneEthos survey
        </p>
        <h1 className="text-3xl font-semibold">Help us learn your home energy story</h1>
        <p className="text-muted-foreground">
          Share a few basics about your home and habits so we can estimate your energy
          use and save it to your history log.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Survey questions</CardTitle>
          <CardDescription>
            We use these details to estimate your energy use and keep a record for later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="zip">1. What&apos;s your zip code?</Label>
              <Input
                id="zip"
                value={zip}
                onChange={(event) => setZip(event.target.value)}
                placeholder="80203"
                inputMode="numeric"
                pattern="\d{5}"
                maxLength={5}
                required
              />
            </div>

            <RadioQuestion
              name="homeType"
              question="2. What type of home do you live in?"
              options={HOME_TYPE_OPTIONS}
              value={homeType}
              onChange={setHomeType}
            />

            <div className="grid gap-2">
              <Label htmlFor="householdSize">
                3. How many people live in your household?
              </Label>
              <Input
                id="householdSize"
                type="number"
                min="1"
                max="999"
                value={householdSize}
                onChange={(event) => setHouseholdSize(event.target.value)}
                placeholder="3"
                required
              />
            </div>

            <RadioQuestion
              name="homeSize"
              question="4. How big is your home?"
              options={HOME_SIZE_OPTIONS}
              value={homeSize}
              onChange={setHomeSize}
            />

            <RadioQuestion
              name="usageHabits"
              question="5. How would you describe your energy usage habits?"
              options={USAGE_HABITS_OPTIONS}
              value={usageHabits}
              onChange={setUsageHabits}
            />

            <RadioQuestion
              name="showerTime"
              question="6. On average, how long does each person in your household spend in the shower?"
              options={SHOWER_TIME_OPTIONS}
              value={showerTime}
              onChange={setShowerTime}
            />

            <RadioQuestion
              name="hotMeals"
              question="7. How many times a week does your household cook hot meals at home?"
              options={HOT_MEALS_OPTIONS}
              value={hotMeals}
              onChange={setHotMeals}
            />

            <RadioQuestion
              name="dishwasherRuns"
              question="8. How many times a week does the household dishwasher run?"
              options={DISHWASHER_OPTIONS}
              value={dishwasherRuns}
              onChange={setDishwasherRuns}
            />

            <RadioQuestion
              name="laundryLoads"
              question="9. How many total loads of laundry does the household run per week?"
              options={LAUNDRY_LOADS_OPTIONS}
              value={laundryLoads}
              onChange={setLaundryLoads}
            />

            <RadioQuestion
              name="washerTemp"
              question="10. When running the washer, what is the household's default temperature choice?"
              options={WASHER_TEMP_OPTIONS}
              value={washerTemp}
              onChange={setWasherTemp}
            />

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">
                11. Which of these do you have at home? (select all that apply)
              </legend>
              {HOME_FEATURE_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={homeFeatures.includes(option.value)}
                    onChange={() => toggleFeature(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>

            <Button type="submit">Save survey</Button>
            {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
