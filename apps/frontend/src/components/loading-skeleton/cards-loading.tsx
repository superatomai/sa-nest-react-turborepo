import { Skeleton } from "@/components/ui/skeleton";

const CardsLoading = () => {
    return (
        <div className="grid grid-cols-4 gap-5 h-full min-h-[200px]">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CardsLoading;