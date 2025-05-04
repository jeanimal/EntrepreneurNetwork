import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ArrowRight, Users, Briefcase, HandshakeIcon, Lightbulb, TrendingUp } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
                Entrepreneur Network
              </h1>
              <p className="text-xl md:text-2xl max-w-xl mb-8">
                A place for founders and investors to get to know each other and help each other.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-white text-primary-700 hover:bg-gray-100 hover:text-primary-800 px-8 py-3 text-lg"
                >
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {!isAuthenticated && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.location.href = "/api/login"}
                    className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <svg viewBox="0 0 200 200" className="w-full">
                  <path 
                    fill="#FFFFFF" 
                    d="M48.8,-51.2C61.9,-37.3,70.6,-18.6,71.5,0.9C72.4,20.4,65.6,40.8,52.4,55.2C39.2,69.7,19.6,78.1,0.6,77.5C-18.4,76.9,-36.8,67.2,-51.5,52.8C-66.1,38.4,-77.1,19.2,-77.8,-0.7C-78.5,-20.7,-68.8,-41.3,-54.1,-55.2C-39.3,-69.1,-19.7,-76.2,-0.5,-75.7C18.6,-75.1,37.1,-66.9,48.8,-51.2Z" 
                    transform="translate(100 100)" 
                    className="drop-shadow-xl"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full p-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute -top-4 -left-4 bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center">
                        <Lightbulb className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -bottom-4 -right-4 bg-green-500 w-16 h-16 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <div className="bg-white text-primary-800 w-40 h-40 rounded-full flex items-center justify-center shadow-lg">
                        <HandshakeIcon className="h-20 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Entrepreneur Network
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A place for founders and investors to get to know each other and help each other.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect</h3>
              <p className="text-gray-600">
                Find and connect with like-minded entrepreneurs, experienced mentors, and potential investors all in one place.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Briefcase className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Share Resources</h3>
              <p className="text-gray-600">
                Match your skills, needs, and resources with others to create powerful collaborations and partnerships.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <HandshakeIcon className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Collaborate</h3>
              <p className="text-gray-600">
                Showcase your side projects, find team members, and connect with investors to turn your ideas into reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to join our community?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Take the first step toward building meaningful connections and growing your ventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg"
            >
              Create Account
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="border-primary-600 text-primary-700 hover:bg-primary-50 px-8 py-3 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">Entrepreneur Network</h2>
              <p className="text-gray-400 mt-2">Connect. Collaborate. Succeed.</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <a href="#" className="text-gray-300 hover:text-white">About Us</a>
              <a href="#" className="text-gray-300 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-white">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Entrepreneur Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}