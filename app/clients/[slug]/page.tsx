import { clients } from "@/components/data/clients";

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const client = clients.find((c) => c.slug === slug);

  if (!client) return <div style={{ padding: 24 }}>Client not found</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Client Card In Progress</h1>

      <p><strong>Name:</strong> {client.name}</p>
      <p><strong>Email:</strong> {client.contactEmail}</p>
      <p><strong>Last Assisted:</strong> {client.lastAssisted}</p>
      <p>
        <strong>Total Received:</strong>{" "}
        {client.totalReceived.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </p>
    </div>
  );
}