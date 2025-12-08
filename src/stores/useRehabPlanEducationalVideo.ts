import { create } from 'zustand';
import { toast } from 'sonner';
import config from '@/config/config';

type EducationalVideo = {
    _id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
};
type RehabPlanEducationalVideos = {
    planId: string;
    video: EducationalVideo[];
};

type RehabPlanEducationalVideoStore = {
    educationalVideos: RehabPlanEducationalVideos | null;
    loading: boolean;
    error: string | null;
    fetchRehabPlanEducationalVideo: (planId: string) => Promise<void>;
    removeVideoFromPlan: (p: { planId: string; videoId: string }) => Promise<boolean>;
};

export const useRehabPlanEducationalVideoStore = create<RehabPlanEducationalVideoStore>((set) => ({
    educationalVideos: null,
    loading: false,
    error: null,

    removeVideoFromPlan: async ({ planId, videoId }) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(
                `${config.baseUri}/api/rehab-plans/educational-video/${videoId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ planId }),
                    credentials: "include",
                }
            );

            const json = await res.json();
            if (!res.ok || json?.success === false) {
                toast.error(json?.message || "Failed to remove video");
                set({ loading: false });
                return false;
            }

            // 🧹 Remove from local state
            set((state) => {
                if (!state.educationalVideos) return state;

                const updatedVideos = state.educationalVideos.video.filter(
                    (v) => v._id !== videoId
                );

                return {
                    ...state,
                    educationalVideos: {
                        ...state.educationalVideos,
                        video: updatedVideos,
                    },
                    loading: false,
                };
            });

            toast.success("Video removed successfully");
            return true;
        } catch (e: unknown) {
            const errMsg = (e as Error).message || "Failed to remove video";
            toast.error(errMsg);
            set({ error: errMsg, loading: false });
            return false;
        }
    },

    fetchRehabPlanEducationalVideo: async (planId: string) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`${config.baseUri}/api/rehab-plans/educational-video/${planId}`, {
                credentials: 'include',
            });

            const json = await res.json();

            if (!res.ok || json?.success === false) {
                toast.error(json?.message || 'Failed to load educational videos');
                set({ loading: false });
                return;
            }
            console.log("this is educational video");
            console.log(json);

            set({ educationalVideos: json.data, loading: false });
        } catch (e: unknown) {
            const errMsg = (e as Error).message || 'Failed to load educational videos';
            toast.error(errMsg);
            set({ error: errMsg, loading: false });
        }
    },
}));
