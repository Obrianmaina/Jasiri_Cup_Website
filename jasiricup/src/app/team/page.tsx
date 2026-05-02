// src/app/team/page.tsx
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  imageSrc: string;
  cardColor: string;
  sqcardColor: string;
  socials?: { platform: string; url: string }[];
}

const FALLBACK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
    name: 'Jane Doe',
    role: 'Co-Founder',
    description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
    cardColor: 'bg-purple-700',
    sqcardColor: 'bg-purple-500',
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'x', url: 'https://x.com' }
    ]
  },
  {
    id: '2',
    imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
    name: 'Joseph Did',
    role: 'Program Lead',
    description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
    cardColor: 'bg-green-700',
    sqcardColor: 'bg-green-500',
    socials: [
      { platform: 'instagram', url: 'https://instagram.com' }
    ]
  },
];

const COLOR_PAIRS = [
  { cardColor: 'bg-purple-700', sqcardColor: 'bg-purple-500' },
  { cardColor: 'bg-green-700',  sqcardColor: 'bg-green-500'  },
];

function applyAlternatingColors(members: Omit<TeamMember, 'cardColor' | 'sqcardColor'>[]): TeamMember[] {
  return members.map((member, index) => ({
    ...member,
    cardColor: COLOR_PAIRS[index % COLOR_PAIRS.length].cardColor,
    sqcardColor: COLOR_PAIRS[index % COLOR_PAIRS.length].sqcardColor,
  }));
}

async function getTeamContent(): Promise<TeamMember[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) return applyAlternatingColors(FALLBACK_TEAM_MEMBERS);

    const response = await fetch(`${baseUrl}/api/site-content?page=team`, {
      next: { tags: ['site-content-team'], revalidate: 300 },
    });
    if (!response.ok) return applyAlternatingColors(FALLBACK_TEAM_MEMBERS);

    const data = await response.json();
    const membersSection = data.data?.find((d: { section: string }) => d.section === 'members');
    
    if (membersSection?.content?.members?.length > 0) {
      return applyAlternatingColors(membersSection.content.members);
    }
    return applyAlternatingColors(FALLBACK_TEAM_MEMBERS);
  } catch {
    return applyAlternatingColors(FALLBACK_TEAM_MEMBERS);
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

      <section className="bg-gray-100 rounded-2xl p-6 md:p-10 mb-12 text-start shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800 leading-tight">
          &ldquo;Empowering girls, one cup at a time.&rdquo;
        </h1>
        <p className="text-lg md:text-xl text-gray-500 font-medium">- The JasiriCup Team</p>
      </section>

      <section className="space-y-16">
        {teamMembers.map((member, index) => (
          <TeamMemberCard
            key={member.id}
            imageSrc={member.imageSrc}
            name={member.name}
            role={member.role}
            description={member.description}
            cardColor={member.cardColor}
            sqcardColor={member.sqcardColor}
            socials={member.socials}
            reverseOrder={index % 2 !== 0}
          />
        ))}
      </section>
    </div>
  );
}