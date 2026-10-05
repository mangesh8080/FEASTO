import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const statusColors = {
  ASSIGNED: "bg-yellow-50 text-yellow-700",
  OUT_FOR_DELIVERY: "bg-sky-50 text-sky-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-700",
  REJECTED: "bg-red-50 text-red-700",
};

const FILTERS = ["ALL", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED"];

const AssignedOrders = () => {
  const profile = useMemo(() => {
    try {
      const raw = localStorage.getItem("deliveryProfile");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const resolvePartnerId = () =>
    profile?.id || profile?.partnerId || profile?.deliveryPartnerId;

  const fetchOrders = async () => {
    const id = resolvePartnerId();
    if (!id) {
      setError("No delivery partner id found. Please log in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `http://localhost:8080/api/delivery-partners/${id}/orders`
      );
      const data = Array.isArray(res.data) ? res.data : [];
      data.sort((a, b) => (b.orderId || 0) - (a.orderId || 0));
      setOrders(data);
    } catch {
      setError("Failed to load assigned orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOutForDelivery = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await axios.put(
        `http://localhost:8080/api/orders/${orderId}/status`,
        null,
        { params: { orderStatus: "OUT_FOR_DELIVERY" } }
      );
      await fetchOrders();
    } catch {
      alert("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await axios.put(
        `http://localhost:8080/api/orders/${orderId}/status`,
        null,
        { params: { orderStatus: "DELIVERED" } }
      );
      await fetchOrders();
    } catch {
      alert("Failed to mark order as delivered");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    filter === "ALL" ? orders : orders.filter((o) => o.orderStatus === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Assigned Orders</h1>
        <button
          onClick={fetchOrders}
          className="text-sm px-3 py-1 rounded border"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1 rounded border ${
              filter === f ? "bg-blue-600 text-white border-blue-600" : ""
            }`}
          >
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading && <div className="text-sm text-gray-600">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="bg-white rounded-lg border divide-y">
        {filteredOrders.map((o) => {
          const itemsCount = Array.isArray(o?.orderItems)
            ? o.orderItems.reduce((acc, it) => acc + (it?.quantity || 0), 0)
            : 0;
          const addressLine = o?.deliveryAddress
            ? `${o.deliveryAddress.street || ""}, ${
                o.deliveryAddress.city || ""
              }`.trim()
            : "-";
          return (
            <div key={o.orderId} className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="font-medium">
                    #{o.orderId} • ₹{Number(o.totalAmount || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Items {itemsCount} • To {addressLine}
                  </div>
                  <div className="text-xs text-gray-500">
                    Restaurant #{o.restaurantId} • Customer #{o.userId}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      statusColors[o.orderStatus] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {o.orderStatus}
                  </span>
                  {o.orderStatus === "ASSIGNED" && (
                    <button
                      onClick={() => handleOutForDelivery(o.orderId)}
                      disabled={updatingId === o.orderId}
                      className="text-sm px-3 py-1 rounded bg-indigo-600 text-white"
                    >
                      {updatingId === o.orderId ? "Updating..." : "Out for delivery"}
                    </button>
                  )}
                  {o.orderStatus === "OUT_FOR_DELIVERY" && (
                    <button
                      onClick={() => handleMarkDelivered(o.orderId)}
                      disabled={updatingId === o.orderId}
                      className="text-sm px-3 py-1 rounded bg-green-600 text-white"
                    >
                      {updatingId === o.orderId ? "Updating..." : "Mark Delivered"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!filteredOrders.length && !loading && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No orders in this category
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedOrders;