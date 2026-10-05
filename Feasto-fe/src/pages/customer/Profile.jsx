import { useEffect, useState } from "react";
import axios from "axios";

const CustomerProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const getUserId = () => {
    try {
      const raw = localStorage.getItem("customerProfile");
      if (!raw) return null;
      const p = JSON.parse(raw);
      return p.userId ?? p.id ?? null;
    } catch {
      return null;
    }
  };

  const populateForm = (data) => {
    setFormValues({
      name: data.name || "",
      phoneNumber: data.phoneNumber || "",
      street: data.address?.street || "",
      city: data.address?.city || "",
      state: data.address?.state || "",
      postalCode: data.address?.postalCode || "",
      country: data.address?.country || "",
    });
  };

  const fetchProfile = async () => {
    const uid = getUserId();
    if (!uid) {
      setError("No user id found. Please log in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:8080/api/users/${uid}`);
      setUser(res.data);
      populateForm(res.data);
    } catch {
      setError("Failed to load your profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const uid = getUserId();
    if (!uid) {
      alert("User id missing");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formValues.name,
        phoneNumber: formValues.phoneNumber,
        address: {
          street: formValues.street,
          city: formValues.city,
          state: formValues.state,
          postalCode: formValues.postalCode,
          country: formValues.country,
        },
      };
      const res = await axios.put(
        `http://localhost:8080/api/users/${uid}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      setUser(res.data);
      populateForm(res.data);

      // Keep localStorage in sync so other pages (e.g. checkout) see the update
      try {
        const raw = localStorage.getItem("customerProfile");
        if (raw) {
          const existing = JSON.parse(raw);
          localStorage.setItem(
            "customerProfile",
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

  if (!user) {
    return <div className="p-6">Profile not found</div>;
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <div className="text-sm text-gray-500">Email: {user.email}</div>
            <div className="text-sm text-gray-500">
              Member since:{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Full Name</label>
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

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h2 className="font-semibold mb-2">Delivery Address</h2>
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
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button onClick={fetchProfile} className="px-3 py-2 border rounded">
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

export default CustomerProfile;