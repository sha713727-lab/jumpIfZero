import { ServicePageEditorPage } from "@/components/admin/ServicePageEditorPage";

type AdminServicePageEditorRouteProps = {
  readonly params: Promise<{ readonly slug: string }>;
};

export default async function AdminServicePageEditorRoute({
  params,
}: AdminServicePageEditorRouteProps) {
  const { slug } = await params;
  return <ServicePageEditorPage slug={slug} />;
}
