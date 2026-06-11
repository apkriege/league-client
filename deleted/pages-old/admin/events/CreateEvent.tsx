import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import PageHeader from "@/components/layout/PageHeader";
import WizardType, { type EventWizardType } from "./WizardType";
import { Trophy } from "lucide-react";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { leagueId } = useParams();
  const [wizardType, setWizardType] = useState<EventWizardType>("single");

  const handleNext = () => {
    // Logic to move to the next step of the wizard
    if (wizardType === "single") {
      navigate(`/admin/league/${leagueId}/events/create/single`);
    } else {
      navigate(`/admin/league/${leagueId}/events/create/multi`);
    }
  };

  return (
    <div className="flex flex-col relative h-full">
      <PageHeader
        title="Choose Event Type"
        subTitle="Select the type of event you want to create. This will determine the setup process and available features."
        icon={<Trophy size={14} />}
        iconText="CREATE EVENT"
      />
      <div className="flex-1">
        <WizardType wizardType={wizardType} setWizardType={setWizardType} />
      </div>
      <div className="bg-base-100 border rounded-xl p-2 mt-4 w-full absolute -bottom-5">
        <div className="text-sm text-gray-500 flex justify-end">
          <button onClick={handleNext} className="btn btn-primary btn-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
