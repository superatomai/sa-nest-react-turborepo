import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter
} from '../ui/alert-dialog'
import { trpc } from '@/utils'
import toast from 'react-hot-toast'
import { projectKeysStore } from '@/stores/mobx_project_keys_store'

interface Props {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  keyName: string;
  keyId: number;
}

const DeleteProjectKeyModal = ({ showDeleteModal, setShowDeleteModal, keyName, keyId }: Props) => {

  const deleteKeyMutation = trpc.projectKeysDelete.useMutation({
    onSuccess: (response) => {
      console.log('Key deleted successfully:', response)
      // Remove from store
      projectKeysStore.removeKeyFromStore(keyId)
      toast.success('API key deleted successfully')
      setShowDeleteModal(false)
    },
    onError: (error) => {
      console.error('Failed to delete key:', error)
      toast.error('Failed to delete API key')
    }
  })

  const handleDelete = () => {
    deleteKeyMutation.mutate({ keyId })
  }

  return (
    <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete API Key</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the API key "{keyName}"?
            This action cannot be undone and will immediately revoke access for any CLI agents using this key.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-800">
            ⚠️ Warning: Deleting this key will break any CLI connections currently using it.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteKeyMutation.isPending} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteKeyMutation.isPending}
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            {deleteKeyMutation.isPending ? 'Deleting...' : 'Delete Key'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteProjectKeyModal