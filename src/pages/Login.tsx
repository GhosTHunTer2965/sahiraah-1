import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaYahoo } from "react-icons/fa";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

// Helper function to clean up auth state
const cleanupAuthState = () => {
  localStorage.removeItem('supabase.auth.token');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

type ExtendedProvider = 'google' | 'facebook' | 'twitter' | 'apple' | 'github' | 'gitlab' | 'bitbucket' | 'azure' | 'discord' | 'linkedin' | 'slack' | 'spotify' | 'workos' | 'yahoo';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [showEmailVerificationAlert, setShowEmailVerificationAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email_confirmed_at) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'expert')
            .maybeSingle();
          
          if (roleData) {
            navigate("/expert-dashboard", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        } else {
          setShowEmailVerificationAlert(true);
        }
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(t('login.email') + " & " + t('login.password') + " required");
      return;
    }
    
    try {
      setIsLoading(true);
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {}
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        if (!data.user.email_confirmed_at) {
          setShowEmailVerificationAlert(true);
          return;
        }
        
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'expert')
          .maybeSingle();
        
        toast.success(t('login.loginSuccess'));
        
        if (roleData) {
          window.location.href = "/expert-dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword) {
      toast.error(t('login.email') + " & " + t('login.password') + " required");
      return;
    }
    
    if (signupPassword !== confirmPassword) {
      toast.error("Password and confirmation do not match");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error(t('login.passwordMinLength'));
      return;
    }
    
    try {
      setIsLoading(true);
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {}
      
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        setEmailVerificationSent(true);
        setShowEmailVerificationAlert(true);
        toast.success(t('login.checkEmailDesc'));
        setSignupEmail("");
        setSignupPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email && !signupEmail) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const emailToVerify = email || signupEmail;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToVerify,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      toast.success(t('login.passwordResetSent'));
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    }
  };

  const handleSocialLogin = async (provider: ExtendedProvider) => {
    try {
      setSocialLoading(provider);
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {}
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        // @ts-ignore
        provider,
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: false,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      toast.error(error.message || `Could not login with ${provider}`);
      setSocialLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {showEmailVerificationAlert && (
          <Alert className="border-amber-200 bg-amber-50">
            <Mail className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {emailVerificationSent ? (
                <>
                  <strong>{t('login.checkEmail')}</strong> {t('login.checkEmailDesc')}
                </>
              ) : (
                <>
                  <strong>{t('login.emailVerificationRequired')}</strong> {t('login.emailVerificationDesc')}
                </>
              )}
              <Button 
                variant="link" 
                size="sm" 
                className="ml-2 p-0 h-auto text-amber-700 underline"
                onClick={handleResendVerification}
              >
                {t('login.resendVerification')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-blue-900">{t('login.title')}</CardTitle>
            <CardDescription className="text-center">{t('login.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('login.loginTab')}</TabsTrigger>
                <TabsTrigger value="register">{t('login.signupTab')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('login.email')}</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t('login.password')}</Label>
                      <button 
                        type="button"
                        onClick={async () => {
                          if (!email) {
                            toast.error("Please enter your email address first");
                            return;
                          }
                          try {
                            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                              redirectTo: `${window.location.origin}/login`,
                            });
                            if (error) throw error;
                            toast.success(t('login.passwordResetSent'));
                          } catch (err: any) {
                            toast.error(err.message || "Failed to send reset email");
                          }
                        }}
                        className="text-sm text-blue-700 hover:underline"
                      >
                        {t('login.forgotPassword')}
                      </button>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? t('login.signingIn') : t('login.signIn')}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#f0f6ff] px-2 text-gray-500">{t('login.orContinueWith')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialLogin('google')} disabled={!!socialLoading}>
                      <FcGoogle className="h-5 w-5" />
                      {socialLoading === 'google' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                    <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialLogin('facebook')} disabled={!!socialLoading}>
                      <FaFacebook className="h-5 w-5 text-blue-600" />
                      {socialLoading === 'facebook' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                    <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialLogin('yahoo')} disabled={!!socialLoading}>
                      <FaYahoo className="h-5 w-5 text-purple-600" />
                      {socialLoading === 'yahoo' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('login.email')}</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('login.password')}</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500">{t('login.passwordMinLength')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('login.confirmPassword')}</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? t('login.creatingAccount') : t('login.createAccount')}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#f0f6ff] px-2 text-gray-500">{t('login.orSignUpWith')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialLogin('google')} disabled={!!socialLoading}>
                      <FcGoogle className="h-5 w-5" />
                      {socialLoading === 'google' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                    <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialLogin('facebook')} disabled={!!socialLoading}>
                      <FaFacebook className="h-5 w-5 text-blue-600" />
                      {socialLoading === 'facebook' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                    <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialLogin('yahoo')} disabled={!!socialLoading}>
                      <FaYahoo className="h-5 w-5 text-purple-600" />
                      {socialLoading === 'yahoo' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
