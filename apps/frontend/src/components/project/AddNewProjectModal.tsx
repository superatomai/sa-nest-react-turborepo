import { useState } from "react";
import { trpc } from "@/utils";
import { projectStore } from "@/stores/mobx_project_store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  setNewProjModalOpen: (open: boolean) => void;
  orgId: string;
};

const AddNewProjectModal = ({ setNewProjModalOpen, orgId }: Props) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const createProjectMutation : any = trpc.projectsCreate.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgId) {
      alert("Organization ID not found. Please try again.");
      return;
    }

    if (!formData.name.trim()) {
      alert("Project name is required.");
      return;
    }

    try {
      const newProject = await createProjectMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || "",
        orgId,
      });

      projectStore.addProjectToStore(newProject.project);

      setFormData({
        name: '',
        description: '',
      });
      
      toast.success('Project created successfully!');
      // Close modal
      setNewProjModalOpen(false);


    } catch (error) {
      console.error("Mutation failed:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleClose = () => {
    if (!createProjectMutation.isPending) {
      resetForm();
      setNewProjModalOpen(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !createProjectMutation.isPending) {
      resetForm();
      setNewProjModalOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Create New Project</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={createProjectMutation.isPending}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter project name"
                required
                disabled={createProjectMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter project description (optional)"
                rows={3}
                disabled={createProjectMutation.isPending}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createProjectMutation.isPending}
                className="cursor-pointer" 
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProjectMutation.isPending || !formData.name.trim()}
                className="cursor-pointer"
              >
                {createProjectMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNewProjectModal;