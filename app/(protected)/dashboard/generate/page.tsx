import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { GenerationForm } from "@/components/generation/generation-form";
import { GenerationGallery } from "@/components/generation/generation-gallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = constructMetadata({
  title: "Generate – Rendus AI",
  description: "Create AI-generated images and videos.",
});

export default async function GeneratePage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  return (
    <>
      <DashboardHeader
        heading="AI Generation"
        text="Create stunning images and videos with AI."
      />

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="gallery">My Generations</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <GenerationForm />
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <GenerationGallery />
        </TabsContent>
      </Tabs>
    </>
  );
}
