// app/rewards/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Percent, Stethoscope, Calendar, Copy, Check } from "lucide-react";

// Define the fixed rewards
const FIXED_REWARDS = [
  {
    id: 1,
    title: "$10 Gift Card",
    description: "Redeem this gift card for any purchase on our platform",
    icon: Gift,
    type: "gift_card",
    value: "$10.00",
    status: "active", // active, used, expired
    expiryDate: "2025-12-31",
    code: "GIFT10-ABC123",
    instructions: "Use this code at checkout to apply your $10 discount."
  },
  {
    id: 2,
    title: "10% Discount",
    description: "Get 10% off your next purchase",
    icon: Percent,
    type: "discount",
    value: "10%",
    status: "active",
    expiryDate: "2025-08-31",
    code: "SAVE10-XYZ789",
    instructions: "Apply this code during checkout to save 10% on your order."
  },
  {
    id: 3,
    title: "Free Online Doctor Consultation",
    description: "Schedule a complimentary consultation with our healthcare professionals",
    icon: Stethoscope,
    type: "consultation",
    value: "Free",
    status: "active",
    expiryDate: "2025-09-30",
    code: "CONSULT-DEF456",
    instructions: "Use this code when booking your appointment to receive a free consultation."
  }
];

export default function RewardsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "used":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRewardIcon = (IconComponent: any, type: string) => {
    const iconColors = {
      gift_card: "text-purple-600",
      discount: "text-blue-600",
      consultation: "text-green-600"
    };
    
    return <IconComponent className={`h-8 w-8 ${iconColors[type as keyof typeof iconColors]}`} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">My Rewards</h1>
          <p className="text-gray-600">Your earned rewards from spinning the wheel</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Total Rewards</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600">Active Rewards</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">$10+</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FIXED_REWARDS.map((reward) => (
            <Card key={reward.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  {getRewardIcon(reward.icon, reward.type)}
                  <Badge className={getStatusColor(reward.status)}>
                    {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{reward.title}</CardTitle>
                <CardDescription>{reward.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Value */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{reward.value}</div>
                  <div className="text-sm text-gray-500">Reward Value</div>
                </div>

                {/* Code */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Reward Code</div>
                      <div className="font-mono text-sm font-medium">{reward.code}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(reward.code)}
                      className="ml-2"
                    >
                      {copiedCode === reward.code ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  {reward.instructions}
                </div>

                {/* Expiry Date */}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Expires: {new Date(reward.expiryDate).toLocaleDateString()}
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  variant={reward.status === "active" ? "default" : "secondary"}
                  disabled={reward.status !== "active"}
                >
                  {reward.type === "consultation" ? "Book Appointment" : "Use Reward"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">How to Use Your Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <Gift className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Gift Cards</h4>
                <p className="text-sm text-gray-600">Copy the code and paste it at checkout to apply your discount.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Percent className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Discount Codes</h4>
                <p className="text-sm text-gray-600">Enter the discount code during purchase to save on your order.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Stethoscope className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Consultations</h4>
                <p className="text-sm text-gray-600">Use the code when booking to schedule your free consultation.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No rewards message (if needed) */}
        {FIXED_REWARDS.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards yet</h3>
              <p className="text-gray-600 mb-4">Start spinning the wheel to earn amazing rewards!</p>
              <Button>Go to Spin Wheel</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}