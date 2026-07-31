import { demoCustomer } from "@/constants/demoCustomer";

export type DemoCustomer = typeof demoCustomer;

export async function getDemoCustomer(): Promise<DemoCustomer> {
  return demoCustomer;
}

export { demoCustomer };
