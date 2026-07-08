import React, { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import NetInfo from '@react-native-community/netinfo';

import { useTheme, spacing } from '@/src/theme';
import SubHeader from '@/components/ui/SubHeader';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

import CheckoutSection from '@/components/checkout/CheckoutSection';
import CartSummaryCard from '@/components/checkout/CartSummaryCard';
import DeliveryDetailsCard, {
  Address,
} from '@/components/checkout/DeliveryDetailsCard';
import PaymentMethodCard, {
  SavedPaymentMethod,
} from '@/components/checkout/PaymentMethodCard';
import FareBreakdownCard from '@/components/checkout/FareBreakDownCard';

import { createOrder, createPaymentIntent } from '@/api/payments';
import { useCart } from '@/src/hooks/useCart';

type Status = 'idle' | 'processing' | 'error';

const PLACEHOLDER_CURRENCY = 'crc';

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const { cart, isLoading, isError, refetch } = useCart();
  const { confirmPayment } = useStripe();

  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [address] = useState<Address | null>(null);
  const [paymentMethod] = useState<SavedPaymentMethod | null>(null);

  const subtotal = parseFloat(cart?.total_amount ?? '0');
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleEditAddress = useCallback(() => {
    router.push('/select-address');
  }, [router]);

  const handleEditPaymentMethod = useCallback(() => {
    router.push('/select-payment-method');
  }, [router]);

  const handleCheckout = useCallback(async () => {
    setErrorMessage(null);

    const net = await NetInfo.fetch();

    if (!net.isConnected) {
      setStatus('error');
      setErrorMessage(
        'No hay conexión a internet. Revisa tu red e intenta de nuevo.'
      );
      return;
    }

    setStatus('processing');

    try {
      const { clientSecret } = await createPaymentIntent();

      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        setStatus('error');
        setErrorMessage(mapStripeError(error.code, error.message));
        return;
      }

      if (paymentIntent?.status !== 'Succeeded') {
        setStatus('error');
        setErrorMessage('El pago no pudo completarse. Intenta de nuevo.');
        return;
      }

      const order = await createOrder();

      router.replace({
        pathname: '/order-confirmation',
        params: { orderId: order.id },
      });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.'
      );
    }
  }, [confirmPayment, router]);

  if (isLoading) {
    return <LoadingState message="Cargando tu carrito…" />;
  }

  if (isError || !cart) {
    return (
      <ErrorState
        message="No pudimos cargar tu carrito. Intenta de nuevo."
        onRetry={refetch}
      />
    );
  }

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.bgPage }]}
    >
      <SubHeader
        title="Caja"
        onBack={() => router.back()}
        rightSlot={
          <MaterialIcons
            name="block"
            size={22}
            color={colors.textPrimary}
            onPress={handleCancel}
          />
        }
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing[4],
          gap: spacing[6],
          paddingBottom: spacing[10],
        }}
        keyboardShouldPersistTaps="handled"
      >
        <CheckoutSection title="Resumen de la orden">
          <View style={{ gap: spacing[3] }}>
            {cart.stores.map((store) => (
              <CartSummaryCard
                key={store.id}
                store={store}
              />
            ))}
          </View>
        </CheckoutSection>

        <CheckoutSection title="Detalles de entrega">
          {address ? (
            <DeliveryDetailsCard
              address={address}
              onEdit={handleEditAddress}
            />
          ) : (
            <Button
              title="Seleccionar dirección"
              variant="secondary"
              onPress={handleEditAddress}
            />
          )}
        </CheckoutSection>

        <CheckoutSection title="Método de pago">
          {paymentMethod ? (
            <PaymentMethodCard
              paymentMethod={paymentMethod}
              onEdit={handleEditPaymentMethod}
            />
          ) : (
            <Button
              title="Seleccionar método de pago"
              variant="secondary"
              onPress={handleEditPaymentMethod}
            />
          )}
        </CheckoutSection>

        <CheckoutSection title="Desglose de tarifas">
          <FareBreakdownCard
            subtotal={subtotal}
            shippingFee={shippingFee}
            shippingCarrier=""
            total={total}
            currency={PLACEHOLDER_CURRENCY}
          />
        </CheckoutSection>

        <CardField
          postalCodeEnabled
          placeholders={{ number: '4242 4242 4242 4242' }}
          style={styles.cardField}
        />

        {status === 'error' && errorMessage ? (
          <ErrorState
            message={errorMessage}
            onRetry={handleCheckout}
          />
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.bgPage,
          },
        ]}
      >
        <Button
          title="Finalizar y Comprar"
          onPress={handleCheckout}
          loading={status === 'processing'}
          disabled={status === 'processing'}
        />
      </View>
    </View>
  );
}

function mapStripeError(code?: string, message?: string): string {
  switch (code) {
    case 'Canceled':
      return 'Pago cancelado.';
    case 'Failed':
      return message ?? 'El pago fue rechazado. Verifica los datos de tu tarjeta.';
    default:
      return message ?? 'No se pudo procesar el pago. Intenta de nuevo.';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing[4],
  },
});