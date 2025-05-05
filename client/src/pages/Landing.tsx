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
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Connect, Collaborate, Create.
              </h1>
              <p className="text-xl md:text-2xl max-w-xl mb-8">
                Join a vibrant community where founders and investors meet to build the future together.
              </p>
              {/* Buttons removed from hero section as requested */}
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Pink splash animation */}
                <div className="absolute inset-0 bg-pink-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute -inset-6 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute -inset-4 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full blur-xl opacity-10 animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                
                {/* Circular background */}
                <div className="relative bg-gradient-to-br from-pink-100 to-white rounded-full p-8 shadow-xl">
                  <div className="absolute top-0 right-0 -mr-4 -mt-4 bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                    <Lightbulb className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 -ml-4 -mb-4 bg-green-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Handshake in center */}
                  <div className="flex items-center justify-center w-full h-full p-4">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-primary-600 to-primary-800 w-32 h-32 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-500 hover:scale-110">
                        <HandshakeIcon className="h-16 w-16 text-white" />
                      </div>
                      
                      {/* Extra animated rings */}
                      <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                      <div className="absolute inset-0 border-2 border-pink-300 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
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
              The Entrepreneur Network
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A powerful platform designed to help entrepreneurs and investors connect, share resources, and build successful ventures together.
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
              className="bg-gradient-to-r from-pink-400 to-pink-200 text-black px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl hover:bg-pink-300 hover:scale-105 transition-all duration-200"
            >
              Create New Account
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="border-primary-500 border-2 bg-white text-black hover:bg-primary-50 px-8 py-6 text-lg shadow-md"
            >
              Log In to Existing Account
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