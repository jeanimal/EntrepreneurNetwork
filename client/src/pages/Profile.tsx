import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import ProjectList from "@/components/ProjectList";
import ResourceGrid from "@/components/ResourceGrid";
import SkillsCard from "@/components/SkillsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/ui/file-upload";
import { Check, Plus, User, Briefcase, MapPin, Mail, AtSign, Camera } from "lucide-react";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    headline: "",
    company: "",
    location: "",
  });
  
  const isOwnProfile = user?.id === userId;
  
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
    onSuccess: (data) => {
      if (isOwnProfile) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          headline: data.headline || "",
          company: data.company || "",
          location: data.location || "",
        });
      }
    },
  });
  
  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/projects`],
    enabled: !!userId,
  });
  
  const { data: resources, isLoading: isResourcesLoading } = useQuery({
    queryKey: [`/api/users/${userId}/resources`],
    enabled: !!userId,
  });
  
  const { data: skills, isLoading: isSkillsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
    enabled: !!userId,
  });
  
  useEffect(() => {
    if (!user && !isUserLoading) {
      setLocation("/login");
    }
  }, [user, isUserLoading, setLocation]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSaveProfile = async () => {
    try {
      await apiRequest("PUT", `/api/users/${userId}`, formData);
      
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelEdit = () => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        headline: userData.headline || "",
        company: userData.company || "",
        location: userData.location || "",
      });
    }
    setIsEditing(false);
  };
  
  const handleAvatarSelected = (file: File) => {
    setAvatarFile(file);
  };
  
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    try {
      setIsUploadingAvatar(true);
      
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      // Make API request to upload avatar
      const response = await fetch(`/api/users/${userId}/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      // Get updated user data
      const updatedUser = await response.json();
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      });
      
      setAvatarFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="h-48 bg-gradient-to-r from-primary-600 to-secondary-500"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-20 mb-6">
              <Skeleton className="h-40 w-40 rounded-full border-4 border-white" />
              <div className="md:ml-6 mt-6 md:mt-0">
                <Skeleton className="h-8 w-60 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="h-8 w-full mb-6" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="mb-4 text-red-500 text-6xl">404</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
            <p className="text-gray-600 mb-4">The user you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = userData.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mb-6">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-t-lg"></div>
        <CardContent className="pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-20 mb-6">
            <div className="relative">
              <Avatar className="h-40 w-40 border-4 border-white">
                <AvatarImage src={userData.avatarUrl || ""} alt={userData.name} />
                <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
              </Avatar>
              
              {isOwnProfile && (
                <div className="absolute -bottom-2 -right-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white"
                    onClick={() => {
                      document.getElementById('avatar-upload-dialog')?.showModal();
                    }}
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                  
                  <dialog id="avatar-upload-dialog" className="p-0 rounded-lg shadow-lg backdrop:bg-black/50">
                    <div className="w-[350px] p-6">
                      <h3 className="text-lg font-semibold mb-4">Update Profile Picture</h3>
                      
                      <FileUpload
                        onFileSelected={handleAvatarSelected}
                        acceptedFileTypes="image/*"
                        maxSizeInMB={2}
                        previewUrl={userData.avatarUrl}
                      />
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAvatarFile(null);
                            document.getElementById('avatar-upload-dialog')?.close();
                          }}
                        >
                          Cancel
                        </Button>
                        
                        <Button
                          disabled={!avatarFile || isUploadingAvatar}
                          onClick={async () => {
                            await handleAvatarUpload();
                            document.getElementById('avatar-upload-dialog')?.close();
                          }}
                        >
                          {isUploadingAvatar ? "Uploading..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </dialog>
                </div>
              )}
            </div>
            
            <div className="md:ml-6 mt-6 md:mt-0 flex flex-col md:flex-row md:items-center md:justify-between flex-grow">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{userData.headline}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Badge 
                  className={`text-sm ${
                    userData.userType === "entrepreneur" 
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {userData.userType === "entrepreneur" ? "Entrepreneur" : "Investor"}
                </Badge>
              </div>
            </div>
          </div>
          
          {isOwnProfile && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm font-medium text-gray-700">{userData.profileCompletion}%</span>
              </div>
              <Progress value={userData.profileCompletion} className="h-2.5" />
            </div>
          )}
          
          {isOwnProfile && !isEditing ? (
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => setIsEditing(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          ) : isOwnProfile && isEditing ? (
            <div className="flex justify-end mb-4 space-x-3">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                className="flex items-center"
                onClick={handleSaveProfile}
              >
                <Check className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </div>
          ) : null}
          
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  placeholder="e.g. Tech Founder & Product Strategist"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. TechSprint"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. San Francisco, CA"
                  className="mt-1"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell others about yourself..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {userData.bio && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600">{userData.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{userData.email}</span>
                </div>
                
                <div className="flex items-center">
                  <AtSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">@{userData.username}</span>
                </div>
                
                {userData.company && (
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">{userData.company}</span>
                  </div>
                )}
                
                {userData.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">{userData.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="resources">
        <TabsList className="mb-6">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources">
          {isResourcesLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : resources?.length > 0 ? (
            <ResourceGrid resources={resources} />
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">No resources yet</h3>
                <p className="text-gray-500 mb-4">
                  {isOwnProfile 
                    ? "Add what you have and need to connect with others"
                    : `${userData.name} hasn't added any resources yet`}
                </p>
                {isOwnProfile && (
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Resources
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="projects">
          {isProjectsLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : projects?.length > 0 ? (
            <ProjectList projects={projects} />
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
                <p className="text-gray-500 mb-4">
                  {isOwnProfile 
                    ? "Share your side projects with the community"
                    : `${userData.name} hasn't added any projects yet`}
                </p>
                {isOwnProfile && (
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Project
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="skills">
          {isSkillsLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : skills?.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <SkillsCard skills={skills} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">No skills yet</h3>
                <p className="text-gray-500 mb-4">
                  {isOwnProfile 
                    ? "Add your skills and expertise to showcase your talents"
                    : `${userData.name} hasn't added any skills yet`}
                </p>
                {isOwnProfile && (
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Skills
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
