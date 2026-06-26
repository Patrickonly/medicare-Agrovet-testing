import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { localDB } from "@/data/localStorageDB";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OTPPage() {
  const [searchParams] = useSearchParams();
  const tempUserId = searchParams.get("tempUserId");
  const otpFromUrl = searchParams.get("otp");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayOtp, setDisplayOtp] = useState<string | null>(otpFromUrl);

  useEffect(() => {
    if (!tempUserId) {
      navigate("/login");
    }
  }, [tempUserId, navigate]);

  const handleVerify = async () => {
    if (!tempUserId) return;

    const tempUser = localDB.tempUsers.getById(tempUserId);
    if (!tempUser) {
      toast({ title: "Error", description: "Session expired", variant: "destructive" });
      navigate("/login");
      return;
    }

    if (otp !== tempUser.otp) {
      toast({ title: "Invalid OTP", description: "Please check the code and try again", variant: "destructive" });
      return;
    }

    if (new Date() > new Date(tempUser.otp_expires_at)) {
      toast({ title: "OTP Expired", description: "Please request a new code", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const organization = localDB.organizations.create({
        name: tempUser.organization_name,
        type: tempUser.organization_type,
        code: tempUser.organization_name.slice(0, 3).toUpperCase() + Math.floor(Math.random() * 1000),
        address: tempUser.organization_address || {
          street: "123 Main St",
          city: "Kigali",
          country: "Rwanda"
        },
        phone: tempUser.phone || "+250780000000",
        email: tempUser.email,
        website: tempUser.organization_website,
        business_unit: tempUser.organization_business_unit,
        tax_id: tempUser.organization_tax_id,
        registration_number: tempUser.organization_registration_number,
        license_number: tempUser.organization_license_number,
        is_active: true,
        subscription_plan: "Professional",
        settings: {
          timezone: "Africa/Kigali",
          currency: "RWF",
          language: "en",
          modules_enabled: ["patients", "appointments", "billing", "pharmacy", "inventory", "pos", "reports"],
          branding: {}
        }
      });

      const startDate = new Date();
      const endDate = new Date(startDate);
      
      // Set subscription duration based on billing cycle
      if (tempUser.subscription_billing_cycle === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        const duration = (tempUser as any).subscription_duration_months || 1;
        endDate.setMonth(endDate.getMonth() + duration);
      }

      localDB.subscriptions.create({
        organization_id: organization.id,
        plan_name: "Professional",
        billing_cycle: tempUser.subscription_billing_cycle || "monthly",
        amount: tempUser.subscription_amount || 35999,
        payment_method: tempUser.subscription_payment_method || "card",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "active",
        auto_renew: true
      });

      const user = localDB.users.create({
        email: tempUser.email,
        first_name: tempUser.first_name,
        last_name: tempUser.last_name,
        phone: tempUser.phone,
        is_active: true,
        status: "active",
        role: "admin",
        organization_id: organization.id
      });

      localDB.session.set({
        userId: user.id,
        organizationId: organization.id,
        userRole: "admin"
      });

      localDB.tempUsers.delete(tempUserId);

      toast({
        title: "Verification successful!",
        description: "Welcome to MedicareOne"
      });

      // Force a full reload so AuthContext picks up the new session from localStorage
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
      toast({
        title: "Verification failed",
        description: "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5fbfb]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-[5rem] bg-[#e4fafa]" />
        <div className="absolute right-[-120px] bottom-20 h-96 w-96 rounded-[5rem] bg-[#dff8f8]" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left Column - Branded Side */}
        <section className="relative hidden overflow-hidden bg-[#0aa9ad] text-white lg:block">
          <div className="absolute inset-0 bg-gradient-to-r from-[#057d82] via-[#079ba0]/90 to-[#0aa9ad]/55" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-[5rem] bg-white/10" />
          <div className="absolute right-10 top-28 h-52 w-52 rounded-[4rem] bg-white/10" />

          <div className="absolute left-10 top-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#07969a] shadow-xl shadow-teal-950/10">
              <HeartPulse className="h-7 w-7" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold tracking-tight">MEDICARE ONE</p>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/75">Healthcare Operations</p>
            </div>
          </div>

          <div className="relative z-10 flex min-h-screen flex-col justify-center px-12 py-24 xl:px-16">
            <div className="max-w-xl">
              <div className="mb-7 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                Account Verification
              </div>

              <h1 className="font-heading text-5xl font-extrabold leading-[1.03] tracking-tight xl:text-6xl">
                Verify your account to get started
              </h1>

              <p className="mt-7 max-w-lg text-lg font-semibold leading-relaxed text-white/88">
                Enter the verification code we sent to your email address
              </p>
            </div>
          </div>
        </section>

        {/* Right Column - Form */}
        <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-2xl">
            <Button
              variant="ghost"
              className="mb-6 text-[#5f6d84]"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>

            <div className="rounded-[2.5rem] border border-[#dcebf0] bg-white/95 p-7 shadow-2xl shadow-teal-900/10 backdrop-blur sm:p-9">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0aa9ad] text-white">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-heading text-xl font-extrabold text-[#09111f]">
                    MEDICARE <span className="text-[#07969a]">ONE</span>
                  </p>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ba0b8]">Account Verification</p>
                </div>
              </div>

              <Card className="mb-8 border-[#dcebf0]">
                <CardHeader>
                  <CardTitle>Verification Code</CardTitle>
                  <CardDescription>
                    We've sent a 6-digit verification code to your email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {displayOtp && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-[1.6rem] text-center">
                      <p className="text-yellow-800 font-semibold">
                        Your OTP is: <span className="text-3xl font-extrabold">{displayOtp}</span>
                      </p>
                      <p className="text-yellow-700 text-sm mt-2">
                        For demo purposes, we're showing you the code
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-black text-[#09111f]">
                      Enter Verification Code
                    </Label>
                    <Input
                      id="otp"
                      placeholder="000000"
                      maxLength={6}
                      className="h-14 text-center text-2xl font-extrabold tracking-[0.5em] border-[#dcebf0] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full h-14 rounded-full bg-[#0aa9ad] text-base font-black text-white hover:bg-[#07969a] shadow-xl shadow-teal-500/20"
                    size="lg"
                    onClick={handleVerify}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="text-center">
                <p className="text-sm font-semibold text-[#5f6d84]">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      if (tempUserId) {
                        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                        localDB.tempUsers.update(tempUserId, {
                          otp: newOtp,
                          otp_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
                        });
                        setDisplayOtp(newOtp);
                        toast({
                          title: "New code sent!",
                          description: "Check your email for the new verification code"
                        });
                      }
                    }}
                    className="font-black text-[#07969a] hover:text-[#056e72]"
                  >
                    Resend code
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
