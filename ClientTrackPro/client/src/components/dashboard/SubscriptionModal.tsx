"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { loadScript } from "@paypal/paypal-js"

interface SubscriptionModalProps {
  open: boolean
  onClose: () => void
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ open, onClose }) => {
  const [paypalLoaded, setPaypalLoaded] = React.useState(false)

  React.useEffect(() => {
    loadScript({
      "client-id": "AYJz-bsyMtMaRUYzMEVSc_5XFkge3tIHS6yoe3rAlNvH8PCQfp5I8ihBZ5kR2460_izvZSvMHcff1aHe",
      currency: "USD",
    }).then((paypal) => {
      if (paypal) {
        paypal
          .Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: "100.00",
                      breakdown: {
                        item_total: {
                          currency_code: "USD",
                          value: "100.00",
                        },
                      },
                    },
                    payee: {
                      email: "cognizansthenextlevel@gmail.com",
                      business_name: "Cognizans - The Next Level",
                    },
                  },
                ],
              })
            },
            onApprove: async (data, actions) => {
              const order = await actions.order.capture()
              // Send order details to backend
              await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id }),
              })
              onClose()
            },
          })
          .render("#paypal-button-container")
        setPaypalLoaded(true)
      }
    })
  }, [])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Premium</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Premium Features</h3>
            <ul className="mt-2 space-y-2">
              <li>✓ Stream to multiple platforms</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Custom alerts and overlays</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => {}} className="w-40">
              $10/month
            </Button>
            <Button onClick={() => {}} className="w-40">
              $100/year
            </Button>
          </div>
          <div id="paypal-button-container" className="mt-4" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
