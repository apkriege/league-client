import { publicLinks } from "@/config/publicLinks";
import LegalDocumentPage from "./LegalDocumentPage";
import { getTermsOfService } from "./legalDocuments";

export default function TermsOfService() {
  return <LegalDocumentPage document={getTermsOfService(publicLinks.supportEmail)} />;
}
