import CardsLoading from "./cards-loading"
import { Skeleton } from "../ui/skeleton"

export const ProjectsLoading = () => {
    return (
        <div className="min-h-screen">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64 bg-white/20" />
                        <Skeleton className="h-4 w-48 bg-white/15" />
                    </div>
                    <Skeleton className="h-10 w-36 bg-white/20 rounded-lg" />
                </div>
            </div>
            
            {/* Breadcrumb */}
            <div className="px-6 py-3 border-b">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
            
            {/* Projects header with controls */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-6 w-8 rounded" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-6 w-6" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-8 w-32 rounded" />
                    </div>
                </div>
                
                {/* Cards */}
                <CardsLoading />
            </div>
        </div>
    );
};
