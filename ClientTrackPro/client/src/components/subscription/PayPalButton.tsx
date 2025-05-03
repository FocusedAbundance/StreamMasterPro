"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface PayPalButtonProps {
  amount: number
  currency: string
  onSuccess: (details: any) => void
  onError: (error: any) => void
}

declare global {
  interface Window {
    paypal?: any
  }
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ amount, currency, onSuccess, onError }) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load the PayPal SDK script
    const script = document.createElement('script');
    script.src = `https://www
