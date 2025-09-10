import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { projectStore } from "../../stores/mobx_project_store";
import { truncateText } from "@/lib/utils/truncate-text";
import ToolTip from "../Tooltip";
import { trpc } from '@/utils';
import toast from "react-hot-toast";

type props = {
    setShowUpdateModal: (open: boolean) => void;
    showUpdateModal: boolean;
    projectDetails: any;
    orgId: string;
}

interface formdata {
    name: string;
    description: string;
}

const UpdateProjectModal = ({ 
    setShowUpdateModal,
    showUpdateModal,
    projectDetails,
    orgId 
}: props) => {

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<formdata>({
        name: projectDetails.name || '',
        description: projectDetails.description || ''
    });
    const [showTooltip, setShowTooltip] = useState(false);

    const hasLongName = projectDetails.name && projectDetails.name.length > 18;

    // TRPC mutation for updating project
    const updateProjectMutation = trpc.projectsUpdate.useMutation({
        onError: (error) => {
            console.error("Failed to update project:", error);
            toast.error('Failed to update project.');
            setIsLoading(false);
        }
    });

    const handleClose = () => {
        if (!isLoading) {
            setShowUpdateModal(false);
        }
    };

    const handleBackdropClick = (e: any) => {
        if (e.target === e.currentTarget && !isLoading) {
            setShowUpdateModal(false);
        }
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const updateData: { name?: string; description?: string } = {};
            
            if (formData.name.trim() !== projectDetails.name) {
                updateData.name = formData.name.trim();
            }
            
            if (formData.description !== projectDetails.description) {
                updateData.description = formData.description;
            }

            // Only proceed if there are changes to make
            if (Object.keys(updateData).length === 0) {
                toast('No changes made!', {
                icon: '👏',
                });
                setShowUpdateModal(false);
                setIsLoading(false);
                return;
            }

            const updatedProject = await updateProjectMutation.mutateAsync({
                id: projectDetails.id,
                data: updateData,
                orgId
            });

            projectStore.updateProjectInStore(updatedProject.project);
            setIsLoading(false);
            setShowUpdateModal(false);

        } catch (error) {
            // Error is already handled in onError callback
            console.error("Update project error:", error);
        }
    };

    if (!showUpdateModal) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-semibold">
                        Update Project<br />
                        Name: <span 
                            className={`relative inline-block text-blue-400 ${hasLongName ? 'cursor-pointer' : ''}`}
                            onMouseEnter={() => hasLongName && setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            &nbsp;{truncateText(projectDetails.name || '', 18)}

                            {showTooltip && hasLongName && (
                                <ToolTip description={projectDetails.name} />
                            )}
                        </span>
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="h-6 w-6 p-0 cursor-pointer"
                    >
                        <Icon icon="material-symbols:close" className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter project name"
                            required
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !formData.name.trim()}
                            className="cursor-pointer"
                        >
                            {isLoading && (
                                <Icon 
                                    icon="line-md:loading-twotone-loop" 
                                    className="mr-2 h-4 w-4" 
                                />
                            )}
                            Update Project
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UpdateProjectModal;