import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentOption } from "@/types/database";
import { paymentOptionsService } from "@/services/database";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const PAYMENT_PROVIDERS = [
  { value: "payu", label: "PayU" },
  { value: "paypal", label: "PayPal" },
  { value: "paytm", label: "Paytm" },
];

export default function AdminPaymentOptions() {
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<PaymentOption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
  const [formData, setFormData] = useState({
    provider: "payu" as PaymentOption["provider"],
    merchant_key: "",
    merchant_salt: "",
    api_key: "",
    api_secret: "",
    webhook_secret: "",
    is_enabled: true,
  });

  useEffect(() => {
    loadPaymentOptions();
  }, []);

  const loadPaymentOptions = async () => {
    try {
      setIsLoading(true);
      const data = await paymentOptionsService.getAll();
      setPaymentOptions(data);
    } catch (error) {
      console.error("Error loading payment options:", error);
      toast.error("Failed to load payment options");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (option?: PaymentOption) => {
    if (option) {
      setEditingOption(option);
      setFormData({
        provider: option.provider,
        merchant_key: option.merchant_key,
        merchant_salt: option.merchant_salt || "",
        api_key: option.api_key || "",
        api_secret: option.api_secret || "",
        webhook_secret: option.webhook_secret || "",
        is_enabled: option.is_enabled,
      });
    } else {
      setEditingOption(null);
      setFormData({
        provider: "payu",
        merchant_key: "",
        merchant_salt: "",
        api_key: "",
        api_secret: "",
        webhook_secret: "",
        is_enabled: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingOption(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.merchant_key) {
        toast.error("Merchant Key is required");
        return;
      }

      if (editingOption) {
        await paymentOptionsService.update(editingOption.id, formData);
        toast.success("Payment option updated successfully");
      } else {
        await paymentOptionsService.create({
          provider: formData.provider,
          merchant_key: formData.merchant_key,
          merchant_salt: formData.merchant_salt || null,
          api_key: formData.api_key || null,
          api_secret: formData.api_secret || null,
          webhook_secret: formData.webhook_secret || null,
          is_enabled: formData.is_enabled,
          additional_config: null,
        });
        toast.success("Payment option created successfully");
      }
      loadPaymentOptions();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Error saving payment option:", error);
      if (error.message?.includes("duplicate")) {
        toast.error("This payment provider is already configured");
      } else {
        toast.error("Failed to save payment option");
      }
    }
  };

  const handleDelete = async (optionId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this payment option? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await paymentOptionsService.delete(optionId);
      toast.success("Payment option deleted successfully");
      loadPaymentOptions();
    } catch (error) {
      console.error("Error deleting payment option:", error);
      toast.error("Failed to delete payment option");
    }
  };

  const handleToggleEnabled = async (option: PaymentOption) => {
    try {
      await paymentOptionsService.update(option.id, {
        is_enabled: !option.is_enabled,
      });
      toast.success(
        `Payment option ${!option.is_enabled ? "enabled" : "disabled"}`
      );
      loadPaymentOptions();
    } catch (error) {
      console.error("Error updating payment option:", error);
      toast.error("Failed to update payment option");
    }
  };

  const getProviderLabel = (provider: string) => {
    return PAYMENT_PROVIDERS.find((p) => p.value === provider)?.label || provider;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
            <p className="text-gray-600">Loading payment options...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Options</h1>
            <p className="text-gray-600 mt-1">
              Manage payment methods and merchant credentials
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Option
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingOption
                    ? "Edit Payment Option"
                    : "Add New Payment Option"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider *</label>
                  <select
                    value={formData.provider}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        provider: e.target.value as PaymentOption["provider"],
                      })
                    }
                    disabled={!!editingOption}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    {PAYMENT_PROVIDERS.map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Merchant Key *</label>
                  <Input
                    value={formData.merchant_key}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        merchant_key: e.target.value,
                      })
                    }
                    placeholder="Enter merchant key"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Merchant Salt</label>
                  <Input
                    value={formData.merchant_salt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        merchant_salt: e.target.value,
                      })
                    }
                    placeholder="Enter merchant salt (if required)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <Input
                    value={formData.api_key}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        api_key: e.target.value,
                      })
                    }
                    placeholder="Enter API key"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">API Secret</label>
                  <Input
                    value={formData.api_secret}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        api_secret: e.target.value,
                      })
                    }
                    placeholder="Enter API secret"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Webhook Secret</label>
                  <Input
                    value={formData.webhook_secret}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        webhook_secret: e.target.value,
                      })
                    }
                    placeholder="Enter webhook secret"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_enabled"
                    checked={formData.is_enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_enabled: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label htmlFor="is_enabled" className="text-sm font-medium">
                    Enable this payment option
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingOption ? "Update" : "Create"} Payment Option
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Payment Options Grid */}
        <div className="grid gap-4">
          {paymentOptions.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-gray-600 mb-4">
                  No payment options configured yet
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  Add Your First Payment Option
                </Button>
              </CardContent>
            </Card>
          ) : (
            paymentOptions.map((option) => (
              <Card key={option.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">
                          {getProviderLabel(option.provider)}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            option.is_enabled
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {option.is_enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Merchant Key</p>
                          <p className="font-mono text-gray-700">
                            {option.merchant_key.substring(0, 10)}...
                          </p>
                        </div>
                        {option.merchant_salt && (
                          <div>
                            <p className="text-gray-500">Merchant Salt</p>
                            <p className="font-mono text-gray-700">
                              {option.merchant_salt.substring(0, 10)}...
                            </p>
                          </div>
                        )}
                        {option.api_key && (
                          <div>
                            <p className="text-gray-500">API Key</p>
                            <p className="font-mono text-gray-700">
                              {option.api_key.substring(0, 10)}...
                            </p>
                          </div>
                        )}
                        {option.api_secret && (
                          <div>
                            <p className="text-gray-500">API Secret</p>
                            <p className="font-mono text-gray-700">
                              {option.api_secret.substring(0, 10)}...
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        Updated{" "}
                        {new Date(option.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleEnabled(option)}
                        title={
                          option.is_enabled ? "Disable" : "Enable"
                        }
                      >
                        {option.is_enabled ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(option)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(option.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
