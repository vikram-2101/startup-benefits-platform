"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  CheckCircle,
  Tag,
  Calendar,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/src/lib/api";
import { Deal } from "@/src/lib/types";
import { DealDetailSkeleton } from "@/src/components/Skeleton";
import { useAuth } from "@/src/context/authContext";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dealId = params.id as string;
  const {
    data: deal,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["deal", dealId],
    queryFn: () => api.get<Deal>(`/deals/${dealId}`),
  });

  // console.log("deal in details", deal);
  const claimMutation = useMutation({
    mutationFn: () => api.post("/claims", { dealId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({ queryKey: ["claims", "me"] });

      router.push("/dashboard");
    },
  });

  const handleClaim = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (deal?.isLocked && !user.isVerified) {
      alert(
        "This deal requires verification. Please verify your account first.",
      );
      return;
    }

    claimMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <DealDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-8"
          >
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Deal Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The deal you're looking for doesn't exist.
            </p>
            <Link href="/deals">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium"
              >
                Back to Deals
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/deals"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Deals</span>
          </Link>
        </motion.div>

        {/* Deal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden"
        >
          <div className="p-8 space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 text-sm font-medium text-primary-700 bg-primary-50 rounded-full">
                  {deal.category}
                </span>
                {deal.isLocked && (
                  <span className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-200 rounded-full flex items-center space-x-1">
                    <Lock className="w-4 h-4" />
                    <span>Verification Required</span>
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {deal?.title}
              </h1>
              <p className="text-lg text-gray-600">{deal?.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border-2 border-primary-200"
              >
                <Tag className="w-8 h-8 text-primary-600 mb-2" />
                <p className="text-sm text-primary-700 font-medium mb-1">
                  Discount
                </p>
                <p className="text-2xl font-bold text-primary-900">
                  {deal?.discount}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200"
              >
                <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-green-700 font-medium mb-1">Value</p>
                <p className="text-2xl font-bold text-green-900">
                  {deal.value}
                </p>
              </motion.div>

              {deal.expiresAt && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200"
                >
                  <Calendar className="w-8 h-8 text-orange-600 mb-2" />
                  <p className="text-sm text-orange-700 font-medium mb-1">
                    Expires
                  </p>
                  <p className="text-lg font-bold text-orange-900">
                    {new Date(deal?.expiresAt).toLocaleDateString()}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Partner Info */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Partner Information
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {deal?.partner?.name}
                  </p>
                  {deal?.partner?.website && (
                    <a
                      href={deal?.partner?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 mt-1"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Requirements */}
            {deal.requirements && deal.requirements.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {deal?.requirements.map((requirement, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Claim Button */}
            <div className="pt-6 border-t border-gray-200">
              {deal?.isLocked && (!user || !user.isVerified) ? (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">
                        Verification Required
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        This deal requires account verification. Please verify
                        your account to claim this deal.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaim}
                disabled={
                  claimMutation.isPending ||
                  (deal.isLocked && (!user || !user.isVerified))
                }
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  claimMutation.isPending ||
                  (deal.isLocked && (!user || !user.isVerified))
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl"
                }`}
              >
                {claimMutation.isPending ? "Claiming..." : "Claim This Deal"}
              </motion.button>

              {claimMutation.isError && (
                <p className="mt-4 text-center text-red-600">
                  {(claimMutation.error as Error).message ||
                    "Failed to claim deal"}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
