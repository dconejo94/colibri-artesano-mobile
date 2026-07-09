import React, { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet, Modal, Pressable, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, spacing } from '@/src/theme';
import SubHeader from '@/components/ui/SubHeader';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import ErrorModal from '@/components/ui/ErrorModal';

import CheckoutSection from '@/components/checkout/CheckoutSection';
import CartSummaryCard from '@/components/checkout/CartSummaryCard';
import DeliveryDetailsCard from '@/components/checkout/DeliveryDetailsCard';
import FareBreakdownCard from '@/components/checkout/FareBreakDownCard';

import AddressForm from '@/components/checkout/AddressForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import { useCheckoutStore } from '@/src/checkout/checkoutStore';
import { createOrder, createPaymentIntent } from '@/api/payments';
import { useCart } from '@/src/hooks/useCart';
type Status = 'idle' | 'processing' | 'error';
const PLACEHOLDER_CURRENCY = 'crc';

export default function CheckoutScreen() {
  const { colors, text, radii } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, isLoading, error, refetch } = useCart();
  const { confirmPayment } = useStripe();
  const {
    address,
    paymentMethod,
    clearCheckout,
  } = useCheckoutStore();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const subtotal = typeof cart?.total_amount === 'number' ? cart.total_amount : parseFloat(cart?.total_amount ?? '0');
  const shippingFee = 0;
  const total = subtotal + shippingFee;
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const showError = (message: string) => {
    setStatus('error');
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleCheckout = useCallback(async () => {
    setStatus('idle');
    setErrorMessage(null);

    if (!address) {
      showError('Debes agregar una dirección de entrega.');
      return;
    }

    if (!paymentMethod) {
      showError('Debes completar los datos de tu tarjeta.');
      return;
    }
    const net = await NetInfo.fetch();

    if (!net.isConnected) {
      showError('No hay conexión a internet. Revisa tu red e intenta de nuevo.');
      return;
    }

    setStatus('processing');

    try {
      const { clientSecret } =
        await createPaymentIntent();

      const { error, paymentIntent } =
        await confirmPayment(
          clientSecret,
          {
            paymentMethodType: 'Card',
          }
        );

      if (error) {
        showError(
          mapStripeError(
            error.code,
            error.message
          )
        );
        return;
      }

      if (paymentIntent?.status !== 'Succeeded') {
        showError('El pago no pudo completarse.');
        return;
      }

      // The payment already succeeded at this point — a failure here must
      // not be reported as a generic payment error, since the card has
      // already been charged and the user needs to know that.
      try {
        const order = await createOrder({
          shipping_address: {
            recipient: address.recipient,
            phone: address.phone,
            address_line: address.addressLine,
            city: address.city,
            province: address.province,
            postal_code: address.postalCode,
          },
        });
        clearCheckout();
        router.replace({
          pathname: '/checkout/order-confirmation',
          params: {
            orderId: order.id,
            total: order.total_amount,
            date: order.created_at,
          },
        });
      } catch (orderErr: any) {
        showError(
          `Tu pago fue procesado (ref. ${paymentIntent.id}), pero no pudimos registrar el pedido. Contacta a soporte con esta referencia.`
        );
      }

    } catch(err:any){

      showError(
        err?.message ??
        'Ocurrió un error inesperado.'
      );
    }

  },[
    address,
    paymentMethod,
    confirmPayment,
    router,
    clearCheckout,
  ]);

  if(isLoading){
    return (
      <LoadingState message="Cargando tu carrito…" />
    );
  }

  if(error || !cart){

    return (
      <ErrorState
        message="No pudimos cargar tu carrito."
        onRetry={refetch}
      />
    );

  }

  return (
    <>
    <SafeAreaView
      edges={['top']}
      style={[
        styles.screen,
        {
          backgroundColor:colors.bgPage,
        },
      ]}
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
          padding:spacing[4],
          gap:spacing[6],
          paddingBottom:spacing[10],
        }}
        keyboardShouldPersistTaps="handled"
      >
      
        <CheckoutSection title="Resumen de la orden">
          <View style={{gap:spacing[3]}}>
            {
              cart.stores.map(store => (
                <CartSummaryCard
                  key={store.id}
                  store={store}
                  currency={PLACEHOLDER_CURRENCY}
                />
              ))
            }
          </View>
        </CheckoutSection>

        <CheckoutSection title="Detalles de entrega">
          {
            address ? (
              <DeliveryDetailsCard
                address={{
                  label: address.recipient,
                  detail: `${address.addressLine}, ${address.city}, ${address.province}${address.postalCode ? ` (${address.postalCode})` : ''} — ${address.phone}`,
                  estimatedDelivery: 'Se calcula al confirmar la compra',
                }}
                onEdit={() => setIsAddressModalOpen(true)}
              />
            ) : (
              <Pressable
                onPress={() => setIsAddressModalOpen(true)}
                style={[
                  local.addAddressBtn,
                  { borderColor: colors.border, borderRadius: radii.md },
                ]}
              >
                <MaterialIcons name="add-location-alt" size={20} color={colors.primary} />
                <Text style={[text.label, { color: colors.primary }]}>
                  Agregar dirección de entrega
                </Text>
              </Pressable>
            )
          }
        </CheckoutSection>

        <CheckoutSection title="Método de pago">
          <PaymentForm />
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

      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor:colors.border,
            backgroundColor:colors.bgPage,
            paddingBottom: Math.max(insets.bottom, spacing[4]),
          },
        ]}
      >
        <Button
          title="Finalizar y Comprar"
          onPress={handleCheckout}
          loading={
            status === 'processing'
          }
          disabled={
            status === 'processing'
          }
        />
      </View>

    </SafeAreaView>

    <Modal
      visible={isAddressModalOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsAddressModalOpen(false)}
    >
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPage }}>
        <View
          style={[
            local.modalHeader,
            { borderBottomColor: colors.border },
          ]}
        >
          <Text style={[text.h3, { color: colors.textPrimary }]}>
            Dirección de entrega
          </Text>
          <MaterialIcons
            name="close"
            size={22}
            color={colors.textPrimary}
            onPress={() => setIsAddressModalOpen(false)}
          />
        </View>
        <ScrollView
          contentContainerStyle={{ padding: spacing[4] }}
          keyboardShouldPersistTaps="handled"
        >
          {isAddressModalOpen && (
            <AddressForm
              initialValue={address}
              onSaved={() => setIsAddressModalOpen(false)}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
    <ErrorModal
      visible={isErrorModalOpen}
      message={errorMessage ?? ''}
      onClose={() => setIsErrorModalOpen(false)}
    />
    </>
  );
}

function mapStripeError(
  code?:string,
  message?:string
){
  switch(code){
    case 'Canceled':
      return 'Pago cancelado.';
    case 'Failed':
      return message ??
        'El pago fue rechazado.';
    default:
      return message ??
        'No se pudo procesar el pago.';
  }
}

const styles = StyleSheet.create({
  screen:{
    flex:1,
  },
  footer:{
    borderTopWidth:
      StyleSheet.hairlineWidth,

    padding:spacing[4],
  },
});

const local = StyleSheet.create({
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
