import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Skill } from "@/lib/types";

interface SkillsCardProps {
  skills: Skill[];
}

export default function SkillsCard({ skills }: SkillsCardProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Sort skills by rating (descending)
  const sortedSkills = [...skills].sort((a, b) => b.rating - a.rating);
  
  // Show only top 4 skills initially
  const displayedSkills = showAll ? sortedSkills : sortedSkills.slice(0, 4);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Top Skills</h3>
        <ul className="space-y-2">
          {displayedSkills.map((skill) => (
            <li key={skill.id} className="flex items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{skill.name}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-primary-600 h-1.5 rounded-full" 
                    style={{ width: `${skill.rating}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-3">
                <span className="text-xs font-medium text-gray-500">
                  {(skill.rating / 10).toFixed(1)}/10
                </span>
              </div>
            </li>
          ))}
        </ul>
        {skills.length > 4 && (
          <Button 
            variant="ghost" 
            className="mt-4 w-full text-primary-600 hover:text-primary-700 hover:bg-primary-50"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                Show less skills
                <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Show more skills
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
