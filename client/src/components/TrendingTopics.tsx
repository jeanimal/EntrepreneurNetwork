import { Button } from "@/components/ui/button";

const trendingTopics = [
  "#AIStartups",
  "#SeedFunding",
  "#ProductStrategy",
  "#VentureCapital",
  "#RemoteTeams",
  "#SustainableTech",
  "#FounderLife",
  "#TechTalent",
];

export default function TrendingTopics() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trending Topics</h3>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <Button
              key={topic}
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-full px-3 py-1.5 h-auto"
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
