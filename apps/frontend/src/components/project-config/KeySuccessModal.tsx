import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Copy, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean;
  onClose: () => void;
  keyValue: string;
  keyName: string;
  environment: string;
}

const KeySuccessModal = ({ isOpen, onClose, keyValue, keyName, environment }: Props) => {
  console.log('🏁 KeySuccessModal props:', { isOpen, keyValue, keyName, environment })

  const handleCopyKey = () => {
    navigator.clipboard.writeText(keyValue)
    toast.success('API key copied to clipboard!')
  }

  console.log('🤔 KeySuccessModal isOpen check:', isOpen)
  if (!isOpen) {
    console.log('❌ KeySuccessModal returning null because isOpen is false')
    return null
  }

  console.log('✅ KeySuccessModal rendering modal')

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <Card className="w-full max-w-lg mx-4 bg-white shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle className="text-xl text-green-600">API Key Created Successfully!</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Your new API key "{keyName}" for {environment} environment has been created.
            Copy this key now - for security reasons, you won't be able to see it again.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Your API Key</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={keyValue}
                readOnly
                className="font-mono text-sm bg-gray-50 border-gray-200"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyKey}
                className="flex-shrink-0 hover:bg-blue-50 hover:border-blue-200"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-red-600 text-lg">🔒</div>
              <div>
                <p className="text-sm text-red-800 font-medium">
                  IMPORTANT: This is the only time you'll see this API key!
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Make sure to copy and store it securely before closing this dialog.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <Button onClick={onClose} className="px-8 bg-blue-600 hover:bg-blue-700">
              I've copied the key, close this dialog
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default KeySuccessModal
