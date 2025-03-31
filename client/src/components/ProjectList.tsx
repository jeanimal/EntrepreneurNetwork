import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ProjectListProps {
  projects: Project[];
}

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["active", "planning", "completed"]),
  lookingFor: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export default function ProjectList({ projects }: ProjectListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  
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
  
  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    try {
      await apiRequest("POST", "/api/projects", values);
      
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      toast({
        title: "Project created",
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
    <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">My Side Projects</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Share your side project with entrepreneurs and investors
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
                            placeholder="Mobile App, React Native, etc."
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
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
                                className="ml-1 font-bold"
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
        </div>
        
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-10 border rounded-lg border-gray-200">
              <p className="text-gray-500 mb-2">You haven't added any projects yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Add Your First Project
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <h4 className="text-base font-semibold text-gray-900">{project.title}</h4>
                    {getStatusBadge(project.status)}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                  {project.lookingFor && (
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <Shield className="h-5 w-5 text-gray-400 mr-1.5" />
                      <span>Looking for: {project.lookingFor}</span>
                    </div>
                  )}
                  <div className="mt-4 flex">
                    {project.tags?.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {projects.length > 0 && (
            <Link href="/projects">
              <Button variant="outline" className="w-full">
                View All Projects
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
