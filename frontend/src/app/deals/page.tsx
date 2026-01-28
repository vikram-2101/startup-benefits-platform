"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import DealCard from "@/src/components/DealCard";
import { DealCardSkeleton } from "@/src/components/Skeleton";
import { api } from "@/src/lib/api";
import { DealsResponse } from "@/src/lib/types";
const categories = [
  "All",
  "communication",
  "cloud",
  "marketing",
  "analytics",
  "productivity",
  "design",
  "development",
];

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showLockedOnly, setShowLockedOnly] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["deals", selectedCategory, showLockedOnly],
    queryFn: async () => {
      let url = "/deals?";
      if (selectedCategory !== "All") {
        url += `category=${selectedCategory}&`;
      }
      if (showLockedOnly) {
        url += `isLocked=true&`;
      }

      const res = await api.get<DealsResponse>(url);
      console.log("res.data", res.data);
      return res.data; // ✅ unwrap HTTP response
    },
  });

  const filteredDeals =
    data?.deals?.filter(
      (deal) =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];
  console.log("filteredDeals", filteredDeals[0]);
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Exclusive Startup Deals
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse through our curated collection of premium SaaS deals
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary-600 text-white shadow-lg"
                    : "bg-white text-gray-600 border-2 border-gray-200 hover:border-primary-300"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="flex items-center justify-center gap-4">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showLockedOnly}
                onChange={(e) => setShowLockedOnly(e.target.checked)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                Show Locked Deals Only
              </span>
            </label>
          </div>
        </motion.div>

        {/* Results Count */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-center text-gray-600"
          >
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredDeals.length}
            </span>{" "}
            deals
          </motion.div>
        )}

        {/* Deals Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <DealCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-red-600 text-lg">
              Failed to load deals. Please try again.
            </p>
          </motion.div>
        ) : filteredDeals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-600 text-lg">
              No deals found matching your criteria.
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map((deal, index) => (
              <DealCard key={deal._id} deal={deal} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
