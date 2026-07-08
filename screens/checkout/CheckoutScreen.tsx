import React, { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, spacing } from '@/src/theme';
import SubHeader from '@/components/ui/SubHeader';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

import CheckoutSection from '@/components/checkout/CheckoutSection';
import CartSummaryCard from '@/components/checkout/CartSummaryCard';
import DeliveryDetailsCard from '@/components/checkout/DeliveryDetailsCard';
import PaymentMethodCard from '@/components/checkout/PaymentMethodCard';
import FareBreakdownCard from '@/components/checkout/FareBreakDownCard';

import AddressForm from '@/components/checkout/AddressForm';
import PaymentForm from '@/components/checkout/PaymentForm';

import { useCheckoutStore } from '@/src/checkout/checkoutStore';
import { createOrder, createPaymentIntent } from '@/api/payments';
import { useCart } from '@/src/hooks/useCart';
type Status = 'idle' | 'processing' | 'error';
const PLACEHOLDER_CURRENCY = 'crc';

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { cart, isLoading, isError, refetch } = useCart();
  const { confirmPayment } = useStripe();
  const {
    address,
    paymentMethod,
    clearCheckout,
  } = useCheckoutStore();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const subtotal = parseFloat(cart?.total_amount ?? '0');
  const shippingFee = 0;
  const total = subtotal + shippingFee;
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleCheckout = useCallback(async () => {
    setErrorMessage(null);

    if (!address) {
      setErrorMessage(
        'Debes agregar una dirección de entrega.'
      );
      return;
    }

    if (!paymentMethod) {
      setErrorMessage(
        'Debes agregar un método de pago.'
      );
      return;
    }

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
      const { clientSecret } =
        await createPaymentIntent();

      const { error, paymentIntent } =
        await confirmPayment(
          clientSecret,
          {
            paymentMethodType: 'Card',
          }
        );

      if(error){
        setStatus('error');
        setErrorMessage(
          mapStripeError(
            error.code,
            error.message
          )
        );
        return;
      }

      if(paymentIntent?.status !== 'Succeeded'){
        setStatus('error');
        setErrorMessage(
          'El pago no pudo completarse.'
        );
        return;
      }

      const order = await createOrder();
      clearCheckout();
      router.replace({
        pathname:'/order-confirmation',
        params:{
          orderId:order.id,
        },
      });

    } catch(err:any){

      setStatus('error');

      setErrorMessage(
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

  if(isError || !cart){

    return (
      <ErrorState
        message="No pudimos cargar tu carrito."
        onRetry={refetch}
      />
    );

  }

  return (

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
                />
              ))
            }
          </View>
        </CheckoutSection>

        <CheckoutSection title="Detalles de entrega">
          {
            address ? (
              <DeliveryDetailsCard
                address={address}
              />):(<AddressForm />)
          }
        </CheckoutSection>

        <CheckoutSection title="Método de pago">
          {
            paymentMethod ? (
              <PaymentMethodCard
                paymentMethod={paymentMethod}
              />):(<PaymentForm />)
          }
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
        {
          status === 'error' && errorMessage ?
          (<ErrorState message={errorMessage} onRetry={handleCheckout}/>): null
        }
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor:colors.border,
            backgroundColor:colors.bgPage,
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