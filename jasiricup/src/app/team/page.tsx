// src/app/team/page.tsx
import Image from "next/image";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  imageSrc: string;
  cardColor: string;
  sqcardColor?: string;
}

const FALLBACK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
    name: 'John Doe',
    role: 'Co-Founder',
    description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
    cardColor: 'bg-purple-700',
    sqcardColor: 'bg-purple-600',
  },
  {
    id: '2',
    imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
    name: 'Jane Doe',
    role: 'Co-Founder',
    description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
    cardColor: 'bg-green-700',
    sqcardColor: 'bg-green-600',
  },
  {
    id: '3',
    imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
    name: 'Joseph Did',
    role: 'Program Lead',
    description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
    cardColor: 'bg-gray-800',
    sqcardColor: 'bg-gray-700',
  },
];

async function getTeamContent(): Promise<TeamMember[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const response = await fetch(`${baseUrl}/api/site-content?page=team`, {
      next: { tags: ['site-content-team'], revalidate: 300 },
    });

    if (!response.ok) return FALLBACK_TEAM_MEMBERS;

    const data = await response.json();
    const membersSection = data.data?.find((d: { section: string }) => d.section === 'members');
    
    if (membersSection?.content?.members?.length > 0) {
      return membersSection.content.members;
    }
    
    return FALLBACK_TEAM_MEMBERS;
  } catch {
    return FALLBACK_TEAM_MEMBERS;
  }
}

export default async function TeamPage() {
  const teamMembers = await getTeamContent();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Team', href: '/team' },
  ];

  return (
    <div className="container mx-auto px-4 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Quote Section */}
      <section className="bg-gray-100 rounded-lg p-6 md:p-8 mb-12 text-start">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
          &ldquo;I am going to say something <span className="text-purple-600">mighty profound</span>&rdquo;
        </h1>
        <p className="text-lg md:text-xl text-gray-600">Something Sayer</p>
      </section>

      {/* Team Member Cards */}
      <section className="space-y-12">
        {teamMembers.map((member, index) => (
          <TeamMemberCard
            key={member.id}
            imageSrc={member.imageSrc}
            name={member.name}
            description={member.description}
            cardColor={member.cardColor}
            sqcardColor={member.sqcardColor || 'bg-purple-600'}
            reverseOrder={index % 2 !== 0}
          />
        ))}
      </section>
    </div>
  );
}