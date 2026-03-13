"use client";
import "./dashboard.css";

import Link from "next/link";
import Image from "next/image";
import { clients } from "@/components/data/clients";
import { UserRoundPlus , User, UsersRound, ChevronRight } from "lucide-react";

export default function Dashboard() {
    const top5 = clients.slice(0, 5);

    return (
        <div className = "dashboardContainer">
            <div className="buttonContainer">

            <Link href="/clients/new" className="dashboardButton">
                <UserRoundPlus size={30} />
                Add Clients
            </Link>
            <Link href="/invite" className="dashboardButton">
                <UsersRound size={30} />
                Invite Collaborators
            </Link>

            </div>

            <div className="clientsContainer">
                <section className="clientsSection">
                    <div className="clientsHeaderRow">
                        <h2 className="clientsTitle">Clients</h2>
                    </div>

                    <div className="clientsList">
                    {top5.map((client, idx) => (
                        <Link
                        key={client.id}
                        href={`/clients/${client.slug}`}
                        className="clientRow"
                        >
                        <div className="clientLeft">
                            <div className="clientNumber">{idx + 1}.</div>

                            <div className="clientAvatarWrap">
                            <Image
                                src={client.photo || "/default-client.png"}
                                alt={client.name}
                                fill
                                className="clientAvatar"
                                sizes="44px"
                            />
                            </div>

                            <div className="clientName">{client.name}</div>
                        </div>

                        <ChevronRight className="clientChevron" size={22} />
                        </Link>
                    ))}
                    </div>
                </section>
            </div>

        </div>
    );
}