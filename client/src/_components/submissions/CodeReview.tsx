import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/card";
import { Button } from "@/_components/ui/button";
import { Textarea } from "@/_components/ui/textarea";
import { Pencil, Save, X } from "lucide-react";

interface CodeReviewProps {
  reviewNote: string;
  setReviewNote: (note: string) => void;
  editingReview: boolean;
  setEditingReview: (editing: boolean) => void;
  onSaveReview: () => void;
  isSavingReview: boolean;
}

export const CodeReview: React.FC<CodeReviewProps> = ({
  reviewNote,
  setReviewNote,
  editingReview,
  setEditingReview,
  onSaveReview,
  isSavingReview
}) => {
  const handleCancel = () => {
    setEditingReview(false);
    // Reset to original value if needed
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Code Review
          </CardTitle>
          {!editingReview && (
            <Button
              onClick={() => setEditingReview(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editingReview ? (
          <>
            <Textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Add your review notes here..."
              className="min-h-32"
            />
            <div className="flex gap-2">
              <Button
                onClick={onSaveReview}
                disabled={isSavingReview}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSavingReview ? "Saving..." : "Save Review"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4 bg-muted/50 rounded-lg">
            {reviewNote ? (
              <p className="whitespace-pre-wrap">{reviewNote}</p>
            ) : (
              <p className="text-muted-foreground italic">
                No review notes added yet. Click "Edit Review" to add your thoughts.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
