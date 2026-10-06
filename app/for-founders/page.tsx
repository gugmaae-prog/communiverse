import { AudiencePage, audienceMetadata } from "@/components/audience-page";
import { foundersPage } from "@/data/pages";

export const metadata = audienceMetadata(foundersPage, "/for-founders");

export default function ForFoundersPage() {
  return <AudiencePage page={foundersPage} />;
}
