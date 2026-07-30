"use client";

import { fetchApi } from "@/lib/api";
import { useState, useEffect } from "react";
import { BundleTier } from "../plans/page";
import Link from "next/link";

interface Bundle {
  id: string;
  tier: BundleTier;
  maxMessages: number;
  price: number;
  isUnlimited: boolean;
}

interface UserSubscription {
  id: string;
  userId: string;
  bundleId: string;
  bundle: Bundle;
  startDate: string;
  endDate: string;
  renewalDate: string;
  autoRenew: boolean;
  isActive: boolean;
  usedQouta: number;
  isYearly: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApi("/subscriptions")
      .then((res) => setSubscriptions(res))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load subscriptions"))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleAutoRenew = async (subId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const updated = await fetchApi(`/subscriptions/${subId}`, {
        method: "PATCH",
        body: JSON.stringify({ autoRenew: newStatus }),
      });

      setSubscriptions((subs) =>
        subs.map((sub) =>
          sub.id === subId
            ? { ...sub, autoRenew: updated.autoRenew, renewalDate: updated.renewalDate }
            : sub
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subscription");
    }
  };

  return (
    <div className="px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Subscriptions</h1>
            <p className="mt-1 text-sm text-gray-500">
              Your current and past bundle subscriptions.
            </p>
          </div>
          <Link
            href="/plans"
            className="rounded-md bg-gray-900 text-white text-sm font-medium px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            Browse plans
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-sm text-gray-400 py-16">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center border border-dashed border-gray-300 rounded-lg py-16">
            <p className="text-sm text-gray-500">You don&apos;t have any subscriptions yet.</p>
            <Link
              href="/plans"
              className="mt-3 inline-block text-sm font-medium text-gray-900 hover:underline"
            >
              View plans
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-lg border border-gray-200 bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-gray-900">
                        {sub.bundle.tier}
                      </h2>
                      <span
                        className={`text-xs font-medium border rounded-full px-2 py-0.5 ${
                          sub.isActive
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {sub.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">${sub.isYearly ? sub.bundle.price * 10 : sub.bundle.price}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {sub.bundle.isUnlimited
                        ? "Unlimited"
                        : `${sub.usedQouta} / ${sub.bundle.maxMessages}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {sub.bundle.isUnlimited ? "responses" : "responses used"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-gray-400">Start date</p>
                    <p className="text-gray-700 mt-0.5">{formatDate(sub.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">End date</p>
                    <p className="text-gray-700 mt-0.5">{formatDate(sub.endDate)}</p>
                  </div>
                  {sub.autoRenew && (
                    <div>
                        <p className="text-gray-400">Renews on</p>
                        <p className="text-gray-700 mt-0.5">{formatDate(sub.renewalDate)}</p>
                    </div>
                  )}
                </div>
                
                {sub.bundle.tier !== BundleTier.FREE && (
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900">Auto-renew</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                        Automatically renews at the end of the billing cycle
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={sub.autoRenew}
                        onClick={() => toggleAutoRenew(sub.id, sub.autoRenew)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        sub.autoRenew ? "bg-gray-900" : "bg-gray-200"
                        }`}
                    >
                        <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            sub.autoRenew ? "translate-x-6" : "translate-x-1"
                        }`}
                        />
                    </button>
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}