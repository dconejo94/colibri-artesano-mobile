import { View, TextInput, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

import { useTheme } from '@/src/theme';
import { useCheckoutStore } from '@/src/checkout/checkoutStore';


export default function AddressForm() {

  const { colors } = useTheme();

  const setAddress = useCheckoutStore(
    state => state.setAddress
  );


  const [form,setForm] = useState({
    recipient:'',
    phone:'',
    addressLine:'',
    city:'',
    province:'',
    postalCode:'',
  });


  useEffect(()=>{
    const complete =
      form.recipient &&
      form.phone &&
      form.addressLine &&
      form.city &&
      form.province;

    if(complete){
      setAddress(form);
    }

  },[form]);


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