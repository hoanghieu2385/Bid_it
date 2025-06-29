import { useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "../services/user-api";
import { getParticipatedAuctions } from "../services/auction-api";
import { getPaymentsByUserId, isAuctionPaid } from "../services/payment-api";

export const useParticipatedAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Enhanced auction data processing
  const processAuctionData = useCallback(
    async (rawAuctions, payments, user) => {
      if (!rawAuctions.length) return [];

      // Batch process payment checks to reduce API calls
      const auctionIds = rawAuctions.map((a) => a.id);
      const paymentChecks = await Promise.allSettled(
        auctionIds.map((id) => isAuctionPaid(id).catch(() => false))
      );

      return rawAuctions.map((auction, index) => {
        // Find auction payment
        const auctionPayment = payments.find(
          (p) =>
            p.auctionId === auction.id && p.paymentType === "AUCTION_PAYMENT"
        );

        // Get payment status from batch check
        const paymentCheckResult = paymentChecks[index];
        const isPaid =
          paymentCheckResult.status === "fulfilled"
            ? paymentCheckResult.value
            : false;

        // Calculate derived fields
        const isWinner = auction.winnerId === user?.id;
        const isPaymentOverdue = auction.winnerPaymentDeadline
          ? new Date() > new Date(auction.winnerPaymentDeadline)
          : false;

        // FRONTEND FIX: Show "Pay Now" only if there's no payment record yet
        const shouldShowPayButton =
          isWinner &&
          !isPaid &&
          auction.status === "CLOSED" &&
          !isPaymentOverdue &&
          !auctionPayment; // Only show if no payment attempt has been made

        // Show "Retry Payment" if payment was attempted but not completed
        const canRetryPayment =
          isWinner &&
          !isPaid &&
          auction.status === "CLOSED" &&
          !isPaymentOverdue &&
          auctionPayment && // Must have a payment record
          ["FAILED", "CANCELLED", "PENDING", "DECLINED", "EXPIRED"].includes(
            auctionPayment?.status
          );

        // Determine if payment is in critical state
        const isPaymentCritical =
          isWinner &&
          !isPaid &&
          (isPaymentOverdue || auctionPayment?.status === "FAILED");

        // Debug logging for payment issues
        if (isWinner && auction.status === "CLOSED") {
          console.log(`Auction ${auction.id} - Payment Debug:`, {
            auctionId: auction.id,
            title: auction.title,
            isWinner,
            isPaid,
            auctionStatus: auction.status,
            isPaymentOverdue,
            paymentStatus: auctionPayment?.status,
            hasPaymentRecord: !!auctionPayment,
            shouldShowPayButton,
            canRetryPayment,
            winnerPaymentDeadline: auction.winnerPaymentDeadline,
            currentTime: new Date().toISOString(),
            auctionPayment: auctionPayment,
            buttonToShow: !auctionPayment
              ? "Pay Now"
              : canRetryPayment
              ? "Retry Payment"
              : "None",
          });
        }

        return {
          ...auction,
          // Payment info
          isPaid,
          auctionPayment,
          paymentStatus: auctionPayment?.status || null,

          // User-specific info
          isWinner,
          isPaymentOverdue,

          // Action states
          shouldShowPayButton,
          isPaymentCritical,

          // UI helpers
          statusColor: getStatusColor(auction.status),
          timeRemaining: getTimeRemaining(auction.endTime),
          canRetryPayment,
        };
      });
    },
    []
  );

  // Main data fetching function
  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const user = await getCurrentUser();
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      setCurrentUser(user);

      // Fetch participated auctions and payments in parallel
      const [rawAuctions, payments] = await Promise.all([
        getParticipatedAuctions(user.id),
        getPaymentsByUserId(user.id).catch((err) => {
          console.warn("Failed to fetch payments:", err);
          return [];
        }),
      ]);

      // Process and enhance auction data
      const processedAuctions = await processAuctionData(
        rawAuctions,
        payments,
        user
      );

      // Sort by most recent activity
      const sortedAuctions = processedAuctions.sort((a, b) => {
        // Prioritize: Active > Recent winners > Recent participation
        if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
        if (b.status === "ACTIVE" && a.status !== "ACTIVE") return 1;

        if (a.isWinner && !b.isWinner) return -1;
        if (b.isWinner && !a.isWinner) return 1;

        return new Date(b.endTime) - new Date(a.endTime);
      });

      setAuctions(sortedAuctions);
    } catch (err) {
      console.error("Error fetching participated auctions:", err);
      setError(err.message || "Failed to load auction data");
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, [processAuctionData]);

  // Initial load
  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  return {
    auctions,
    loading,
    error,
    currentUser,
    refetch,
  };
};

// Helper functions
const getStatusColor = (status) => {
  const statusColors = {
    UPCOMING: "info",
    OPENED: "success",
    CANCELLED: "danger",
    CLOSED: "warning",
    SOLD: "success",
    EXPIRED_PAYMENT: "danger",
    FAILED: "secondary",
    SHIPPING: "info",
    DELIVERED: "primary",
    DISPUTED: "danger",
    PENDING_RETURN: "warning",
    RETURNING: "warning",
    COMPLETED: "success",
  };
  return statusColors[status] || "secondary";
};

const getTimeRemaining = (endTime) => {
  if (!endTime) return null;

  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
