import { useEffect, useState } from "react";
import axios from "axios";

const RestaurantProfile = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    phoneNumber: "",
    cuisineType: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);

  const getRestaurantId = () => {
    try {
      const raw = localStorage.getItem("restaurantProfile");
      if (!raw) return null;
      const p = JSON.parse(raw);
      return p.id ?? p.restaurantId ?? null;
    } catch {
      return null;
    }
  };

  const populateForm = (data) => {
    setFormValues({
      name: data.name || "",
      description: data.description || "",
      phoneNumber: data.phoneNumber || "",
      cuisineType: data.cuisineType || "",
      street: data.address?.street || "",
      city: data.address?.city || "",
      state: data.address?.state || "",
      postalCode: data.address?.postalCode || "",
      country: data.address?.country || "",
    });
    setImageUrl(data.imageUrl || "");
  };

  const fetchProfile = async () => {
    const rid = getRestaurantId();
    if (!rid) {
      setError("No restaurant id found in localStorage");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `http://localhost:8080/api/restaurants/${rid}`
      );
      setRestaurant(res.data);
      populateForm(res.data);
    } catch {
      setError("Failed to load restaurant profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const handleSave = async () => {
    const rid = getRestaurantId();
    if (!rid) {
      alert("Restaurant id missing");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formValues.name,
        description: formValues.description,
        phoneNumber: formValues.phoneNumber,
        cuisineType: formValues.cuisineType,
        address: {
          street: formValues.street,
          city: formValues.city,
          state: formValues.state,
          postalCode: formValues.postalCode,
          country: formValues.country,
        },
      };
      // Only send imageUrl if user pasted one and did not pick a file
      if (!file && imageUrl.trim()) {
        payload.imageUrl = imageUrl.trim();
      }

      const fd = new FormData();
      fd.append(
        "restaurant",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
      if (file) {
        fd.append("image", file);
      }

      const url = `http://localhost:8080/api/restaurants/${rid}`;
      const res = await axios.put(url, fd);

      setRestaurant(res.data);
      populateForm(res.data);
      setFile(null);

      // Keep localStorage in sync so the top nav / layout show updated info
      try {
        const raw = localStorage.getItem("restaurantProfile");
        if (raw) {
          const existing = JSON.parse(raw);
          localStorage.setItem(
            "restaurantProfile",
            JSON.stringify({ ...existing, ...res.data })
          );
        }
      } catch {
        // ignore
      }

      alert("Profile updated");
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!restaurant) {
    return <div className="p-6">Restaurant not found</div>;
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Restaurant Profile</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={
                imageUrl ||
                "https://via.placeholder.com/96?text=No+Image"
              }
              alt={restaurant.name}
              className="w-24 h-24 rounded-full object-cover border"
            />
            <div>
              <div className="text-sm text-gray-500">
                Rating: {restaurant.rating ?? "N/A"}
              </div>
              <div className="text-sm text-gray-500">
                Status: {restaurant.isActive ? "Active" : "Inactive"}
              </div>
              <div className="text-sm text-gray-500">
                Email: {restaurant.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Restaurant Name</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={formValues.name}
                onChange={(e) =>
                  setFormValues((v) => ({ ...v, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone Number</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={formValues.phoneNumber}
                onChange={(e) =>
                  setFormValues((v) => ({ ...v, phoneNumber: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                className="border rounded px-3 py-2 w-full"
                value={formValues.description}
                onChange={(e) =>
                  setFormValues((v) => ({ ...v, description: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Cuisine Type</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={formValues.cuisineType}
                onChange={(e) =>
                  setFormValues((v) => ({ ...v, cuisineType: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h2 className="font-semibold mb-2">Address</h2>
            </div>
            <div>
              <label className="block text-sm mb-1">Street</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={formValues.street}
                onChange={(e) =>
                  setFormValues((v) => ({ ...v, street: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">City</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={formValues.city}
                onChange={(e) =>
                  setFormValues((v) => ({ ...v, city: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">State</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={formValues.state}
                onChange={(e) =>
                  setFormValues((v) => ({ ...v, state: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Postal Code</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={formValues.postalCode}
                onChange={(e) =>
                  setFormValues((v) => ({ ...v, postalCode: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Country</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={formValues.country}
                onChange={(e) =>
                  setFormValues((v) => ({ ...v, country: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h2 className="font-semibold mb-2">Photo</h2>
            </div>
            <div>
              <label className="block text-sm mb-1">Upload New Photo</label>
              <input type="file" accept="image/*" onChange={onFileChange} />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Or paste an image URL (used only if no file selected)
              </label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/restaurant-photo.jpg"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={fetchProfile}
              className="px-3 py-2 border rounded"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-2 bg-blue-600 text-white rounded"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;