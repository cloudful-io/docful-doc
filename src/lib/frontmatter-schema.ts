import { z } from "astro/zod";

export const wikiFrontmatterSchema = z.object({
  title: z.string().trim().min(1, "title must not be empty"),
  author: z.string().trim().min(1).optional(),
});
