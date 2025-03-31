import { Link } from "wouter";
import { DashboardStats } from "@/lib/types";

interface StatisticsCardProps {
  stats: DashboardStats;
}

export default function StatisticsCard({ stats }: StatisticsCardProps) {
  return (
    <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Your Network</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/network">
            <div className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded-md">
              <div className="text-2xl font-bold text-gray-900">{stats.connectionCount}</div>
              <div className="text-sm text-gray-500">Connections</div>
            </div>
          </Link>
          <Link href="/network?tab=pending">
            <div className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded-md">
              <div className="text-2xl font-bold text-gray-900">{stats.pendingCount}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </Link>
          <Link href="/projects">
            <div className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded-md">
              <div className="text-2xl font-bold text-gray-900">{stats.projectCount}</div>
              <div className="text-sm text-gray-500">Projects</div>
            </div>
          </Link>
          <Link href="/messages">
            <div className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded-md">
              <div className="text-2xl font-bold text-gray-900">{stats.unreadMessageCount}</div>
              <div className="text-sm text-gray-500">Messages</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
