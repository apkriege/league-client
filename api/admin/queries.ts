import { useQuery } from "@tanstack/react-query";
import {
  getAdminBilling,
  getAdminLeagues,
  getAdminUsers,
  getPaymentBypassCodes,
} from ".";

export const useAdminUsers = (enabled = true) =>
  useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
    enabled,
  });

export const useAdminLeagues = (enabled = true) => {
  return useQuery({
    queryKey: ["admin-leagues"],
    queryFn: () => getAdminLeagues(),
    enabled,
  });
};

export const useAdminBilling = (enabled = true) =>
  useQuery({
    queryKey: ["admin-billing"],
    queryFn: getAdminBilling,
    enabled,
  });

export const usePaymentBypassCodes = (enabled = true) =>
  useQuery({
    queryKey: ["payment-bypass-codes"],
    queryFn: getPaymentBypassCodes,
    enabled,
  });
