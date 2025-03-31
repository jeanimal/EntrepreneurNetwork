import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Resource } from "@/lib/types";
import { Check, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resourceCategories } from "@shared/schema";

interface ResourceGridProps {
  resources: Resource[];
}

const resourceSchema = z.object({
  category: z.string(),
  have: z.array(z.string()),
  need: z.array(z.string()),
});

const formatCategoryLabel = (category: string) => {
  return category
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ResourceGrid({ resources }: ResourceGridProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [haveInput, setHaveInput] = useState("");
  const [needInput, setNeedInput] = useState("");
  
  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      category: "",
      have: [],
      need: [],
    },
  });

  const existingCategories = resources.map(resource => resource.category);
  const availableCategories = resourceCategories.filter(
    category => !existingCategories.includes(category)
  );
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    form.setValue("category", category);
  };
  
  const handleAddHave = () => {
    if (haveInput.trim()) {
      const currentHave = form.getValues("have");
      form.setValue("have", [...currentHave, haveInput.trim()]);
      setHaveInput("");
    }
  };
  
  const handleAddNeed = () => {
    if (needInput.trim()) {
      const currentNeed = form.getValues("need");
      form.setValue("need", [...currentNeed, needInput.trim()]);
      setNeedInput("");
    }
  };
  
  const handleRemoveHave = (item: string) => {
    const currentHave = form.getValues("have");
    form.setValue("have", currentHave.filter(i => i !== item));
  };
  
  const handleRemoveNeed = (item: string) => {
    const currentNeed = form.getValues("need");
    form.setValue("need", currentNeed.filter(i => i !== item));
  };
  
  const onSubmit = async (values: z.infer<typeof resourceSchema>) => {
    try {
      await apiRequest("POST", "/api/resources", values);
      
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      toast({
        title: "Resource added",
        description: `${formatCategoryLabel(values.category)} added to your resource grid`,
      });
      
      setIsDialogOpen(false);
      form.reset();
      setSelectedCategory(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add resource",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">My Resource Grid</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Edit Grid
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Edit Resource Grid</DialogTitle>
                <DialogDescription>
                  Add what you have and what you need in different categories
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={() => (
                      <FormItem>
                        <FormLabel>Select Category</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {availableCategories.map((category) => (
                            <div
                              key={category}
                              className={`border rounded-md p-2 cursor-pointer ${
                                selectedCategory === category 
                                  ? "border-primary-500 bg-primary-50" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleCategorySelect(category)}
                            >
                              {formatCategoryLabel(category)}
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedCategory && (
                    <>
                      <Tabs defaultValue="have" className="w-full">
                        <TabsList className="grid grid-cols-2">
                          <TabsTrigger value="have">I Have</TabsTrigger>
                          <TabsTrigger value="need">I Need</TabsTrigger>
                        </TabsList>
                        <TabsContent value="have" className="mt-2">
                          <FormField
                            control={form.control}
                            name="have"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex gap-2 mb-2">
                                  <Input
                                    placeholder="Add what you have..."
                                    value={haveInput}
                                    onChange={(e) => setHaveInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddHave();
                                      }
                                    }}
                                  />
                                  <Button type="button" onClick={handleAddHave}>
                                    Add
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {field.value.map((item) => (
                                    <Badge key={item} className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
                                      <Check className="h-3 w-3" />
                                      {item}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveHave(item)}
                                        className="ml-1 font-bold"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                        <TabsContent value="need" className="mt-2">
                          <FormField
                            control={form.control}
                            name="need"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex gap-2 mb-2">
                                  <Input
                                    placeholder="Add what you need..."
                                    value={needInput}
                                    onChange={(e) => setNeedInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddNeed();
                                      }
                                    }}
                                  />
                                  <Button type="button" onClick={handleAddNeed}>
                                    Add
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {field.value.map((item) => (
                                    <Badge key={item} className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
                                      <Plus className="h-3 w-3" />
                                      {item}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveNeed(item)}
                                        className="ml-1 font-bold"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </Tabs>
                      
                      <DialogFooter>
                        <Button type="submit" disabled={!form.getValues("category")} className="w-full">
                          Save Resource
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">What I Have vs. What I Need</h4>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {resources.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-gray-500">No resources added yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Add Your First Resource
                  </Button>
                </div>
              ) : (
                resources.map((resource) => (
                  <div key={resource.id} className="grid grid-cols-12 py-4 px-4">
                    <div className="col-span-3 flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCategoryLabel(resource.category)}
                      </span>
                    </div>
                    <div className="col-span-4 pr-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 mb-1">I HAVE</span>
                        {resource.have.length === 0 ? (
                          <span className="text-xs text-gray-400">Nothing added yet</span>
                        ) : (
                          resource.have.map((item, index) => (
                            <div key={index} className="bg-green-100 text-green-800 text-xs rounded px-2 py-1 mt-1 inline-flex items-center w-fit">
                              <Check className="w-3 h-3 mr-1" />
                              {item}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="col-span-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 mb-1">I NEED</span>
                        {resource.need.length === 0 ? (
                          <span className="text-xs text-gray-400">Nothing added yet</span>
                        ) : (
                          resource.need.map((item, index) => (
                            <div key={index} className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1 mt-1 inline-flex items-center w-fit">
                              <Plus className="w-3 h-3 mr-1" />
                              {item}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
