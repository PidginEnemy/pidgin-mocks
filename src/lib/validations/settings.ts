import { z } from "zod";
import { MAX_PORT, MIN_PORT } from "@/lib/settings/constants";

export const settingsInputSchema = z.object({
  port: z
    .number()
    .int("Порт должен быть целым числом")
    .min(MIN_PORT, `Порт должен быть не меньше ${MIN_PORT}`)
    .max(MAX_PORT, `Порт должен быть не больше ${MAX_PORT}`),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;
