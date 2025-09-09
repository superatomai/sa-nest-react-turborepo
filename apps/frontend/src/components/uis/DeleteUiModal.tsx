import React from 'react'
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
import { uisStore } from '@/stores/mobx_uis_store'
import { observer } from 'mobx-react-lite'
import { trpc } from '@/utils';

type Props = {
    setShowDeleteUiModal: React.Dispatch<React.SetStateAction<boolean>>,
    showDeleteUiModal: boolean,
    ui_name: string,
    id: number,
}

const DeleteUiModal = ({ setShowDeleteUiModal, showDeleteUiModal, ui_name, id }: Props) => {

    const [isDeleting, setIsDeleting] = React.useState(false);

    // TRPC mutation for deleting UI
    const deleteUiMutation = trpc.uisDelete.useMutation({
        onSuccess: () => {
            uisStore.removeUiFromStore(id);
            setShowDeleteUiModal(false);
            setIsDeleting(false);
        },
        onError: (error) => {
            console.error("Failed to delete UI:", error);
            setIsDeleting(false);
        }
    });

    const handleDeleteUi = async (uiId: number) => {
        setIsDeleting(true);

        try {
            await deleteUiMutation.mutateAsync({
                id: uiId
            });
        } catch (err) {
            // Error is already handled in onError callback
            console.error("Delete UI error:", err);
        }
    };

    return (
        <AlertDialog open={showDeleteUiModal} onOpenChange={(open) => {
            // Prevent closing during deletion
            if (!isDeleting) {
                setShowDeleteUiModal(open);
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
                        <AlertDialogTitle>Delete UI</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to delete this UI component? This action cannot be undone.
                    </AlertDialogDescription>
                    <div className="bg-gray-50 rounded-lg p-3 border mt-3">
                        <p className="text-sm text-gray-600 mb-1">UI name:</p>
                        <p className="font-mono text-sm text-gray-900 break-all">{ui_name}</p>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => handleDeleteUi(id)}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <div className="flex items-center gap-2">
                                <Icon 
                                    icon="line-md:loading-twotone-loop" 
                                    className="h-4 w-4" 
                                />
                                Deleting...
                            </div>
                        ) : (
                            'Delete'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default observer(DeleteUiModal)