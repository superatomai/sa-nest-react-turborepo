import { useState } from "react";
import { trpc } from "@/utils";
import { uisStore } from "@/stores/mobx_uis_store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { default_dsl } from "@/lib/utils/default-dsl";

type Props = {
  setShowAddUiModal: (open: boolean) => void;
  projectId: number;
};

const AddNewUiModal = ({ setShowAddUiModal, projectId }: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Mutations
  const createVersionMutation = trpc.versionsCreate.useMutation();
  const createUiMutation = trpc.uisCreate.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleClose = () => {
    if (!createUiMutation.isPending && !createVersionMutation.isPending) {
      resetForm();
      setShowAddUiModal(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget &&
      !createUiMutation.isPending &&
      !createVersionMutation.isPending
    ) {
      resetForm();
      setShowAddUiModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("UI name is required.");
      return;
    }

    try {

        const ui_id = "ui_" + nanoid(6)

      // 1. Create version first
      const version : any = await createVersionMutation.mutateAsync({
        uiId: ui_id, 
        dsl: default_dsl, 
        prompt: "This is a default prompt",
      });

      console.log("Version created:", JSON.stringify(version));
      
      // 2. Then create UI with versionId
      const newUi : any = await createUiMutation.mutateAsync({
        uiId: version.version.uiId,
        uiVersion: version.version.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        projectId,
      });

      console.log("UI created:", JSON.stringify(newUi.ui));
      // 3. Add to MobX store
      uisStore.addUiToStore(newUi.ui);

      // 4. Reset + close modal
      resetForm();
      setShowAddUiModal(false);

    } catch (error) {
      console.error("Error creating UI:", error);
      alert("Failed to create UI. Please try again.");
    }
  };

  const isPending = createVersionMutation.isPending || createUiMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Create New UI</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isPending}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">UI Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter UI name"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter UI description (optional)"
                rows={3}
                disabled={isPending}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !formData.name.trim()}
              >
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create UI
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNewUiModal;
