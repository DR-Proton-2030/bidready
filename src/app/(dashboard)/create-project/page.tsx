"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useProjects } from "@/hooks/useProjects/useProjects";
import { useStepper } from "@/hooks/useStepper";

const statusOptions = ["active", "completed", "on-hold", "in-progress"];

const stepMeta = [
  {
    id: 1,
    title: "Project basics",
    description: "Name and describe the work clearly",
  },
  {
    id: 2,
    title: "Project scope",
    description: "Define boundaries and responsibilities",
  },
  {
    id: 3,
    title: "Project status",
    description: "Set the current phase and review",
  },
];



export default function CreateProjectPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    scope: "",
    status: "active",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const submitIntentRef = useRef(false);
  const { handleNewProject } = useProjects();
  const router = useRouter();
  const {
    currentStep,
    completedSteps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isFirstStep,
    isLastStep,
  } = useStepper(stepMeta.length);
  const currentStepMeta = stepMeta[currentStep - 1];
  const progressPercent = Math.round((currentStep / stepMeta.length) * 100);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleStatusChange = (status: string) => {
    setForm({ ...form, status });
    setError("");
  };

  const formatStatus = (value: string) =>
    value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const getStepError = (step: number) => {
    if (step === 1) {
      if (!form.title || !form.description) {
        return "Add a title and description to continue.";
      }
    }

    if (step === 2) {
      if (!form.scope) {
        return "Add the project scope to continue.";
      }
    }

    return "";
  };

  const handleNextStep = () => {
    const stepError = getStepError(currentStep);
    if (stepError) {
      setError(stepError);
      return;
    }
    setError("");
    goToNextStep();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLastStep) {
      handleNextStep();
      return;
    }
    if (!submitIntentRef.current) {
      return;
    }
    submitIntentRef.current = false;
    if (!form.title || !form.description || !form.scope) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      // Add a small delay so the user can see the "Creating Project..." state
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await handleNewProject(form);
      // success - navigate to projects list
      router.push("/projects");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create project";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full px-4 py-6 md:px-8 bg-gray-100 h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-6 top-8 h-52 w-52 rounded-full bg-orange-100/80 blur-3xl" />
        <div className="absolute right-8 top-0 h-72 w-72 rounded-full bg-orange-200/60 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-amber-100/70 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl mt-3">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-white/70 bg-white/70 p-6 ">
            <div className="flex items-center justify-between">
              <div>
             
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  Step {currentStep} of {stepMeta.length}
                </p>
              </div>
           
            </div>

            <div className="mt-6 space-y-4">
              {stepMeta.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = completedSteps.includes(step.id);
                const isClickable = step.id <= currentStep;

                return (
                  <div key={step.id} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => isClickable && goToStep(step.id)}
                      disabled={!isClickable}
                      className={`group flex w-full items-start gap-3 text-left transition ${
                        isClickable
                          ? "cursor-pointer"
                          : "cursor-not-allowed "
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold transition ${
                          isActive
                            ? "border-transparent bg-primary text-white shadow-[0_12px_24px_rgba(244,124,32,0.35)]"
                            : isCompleted
                            ? "border-orange-200/80 bg-white text-orange-500"
                            : "border-slate-200/80 bg-white/80 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <Check size={16} /> : `0${step.id}`}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            isActive ? "text-slate-900" : "text-slate-600"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    </button>
                    {index < stepMeta.length - 1 && (
                      <div className="ml-5 mt-3 h-6 w-px bg-slate-200/80" />
                    )}
                  </div>
                );
              })}
            </div>

          
          </aside>

          <section className="rounded-3xl border border-white/70 bg-white/80 p-6 ">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {currentStepMeta.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                    Create Project
                  </h2>
                </div>
                <div className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600">
                  Step {currentStep} of {stepMeta.length}
                </div>
              </div>
              <p className="text-sm text-slate-500">
                {currentStepMeta.description}
              </p>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              {error && (
                <div
                  role="alert"
                  className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              <div
                key={currentStep}
                className="space-y-6"
                style={{ animation: "fadeSlide 380ms ease-out" }}
              >
                {currentStep === 1 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-slate-900">
                        Project title
                      </label>
                      <input
                        name="title"
                        type="text"
                        value={form.title}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                        placeholder="e.g. Midtown Office Renovation"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-slate-900">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                        placeholder="Outline the scope of work, scope notes, and key milestones."
                        rows={4}
                        required
                      />
                    </div>
                   
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-slate-900">
                        Scope
                      </label>
                      <input
                        name="scope"
                        type="text"
                        value={form.scope}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                        placeholder="e.g. Level 2 interiors, MEP coordination only"
                        required
                      />
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Deliverables
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        List plans, takeoffs, or reports your team should deliver.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Stakeholders
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Note who approves scope changes or final bids.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid gap-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-900">
                        Status
                      </label>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {statusOptions.map((status) => {
                          const isActive = form.status === status;
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(status)}
                              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                                isActive
                                  ? "border-transparent bg-primary text-white shadow-[0_12px_24px_rgba(244,124,32,0.35)]"
                                  : "border-slate-200/80 bg-white/80 text-slate-600 hover:border-orange-200"
                              }`}
                            >
                              {formatStatus(status)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Review
                      </p>
                      <div className="mt-4 grid gap-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">Title</span>
                          <span className="font-semibold text-slate-900">
                            {form.title || "-"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">Scope</span>
                          <span className="font-semibold text-slate-900">
                            {form.scope || "-"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">Status</span>
                          <span className="font-semibold text-slate-900">
                            {formatStatus(form.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={isFirstStep || isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {!isLastStep ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(244,124,32,0.35)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Next step
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      onClick={() => {
                        submitIntentRef.current = true;
                      }}
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(244,124,32,0.35)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? "Creating Project..." : "Create Project"}
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  
  );
}
