import { useQuery } from "@tanstack/react-query";
import ProfileCard from "@/components/ProfileCard";
import StatisticsCard from "@/components/StatisticsCard";
import SkillsCard from "@/components/SkillsCard";
import PostCreator from "@/components/PostCreator";
import ResourceGrid from "@/components/ResourceGrid";
import ProjectList from "@/components/ProjectList";
import FeedItem from "@/components/FeedItem";
import RecommendedConnections from "@/components/RecommendedConnections";
import UpcomingEvents from "@/components/UpcomingEvents";
import TrendingTopics from "@/components/TrendingTopics";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user } = useAuth();
  
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  const { data: feedData, isLoading: isFeedLoading } = useQuery({
    queryKey: ["/api/feed"],
    enabled: !!user,
  });

  return (
    <main className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            {isDashboardLoading ? (
              <>
                <div className="bg-white shadow rounded-lg mb-6">
                  <div className="h-32 bg-gradient-to-r from-primary-600 to-secondary-500"></div>
                  <div className="p-5">
                    <Skeleton className="h-28 w-28 rounded-full mx-auto -mt-20 mb-4" />
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-2 w-full mb-1" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="bg-white shadow rounded-lg mb-6">
                  <div className="p-5">
                    <Skeleton className="h-6 w-1/2 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </div>
                <div className="bg-white shadow rounded-lg">
                  <div className="p-5">
                    <Skeleton className="h-6 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full mb-2" />
                  </div>
                </div>
              </>
            ) : dashboard ? (
              <>
                <ProfileCard user={dashboard.user} />
                <StatisticsCard stats={dashboard.stats} />
                <SkillsCard skills={dashboard.skills} />
              </>
            ) : null}
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-6">
            {user && <PostCreator />}
            
            {dashboard?.resources && (
              <ResourceGrid resources={dashboard.resources} />
            )}
            
            {dashboard?.projects && (
              <ProjectList projects={dashboard.projects} />
            )}
            
            {isFeedLoading ? (
              <>
                <div className="bg-white shadow rounded-lg mb-6">
                  <div className="p-5">
                    <div className="flex space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/2 mb-1" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="bg-white shadow rounded-lg mb-6">
                  <div className="p-5">
                    <div className="flex space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/2 mb-1" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </>
            ) : feedData ? (
              feedData.map((post) => (
                <FeedItem key={post.id} post={post} />
              ))
            ) : null}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:col-span-3 lg:block">
            <RecommendedConnections />
            <UpcomingEvents />
            <TrendingTopics />
          </div>
        </div>
      </div>
    </main>
  );
}
