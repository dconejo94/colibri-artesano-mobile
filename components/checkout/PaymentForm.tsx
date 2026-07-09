import { View, StyleSheet, Text } from 'react-native';
import { useState } from 'react';
import { CardForm, CardFormView, type CardFieldInput } from '@stripe/stripe-react-native';

import { useTheme } from '@/src/theme';
import { useCheckoutStore } from '@/src/checkout/checkoutStore';
import { Pressable } from 'react-native';

export default function PaymentForm() {

  const { colors } = useTheme();

  const setPaymentMethod = useCheckoutStore(
    state => state.setPaymentMethod
  );

  const [card, setCard] = useState<CardFormView.Details | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const handleFormComplete = (cardDetails: CardFormView.Details) => {
    setCard(cardDetails);

    if (cardDetails.complete) {
      setPaymentMethod({
        type: 'card',
        brand: cardDetails.brand,
        last4: cardDetails.last4,
      });

      setCollapsed(true);
    }
  };


  return (
    <View style={styles.container}>


      <View
        style={[
          styles.cardContainer,
          collapsed && styles.cardContainerCollapsed,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
          },
        ]}
      >

        <CardForm
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
          <Pressable
            onPress={() => setCollapsed(false)}
            style={[
              styles.preview,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.previewRow}>
              <View>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  💳 {card.brand ?? 'Tarjeta'}
                </Text>

                <Text
                  style={{
                    color: colors.textMuted,
                    marginTop: 2,
                  }}
                >
                  **** **** **** {card.last4}
                </Text>
              </View>

              <Text
                style={{
                  color: colors.primary,
                  fontWeight: '600',
                }}
              >
                Editar
              </Text>
            </View>
          </Pressable>
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
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },

  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  cardContainerCollapsed: {
  height: 1,
  opacity: 0,
  overflow: 'hidden',
  },

});