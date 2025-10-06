import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Loader2, Download, Undo } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageEditorProps {
  originalImage: string;
  originalFile: File;
  onReset: () => void;
}

interface EditHistory {
  imageUrl: string;
  prompt: string;
}

export const ImageEditor = ({ originalImage, originalFile, onReset }: ImageEditorProps) => {
  const [prompt, setPrompt] = useState("");
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<EditHistory[]>([]);

  const handleEdit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter an edit prompt");
      return;
    }

    setIsProcessing(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      const imageBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(originalFile);
      });

      const { data, error } = await supabase.functions.invoke("edit-image", {
        body: {
          imageBase64,
          prompt: prompt.trim(),
        },
      });

      if (error) throw error;

      if (data?.editedImageUrl) {
        setHistory(prev => [...prev, { imageUrl: editedImage || originalImage, prompt }]);
        setEditedImage(data.editedImageUrl);
        setPrompt("");
        toast.success("Image edited successfully!");
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Failed to edit image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setEditedImage(previous.imageUrl === originalImage ? null : previous.imageUrl);
      setHistory(prev => prev.slice(0, -1));
      toast.info("Reverted to previous version");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = editedImage || originalImage;
    link.download = `edited-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const displayImage = editedImage || originalImage;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Original</h3>
          <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-border bg-card">
            <img
              src={originalImage}
              alt="Original"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {editedImage ? "Edited" : "Preview"}
          </h3>
          <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary/30 bg-card">
            <img
              src={displayImage}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            {editedImage && (
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Textarea
          placeholder="Describe how you want to edit the image... (e.g., 'Add a sunset background' or 'Make it look like a watercolor painting')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isProcessing}
          className="min-h-24 resize-none bg-card border-2 border-input focus:border-primary/50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleEdit();
            }
          }}
        />
        <div className="flex gap-3">
          <Button
            onClick={handleEdit}
            disabled={isProcessing || !prompt.trim()}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Edit Image"
            )}
          </Button>
          {history.length > 0 && (
            <Button onClick={handleUndo} variant="outline" disabled={isProcessing}>
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button onClick={onReset} variant="outline">
          New Image
        </Button>
      </div>
    </div>
  );
};