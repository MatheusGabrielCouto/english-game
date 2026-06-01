import { z } from 'zod';

export const playerNameSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(32, 'Nome deve ter no máximo 32 caracteres'),
});

export type PlayerNameFormValues = z.infer<typeof playerNameSchema>;

/** @deprecated Use playerNameSchema */
export const displayNameSchema = playerNameSchema;

/** @deprecated Use PlayerNameFormValues */
export type DisplayNameFormValues = PlayerNameFormValues;
