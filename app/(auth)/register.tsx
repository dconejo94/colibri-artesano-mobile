import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuthStore } from '@/src/auth/authStore';
import { normalizeError } from '@/src/api/errors';
import { useTheme } from '@/src/theme';
import AuthShell from '@/src/components/AuthShell';
import AuthLogo from '@/src/components/AuthLogo';
import GlassCard from '@/src/components/GlassCard';
import { Heading, Banner, FooterSwitch, RoleCard } from '@/src/components/AuthParts';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Role = 'buyer' | 'vendor';
type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  role?: string;
  store?: string;
  form?: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, fonts } = useTheme();
  const register = useAuthStore((s) => s.register);

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [storeName, setStoreName] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const clear = (k: keyof Errors) => setErrors((e) => ({ ...e, [k]: undefined, form: undefined }));

  const goNext = () => {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Ingresa tu nombre.';
    if (!email.trim()) next.email = 'Ingresa tu correo electrónico.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'El correo no es válido.';
    if (!password) next.password = 'Crea una contraseña.';
    else if (password.length < 8) next.password = 'Debe tener al menos 8 caracteres.';
    if (!confirm) next.confirm = 'Confirma tu contraseña.';
    else if (confirm !== password) next.confirm = 'Las contraseñas no coinciden.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setStep(2);
  };

  const back = () => {
    setErrors({});
    setStep(1);
  };

  const submit = async () => {
    const next: Errors = {};
    if (!role) next.role = 'Elige una opción para continuar.';
    if (role === 'vendor' && !storeName.trim()) next.store = 'Ingresa el nombre de tu tienda.';
    setErrors(next);
    if (Object.keys(next).length || !role) return;

    setSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
        ...(role === 'vendor' ? { store_name: storeName.trim() } : {}),
      });
      router.replace('/');
    } catch (e) {
      const { status, message } = normalizeError(e);
      setErrors({
        form: status === 409 ? 'Ese correo ya está registrado. Inicia sesión.' : message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthLogo />
      <GlassCard style={styles.card} contentStyle={styles.cardContent}>
        {step === 1 ? (
          <>
            <Heading title="Crear cuenta" subtitle="Únete y lleva las manos artesanas a tu hogar." />
            <View style={styles.form}>
              <Input
                label="Nombre completo"
                placeholder="Tu nombre"
                value={name}
                onChangeText={(v) => { setName(v); clear('name'); }}
                error={errors.name}
              />
              <Input
                label="Correo electrónico"
                placeholder="hola@colibri.cr"
                keyboardType="email-address"
                value={email}
                onChangeText={(v) => { setEmail(v); clear('email'); }}
                error={errors.email}
              />
              <Input
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                secureTextEntry
                value={password}
                onChangeText={(v) => { setPassword(v); clear('password'); }}
                error={errors.password}
              />
              <Input
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                secureTextEntry
                value={confirm}
                onChangeText={(v) => { setConfirm(v); clear('confirm'); }}
                error={errors.confirm}
              />
              <Button title="Siguiente" onPress={goNext} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.stepHeader}>
              <Pressable onPress={back} accessibilityRole="button" style={styles.backLink}>
                <MaterialIcons name="arrow-back" size={16} color={colors.primary} />
                <Text style={[styles.backText, { fontFamily: fonts.sanBold, color: colors.primary }]}>Atrás</Text>
              </Pressable>
              <Text style={[styles.stepLabel, { fontFamily: fonts.sanRegular, color: colors.textMuted }]}>
                PASO 2 DE 2
              </Text>
            </View>

            <Heading
              title="¿Qué te trae a Colibrí Artesano?"
              subtitle="Cuéntanos cómo quieres ser parte de la comunidad."
            />

            <View style={styles.form}>
              {errors.form && <Banner kind="error">{errors.form}</Banner>}

              <RoleCard
                selected={role === 'buyer'}
                onSelect={() => { setRole('buyer'); clear('role'); }}
                icon="buyer"
                title="Comprador"
                desc="Quiero descubrir y comprar artesanías."
              />
              <RoleCard
                selected={role === 'vendor'}
                onSelect={() => { setRole('vendor'); clear('role'); }}
                icon="vendor"
                title="Vendedor"
                desc="Quiero vender mis creaciones."
              />

              <Text style={[styles.roleError, { fontFamily: fonts.sanRegular, color: colors.errorText }]}>
                {errors.role ?? ' '}
              </Text>

              {role === 'vendor' && (
                <Input
                  label="Nombre de la tienda"
                  placeholder="Ej. Taller Colibrí"
                  value={storeName}
                  onChangeText={(v) => { setStoreName(v); clear('store'); }}
                  error={errors.store}
                />
              )}

              <Button title="Registrarme" onPress={submit} disabled={submitting} />
            </View>
          </>
        )}
      </GlassCard>

      <FooterSwitch prompt="¿Ya tienes cuenta?" action="Inicia sesión" onPress={() => router.replace('/login')} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
  },
  cardContent: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  form: {
    gap: 8,
    marginTop: 14,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 13,
  },
  stepLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  roleError: {
    fontSize: 11,
    letterSpacing: 0.8,
    minHeight: 14,
  },
});
