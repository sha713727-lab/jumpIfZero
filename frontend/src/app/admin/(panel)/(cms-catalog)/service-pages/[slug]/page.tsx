import { redirect } from "next/navigation";

type AdminServicePagesEditorRedirectProps = {
  readonly params: Promise<{ readonly slug: string }>;
};

export default async function AdminServicePagesEditorRedirect({
  params,
}: AdminServicePagesEditorRedirectProps) {
  const { slug } = await params;
  redirect(`/admin/services/${slug}`);
}
