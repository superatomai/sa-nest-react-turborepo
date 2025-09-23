import { truncateText } from "@/lib/utils/truncate-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { useState } from "react";
import ToolTip from "../../Tooltip";
import { Icon } from "@iconify/react/dist/iconify.js";
import { getTimeAgo } from "@/lib/utils/time-ago";
import DeleteProjectKeyModal from "./DeleteProjectKeyModal";
import { Badge } from "../../ui/badge";

type Props = {
  keyDetails: any;
  selectedProjId: number;
};

const ProjectKeyCard = ({ keyDetails }: Props) => {
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const name = keyDetails.name ?? "";
  const hasLongName = name.length > 18;
  const customInst = keyDetails.customInst ?? "";

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'destructive';
      case 'staging':
        return 'secondary';
      case 'development':
      default:
        return 'outline';
    }
  };


  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{keyDetails.name}</CardTitle>
              <Badge
                variant={keyDetails.environment === 'production' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {keyDetails.environment}
              </Badge>
              {keyDetails.isActive && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                  Active
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                className="py-1 px-3 bg-white cursor-pointer border border-gray-300 rounded-md text-xs text-gray-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
              >
                <Icon icon="material-symbols:delete-rounded" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Key Prefix:</span>
              <p className="font-mono mt-1">{keyDetails.keyValue.substring(0, 8)}•••••••</p>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="mt-1">{new Date(keyDetails.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <p className="mt-1">{keyDetails.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>

          {customInst && (
            <div>
              <span className="text-gray-500 text-sm">Custom Instructions:</span>
              <p className="text-sm mt-1 p-2 bg-gray-50 rounded text-gray-700">
                {customInst}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {showDeleteModal && (
        <DeleteProjectKeyModal
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          keyName={keyDetails.name}
          keyId={keyDetails.id}
        />
      )}
    </>
  );
};

export default ProjectKeyCard;