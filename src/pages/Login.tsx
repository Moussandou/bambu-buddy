import { useState } from 'react';
import { Printer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export function Login() {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setSuccess('Email de réinitialisation envoyé ! Vérifiez votre boîte mail (et les spams).');
        setEmail('');
      } else if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Messages d'erreur plus clairs pour le reset password
        if (err.message.includes('auth/user-not-found')) {
          setError('Aucun compte trouvé avec cet email.');
        } else if (err.message.includes('auth/invalid-email')) {
          setError('Format d\'email invalide.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  function handleModeSwitch(mode: 'signIn' | 'signUp' | 'forgotPassword') {
    setIsSignUp(mode === 'signUp');
    setIsForgotPassword(mode === 'forgotPassword');
    setError('');
    setSuccess('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Printer className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            {isForgotPassword ? 'Mot de passe oublié' : isSignUp ? 'Créer un compte' : 'Connexion'}
          </CardTitle>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-2">
            {isForgotPassword 
              ? 'Entrez votre email pour réinitialiser votre mot de passe'
              : 'Bambu Buddy - Gestionnaire d\'impressions 3D'
            }
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && !isForgotPassword && (
              <Input
                label="Nom"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                placeholder="Ton nom"
              />
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ton@email.com"
            />

            {!isForgotPassword && (
              <div>
                <Input
                  label="Mot de passe"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('forgotPassword')}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={loading}>
              {isForgotPassword ? 'Envoyer le lien de réinitialisation' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
            </Button>
          </form>

          {!isForgotPassword && (
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                    Ou
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleGoogleSignIn}
                  variant="secondary"
                  className="w-full mt-4"
                  isLoading={loading}
                >
                  Continuer avec Google
                </Button>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  ⚠️ Connexion Google disponible uniquement sur la version web
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center space-y-2">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => handleModeSwitch('signIn')}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Retour à la connexion
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleModeSwitch(isSignUp ? 'signIn' : 'signUp')}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {isSignUp
                  ? 'Déjà un compte ? Se connecter'
                  : 'Pas de compte ? Créer un compte'}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
