import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Footer from "../../components/common/Footer";
import CustomerTopNav from "../../components/customer/TopNav";

const API_BASE = "http://localhost:8080/api";

const STATUS_STYLES = {
  DELIVERED: "bg-green-50 text-green-700",
  OUT_FOR_DELIVERY: "bg-sky-50 text-sky-700",
  CANCELLED: "bg-red-50 text-red-700",
  REJECTED: "bg-red-50 text-red-700",
};

const getReviewedMap = () => {
  try {
    const raw = localStorage.getItem("reviewedOrders");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveReviewedMap = (map) => {
  try {
    localStorage.setItem("reviewedOrders", JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
};

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className={`text-2xl leading-none ${n <= value ? "text-yellow-400" : "text-gray-300"}`}
        aria-label={`${n} star`}
      >
        ★
      </button>
    ))}
  </div>
);

const RatingModal = ({ title, onClose, onSubmit, submitting, error }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <StarPicker value={rating} onChange={setRating} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
          rows={3}
          className="mt-3 w-full border rounded p-2 text-sm"
        />
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-3 py-2 text-sm rounded border"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(rating, comment)}
            disabled={submitting}
            className="px-3 py-2 text-sm rounded bg-indigo-600 text-white disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerOrders = () => {
  const profile = useMemo(() => {
    try {
      const raw = localStorage.getItem("customerProfile");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restaurantNames, setRestaurantNames] = useState({});
  const [riderNames, setRiderNames] = useState({});
  const [reviewed, setReviewed] = useState(getReviewedMap());
  const [modal, setModal] = useState(null); // { orderId, type: 'restaurant'|'rider', targetId }
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!profile?.userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/orders/user/${profile.userId}`);
      const data = Array.isArray(res?.data) ? res.data : [];
      data.sort((a, b) => new Date(b.orderTime || 0) - new Date(a.orderTime || 0));
      setOrders(data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Fetch restaurant + rider names for display (dedup by id)
  useEffect(() => {
    const restaurantIds = [...new Set(orders.map((o) => o.restaurantId).filter(Boolean))]
      .filter((id) => !(id in restaurantNames));
    const riderIds = [...new Set(orders.map((o) => o.deliveryPartnerId).filter(Boolean))]
      .filter((id) => !(id in riderNames));

    restaurantIds.forEach(async (id) => {
      try {
        const res = await axios.get(`${API_BASE}/restaurants/${id}`);
        setRestaurantNames((prev) => ({ ...prev, [id]: res?.data?.name || `Restaurant #${id}` }));
      } catch {
        setRestaurantNames((prev) => ({ ...prev, [id]: `Restaurant #${id}` }));
      }
    });

    riderIds.forEach(async (id) => {
      try {
        const res = await axios.get(`${API_BASE}/delivery-partners/${id}`);
        setRiderNames((prev) => ({ ...prev, [id]: res?.data?.name || `Rider #${id}` }));
      } catch {
        setRiderNames((prev) => ({ ...prev, [id]: `Rider #${id}` }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const isReviewed = (orderId, type) => !!reviewed?.[orderId]?.[type];

  const markReviewed = (orderId, type) => {
    setReviewed((prev) => {
      const next = { ...prev, [orderId]: { ...(prev[orderId] || {}), [type]: true } };
      saveReviewedMap(next);
      return next;
    });
  };

  const openModal = (orderId, type, targetId) => {
    setModalError("");
    setModal({ orderId, type, targetId });
  };

  const closeModal = () => {
    if (submitting) return;
    setModal(null);
    setModalError("");
  };

  const handleSubmitReview = async (rating, comment) => {
    if (!modal) return;
    setSubmitting(true);
    setModalError("");
    try {
      const payload = {
        userId: profile.userId,
        orderId: modal.orderId,
        rating,
        comment,
        restaurantId: modal.type === "restaurant" ? modal.targetId : null,
        deliveryPartnerId: modal.type === "rider" ? modal.targetId : null,
      };
      await axios.post(`${API_BASE}/reviews`, payload);
      markReviewed(modal.orderId, modal.type);
      setModal(null);
    } catch (err) {
      setModalError(err?.response?.data?.error || err?.response?.data?.message || err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const customerName = profile?.name || profile?.email || null;

  return (
    <div className="min-h-screen">
      <CustomerTopNav name={customerName} />
      <div className="pt-24 pb-10 max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-4">Your Orders</h1>

        {!profile?.userId && (
          <div className="text-sm text-gray-600">Please log in to view your orders.</div>
        )}

        {loading && <div className="text-sm text-gray-600">Loading orders…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="space-y-4">
          {orders.map((o) => {
            const itemsCount = Array.isArray(o?.orderItems)
              ? o.orderItems.reduce((acc, it) => acc + (it?.quantity || 0), 0)
              : 0;
            const statusClass = STATUS_STYLES[o.orderStatus] || "bg-yellow-50 text-yellow-700";
            const delivered = o.orderStatus === "DELIVERED";

            return (
              <div key={o.orderId} className="p-4 rounded-lg border bg-white">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-medium">
                      Order #{o.orderId} • ₹{Number(o.totalAmount || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {restaurantNames[o.restaurantId] || (o.restaurantId ? `Restaurant #${o.restaurantId}` : "—")} • {itemsCount} item(s)
                    </div>
                    {o.deliveryPartnerId && (
                      <div className="text-xs text-gray-500">
                        Delivered by {riderNames[o.deliveryPartnerId] || `Rider #${o.deliveryPartnerId}`}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${statusClass}`}>{o.orderStatus}</span>
                </div>

                {delivered && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {o.restaurantId && (
                      isReviewed(o.orderId, "restaurant") ? (
                        <span className="text-xs px-3 py-1 rounded border text-gray-500">Restaurant reviewed ✓</span>
                      ) : (
                        <button
                          onClick={() => openModal(o.orderId, "restaurant", o.restaurantId)}
                          className="text-sm px-3 py-1 rounded bg-indigo-600 text-white"
                        >
                          Rate Restaurant
                        </button>
                      )
                    )}
                    {o.deliveryPartnerId && (
                      isReviewed(o.orderId, "rider") ? (
                        <span className="text-xs px-3 py-1 rounded border text-gray-500">Rider reviewed ✓</span>
                      ) : (
                        <button
                          onClick={() => openModal(o.orderId, "rider", o.deliveryPartnerId)}
                          className="text-sm px-3 py-1 rounded bg-emerald-600 text-white"
                        >
                          Rate Rider
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!loading && !orders.length && !error && (
            <div className="py-10 text-center text-gray-500 text-sm">No orders yet.</div>
          )}
        </div>
      </div>
      <Footer />

      {modal && (
        <RatingModal
          title={modal.type === "restaurant" ? "Rate the restaurant" : "Rate your rider"}
          onClose={closeModal}
          onSubmit={handleSubmitReview}
          submitting={submitting}
          error={modalError}
        />
      )}
    </div>
  );
};

export default CustomerOrders;