import doctorPortrait from "@/assets/doctor-portrait.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Building2,
  Eye,
  EyeOff,
  HeartPulse,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, user, userRole, loading: authLoading, tempUserId } = useAuth();
  const navigate = useNavigate();

  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) return;
    if (user && !authLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Enter your email address and password.");
      return;
    }

    if (loading) return;

    setLoading(true);
    const { error, requiresOtp, tempUserId: tid, otp } = await signIn(email, password);
    
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    setLoading(false);

    if (requiresOtp && tid) {
      toast.success("Check OTP sent!");
      navigate(`/otp?tempUserId=${tid}&otp=${otp}`);
      return;
    }

    toast.success("Signed in successfully.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5fbfb]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 top-16 h-80 w-80 rounded-[5rem] bg-[#e4fafa]" />
        <div className="absolute right-[-120px] bottom-20 h-96 w-96 rounded-[5rem] bg-[#dff8f8]" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#0aa9ad] text-white lg:block">
          <img
            src={doctorPortrait}
            alt="Healthcare professional using a clinical tablet"
            loading="lazy"
            width={1600}
            height={1024}
            className="absolute inset-0 h-full w-full object-cover opacity-42"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#057d82] via-[#079ba0]/90 to-[#0aa9ad]/55" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-[5rem] bg-white/10" />
          <div className="absolute right-10 top-28 h-52 w-52 rounded-[4rem] bg-white/10" />

          <div className="absolute left-10 top-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#07969a] shadow-xl shadow-teal-950/10">
              <HeartPulse className="h-7 w-7" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold tracking-tight">
                MEDICARE ONE
              </p>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/75">
                Healthcare Operations
              </p>
            </div>
          </div>

          <div className="relative z-10 flex min-h-screen flex-col justify-center px-12 py-24 xl:px-16">
            <div className="max-w-xl">
              <div className="mb-7 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                Secure facility access
              </div>

              <h1 className="font-heading text-5xl font-extrabold leading-[1.03] tracking-tight xl:text-6xl">
                Centralized access for modern healthcare teams.
              </h1>

              <p className="mt-7 max-w-lg text-lg font-semibold leading-relaxed text-white/88">
                Sign in to manage patient records, appointments, pharmacy operations, billing, reporting and facility workflows from one secure workspace.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Users,
                    title: "Role-Based Access",
                    desc: "Access levels for clinical and administrative teams.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Protected Records",
                    desc: "Secure sessions and controlled healthcare data.",
                  },
                  {
                    icon: BarChart3,
                    title: "Operational Visibility",
                    desc: "Dashboards for facility and department performance.",
                  },
                  {
                    icon: Building2,
                    title: "Multi-Facility Ready",
                    desc: "Support for hospitals, clinics, pharmacies and agrovets.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.6rem] border border-white/20 bg-white/12 p-5 backdrop-blur-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-[#07969a]">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{item.title}</p>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-white/75">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-xl">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#5f6d84] transition hover:text-[#07969a]"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="rounded-[2.5rem] border border-[#dcebf0] bg-white/95 p-7 shadow-2xl shadow-teal-900/10 backdrop-blur sm:p-9 lg:p-10">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-[#0aa9ad] text-white shadow-xl shadow-teal-500/20">
                  <HeartPulse className="h-8 w-8" />
                </div>

                <h2 className="font-heading text-4xl font-extrabold tracking-tight text-[#09111f]">
                  Sign in to your account
                </h2>
                <p className="mt-2 text-base font-semibold text-[#5f6d84]">
                  Access your healthcare or agrovet workspace
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-black text-[#09111f]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ba0b8]" />
                    <input
                      type="email"
                      className="h-14 w-full rounded-[1.2rem] border border-[#dcebf0] bg-white px-12 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                      placeholder="name@facility.rw"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-[#09111f]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ba0b8]" />
                    <input
                      type={showPass ? "text" : "password"}
                      className="h-14 w-full rounded-[1.2rem] border border-[#dcebf0] bg-white px-12 pr-12 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6d84] transition hover:text-[#07969a]"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-14 w-full rounded-full bg-[#0aa9ad] text-base font-black text-white shadow-xl shadow-teal-500/20 hover:bg-[#07969a]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={19} className="mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock size={18} className="mr-2" />
                      Sign in securely
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-7 text-center text-sm font-semibold text-[#5f6d84]">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-black text-[#07969a] hover:text-[#056e72]">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
