import { redirect } from "next/navigation";

export default async function LegacyProcurementDetailPage({
  params,
}: {
  params: Promise<{ ocid: string }>;
}) {
  const { ocid } = await params;
  redirect(`/procurement/browse/${encodeURIComponent(ocid)}`);
}
