import { truncateText } from "@/lib/utils/truncate-text";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import ToolTip from "../Tooltip";
import { Icon } from "@iconify/react/dist/iconify.js";
import { getTimeAgo } from "@/lib/utils/time-ago";
import { useNavigate } from "react-router-dom";

type Props = {
    UICardDetails: any;
    selectedProjId: number
}
const UICard = ({UICardDetails, selectedProjId} : Props) => {
    
    const navigate = useNavigate();
    const [showNameTooltip, setShowNameTooltip] = useState(false);
    const [showDescTooltip, setShowDescTooltip] = useState(false);

    const description = UICardDetails.description ?? "";
    const hasLongDescription = description.length > 30;
    const name = UICardDetails.name ?? "";
    const hasLongName = name.length > 18;

    useEffect(()=>{
        console.log("UICardDetails", JSON.stringify(UICardDetails))
    },[UICardDetails])

  return (
    <>
      <Card className={`relative group hover:shadow-md transition-all duration-200 rounded-2xl border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-white px-3 pt-2 pb-0 overflow-hidden max-w-sm `}>

                {/* Header Section */}
                <div className="space-y-2">
                    {/* Title */}
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        <span
                            className="relative inline-block"
                            onMouseEnter={() => hasLongName && setShowNameTooltip(true)}
                            onMouseLeave={() => setShowNameTooltip(false)}
                        >
                            {truncateText(UICardDetails.name, 18)}
                            {showNameTooltip && hasLongName && (
                                <ToolTip description={UICardDetails.name} />
                            )}
                            &nbsp;
                            <span className="font-medium text-gray-800">
                                (v{UICardDetails.version_id || 'N/A'})
                            </span>
                        </span>
                    </CardTitle>

                    {/* Description - Always rendered to maintain consistent height */}
                    <CardDescription
                        className="text-sm text-gray-600 leading-relaxed relative inline-block py-0 min-h-[1.25rem]"
                        onMouseEnter={() => hasLongDescription && setShowDescTooltip(true)}
                        onMouseLeave={() => setShowDescTooltip(false)}
                    >
                        {description ? truncateText(description, 30) : "\u00A0"}
                        {showDescTooltip && hasLongDescription && (
                            <ToolTip description={description} />
                        )}
                    </CardDescription>

                    {/* Timestamps */}
                    <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                            <Icon icon={"solar:calendar-bold-duotone"} />
                            <span>
                                Created{" "}
                                {UICardDetails.createdAt
                                    ? new Date(UICardDetails.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })
                                    : "N/A"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon icon={"tabler:clock-filled"} />
                            <span>Updated {UICardDetails.updatedAt ? getTimeAgo(UICardDetails.updatedAt) : "N/A"}</span>
                        </div>
                    </div>

                    {/* Deployment Status */}
                    <div className="w-full">
                        <div
                            className={`w-full py-1 px-3 rounded-lg text-center text-sm font-medium transition-colors ${UICardDetails.published
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                                }`}
                        >
                            {UICardDetails.published ? "Deployed" : "Not Deployed"}
                        </div>
                    </div>
                </div>

                {/* Hover actions */}
                <div className="w-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex justify-between relative py-2">
                    <button
                        className="py-1 px-3 bg-white outline-1 rounded-md text-xs z-20 hover:bg-gray-50 transition-colors"
                    >
                        <Icon icon="material-symbols:open-in-new-rounded" />
                    </button>
                    <button
                        className="py-1 px-3 bg-white cursor-pointer border border-gray-300 rounded-md text-xs z-20 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/editor/${UICardDetails.uiId}?version=${UICardDetails.version_id}`);
                        }}
                    >
                        <Icon icon="material-symbols:edit-rounded" />
                    </button>
                    <button
                        className="py-1 px-3 bg-white cursor-pointer border border-gray-300 rounded-md text-xs z-20 text-gray-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        // disabled={isUpdating}
                        // onClick={(e) => {
                        //     e.stopPropagation();
                        //     setShowDeleteUiModal(!showDeleteUiModal);
                        // }}
                    >
                        <Icon icon="material-symbols:delete-rounded" />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#92B5F7] to-white/80 -left-3 -right-3 bottom-0 top-0 z-10"></div>
                </div>
            </Card>
    </>
  )
}

export default UICard
