import { View, StyleSheet, Text } from 'react-native';
import { useState } from 'react';
import { CardForm, type CardFieldInput } from '@stripe/stripe-react-native';

import { useTheme } from '@/src/theme';
import { useCheckoutStore } from '@/src/checkout/checkoutStore';


export default function PaymentForm() {

  const { colors } = useTheme();

  const setPaymentMethod = useCheckoutStore(
    state => state.setPaymentMethod
  );

  const [card, setCard] = useState<CardFieldInput.Details | null>(null);


  const handleFormComplete = (cardDetails: CardFieldInput.Details) => {

    setCard(cardDetails);

    if (cardDetails.complete) {
      setPaymentMethod({
        type: 'card',
        brand: cardDetails.brand,
        last4: cardDetails.last4,
      });
    }

  };


  return (
    <View style={styles.container}>


      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
          }
        ]}
      >

        <CardForm
          postalCodeEnabled={false}
          onFormComplete={handleFormComplete}
          cardStyle={{
            backgroundColor: colors.bgCard,
            textColor: colors.textPrimary,
            placeholderColor: colors.textMuted,
            borderWidth: 0,
            borderRadius: 16,
            fontSize: 16,
            cursorColor: colors.textPrimary,
          }}
          style={styles.cardForm}
        />

      </View>
      {
        card?.complete && (
          <View
            style={[
              styles.preview,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
              }
            ]}
          >
            <Text style={{ color: colors.textPrimary }}>
              💳 {card.brand ?? 'Tarjeta'}
            </Text>

            <Text style={{ color: colors.textMuted }}>
              **** **** **** {card.last4 ?? '----'}
            </Text>

          </View>
        )
      }
    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    gap: 12,
  },

  cardContainer: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },

  cardForm: {
    width: '100%',
    height: 200,
  },

  preview: {
    height: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: 4,
  },

});