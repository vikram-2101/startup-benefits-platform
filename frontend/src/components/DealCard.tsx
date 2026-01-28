"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Tag, Calendar } from "lucide-react";
import { Deal } from "../lib/types";

interface DealCardProps {
  deal: Deal;
  index: number;
}

export default function DealCard({ deal, index }: DealCardProps) {
  // console.log("deal in deal card", deal);
  console.log("category", deal.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link href={`/deals/${deal._id}`}>
        <div
          className={`relative h-full bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 ${
            deal.isLocked
              ? "border-gray-300 bg-gray-50"
              : "border-gray-200 hover:border-primary-400 hover:shadow-xl"
          }`}
        >
          {deal.isLocked && (
            <div className="absolute inset-0 bg-gray-900/5 z-10 flex items-center justify-center backdrop-blur-[2px]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                className="bg-white rounded-full p-4 shadow-lg"
              >
                <Lock className="w-8 h-8 text-gray-400" />
              </motion.div>
            </div>
          )}

          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full">
                    {deal.category}
                  </span>
                  {deal.isLocked && (
                    <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {deal?.title}
                </h3>
              </div>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2">
              {deal.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-sm">
                  <Tag className="w-4 h-4 text-primary-600" />
                  <span className="font-semibold text-primary-600">
                    {deal.discount}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Value:{" "}
                  <span className="font-medium text-gray-700">
                    {deal.value}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-gray-700">
                by {deal?.partner?.name}
              </span>
              <motion.div
                className="text-primary-600 flex items-center space-x-1"
                whileHover={{ x: 4 }}
              >
                <span className="text-sm font-medium">View Details</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
