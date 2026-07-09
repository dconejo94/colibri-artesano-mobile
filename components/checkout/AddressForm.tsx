import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/src/theme';
import { useCheckoutStore } from '@/src/checkout/checkoutStore';
import Button from '@/components/ui/Button';

export type AddressFormData = {
  recipient: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
};

const BLANK_FORM: AddressFormData = {
  recipient: '',
  phone: '',
  addressLine: '',
  city: '',
  province: '',
  postalCode: '',
};

type Props = {
  initialValue?: AddressFormData | null;
  onSaved?: () => void;
};

export default function AddressForm({ initialValue, onSaved }: Props) {

  const { colors, text: textStyles } = useTheme();

  const setAddress = useCheckoutStore(
    state => state.setAddress
  );

  const [form,setForm] = useState<AddressFormData>(
    initialValue ?? BLANK_FORM
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isComplete = !!(
    form.recipient &&
    form.phone &&
    form.addressLine &&
    form.city &&
    form.province
  );

  const missingFieldLabel = () => {
    if (!form.recipient) return 'el nombre completo';
    if (!form.phone) return 'el teléfono';
    if (!form.addressLine) return 'la dirección';
    if (!form.city) return 'la ciudad';
    if (!form.province) return 'la provincia';
    return null;
  };

  const handleSave = () => {
    if (!isComplete) {
      setErrorMessage(`Falta completar ${missingFieldLabel()}.`);
      return;
    }
    setErrorMessage(null);
    setAddress(form);
    Toast.show({ type: 'success', text1: 'Dirección guardada' });
    onSaved?.();
  };


  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre completo"
        placeholderTextColor={colors.textMuted}
        value={form.recipient}
        onChangeText={
          v=>setForm({...form,recipient:v})
        }
        style={[
          styles.input,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            color: colors.textPrimary,
          }
        ]}
      />

      <TextInput
        placeholder="Teléfono"
        placeholderTextColor={colors.textMuted}
        value={form.phone}
        keyboardType="phone-pad"
        onChangeText={
          v=>setForm({...form,phone:v})
        }
        style={[
          styles.input,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            color: colors.textPrimary,
          }
        ]}
      />

      <TextInput
        placeholder="Dirección"
        placeholderTextColor={colors.textMuted}
        value={form.addressLine}
        onChangeText={
          v=>setForm({...form,addressLine:v})
        }
        style={[
          styles.input,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            color: colors.textPrimary,
          }
        ]}
      />

      <View style={styles.row}>

        <TextInput
          placeholder="Ciudad"
          placeholderTextColor={colors.textMuted}
          value={form.city}
          onChangeText={
            v=>setForm({...form,city:v})
          }
          style={[
            styles.input,
            styles.flex,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
              color: colors.textPrimary,
            }
          ]}
        />

        <TextInput
          placeholder="Provincia"
          placeholderTextColor={colors.textMuted}
          value={form.province}
          onChangeText={
            v=>setForm({...form,province:v})
          }
          style={[
            styles.input,
            styles.flex,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
              color: colors.textPrimary,
            }
          ]}
        />

      </View>

      <TextInput
        placeholder="Código postal (opcional)"
        placeholderTextColor={colors.textMuted}
        value={form.postalCode}
        keyboardType="number-pad"
        onChangeText={
          v=>setForm({...form,postalCode:v})
        }
        style={[
          styles.input,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            color: colors.textPrimary,
          }
        ]}
      />

      {errorMessage && (
        <Text style={[textStyles.caption, { color: colors.errorText ?? '#B3261E' }]}>
          {errorMessage}
        </Text>
      )}

      <Button
        title="Guardar dirección"
        onPress={handleSave}
        variant='secondary'
      />
    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    gap:12,
  },

  row:{
    flexDirection:'row',
    gap:10,
  },

  flex:{
    flex:1,
  },

  input:{
    height:50,
    borderWidth:1,
    borderRadius:12,
    paddingHorizontal:14,
  },

});