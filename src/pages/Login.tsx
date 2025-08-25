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

// Helper function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Define a type that includes 'yahoo' as a valid provider
type ExtendedProvider = 'google' | 'facebook' | 'twitter' | 'apple' | 'github' | 'gitlab' | 'bitbucket' | 'azure' | 'discord' | 'linkedin' | 'slack' | 'spotify' | 'workos' | 'yahoo';

const Login = () => {
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

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Check if email is verified before allowing login
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email_confirmed_at) {
          navigate("/dashboard", { replace: true });
        } else {
          setShowEmailVerificationAlert(true);
          toast.error("Please verify your email before accessing the dashboard.");
        }
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please provide both email and password");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try to sign out first to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Now attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          setShowEmailVerificationAlert(true);
          toast.error("Please verify your email before accessing the dashboard. Check your inbox for verification link.");
          return;
        }

        // Store user data in localStorage for app-level access
        localStorage.setItem("sahiraah_user", JSON.stringify(data.user));
        
        toast.success("Login successful! Welcome back!");
        
        // Force a full page refresh and redirect to dashboard
        window.location.href = "/dashboard";
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
      toast.error("Please provide both email and password");
      return;
    }
    
    if (signupPassword !== confirmPassword) {
      toast.error("Password and confirmation do not match");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try to sign out first to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        setEmailVerificationSent(true);
        setShowEmailVerificationAlert(true);
        toast.success("Account created! Please check your email to verify your account before logging in.");
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

      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    }
  };

  const handleSocialLogin = async (provider: ExtendedProvider) => {
    try {
      setSocialLoading(provider);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try to sign out first to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Use type assertion to handle yahoo provider
      const { data, error } = await supabase.auth.signInWithOAuth({
        // @ts-ignore - Ignore typescript error for yahoo provider
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      toast.error(error.message || `Could not login with ${provider}`);
      setSocialLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Email Verification Alert */}
        {showEmailVerificationAlert && (
          <Alert className="border-amber-200 bg-amber-50">
            <Mail className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {emailVerificationSent ? (
                <>
                  <strong>Check your email!</strong> We've sent you a verification link. Please verify your email before logging in.
                </>
              ) : (
                <>
                  <strong>Email verification required.</strong> Please verify your email to access the dashboard.
                </>
              )}
              <Button 
                variant="link" 
                size="sm" 
                className="ml-2 p-0 h-auto text-amber-700 underline"
                onClick={handleResendVerification}
              >
                Resend verification email
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-blue-900">SahiRaah</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-sm text-blue-700 hover:underline">
                        Forgot password?
                      </a>
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
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#f0f6ff] px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleSocialLogin('google')}
                      disabled={!!socialLoading}
                    >
                      <FcGoogle className="h-5 w-5" />
                      {socialLoading === 'google' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleSocialLogin('facebook')}
                      disabled={!!socialLoading}
                    >
                      <FaFacebook className="h-5 w-5 text-blue-600" />
                      {socialLoading === 'facebook' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleSocialLogin('yahoo')}
                      disabled={!!socialLoading}
                    >
                      <FaYahoo className="h-5 w-5 text-purple-600" />
                      {socialLoading === 'yahoo' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
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
                    <Label htmlFor="signup-password">Password</Label>
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
                    <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
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
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#f0f6ff] px-2 text-gray-500">Or sign up with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleSocialLogin('google')}
                      disabled={!!socialLoading}
                    >
                      <FcGoogle className="h-5 w-5" />
                      {socialLoading === 'google' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleSocialLogin('facebook')}
                      disabled={!!socialLoading}
                    >
                      <FaFacebook className="h-5 w-5 text-blue-600" />
                      {socialLoading === 'facebook' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleSocialLogin('yahoo')}
                      disabled={!!socialLoading}
                    >
                      <FaYahoo className="h-5 w-5 text-purple-600" />
                      {socialLoading === 'yahoo' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-500 text-center">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-blue-700 hover:underline">Terms</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-700 hover:underline">Privacy Policy</Link>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
