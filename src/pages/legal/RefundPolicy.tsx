import { publicLinks } from "@/config/publicLinks";
import LegalDocumentPage from "./LegalDocumentPage";
import { getRefundPolicy } from "./legalDocuments";

export default function RefundPolicy() {
  return <LegalDocumentPage document={getRefundPolicy(publicLinks.supportEmail)} />;
}
