import PageHeader from "@/components/layout/PageHeader";
import { Trophy } from "lucide-react";
import FlightBuilder from "../shared/FlightBuilder";
import { useFormContext } from "react-hook-form";

export default function Flights() {
  const methods = useFormContext();
  const event = methods.watch();

  const setFlights = (flights: any[]) => {
    methods.setValue("flights", flights);
  };

  const flights = methods.watch("flights");

  return (
    <div>
      <PageHeader
        title="Flight Builder"
        subTitle="Select the type of event you want to create. This will determine the setup process and available features."
        icon={<Trophy size={14} />}
        iconText="CREATE EVENT"
      />
      <div className="mt-4">
        <FlightBuilder flights={flights} setFlights={setFlights} event={event} />
      </div>
    </div>
  );
}
