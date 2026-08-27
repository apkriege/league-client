import { publicLinks } from "@/config/publicLinks";
import LegalDocumentPage from "./LegalDocumentPage";
import { getPrivacyPolicy } from "./legalDocuments";

export default function PrivacyPolicy() {
  return <LegalDocumentPage document={getPrivacyPolicy(publicLinks.supportEmail)} />;
}
