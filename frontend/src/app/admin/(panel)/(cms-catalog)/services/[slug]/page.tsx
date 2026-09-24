import { ServicePageEditorPage } from "@/components/admin/ServicePageEditorPage";

type AdminServiceEditorRouteProps = {
  readonly params: Promise<{ readonly slug: string }>;
};

export default async function AdminServiceEditorRoute({
  params,
}: AdminServiceEditorRouteProps) {
  const { slug } = await params;
  return <ServicePageEditorPage slug={slug} />;
}
