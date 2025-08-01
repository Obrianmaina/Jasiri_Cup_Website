import Image from "next/image";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";

export default function TeamPage() {
  // Placeholder Cloudinary URLs - replace 'dsvexizbx' with your actual Cloudinary cloud name
  const teamMembers = [
    {
      id: '1',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
      name: 'John Doe',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      cardColor: 'bg-purple-600'
    },
    {
      id: '2',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
      name: 'Jane Done',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      cardColor: 'bg-green-600'
    },
    {
      id: '3',
      imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
      name: 'Joseph Did',
      description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
      cardColor: 'bg-gray-800'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <p className="text-sm text-gray-500 mb-4">Home / Product / Blog / Team</p>
      {/* Quote Section - Based on Team.jpg */}
      <section className="bg-gray-100 rounded-lg p-8 mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          “I am going to say something <span className="text-purple-600">mighty profound</span>”
        </h1>
        <p className="text-xl text-gray-600">- Something Sayer</p>
      </section>

      {/* Team Member Cards */}
      <section className="space-y-12">
        {teamMembers.map((member, index) => (
          <TeamMemberCard
            key={member.id}
            imageSrc={member.imageSrc} // This will be a Cloudinary URL from the mock data
            name={member.name}
            description={member.description}
            cardColor={member.cardColor}
            reverseOrder={index % 2 !== 0} // Alternate layout for visual appeal
          />
        ))}
      </section>
    </div>
  );
}
