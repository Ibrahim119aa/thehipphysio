"use client";
import React, { useEffect, useState } from "react";
import styles from "./RehabPlanStyle.module.css";
import Head from "next/head";
interface Category {
    _id: string;
    title: string;
}

interface Plan {
    _id: string;
    name: string;
    description: string;
    price: number;
    planType: string;
    phase: string | null;
    weekStart?: number | null;
    weekEnd?: number | null;
    totalWeeks?: number | null;
    categories?: Category[];
    planDurationInWeeks?: number | null;
}

const staticPlans: Plan[] = [
    {
        _id: "689883f20ecbb1a9b6173049",
        name: "Hip Replacement",
        description: "this is hip replacement",
        price: 90,
        planType: "paid",
        phase: "phase 2",
        totalWeeks: 2,
        categories: [{ _id: "68962d5e50cb817e7236b1d4", title: "Hip replacement" }],
        planDurationInWeeks: 3,
    },
    {
        _id: "68a2629edf4d852962627253",
        name: "Full Exercise Plan",
        description: "This is Full Exercise Plan",
        price: 265,
        planType: "paid",
        phase: "Phase 1",
        weekEnd: 8,
        weekStart: 3,
        totalWeeks: 2,
        categories: [{ _id: "68962d9350cb817e7236b1d7", title: "Shoulder plan" }],
        planDurationInWeeks: 3,
    },
    {
        _id: "68b839d214206109ac768593",
        name: "FAIS Post Surgery Rehab Plan - Early Phase",
        description: "PHASE 1 (Early) - Taking you through from week 1 post surgery...",
        price: 125,
        planType: "paid",
        phase: "phase 1",
        weekStart: 3,
        weekEnd: 5,
        totalWeeks: 2,
        categories: [{ _id: "68b8398414206109ac76858f", title: "Post surgery" }],
        planDurationInWeeks: 2,
    },
];

const RehabPlansPage: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRehabPlans = async () => {
            try {
                const response = await fetch(
                    "https://the-hip-physio-api.onrender.com/api/rehab-plans",
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "true",
                        },
                    }
                );

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const result = await response.json();

                if (result.success && result.data && result.data.length > 0) {
                    setPlans(result.data);
                    setError(null);
                } else {
                    throw new Error("No plans available from API");
                }
            } catch (err: any) {
                console.warn("API failed, showing static data:", err.message);
                setError(
                    `Unable to load live data (${err.message}). Showing example plans instead.`
                );
                setPlans(staticPlans);
            } finally {
                setLoading(false);
            }
        };

        fetchRehabPlans();
    }, []);

    const buyPlan = async (planId: string, planName: string, planPrice: number) => {
        try {
            const response = await fetch(
                "https://the-hip-physio-api.onrender.com/api/user/create-checkout-session",
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                    body: JSON.stringify({ planId, rehabPlanName: planName, price: planPrice }),
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const url = data.id || "";

            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL received from server");
            }
        } catch (error: any) {
            alert("Checkout failed. Please try again.\n\nError: " + error.message);
        }
    };

    return (
        <><Head>
        {/* Bootstrap only for this page */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </Head>
            <div>
                {/* Hero Section */}
                <section className={styles.onlineRehapsSec}>
                    <div className="container">
                        <div className={styles.bannerHeading}>
                            <h1>Online Rehab Programmes</h1>
                            <p>
                                Online hip physiotherapy programmes. Crafted to help you achieve full
                                function regardless of your stage of recovery.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Plans Section */}
                <div className="container py-5">
                    <h1 className="text-center mb-4">Available Rehab Plans</h1>

                    {loading && (
                        <div className="text-center mb-4">
                            <div className={styles.loadingSpinner}></div>
                            <p className="mt-2">Loading plans...</p>
                        </div>
                    )}

                    {error && <div className={styles.alertInfo}>{error}</div>}

                    <div className="row g-4">
                        {plans.map((plan) => (
                            <div className="col-md-4" key={plan._id}>
                                <div className={`card h-100 shadow-sm ${styles.planCard}`}>
                                    <div className="card-body d-flex flex-column">
                                        <h5 className={styles.cardTitle}>{plan.name}</h5>
                                        <p className={styles.planDuration}>
                                            Weeks: {plan.planDurationInWeeks || plan.totalWeeks || "-"}
                                        </p>
                                        <p className={styles.planPrice}>£{plan.price}</p>
                                        <p className={styles.planType}>
                                            <strong>Type:</strong> {plan.planType}
                                        </p>
                                        <p className={styles.planType}>
                                            <strong>Phase:</strong> {plan.phase || "-"}
                                        </p>
                                        <p className={styles.planDesc}>{plan.description}</p>
                                        <p className={styles.planType}>
                                            <strong>Categories:</strong>{" "}
                                            {plan.categories?.map((c) => c.title).join(", ") || "-"}
                                        </p>
                                        <button
                                            className={styles.buyNowBtn}
                                            onClick={() => buyPlan(plan._id, plan.name, plan.price)}
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default RehabPlansPage;
