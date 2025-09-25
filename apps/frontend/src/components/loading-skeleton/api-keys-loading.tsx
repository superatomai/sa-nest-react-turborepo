import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ApiKeysLoading = () => {
  return (
    <div className="space-y-4 mt-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-32" /> {/* CardTitle - API Key Name */}
                <Skeleton className="h-5 w-20 rounded-full" /> {/* Environment Badge */}
                {i % 2 === 0 && <Skeleton className="h-5 w-16 rounded-full" />} {/* Active Badge (sometimes) */}
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-12 rounded-md" /> {/* Delete Button */}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <Skeleton className="h-4 w-20" /> {/* "Key Prefix:" label */}
                <Skeleton className="h-4 w-24 mt-1" /> {/* Key prefix value */}
              </div>
              <div>
                <Skeleton className="h-4 w-16" /> {/* "Created:" label */}
                <Skeleton className="h-4 w-20 mt-1" /> {/* Date value */}
              </div>
              <div>
                <Skeleton className="h-4 w-12" /> {/* "Status:" label */}
                <Skeleton className="h-4 w-16 mt-1" /> {/* Status value */}
              </div>
            </div>

            {/* Custom Instructions (appears for some cards for variety) */}
            {i % 2 === 0 && (
              <div>
                <Skeleton className="h-4 w-32" /> {/* "Custom Instructions:" label */}
                <Skeleton className="h-16 w-full rounded mt-1" /> {/* Instructions box */}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ApiKeysLoading;