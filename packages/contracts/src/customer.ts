import { z } from "zod";

export const demoCustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  company: z.string(),
  role: z.string(),
  phone: z.string(),
  location: z.string(),
  memberSince: z.string(),
  plan: z.string(),
  initials: z.string(),
});

export type DemoCustomer = z.infer<typeof demoCustomerSchema>;
