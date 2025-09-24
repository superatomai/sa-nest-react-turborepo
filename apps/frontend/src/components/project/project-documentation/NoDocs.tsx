import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@iconify/react'

const NoDocs = () => {
  return (
    <div>
      <Card className="border-dashed m-5">
        <CardContent className="flex flex-col items-center justify-center py-12">
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
