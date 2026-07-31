import { demoCustomer } from "@/constants/demoCustomer";
import type { DemoCustomer } from "@/schemas/customer";

export type { DemoCustomer };

export async function getDemoCustomer(): Promise<DemoCustomer> {
  return demoCustomer;
}

export { demoCustomer };
