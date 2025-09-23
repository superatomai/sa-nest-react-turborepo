import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddNewProjectKeyModal from "./AddNewProjectKeyModal";
import KeySuccessModal from "./KeySuccessModal";

type Props = {
  projectId: number;
};

const AddNewProjectKey = ({ projectId }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState<{
    keyValue: string;
    keyName: string;
    environment: string;
  } | null>(null);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create New Key
      </Button>

      {showModal && (
        <AddNewProjectKeyModal
          showModal={showModal}
          setShowModal={setShowModal}
          projectId={projectId}
          setShowSuccessModal={setShowSuccessModal}
          setCreatedKeyData={setCreatedKeyData}
        />
      )}

      {showSuccessModal && createdKeyData && (
        <KeySuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setCreatedKeyData(null);
          }}
          keyValue={createdKeyData.keyValue}
          keyName={createdKeyData.keyName}
          environment={createdKeyData.environment}
        />
      )}
    </>
  );
};

export default AddNewProjectKey;