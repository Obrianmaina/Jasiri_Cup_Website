import Image from "next/image";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export default function TeamPage() {
  const teamMembers = [
    {
      id: '1',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
      name: 'John Doe',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      cardColor: 'bg-purple-700',
      sqcardColor: 'bg-purple-600'
    },
    {
      id: '2',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
      name: 'Jane Done',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      cardColor: 'bg-green-700',
      sqcardColor: 'bg-green-600'
    },
    {
      id: '3',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
      name: 'Joseph Did',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      cardColor: 'bg-gray-800',
      sqcardColor: 'bg-gray-700'
    },
  ];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Team', href: '/team' } 
  ];

  return (
    <div className="container mx-auto px-4 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Quote Section */}
      <section className="bg-gray-100 rounded-lg p-6 md:p-8 mb-12 text-start">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
          “I am going to say something <span className="text-purple-600">mighty profound</span>”
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
            sqcardColor={member.sqcardColor}
            reverseOrder={index % 2 !== 0}
            className="flex flex-col md:flex-row md:items-center md:space-x-8" // Ensure stacking on mobile
          />
        ))}
      </section>
    </div>
  );
}
