export type Client = {
  id: string;
  slug: string;
  name: string;
  photo: string;
  contactEmail: string;
  lastAssisted: string;
  totalReceived: number;
};

const defaultClientPhoto = "/user-round.png";

export const clients: Client[] = [
  {
    id: "1",
    slug: "john-smith",
    name: "John Smith",
    photo: defaultClientPhoto,
    contactEmail: "john.smith@email.com",
    lastAssisted: "2026-02-10",
    totalReceived: 1250.0,
  },
  {
    id: "2",
    slug: "maria-johnson",
    name: "Maria Johnson",
    photo: defaultClientPhoto,
    contactEmail: "maria.j@email.com",
    lastAssisted: "2026-01-28",
    totalReceived: 890.0,
  },
  {
    id: "3",
    slug: "david-walker",
    name: "David Walker",
    photo: defaultClientPhoto,
    contactEmail: "david.walker@email.com",
    lastAssisted: "2025-12-15",
    totalReceived: 2140.0,
  },
  {
    id: "4",
    slug: "sarah-mitchell",
    name: "Sarah Mitchell",
    photo: defaultClientPhoto,
    contactEmail: "sarah.m@email.com",
    lastAssisted: "2026-02-03",
    totalReceived: 560.0,
  },
  {
    id: "5",
    slug: "anthony-rodriguez",
    name: "Anthony Rodriguez",
    photo: defaultClientPhoto,
    contactEmail: "anthony.r@email.com",
    lastAssisted: "2026-01-12",
    totalReceived: 1750.0,
  },
  {
    id: "6",
    slug: "emily-davis",
    name: "Emily Davis",
    photo: defaultClientPhoto,
    contactEmail: "emily.d@email.com",
    lastAssisted: "2026-02-01",
    totalReceived: 430.0,
  },
  {
    id: "7",
    slug: "michael-lee",
    name: "Michael Lee",
    photo: defaultClientPhoto,
    contactEmail: "michael.lee@email.com",
    lastAssisted: "2025-11-22",
    totalReceived: 980.0,
  },
  {
    id: "8",
    slug: "olivia-thompson",
    name: "Olivia Thompson",
    photo: defaultClientPhoto,
    contactEmail: "olivia.t@email.com",
    lastAssisted: "2026-01-30",
    totalReceived: 1525.0,
  },
  {
    id: "9",
    slug: "daniel-clark",
    name: "Daniel Clark",
    photo: defaultClientPhoto,
    contactEmail: "daniel.c@email.com",
    lastAssisted: "2026-02-14",
    totalReceived: 670.0,
  },
  {
    id: "10",
    slug: "grace-hall",
    name: "Grace Hall",
    photo: defaultClientPhoto,
    contactEmail: "grace.h@email.com",
    lastAssisted: "2026-01-05",
    totalReceived: 1120.0,
  },
];