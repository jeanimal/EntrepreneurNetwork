import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["active", "planning", "completed"]),
  lookingFor: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "planning",
      lookingFor: "",
      tags: [],
    },
  });
  
  const { data: allProjects, isLoading: isAllProjectsLoading } = useQuery({
    queryKey: [`/api/projects?q=${searchQuery}`],
    enabled: !!user,
  });
  
  const { data: myProjects, isLoading: isMyProjectsLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/projects`],
    enabled: !!user,
  });
  
  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    try {
      await apiRequest("POST", "/api/projects", values);
      
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/projects`] });
      
      toast({
        title: "Project Created",
        description: "Your project has been created successfully",
      });
      
      form.reset();
      setTagsInput("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create project",
        variant: "destructive",
      });
    }
  };
  
  const handleAddTag = () => {
    if (tagsInput.trim()) {
      const currentTags = form.getValues("tags") || [];
      form.setValue("tags", [...currentTags, tagsInput.trim()]);
      setTagsInput("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
      case "planning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{status}</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projects</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Share your side project with entrepreneurs and investors.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="TechSprint Mobile App" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A brief description of your project..." 
                            className="resize-none"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <div className="flex gap-4">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="planning"
                              value="planning"
                              className="mr-2"
                              checked={field.value === "planning"}
                              onChange={() => form.setValue("status", "planning")}
                            />
                            <label htmlFor="planning">Planning</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="active"
                              value="active"
                              className="mr-2"
                              checked={field.value === "active"}
                              onChange={() => form.setValue("status", "active")}
                            />
                            <label htmlFor="active">Active</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="completed"
                              value="completed"
                              className="mr-2"
                              checked={field.value === "completed"}
                              onChange={() => form.setValue("status", "completed")}
                            />
                            <label htmlFor="completed">Completed</label>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lookingFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Looking For</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Backend Developer, UI/UX Designer" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Web Platform"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                          />
                          <Button type="button" onClick={handleAddTag}>
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {field.value?.map((tag) => (
                            <Badge key={tag} className="flex items-center gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="font-bold"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      Create Project
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="relative w-full mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search projects by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isAllProjectsLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-6">
                        <div className="flex justify-between">
                          <div className="h-5 w-36 bg-gray-200 rounded mb-2"></div>
                          <div className="h-5 w-16 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-16 w-full bg-gray-200 rounded mt-2 mb-3"></div>
                        <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
                        <div className="flex gap-2 mb-5">
                          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-10 w-full bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : allProjects?.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
                    <p className="text-gray-500">Try a different search term or add your own project</p>
                  </div>
                ) : allProjects?.map((project: Project) => (
                  <Card key={project.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between">
                        <h3 className="text-base font-semibold text-gray-900">{project.title}</h3>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                        {project.description}
                      </p>
                      {project.lookingFor && (
                        <div className="mt-3 flex items-center text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-xs">Looking for: {project.lookingFor}</span>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="my-projects">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isMyProjectsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-6">
                        <div className="flex justify-between">
                          <div className="h-5 w-36 bg-gray-200 rounded mb-2"></div>
                          <div className="h-5 w-16 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-16 w-full bg-gray-200 rounded mt-2 mb-3"></div>
                        <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
                        <div className="flex gap-2 mb-5">
                          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-10 w-full bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : myProjects?.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
                    <p className="text-gray-500">Start by creating your first project</p>
                    <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Project
                    </Button>
                  </div>
                ) : myProjects?.map((project: Project) => (
                  <Card key={project.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between">
                        <h3 className="text-base font-semibold text-gray-900">{project.title}</h3>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                        {project.description}
                      </p>
                      {project.lookingFor && (
                        <div className="mt-3 flex items-center text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-xs">Looking for: {project.lookingFor}</span>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" className="w-full">
                          Edit
                        </Button>
                        <Button variant="outline" className="w-full">
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
