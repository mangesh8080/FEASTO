import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const FONT_DISPLAY = { fontFamily: "'Fraunces', Georgia, serif" };
const FONT_BODY = { fontFamily: "'Inter', system-ui, sans-serif" };

const CustomerRestaurantDetail = () => {
  const { id } = useParams();

  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restaurant, setRestaurant] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("name_asc");

  const [cart, setCart] = useState({});
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const [address, setAddress] = useState({
    street: "123 MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    latitude: 19.076,
    longitude: 72.8777,
  });

  useEffect(() => {
    const fetchMenu = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:8080/api/restaurants/${id}/menu`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        setMenu(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8080/api/restaurants/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setRestaurant(data))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("customerProfile");
      if (raw) {
        const profile = JSON.parse(raw);
        if (profile?.userId) setUserId(profile.userId);
        if (profile?.address) setAddress((prev) => ({ ...prev, ...profile.address }));
      }
    } catch {
      // ignore localStorage parse errors
    }
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    menu.forEach((m) => m?.category && set.add(m.category));
    return Array.from(set).sort();
  }, [menu]);

  const filtered = useMemo(() => {
    let list = [...menu];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (m) =>
          (m.name || "").toLowerCase().includes(s) ||
          (m.description || "").toLowerCase().includes(s) ||
          (m.category || "").toLowerCase().includes(s),
      );
    }
    if (category) list = list.filter((m) => m.category === category);
    if (availability) {
      const want = availability === "available";
      list = list.filter((m) => !!m.isAvailable === want);
    }
    switch (sort) {
      case "price_asc":
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price_desc":
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "name_desc":
        list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      default:
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return list;
  }, [menu, search, category, availability, sort]);

  // Group the filtered list by category for the printed-menu layout
  const groupedByCategory = useMemo(() => {
    const groups = new Map();
    filtered.forEach((m) => {
      const key = m.category || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    });
    return Array.from(groups.entries());
  }, [filtered]);

  const cartArray = useMemo(() => Object.values(cart), [cart]);
  const subtotal = useMemo(
    () => cartArray.reduce((sum, ci) => sum + (ci.item.price || 0) * ci.quantity, 0),
    [cartArray],
  );
  const delivery = useMemo(() => (subtotal > 0 ? 30 : 0), [subtotal]);
  const discount = useMemo(() => 0, []);
  const total = useMemo(() => subtotal + delivery - discount, [subtotal, delivery, discount]);

  const inc = (item) => {
    setCart((prev) => {
      const existing = prev[item.menuItemId];
      const quantity = (existing?.quantity || 0) + 1;
      return { ...prev, [item.menuItemId]: { item, quantity } };
    });
  };
  const dec = (item) => {
    setCart((prev) => {
      const existing = prev[item.menuItemId];
      if (!existing) return prev;
      const quantity = existing.quantity - 1;
      if (quantity <= 0) {
        const { [item.menuItemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.menuItemId]: { item, quantity } };
    });
  };

  const clearCart = () => setCart({});

  const placeOrder = async () => {
    if (!cartArray.length) {
      window.alert("Add items to cart");
      return;
    }
    if (!userId) {
      window.alert("User not found. Please login as customer.");
      return;
    }
    const payload = {
      userId: Number(userId),
      restaurantId: Number(id),
      orderStatus: "PLACED",
      totalAmount: Number(total.toFixed(2)),
      deliveryAddress: address,
      orderTime: new Date().toISOString().slice(0, 19),
      orderItems: cartArray.map((ci) => ({
        menuItemId: ci.item.menuItemId,
        quantity: ci.quantity,
        price: ci.item.price,
      })),
    };
    try {
      const res = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Order failed ${res.status}`);
      const data = await res.json().catch(() => ({}));

      if (paymentMethod === "COD") {
        await fetch("http://localhost:8080/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.orderId,
            userId: Number(userId),
            amount: total,
            paymentMethod: "COD",
          }),
        });
        window.alert("Order placed! Pay cash on delivery.");
        setCart({});
        setShowOrderModal(false);
        return data;
      }

      const payRes = await fetch("http://localhost:8080/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderId, amount: total }),
      });
      if (!payRes.ok) throw new Error("Could not start payment");
      const payData = await payRes.json();

      const options = {
        key: payData.keyId,
        amount: Math.round(payData.amount * 100),
        currency: payData.currency,
        name: "Feasto",
        description: `Order #${data.orderId}`,
        order_id: payData.razorpayOrderId,
        handler: async function (response) {
          try {
            await fetch("http://localhost:8080/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                userId: Number(userId),
                amount: total,
                paymentMethod: "ONLINE",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            window.alert("Payment successful! Order placed.");
          } catch {
            window.alert("Order placed, but payment verification failed. Please contact support.");
          } finally {
            setCart({});
            setShowOrderModal(false);
          }
        },
        theme: { color: "#C8541F" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();

      return data;
    } catch (e) {
      window.alert(e.message || "Failed to place order");
    }
  };

  return (
    <div style={FONT_BODY} className="min-h-screen bg-white text-[#241A1F]">
      <div className="max-w-3xl mx-auto px-5 pb-32">
        {/* Hero */}
        <div className="pt-10 pb-6 flex items-start justify-between gap-4">
          <div>
            <h1 style={FONT_DISPLAY} className="text-4xl leading-tight">
              {restaurant?.name || "Menu"}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-[#6B5F63]">
              {typeof restaurant?.rating === "number" && (
                <span>{restaurant.rating.toFixed(1)} ★</span>
              )}
              {restaurant?.cuisineType && <span>{restaurant.cuisineType}</span>}
            </div>
          </div>
          <Link
            to="/"
            className="shrink-0 text-sm text-[#6B5F63] hover:text-[#241A1F] transition-colors"
          >
            Back
          </Link>
        </div>

        {/* Search + filters — plain text controls, not boxed dropdowns */}
        <div className="pb-6 border-b border-[#EDE6DE] space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the menu"
            className="w-full bg-[#F6F1EC] rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#C8541F]/40"
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <button
              onClick={() => setCategory("")}
              className={category === "" ? "text-[#C8541F] font-medium" : "text-[#6B5F63] hover:text-[#241A1F]"}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={category === c ? "text-[#C8541F] font-medium" : "text-[#6B5F63] hover:text-[#241A1F]"}
              >
                {c}
              </button>
            ))}
            <span className="ml-auto flex items-center gap-3">
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="bg-transparent text-[#6B5F63] text-sm outline-none"
              >
                <option value="">All items</option>
                <option value="available">Available</option>
                <option value="unavailable">Sold out</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-[#6B5F63] text-sm outline-none"
              >
                <option value="name_asc">A–Z</option>
                <option value="name_desc">Z–A</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
            </span>
          </div>
        </div>

        {loading && <div className="py-16 text-center text-[#6B5F63]">Loading menu…</div>}
        {error && <div className="py-8 text-center text-[#B14A3A]">{error}</div>}

        {/* Menu, grouped by category, printed-menu style */}
        {!loading && !error && (
          <div className="pt-6 space-y-8">
            {groupedByCategory.map(([cat, items]) => (
              <div key={cat}>
                <h2 style={FONT_DISPLAY} className="italic text-xl text-[#C8541F] mb-3">
                  {cat}
                </h2>
                <div className="space-y-5">
                  {items.map((m) => {
                    const inCartQty = cart[m.menuItemId]?.quantity || 0;
                    return (
                      <div key={m.menuItemId}>
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium">{m.name}</span>
                          <span className="flex-1 border-b border-dotted border-[#9B8F86]/50 mb-1" />
                          <span style={FONT_DISPLAY} className="text-[#241A1F]">
                            ₹{m.price}
                          </span>
                        </div>
                        <div className="mt-1 flex items-end justify-between gap-3">
                          <div className="max-w-[70%]">
                            {m.description && (
                              <p className="text-sm text-[#6B5F63] line-clamp-2">{m.description}</p>
                            )}
                            <span
                              className={`text-xs ${m.isAvailable ? "text-[#4B6B3D]" : "text-[#9B8F86]"}`}
                            >
                              {m.isAvailable ? "Available" : "Sold out"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {inCartQty > 0 && (
                              <>
                                <button
                                  onClick={() => dec(m)}
                                  className="w-7 h-7 rounded-full border border-[#9B8F86]/40 text-[#241A1F] hover:border-[#C8541F] transition-colors"
                                >
                                  –
                                </button>
                                <span className="w-5 text-center text-sm">{inCartQty}</span>
                              </>
                            )}
                            <button
                              onClick={() => inc(m)}
                              disabled={!m.isAvailable}
                              className={`w-7 h-7 rounded-full border transition-colors ${
                                m.isAvailable
                                  ? "border-[#9B8F86]/40 text-[#241A1F] hover:border-[#C8541F]"
                                  : "border-[#EDE6DE] text-[#EDE6DE] cursor-not-allowed"
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {!filtered.length && (
              <div className="py-16 text-center text-[#6B5F63]">No dishes match your filters</div>
            )}
          </div>
        )}
      </div>

      {/* Floating cart bar */}
      {cartArray.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#241A1F] text-white px-5 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{cartArray.length} item(s)</span>
              <span className="mx-2 opacity-50">·</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowOrderModal(true)}
              className="ml-auto px-5 py-2 rounded-full bg-[#C8541F] hover:bg-[#B04A1B] transition-colors text-sm font-medium"
            >
              Review order
            </button>
            <button onClick={clearCart} className="text-sm text-white/60 hover:text-white transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Order modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowOrderModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 style={FONT_DISPLAY} className="text-2xl">
                Your order
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-[#6B5F63] hover:text-[#241A1F]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {cartArray.map((ci) => (
                <div key={ci.item.menuItemId} className="flex items-baseline gap-2 text-sm">
                  <span>
                    {ci.quantity} × {ci.item.name}
                  </span>
                  <span className="flex-1 border-b border-dotted border-[#9B8F86]/50 mb-1" />
                  <span>₹{(ci.item.price * ci.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#EDE6DE] space-y-1.5 text-sm text-[#6B5F63]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{delivery.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-[#241A1F] pt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-medium mb-2">Delivery address</div>
              <div className="grid grid-cols-1 gap-2">
                <input
                  className="bg-[#F6F1EC] rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#C8541F]/40"
                  placeholder="Street"
                  value={address.street}
                  onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="bg-[#F6F1EC] rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#C8541F]/40"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                  />
                  <input
                    className="bg-[#F6F1EC] rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#C8541F]/40"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="bg-[#F6F1EC] rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#C8541F]/40"
                    placeholder="Postal code"
                    value={address.postalCode}
                    onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))}
                  />
                  <input
                    className="bg-[#F6F1EC] rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#C8541F]/40"
                    placeholder="Country"
                    value={address.country}
                    onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-medium mb-2">Payment</div>
              <label className="flex items-center gap-2 mb-1.5 text-sm">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                />
                Pay online (card / UPI)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                Cash on delivery
              </label>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={placeOrder}
                disabled={!cartArray.length}
                className={`px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors ${
                  cartArray.length ? "bg-[#C8541F] hover:bg-[#B04A1B]" : "bg-[#EDE6DE] cursor-not-allowed"
                }`}
              >
                Place order
              </button>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-sm text-[#6B5F63] hover:text-[#241A1F] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearCart}
                className="ml-auto text-sm text-[#6B5F63] hover:text-[#241A1F] transition-colors"
              >
                Clear cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRestaurantDetail;