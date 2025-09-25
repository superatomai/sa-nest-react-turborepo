import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { formatDate, getTimeAgo, truncateText } from "@/lib/utils/index";
import { observer } from 'mobx-react-lite';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';
import ToolTip from '../Tooltip';
import DeleteProjectModal from './DeleteProjectModal';
import UpdateProjectModal from './UpdateProject';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  ProjectDetails: any;
  selected?: boolean;
  onSelect?: () => void;
}

const ProjectCard = observer(({ ProjectDetails, selected, onSelect }: ProjectCardProps) => {

  const navigate = useNavigate();

  const [showTooltip, setShowTooltip] = useState(false);
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfigTooltip, setShowConfigTooltip] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const hasLongDescription = ProjectDetails.description && ProjectDetails.description.length > 50;
  const hasLongName = ProjectDetails.name && ProjectDetails.name.length > 20;

  return (
    <div className="relative">
      <Card
        onClick={onSelect}
        className={`cursor-pointer rounded-md transition-all duration-300 hover:shadow-lg group relative overflow-visible flex flex-col gap-2 px-3 pt-3 pb-0 ${
          selected
            ? "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-500 shadow-lg"
            : "hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 border border-gray-200 hover:border-blue-300"
        }`}
      >
        <CardHeader className="flex-shrink-0 p-0 gap-0">
          <div className="flex items-start justify-between relative">
            <div className="flex-1 min-w-0">
              {ProjectDetails.name && (
                <div
                  className="relative inline-block"
                  onMouseEnter={() => hasLongName && setShowNameTooltip(true)}
                  onMouseLeave={() => setShowNameTooltip(false)}
                >
                  <CardTitle className="text-[18px] font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-200 leading-tight">
                    {hasLongName
                      ? truncateText(ProjectDetails.name, 15)
                      : ProjectDetails.name}
                  </CardTitle>

                  {hasLongName && showNameTooltip && (
                    <ToolTip description={ProjectDetails.name} />
                  )}
                </div>
              )}

              <div className="h-6 flex items-start mt-1">
                {ProjectDetails.description ? (
                  <div
                    className="relative inline-block"
                    onMouseEnter={() => hasLongDescription && setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <CardDescription className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">
                      {truncateText(ProjectDetails.description)}
                    </CardDescription>

                    {hasLongDescription && showTooltip && (
                      <ToolTip description={ProjectDetails.description} />
                    )}
                  </div>
                ) : (
                  <CardDescription className="text-xs text-gray-400 italic leading-relaxed font-medium">
                    No description provided
                  </CardDescription>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-0 pt-1 px-0 m-0 flex-1 flex flex-col justify-between">
          <div className="flex justify-between">
            <Badge
              variant="secondary"
              className={`text-xs font-medium px-2 py-1 flex items-center gap-1 ${
                selected
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700"
              }`}
            >
              <Icon icon={"fluent:card-ui-24-regular"} className="w-3 h-3" />
              {ProjectDetails.uis_count || 0} {Number(ProjectDetails.uis_count || 0) === 1 ? 'UI' : 'UIs'}
            </Badge>

            {/* <Badge
              variant="secondary"
              className={`text-xs font-medium px-2 py-1 flex ${
                selected
                  ? "bg-green-200 text-blue-800 border-blue-200"
                  : "bg-green-100 text-gray-700 group-hover:bg-green-100 group-hover:text-green-700"
              }`}
            >
              <Icon icon={"solar:dollar-broken"} />
              Paid
            </Badge> */}
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Icon icon={"solar:calendar-bold-duotone"} />
              <span className="font-medium">
                Created {formatDate(ProjectDetails.createdAt)}
              </span>
              {ProjectDetails.created_by && (
                <>
                  <span className="text-gray-400">•</span>
                  <User className="w-3 h-3 text-green-500" />
                  <span
                    className="truncate max-w-20"
                    title={ProjectDetails.created_by}
                  >
                    {ProjectDetails.created_by}
                  </span>
                </>
              )}
            </div>

            {ProjectDetails.updatedAt && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Icon icon={"tabler:clock-filled"} />
                <span className="font-medium">
                  Updated {getTimeAgo(ProjectDetails.updatedAt)}
                </span>
              </div>
            )}
          </div>

          <div className="w-full flex my-2">
            <span className="w-full py-0.5 text-xs text-blue-500 items-center justify-center text-center bg-blue-100 rounded-2xl outline-1">
              Deployed
            </span>
          </div>

          <div
            className={`w-full opacity-0 group-hover:opacity-100  ${
              selected ? "opacity-100" : ""
            } transition-all duration-200 flex justify-between relative py-2`}
          >
            <button
              className="py-1 px-3 bg-white outline-1 rounded-md text-xs z-20 relative cursor-pointer  hover:border-blue-500 hover:text-blue-600"
              onClick={(e) =>{ 
                e.stopPropagation()
                navigate(`${ProjectDetails.id}/api-keys`);
              }}
              onMouseEnter={() => setShowConfigTooltip(true)}
              onMouseLeave={() => setShowConfigTooltip(false)}
            >
              <Icon icon="mynaui:config" />
              {showConfigTooltip && <ToolTip description="Project Configuration"/>}
            </button>
            <button
              className="py-1 px-3 cursor-pointer bg-white border border-gray-300 rounded-md text-xs z-20 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              onClick={(e) =>( 
                e.stopPropagation(),
                setShowEditModal(true)
              )}
            >
              <Icon icon="material-symbols:edit-rounded" />
            </button>
            <button
              className="py-1 px-3 cursor-pointer bg-white border border-gray-300 rounded-md text-xs z-20 text-gray-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              onClick={(e) =>( 
                e.stopPropagation(),
                setShowDeleteModal(true)
                )
              }
            >
              <Icon icon="material-symbols:delete-rounded" />
            </button>
            <div className="absolute inset-0 bg-gradient-to-t from-[#92B5F7] to-white/80 -left-3 -right-3 bottom-0 top-0 z-10 rounded-b-md"></div>
          </div>
        </CardContent>
      </Card>
              {
                showDeleteModal && (
                  <DeleteProjectModal setShowDeleteProjectModal={setShowDeleteModal} showDeleteProjectModal={showDeleteModal} Project_name={ProjectDetails.name} id={ProjectDetails.id} orgId={ProjectDetails.orgId}/>
                )
              }

              {
                showEditModal && (
                  <UpdateProjectModal setShowUpdateModal={setShowEditModal} showUpdateModal={showEditModal} projectDetails={ProjectDetails} orgId={ProjectDetails.orgId}/>
                )
              }
    </div>
  );
});

export default ProjectCard;
