"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Generation {
  id: string;
  type: string;
  status: string;
  prompt: string;
  outputUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  completedAt: string | null;
}

export function GenerationGallery() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGenerations();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchGenerations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchGenerations = async () => {
    try {
      const response = await fetch("/api/generations/list");
      if (!response.ok) throw new Error("Failed to fetch generations");
      
      const data = await response.json();
      setGenerations(data.generations);
    } catch (error) {
      console.error("Failed to fetch generations:", error);
      toast({
        title: "Error",
        description: "Failed to load generations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this generation?")) return;

    try {
      const response = await fetch(`/api/generations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast({
        title: "Deleted",
        description: "Generation deleted successfully",
      });

      setGenerations(generations.filter((g) => g.id !== id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete generation",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">Completed</Badge>;
      case "PROCESSING":
        return <Badge variant="secondary">Processing</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium">No generations yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first AI generation using the form above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Your Generations</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchGenerations}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generations.map((generation) => (
          <Card key={generation.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted">
                {generation.status === "COMPLETED" && generation.outputUrl ? (
                  <Image
                    src={generation.thumbnailUrl || generation.outputUrl}
                    alt={generation.prompt}
                    fill
                    className="object-cover"
                  />
                ) : generation.status === "PROCESSING" ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : generation.status === "FAILED" ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-destructive">Generation failed</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Pending...</p>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {generation.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {generation.prompt}
                    </p>
                  </div>
                  {getStatusBadge(generation.status)}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(generation.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {generation.status === "COMPLETED" && generation.outputUrl && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        handleDownload(
                          generation.outputUrl!,
                          `generation-${generation.id}.${generation.type.includes("VIDEO") ? "mp4" : "png"}`
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(generation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {generation.status === "FAILED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDelete(generation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
