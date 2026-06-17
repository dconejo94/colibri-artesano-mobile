import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@/src/auth/authStore';
import { normalizeError } from '@/src/api/errors';
import AuthShell from '@/src/components/AuthShell';
import AuthLogo from '@/src/components/AuthLogo';
import GlassCard from '@/src/components/GlassCard';
import { Heading, Banner, TextLink, FooterSwitch } from '@/src/components/AuthParts';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { email?: string; password?: string; form?: string };

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const next: Errors = {};
    if (!email.trim()) next.email = 'Ingresa tu correo electrónico.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'El correo no es válido.';
    if (!password) next.password = 'Ingresa tu contraseña.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.replace('/');
    } catch (e) {
      const { status, message } = normalizeError(e);
      setErrors({
        form: status === 401 ? 'Correo o contraseña incorrectos. Inténtalo de nuevo.' : message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthLogo />
      <GlassCard style={styles.card}>
        <Heading title="Iniciar sesión" subtitle="Bienvenid@ de nuevo a la comunidad artesana." />
        <View style={styles.form}>
          {errors.form && <Banner kind="error">{errors.form}</Banner>}
          <Input
            label="Correo electrónico"
            placeholder="hola@colibri.cr"
            keyboardType="email-address"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setErrors((e) => ({ ...e, email: undefined, form: undefined }));
            }}
            error={errors.email}
          />
          <Input
            label="Contraseña"
            placeholder="Tu contraseña"
            secureTextEntry
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setErrors((e) => ({ ...e, password: undefined, form: undefined }));
            }}
            error={errors.password}
          />
          <TextLink align="right" onPress={() => {}}>
            ¿Olvidaste tu contraseña?
          </TextLink>
          <Button title="Entrar" onPress={submit} disabled={submitting} />
        </View>
      </GlassCard>
      <FooterSwitch prompt="¿No tienes cuenta?" action="Regístrate" onPress={() => router.push('/register')} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 28,
  },
  form: {
    gap: 8,
    marginTop: 16,
  },
});
