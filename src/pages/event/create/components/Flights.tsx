import FlightBuilder from "./FlightBuilder";
import { useFormContext } from "react-hook-form";

export default function Flights() {
  const methods = useFormContext();
  const event = methods.watch();

  const setFlights = (flights: any[]) => {
    methods.setValue("flights", flights);
  };

  const flights = methods.watch("flights");

  return <FlightBuilder flights={flights} setFlights={setFlights} event={event} />;
}
