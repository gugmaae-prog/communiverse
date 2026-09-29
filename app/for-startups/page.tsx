import { AudiencePage, audienceMetadata } from "@/components/audience-page";
import { startupsPage } from "@/data/pages";

export const metadata = audienceMetadata(startupsPage, "/for-startups");

export default function ForStartupsPage() {
  return <AudiencePage page={startupsPage} />;
}
