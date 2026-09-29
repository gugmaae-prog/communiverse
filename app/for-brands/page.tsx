import { AudiencePage, audienceMetadata } from "@/components/audience-page";
import { brandsPage } from "@/data/pages";

export const metadata = audienceMetadata(brandsPage, "/for-brands");

export default function ForBrandsPage() {
  return <AudiencePage page={brandsPage} />;
}
