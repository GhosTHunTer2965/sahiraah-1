import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaYahoo } from "react-icons/fa";
import { useTranslation } from "react-i18next";

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

const Signup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setIsLoading(true);

    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {}
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success(t('signup.accountCreated'));
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
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
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      toast.error(error.message || `Could not sign up with ${provider}`);
      setSocialLoading("");
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-blue-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-blue-900">{t('signup.title')}</CardTitle>
          <CardDescription className="text-center text-blue-700">{t('signup.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('signup.fullName')}</Label>
              <Input id="name" placeholder={t('signup.fullName')} required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('signup.email')}</Label>
              <Input id="email" placeholder="your.email@example.com" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.password')}</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('signup.confirmPassword')}</Label>
              <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={isLoading}>
              {isLoading ? t('signup.creatingAccount') : t('signup.signUp')}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><Separator /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-blue-50 px-2 text-gray-500">{t('signup.orSignUpWith')}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialLogin('google')} disabled={!!socialLoading}>
              <FcGoogle className="h-5 w-5" />
            </Button>
            <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialLogin('facebook')} disabled={!!socialLoading}>
              <FaFacebook className="h-5 w-5 text-blue-600" />
            </Button>
            <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialLogin('yahoo')} disabled={!!socialLoading}>
              <FaYahoo className="h-5 w-5 text-purple-600" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            {t('signup.alreadyHaveAccount')}{" "}
            <Link to="/login" className="text-blue-700 hover:text-blue-900 font-medium">{t('signup.login')}</Link>
          </div>
          <div className="text-xs text-center text-gray-500">
            {t('signup.termsAgreement')}{" "}
            <Link to="/terms" className="underline hover:text-gray-700">{t('signup.termsOfService')}</Link>{" "}
            {t('signup.and')}{" "}
            <Link to="/privacy" className="underline hover:text-gray-700">{t('signup.privacyPolicy')}</Link>.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
