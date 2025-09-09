import React, { useState } from 'react'
import { Icon } from "@iconify/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog'
import { projectStore } from '../../stores/mobx_project_store';
import { trpc } from '@/utils';

type props = {
    setShowDeleteProjectModal: React.Dispatch<React.SetStateAction<boolean>>,
    showDeleteProjectModal: boolean,
    Project_name: string,
    id: number,
    orgId: string
}

const DeleteProjectModal = ({ setShowDeleteProjectModal, showDeleteProjectModal, Project_name, id, orgId }: props) => {
    const [isDeleting, setIsDeleting] = useState(false);

    // TRPC mutation for deleting project
    const deleteProjectMutation = trpc.projectsDelete.useMutation({
        onSuccess: () => {
            projectStore.removeProjectFromStore(id);
            setShowDeleteProjectModal(false);
            setIsDeleting(false);
        },
        onError: (error) => {
            console.error("Failed to delete project:", error);
            setIsDeleting(false);
        }
    });

    const handleDeleteProject = async (id: number) => {
        setIsDeleting(true);

        try {
            await deleteProjectMutation.mutateAsync({
                id,
                orgId
            });
        } catch (err) {
           
            console.error("Delete project error:", err);
        }
    };

    return (
        <AlertDialog open={showDeleteProjectModal} onOpenChange={(open) => {
            // Prevent closing during deletion
            if (!isDeleting) {
                setShowDeleteProjectModal(open);
            }
        }}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-full">
                            <Icon 
                                icon="material-symbols:warning-outline" 
                                className="h-5 w-5 text-red-600" 
                            />
                        </div>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to delete this project? This action cannot be undone.
                    </AlertDialogDescription>
                    <div className="bg-gray-50 rounded-lg p-3 border mt-3">
                        <p className="text-sm text-gray-600 mb-1">Project name:</p>
                        <p className="font-mono text-sm text-gray-900 break-all">{Project_name}</p>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => handleDeleteProject(id)}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting && (
                            <Icon 
                                icon="line-md:loading-twotone-loop" 
                                className="mr-2 h-4 w-4" 
                            />
                        )}
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteProjectModal