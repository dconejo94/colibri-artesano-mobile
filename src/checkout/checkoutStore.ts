import { create } from 'zustand';

export type Address = {
  recipient: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
};

export type PaymentMethod = {
  type: 'card';
  brand?: string;
  last4?: string;
};

interface CheckoutState {
  address: Address | null;
  paymentMethod: PaymentMethod | null;

  setAddress: (address: Address) => void;
  setPaymentMethod: (payment: PaymentMethod) => void;

  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  address: null,
  paymentMethod: null,

  setAddress: (address) =>
    set({ address }),

  setPaymentMethod: (payment) =>
    set({ paymentMethod: payment }),

  clearCheckout: () =>
    set({
      address: null,
      paymentMethod: null,
    }),
}));