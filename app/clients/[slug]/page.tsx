import { clients } from "@/components/data/clients";
import ClientCard from "./ClientCard"

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const client = clients.find((c) => c.slug === slug);

  if (!client) {
    return <div>Client not found</div>;
  }

  return <ClientCard client={client} />;
}