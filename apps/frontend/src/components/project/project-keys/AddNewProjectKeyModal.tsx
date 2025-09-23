import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter
} from '../../ui/alert-dialog'
import { Label } from '../../ui/label'
import { useState, useEffect } from 'react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { trpc } from '@/utils'
import { nanoid, customAlphabet } from 'nanoid'
import toast from 'react-hot-toast'
import { projectKeysStore } from '@/stores/mobx_project_keys_store'


interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  projectId: number;
  setShowSuccessModal: (show: boolean) => void;
  setCreatedKeyData: (data: { keyValue: string; keyName: string; environment: string; } | null) => void;
}

const AddNewProjectKeyModal = ({ showModal, setShowModal, projectId, setShowSuccessModal, setCreatedKeyData }: Props) => {
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    environment: 'development',
    customInstructions: ''
  })

  // Mutation with success/error handling
  const createKeyMutation = trpc.projectKeysCreate.useMutation({
    onSuccess: (response) => {
      toast.dismiss('creating-key')

      if (response?.projectKey) {
        projectKeysStore.addKeyToStore(response.projectKey)
      }

      const keyData = {
        keyValue: response.keyValue,
        keyName: newKeyForm.name,
        environment: newKeyForm.environment
      }
      setCreatedKeyData(keyData)

      setShowModal(false)

      setTimeout(() => {
        setShowSuccessModal(true)
      }, 100)

      // alert(`API Key Created Successfully!\n\nKey Name: ${newKeyForm.name}\nEnvironment: ${newKeyForm.environment}\nAPI Key: ${response.keyValue}\n\n🔒 IMPORTANT: This is the only time you'll see this API key!\nMake sure to copy and store it securely.`)

      setNewKeyForm({ name: '', environment: 'development', customInstructions: '' })
    },
    onError: (error) => {
      toast.dismiss('creating-key')
      toast.error('Failed to create API key')
    }
  })

  // Generate unique API key with nanoid (36 characters)
  const generateApiKey = () => {
    const nanoidLowercase = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 28)

    const prefix = newKeyForm.environment === 'production' ? 'sa_prod_' :
                  newKeyForm.environment === 'staging' ? 'sa_stag_' : 'sa_dev_'
    const randomPart = nanoidLowercase(28)
    return `${prefix}${randomPart}`
  }

  const handleCreateKey = () => {
    // Validate form
    if (!newKeyForm.name.trim()) {
      toast.error('Please enter a key name')
      return
    }

    // Generate the API key
    const keyValue = generateApiKey()

    // Show loading toast
    toast.loading('Creating API key...', { id: 'creating-key' })

    // Call mutation
    createKeyMutation.mutate({
      projectId: Number(projectId),
      name: newKeyForm.name,
      keyValue: keyValue,
      environment: newKeyForm.environment,
      customInst: newKeyForm.customInstructions || undefined
    })
  }

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setNewKeyForm({ ...newKeyForm, [name]: value });
  }



  return (
    <>
      <AlertDialog open={showModal} onOpenChange={setShowModal}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Create API Key</AlertDialogTitle>
          <AlertDialogDescription>
            Generate a new API key for your project
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="key-name">Key Name</Label>
            <Input
              name="name"
              placeholder="e.g., Development Key"
              value={newKeyForm.name}
              onChange={handleFormChange}
            />
          </div>

          <div>
            <Label htmlFor="environment">Environment</Label>
            <select
              name="environment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={newKeyForm.environment}
              onChange={handleFormChange}
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>

          <div>
            <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
            <Textarea
              name="customInstructions"
              placeholder="Custom instructions for UI generation with this key..."
              value={newKeyForm.customInstructions}
              onChange={handleFormChange}
              rows={3}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={createKeyMutation.isPending} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCreateKey}
            disabled={createKeyMutation.isPending || !newKeyForm.name.trim()}
            className="cursor-pointer"
          >
            {createKeyMutation.isPending ? 'Creating...' : 'Create Key'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </>
  )
}

export default AddNewProjectKeyModal