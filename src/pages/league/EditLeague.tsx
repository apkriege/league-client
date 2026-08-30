import LoadingState from "@/components/layout/LoadingState";
import Button from "@/components/layout/Button";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import PageState from "@/components/layout/PageState";
import InfoForm from "./forms/InfoForm";

import { useLeague } from "@api/league/queries";
import { useUpdateLeague } from "@api/league/mutations";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useToast } from "@/context/useToast";
import { validateLeagueForm } from "./validation";
import {
  normalizeLeagueHoleFormat,
  type LeagueHoleFormat,
} from "@/features/leagues/leagueHoleFormat";
import { getLeagueCapacity } from "@/lib/billing";

type LeagueFormData = {
  id?: number;
  adminId?: number;
  name: string;
  description: string;
  numPlayers: number;
  type: string;
  holeFormat: LeagueHoleFormat;
  format: string | null;
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
  holeFormat: "18",
  format: "team",
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
    numPlayers: getLeagueCapacity(league),
    type: String(league.type || "season").toLowerCase(),
    holeFormat: normalizeLeagueHoleFormat(league.holeFormat),
    format: league.format ? String(league.format).toLowerCase() : null,
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
  const { show } = useToast();

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
    const validationMessage = validateLeagueForm(values);
    if (validationMessage) {
      show(validationMessage, "error");
      return;
    }

    const payload = modelLeagueDataForSave(values);

    updateLeague.mutate(
      { id: numericLeagueId, data: payload },
      {
        onSuccess: () => {
          navigate(`/league/${numericLeagueId}/admin`);
        },
        onError: (error) => {
          show(getApiErrorMessage(error, "Unable to update the league."), "error");
        },
      }
    );
  };

  if (!numericLeagueId) {
    return (
      <LoadingState>
        Invalid league id.
      </LoadingState>
    );
  }

  if (isLoading) {
    return (
      <LoadingState>
        Loading league...
      </LoadingState>
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
          <InfoForm
            competitiveSettingsLocked={Boolean(league.hasRecordedScores)}
            isEditing
          />
        </div>

        <div className="step-footer mt-4 w-full bg-white px-4 py-3 flex items-center justify-end border border-slate-200 rounded-xl shadow-xs gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(`/league/${numericLeagueId}/admin`)}
            disabled={updateLeague.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={updateLeague.isPending}
          >
            {updateLeague.isPending ? "Saving..." : "Save League"}
          </Button>
        </div>
      </FormProvider>
    </div>
  );
}
