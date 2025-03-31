import { Button } from "@/components/ui/button";

// Sample event data
const events = [
  {
    id: 1,
    title: "VC Pitch Night",
    location: "San Francisco, CA",
    time: "6:00 PM",
    month: "MAY",
    day: "15"
  },
  {
    id: 2,
    title: "Tech Founder Meetup",
    location: "Online",
    time: "12:00 PM",
    month: "MAY",
    day: "22"
  },
  {
    id: 3,
    title: "Seed Funding Workshop",
    location: "Chicago, IL",
    time: "10:00 AM",
    month: "JUN",
    day: "03"
  }
];

export default function UpcomingEvents() {
  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
        <ul className="divide-y divide-gray-200">
          {events.map((event) => (
            <li key={event.id} className="py-4">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="bg-primary-100 rounded-md p-2 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-800 text-center">
                      {event.month}<br/>{event.day}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.location} • {event.time}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Button variant="outline" className="mt-4 w-full">
          Browse All Events
        </Button>
      </div>
    </div>
  );
}
