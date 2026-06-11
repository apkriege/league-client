import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import PageState from "@/components/layout/PageState";
import InfoForm from "./forms/InfoForm";

import { useLeague } from "@api/league/queries";
import { useUpdateLeague } from "@api/league/mutations";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";

type LeagueFormData = {
  id?: number;
  adminId?: number;
  name: string;
  description: string;
  numPlayers: number;
  type: string;
  format: string | null;
  access: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  startDate: Date;
  endDate: Date;
};

const defaultLeagueData: LeagueFormData = {
  adminId: 1,
  name: "",
  description: "",
  numPlayers: 0,
  type: "season",
  format: "team",
  access: "public",
  contactFirstName: "",
  contactLastName: "",
  contactEmail: "",
  contactPhone: "",
  startDate: new Date(),
  endDate: new Date(),
};

const mapLeagueToForm = (league: any): LeagueFormData => {
  return {
    id: Number(league.id),
    adminId: Number(league.adminId),
    name: league.name || "",
    description: league.description || "",
    numPlayers: Number(league.numPlayers ?? 0),
    type: String(league.type || "season").toLowerCase(),
    format: league.format ? String(league.format).toLowerCase() : null,
    access: String(league.access || "public").toLowerCase(),
    contactFirstName: league.contactFirstName || "",
    contactLastName: league.contactLastName || "",
    contactEmail: league.contactEmail || "",
    contactPhone: league.contactPhone || "",
    startDate: league.startDate ? new Date(league.startDate) : new Date(),
    endDate: league.endDate ? new Date(league.endDate) : new Date(),
  };
};

const modelLeagueDataForSave = (league: any) => {
  const { id: _id, ...info } = league;

  const normalizedType = String(info.type || "").toLowerCase();
  const normalizedFormat = info.format ? String(info.format).toLowerCase() : null;
  const isSeason = normalizedType === "season";

  return {
    ...info,
    type: normalizedType,
    format: isSeason ? normalizedFormat : null,
    numPlayers: Number(info.numPlayers ?? 0),
  };
};

export default function EditLeague() {
  const { leagueId } = useParams();
  const numericLeagueId = Number(leagueId);
  const navigate = useNavigate();

  const { data: league, isLoading, isError, error } = useLeague(numericLeagueId);
  const updateLeague = useUpdateLeague();

  const leagueForm = useForm<LeagueFormData>({
    defaultValues: defaultLeagueData,
  });

  useEffect(() => {
    if (!league) return;
    leagueForm.reset(mapLeagueToForm(league));
  }, [league, leagueForm]);

  const handleSubmit = () => {
    const values = leagueForm.getValues();
    const payload = modelLeagueDataForSave(values);

    updateLeague.mutate(
      { id: numericLeagueId, data: payload },
      {
        onSuccess: () => {
          navigate(`/league/${numericLeagueId}/admin`);
        },
        onError: (error) => {
          console.error("Failed to update league:", error);
        },
      }
    );
  };

  if (!numericLeagueId) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Invalid league id.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading league...
      </div>
    );
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={
          status === 404
            ? "League Not Found"
            : status === 403
              ? "Access Denied"
              : "Unable to Load League"
        }
        message={getApiErrorMessage(error, "The league settings page could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
      />
    );
  }

  if (!league) {
    return (
      <PageState
        title="League Not Found"
        message="The league settings page could not be loaded because the league was not found."
        variant="notFound"
      />
    );
  }

  return (
    <div className="pb-4">
      <FormProvider {...leagueForm}>
        <div className="step-body">
          <InfoForm />
        </div>

        <div className="step-footer mt-4 w-full bg-base-100 px-4 py-3 flex items-center justify-end border border-base-300 rounded-xl shadow-xs gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={() => navigate(`/league/${numericLeagueId}/admin`)}
            disabled={updateLeague.isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={handleSubmit}
            disabled={updateLeague.isPending}
          >
            {updateLeague.isPending ? "Saving..." : "Save League"}
          </button>
        </div>
      </FormProvider>
    </div>
  );
}
