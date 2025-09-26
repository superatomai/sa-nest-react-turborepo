import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@iconify/react'

const NoDocs = () => {
  return (
    <div className="flex flex-col h-full">
      <Card className="border-dashed m-5 flex-1 flex flex-col">
        <CardContent className="flex flex-col items-center justify-center flex-1 py-12">
          <Icon icon="solar:document-text-broken" className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No API Documentation</h3>
          <p className="text-muted-foreground text-center max-w-md">
            API documentation has not been created for this project yet.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default NoDocs
