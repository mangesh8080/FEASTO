import { useEffect, useState } from "react";
import axios from "axios";

const DeliveryProfile = () => {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    phoneNumber: "",
    vehicleDetails: "",
  });

  const getPartnerId = () => {
    try {
      const raw = localStorage.getItem("deliveryProfile");
      if (!raw) return null;
      const p = JSON.parse(raw);
      return p.id ?? p.partnerId ?? p.deliveryPartnerId ?? null;
    } catch {
      return null;
    }
  };

  const populateForm = (data) => {
    setFormValues({
      name: data.name || "",
      phoneNumber: data.phoneNumber || "",
      vehicleDetails: data.vehicleDetails || "",
    });
  };

  const fetchProfile = async () => {
    const pid = getPartnerId();
    if (!pid) {
      setError("No delivery partner id found. Please log in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `http://localhost:8080/api/delivery-partners/${pid}`
      );
      setPartner(res.data);
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
    const pid = getPartnerId();
    if (!pid) {
      alert("Delivery partner id missing");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formValues.name,
        phoneNumber: formValues.phoneNumber,
        vehicleDetails: formValues.vehicleDetails,
      };
      const res = await axios.put(
        `http://localhost:8080/api/delivery-partners/${pid}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      setPartner(res.data);
      populateForm(res.data);

      try {
        const raw = localStorage.getItem("deliveryProfile");
        if (raw) {
          const existing = JSON.parse(raw);
          localStorage.setItem(
            "deliveryProfile",
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

  if (!partner) {
    return <div className="p-6">Profile not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>

      <div className="bg-white rounded-lg border p-6">
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded border">
            <div className="text-xs text-gray-500">Email</div>
            <div className="text-sm font-medium">{partner.email}</div>
          </div>
          <div className="p-3 rounded border">
            <div className="text-xs text-gray-500">Rating</div>
            <div className="text-sm font-medium">
              {partner.averageRating ?? "N/A"}
            </div>
          </div>
          <div className="p-3 rounded border">
            <div className="text-xs text-gray-500">Status</div>
            <div className="text-sm font-medium">
              {partner.available ? "Available" : "Unavailable"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
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
          <div>
            <label className="block text-sm mb-1">Vehicle Details</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={formValues.vehicleDetails}
              onChange={(e) =>
                setFormValues((v) => ({
                  ...v,
                  vehicleDetails: e.target.value,
                }))
              }
              placeholder="e.g. Bike - MH12AB1234"
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
  );
};

export default DeliveryProfile;