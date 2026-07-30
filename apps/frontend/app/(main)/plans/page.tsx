"use client";

import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type BillingCycle = "monthly" | "yearly";

export enum BundleTier {
  FREE = "Free",
  BASIC = "Basic",
  PRO = "Pro",
  ENTERPRISE = "Enterprise",
}

interface Bundles {
  id: string;
  tier: BundleTier;
  maxMessages: number;
  price: number;
  isUnlimited: boolean;
}

export default function PlansPage() {
  const router = useRouter();
  const [bundles, setBundles] = useState<Bundles[]>([]);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [autoRenew, setAutoRenew] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApi("/subscriptions/bundles")
      .then((res) => setBundles(res))
      .catch((error) => console.log(error));
  }, []);

  const paidBundles = bundles.filter((bundle) => bundle.tier !== BundleTier.FREE);
  const selectedBundle = bundles.find((b) => b.id === selectedBundleId) ?? null;

  const handleSubscribe = async () => {
    if (!selectedBundleId) return;

    setError(null);
    setIsSubscribing(true);

    try {
      await fetchApi("/subscriptions/create", {
        method: "POST",
        body: JSON.stringify({
          bundleId: selectedBundleId,
          isYearly: cycle === "yearly",
          autoRenew,
        }),
      });

      router.push("/subscriptions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to subscribe");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Plans</h1>
          <p className="mt-1 text-sm text-gray-500">
            Choose a bundle to keep chatting after your free messages run out.
          </p>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-md border border-gray-300 bg-white p-1">
            {(["monthly", "yearly"] as BillingCycle[]).map((option) => (
              <button
                key={option}
                onClick={() => setCycle(option)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  cycle === option ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Plan cards — selectable, not individually actionable */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {paidBundles.map((bundle) => {
            const price = cycle === "monthly" ? bundle.price : bundle.price * 10;
            const isPopular = bundle.tier.toLowerCase() === "pro";
            const isSelected = selectedBundleId === bundle.id;

            return (
              <button
                key={bundle.id}
                type="button"
                onClick={() => setSelectedBundleId(bundle.id)}
                className={`relative text-left rounded-lg border bg-white p-6 flex flex-col transition-colors focus:outline-none ${
                  isSelected
                    ? "border-gray-900 ring-2 ring-gray-900 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 text-white text-xs font-medium px-3 py-1">
                    Most popular
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{bundle.tier}</h2>
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-gray-900" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-gray-900" />}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-gray-900">${price}</span>
                  <span className="text-sm text-gray-500">
                    / {cycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  {bundle.isUnlimited
                    ? "Unlimited responses"
                    : `${bundle.maxMessages} responses monthly`}
                </p>
              </button>
            );
          })}
        </div>

        {/* Auto-renew + subscribe */}
        <div className="mt-8 max-w-sm mx-auto rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-renew</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Automatically renews each {cycle === "monthly" ? "month" : "year"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoRenew}
              onClick={() => setAutoRenew((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRenew ? "bg-gray-900" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRenew ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={!selectedBundleId || isSubscribing}
            className="mt-5 w-full rounded-md bg-gray-900 text-white text-sm font-medium py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubscribing
              ? "Subscribing..."
              : selectedBundle
                ? `Subscribe to ${selectedBundle.tier}`
                : "Select a plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
