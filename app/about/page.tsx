import { AudiencePage, audienceMetadata } from "@/components/audience-page";
import { aboutPage } from "@/data/pages";

export const metadata = audienceMetadata(aboutPage, "/about");

export default function AboutPage() {
  return <AudiencePage page={aboutPage} />;
}
