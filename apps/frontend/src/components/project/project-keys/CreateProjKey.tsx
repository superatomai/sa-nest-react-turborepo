import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter
} from '../../ui/alert-dialog'
import { Label } from '../../ui/label'
import { Plus, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { trpc } from '@/utils'
import { getApiKeyNanoid } from '../../../utils/nanoid'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

interface CreateProjKeyProps {
  onKeyCreated?: () => void
}

const CreateProjKey = ({ onKeyCreated }: CreateProjKeyProps) => {
      const params : any = useParams()
      const [showCreateDialog, setShowCreateDialog] = useState(false)
      const [newKeyForm, setNewKeyForm] = useState({
            name: '',
            environment: 'development',
            customInstructions: ''
        })
      const [generatedKey, setGeneratedKey] = useState<string | null>(null)

      // Mutation with success/error handling
      const createKeyMutation = trpc.projectKeysCreate.useMutation({
        onSuccess: (response) => {
          console.log('Key created successfully:', response)
          // Show the generated key to the user
          setGeneratedKey(generatedKeyValue)
        },
        onError: (error) => {
          console.error('Failed to create key:', error)
          toast.error('Failed to create API key')
        }
      })

      let generatedKeyValue = '';

      // Generate unique API key with lowercase alphanumeric characters
      const generateApiKey = () => {
        const prefix = newKeyForm.environment === 'production' ? 'sa_prod_' :
                      newKeyForm.environment === 'staging' ? 'sa_stag_' : 'sa_dev_'
        const randomPart = getApiKeyNanoid()
        return `${prefix}${randomPart}`
      }

      const handleCreateKey = () => {
        // Validate form
        if (!newKeyForm.name.trim()) {
          toast.error('Please enter a key name')
          return
        }

        // Generate the API key
        generatedKeyValue = generateApiKey()

        // Call mutation
        createKeyMutation.mutate({
          projectId: Number(params.projectId),
          name: newKeyForm.name,
          keyValue: generatedKeyValue,
          environment: newKeyForm.environment,
          customInst: newKeyForm.customInstructions || undefined
        })
      }

  const handleFormChange =(e:any) =>{
    const {name, value} = e.target;

    console.log("form change:", name, value);
    setNewKeyForm({...newKeyForm, [name]: value});
  }

    
  // If key was generated, show success modal
  if (generatedKey) {
    return (
      <>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">API Keys</h2>
            <p className="text-gray-600 text-sm">Manage API keys for your CLI agents and integrations</p>
          </div>
          <Button variant="outline" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Create New Key
          </Button>
        </div>

        {/* Success Modal - Show Generated Key */}
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>✅ API Key Created Successfully!</AlertDialogTitle>
              <AlertDialogDescription>
                Copy this key now. For security reasons, you won't be able to see it again.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Your API Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={generatedKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedKey)
                      toast.success('Copied to clipboard!')
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Store this key securely. It won't be shown again.
                </p>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogAction onClick={() => {
                setGeneratedKey(null)
                setShowCreateDialog(false)
                setNewKeyForm({ name: '', environment: 'development', customInstructions: '' })
                toast.success('API key created successfully!')
                onKeyCreated?.() // Refresh the keys list
              }}>
                Done
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">API Keys</h2>
                <p className="text-gray-600 text-sm">Manage API keys for your CLI agents and integrations</p>
              </div>

              <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <AlertDialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Key
                  </Button>
                </AlertDialogTrigger>
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
                    <AlertDialogCancel disabled={createKeyMutation.isPending}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCreateKey}
                      disabled={createKeyMutation.isPending || !newKeyForm.name.trim()}
                    >
                      {createKeyMutation.isPending ? 'Creating...' : 'Create Key'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
    </>
  )
}

export default CreateProjKey
