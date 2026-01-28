"use client";

import { motion } from "framer-motion";

export function DealCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-6 w-24 bg-gray-200 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            className="h-8 w-3/4 bg-gray-200 rounded"
          />
        </div>
      </div>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        className="h-4 w-full bg-gray-200 rounded"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        className="h-4 w-2/3 bg-gray-200 rounded"
      />

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          className="h-6 w-20 bg-gray-200 rounded"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          className="h-6 w-32 bg-gray-200 rounded"
        />
      </div>
    </div>
  );
}

export function DealDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-12 w-3/4 bg-gray-200 rounded"
      />
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            className="h-24 bg-gray-200 rounded-lg"
          />
        ))}
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-64 bg-gray-200 rounded-xl"
      />
    </div>
  );
}
