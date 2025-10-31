"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type GenerationType = "TEXT_TO_IMAGE" | "TEXT_TO_VIDEO" | "IMAGE_TO_VIDEO" | "IMAGE_TO_IMAGE";

export function GenerationForm() {
  const [type, setType] = useState<GenerationType>("TEXT_TO_IMAGE");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/generations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          parameters: {
            // Default parameters - can be customized later
            imageSize: type === "TEXT_TO_IMAGE" ? "square_hd" : undefined,
            numInferenceSteps: 30,
            guidanceScale: 7.5,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create generation");
      }

      toast({
        title: "Generation started!",
        description: "Your generation is being processed. Check the gallery in a moment.",
      });

      // Reset form
      setPrompt("");
      setNegativePrompt("");
      
      // Refresh the page to show in gallery
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create generation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Generation</CardTitle>
        <CardDescription>
          Choose your generation type and describe what you want to create
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Generation Type</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT_TO_IMAGE">Text to Image</SelectItem>
                <SelectItem value="TEXT_TO_VIDEO">Text to Video</SelectItem>
                <SelectItem value="IMAGE_TO_VIDEO">Image to Video</SelectItem>
                <SelectItem value="IMAGE_TO_IMAGE">Image to Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt *</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A serene landscape with mountains, a lake, and sunset colors..."
              rows={4}
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Describe what you want to generate in detail
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="negativePrompt">Negative Prompt (Optional)</Label>
            <Textarea
              id="negativePrompt"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, low quality, distorted..."
              rows={2}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Specify what you want to avoid in the generation
            </p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Generation...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
