"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { TemplateId } from "@/templates/types";

type TemplateStore = {
  template: TemplateId;
  setTemplate: (template: TemplateId) => void;
};

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      template: "standard",
      setTemplate: (template) => set({ template }),
    }),
    {
      name: "airobi:template:v1",
      storage: typeof window !== "undefined" ? createJSONStorage(() => localStorage) : undefined,
    },
  ),
);
