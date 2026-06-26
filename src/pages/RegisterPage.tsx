
import digitalHealth from "@/assets/digital-health.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { Address, OrganizationType } from "@/types/models";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const facilityTypes = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "agrovet", label: "Agrovet Pharmacy" },
  { value: "medical_center", label: "Medical Center" },
  { value: "diagnostic_center", label: "Diagnostic Center" },
  { value: "specialist_center", label: "Specialist Center" },
];

const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "Uppercase and lowercase letters", test: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value) },
  { label: "At least one number", test: (value: string) => /\d/.test(value) },
  { label: "At least one special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

const getPasswordStrength = (password: string) => {
  const score = passwordRules.filter((rule) => rule.test(password)).length;
  if (!password) return { label: "Not started", className: "bg-[#eef4f5] text-[#8ba0b8]", width: "0%" };
  if (score <= 1) return { label: "Weak", className: "bg-rose-100 text-rose-700", width: "25%" };
  if (score === 2) return { label: "Fair", className: "bg-orange-100 text-orange-700", width: "50%" };
  if (score === 3) return { label: "Good", className: "bg-[#e8fbfb] text-[#07969a]", width: "75%" };
  return { label: "Strong", className: "bg-emerald-100 text-emerald-700", width: "100%" };
};

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Step 1: Organization Type
  const [organizationType, setOrganizationType] = useState<OrganizationType | null>(null);
  
  // Step 2: User Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Step 3: Organization Details
  const [organizationName, setOrganizationName] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [taxId, setTaxId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressCountry, setAddressCountry] = useState("Rwanda");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  
  // Step 4: Review & Submit
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(password);
  const passwordIsValid = passwordRules.every((rule) => rule.test(password));
  
  const validateStep1 = () => {
    if (!organizationType) {
      toast.error("Please select your organization type.");
      return false;
    }
    return true;
  };
  
  const validateStep2 = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all required user information fields.");
      return false;
    }
    if (!passwordIsValid) {
      toast.error("Please use a stronger password that meets all security requirements.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };
  
  const validateStep3 = () => {
    if (!organizationName.trim()) {
      toast.error("Please enter your organization name.");
      return false;
    }
    if (!addressStreet.trim() || !addressCity.trim() || !addressCountry.trim()) {
      toast.error("Please fill in the required address fields.");
      return false;
    }
    return true;
  };
  
  const handleNext = () => {
    let isValid = true;
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    if (currentStep === 3) isValid = validateStep3();
    
    if (isValid) setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async () => {
    if (!organizationType) return;
    
    setLoading(true);
    
    const address: Address = {
      street: addressStreet,
      city: addressCity,
      state: addressState,
      country: addressCountry,
      postal_code: addressPostalCode,
    };
    
    try {
      const { error, tempUserId, otp } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        phone,
        organization_name: organizationName,
        organization_type: organizationType,
        organization_business_unit: businessUnit,
        organization_address: address,
        organization_tax_id: taxId,
        organization_registration_number: registrationNumber,
        organization_license_number: licenseNumber,
        organization_website: website,
      } as any);
      
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      
      toast.success("Account created! Now choose your subscription plan.");
      navigate(`/subscription?tempUserId=${tempUserId}`);
    } catch (err) {
      toast.error("An error occurred during registration. Please try again.");
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
        <section className="relative hidden overflow-hidden bg-[#0aa9ad] text-white lg:block">
          <img
            src={digitalHealth}
            alt="Digital healthcare operations workspace"
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
              <p className="font-heading text-2xl font-extrabold tracking-tight">MEDICARE ONE</p>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/75">Healthcare Operations</p>
            </div>
          </div>

          <div className="relative z-10 flex min-h-screen flex-col justify-center px-12 py-24 xl:px-16">
            <div className="max-w-xl">
              <div className="mb-7 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                Secure Facility Onboarding
              </div>

              <h1 className="font-heading text-5xl font-extrabold leading-[1.03] tracking-tight xl:text-6xl">
                Register your healthcare operation with confidence.
              </h1>

              <p className="mt-7 max-w-lg text-lg font-semibold leading-relaxed text-white/88">
                Set up secure access for hospitals, clinics, pharmacies, diagnostic centers, staff teams and patient portals.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-2xl">
            <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#5f6d84] transition hover:text-[#07969a]">
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="rounded-[2.5rem] border border-[#dcebf0] bg-white/95 p-7 shadow-2xl shadow-teal-900/10 backdrop-blur sm:p-9">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0aa9ad] text-white">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-heading text-xl font-extrabold text-[#09111f]">
                    MEDICARE <span className="text-[#07969a]">ONE</span>
                  </p>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ba0b8]">
                    Account Setup - Step {currentStep} of {totalSteps}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          step < currentStep
                            ? "bg-[#0aa9ad] text-white"
                            : step === currentStep
                            ? "bg-[#e8fbfb] text-[#0aa9ad] border-2 border-[#0aa9ad]"
                            : "bg-[#eef4f5] text-[#8ba0b8]"
                        }`}
                      >
                        {step < currentStep ? <CheckCircle2 size={20} /> : step}
                      </div>
                      <span className="text-xs mt-1 font-semibold text-[#5f6d84]">
                        {step === 1 ? "Type" : step === 2 ? "User" : step === 3 ? "Details" : "Review"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-2 bg-[#eef4f5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0aa9ad] transition-all"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step 1: Organization Type */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-[#09111f] mb-4">Organization Type</h2>
                  <p className="text-sm text-[#5f6d84] mb-6">
                    Select the type of your organization.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {facilityTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setOrganizationType(type.value as OrganizationType)}
                        className={`flex items-center gap-3 p-5 rounded-[1.6rem] border text-left transition-all ${
                          organizationType === type.value
                            ? "border-[#0aa9ad] bg-[#e8fbfb]"
                            : "border-[#dcebf0] bg-white hover:border-[#8ee4e7]"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            organizationType === type.value ? "border-[#0aa9ad]" : "border-[#c7d9e1]"
                          }`}
                        >
                          {organizationType === type.value && (
                            <div className="w-3 h-3 rounded-full bg-[#0aa9ad]" />
                          )}
                        </div>
                        <span className="font-bold text-[#09111f]">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: User Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-[#09111f] mb-4">Your Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">First Name *</label>
                      <input
                        type="text"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="Jean"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">Last Name *</label>
                      <input
                        type="text"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="Bihira"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">Email Address *</label>
                      <input
                        type="email"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="name@facility.rw"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="+250 780 000 000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 pr-12 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                          placeholder="Create password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6d84] transition hover:text-[#07969a]"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">Confirm Password *</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="rounded-[1.6rem] border border-[#dcebf0] bg-[#f6fbfb] p-4">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <p className="text-sm font-black text-[#09111f]">Password strength</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${passwordStrength.className}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#dcebf0]">
                      <div className="h-full rounded-full bg-[#0aa9ad] transition-all" style={{ width: passwordStrength.width }} />
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {passwordRules.map((rule) => {
                        const passed = rule.test(password);
                        return (
                          <div key={rule.label} className="flex items-center gap-2 text-xs font-semibold text-[#5f6d84]">
                            <CheckCircle2 className={`h-4 w-4 ${passed ? "text-[#07969a]" : "text-[#c7d9e1]"}`} />
                            {rule.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Organization Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-[#09111f] mb-4">Organization Details</h2>
                  <div>
                    <label className="mb-1.5 block text-sm font-black text-[#09111f]">Organization Name *</label>
                    <input
                      type="text"
                      className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                      placeholder="Foni Agrovet Solutions Ltd"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">Business Unit</label>
                      <input
                        type="text"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="Foni Agrovet Pharmacy"
                        value={businessUnit}
                        onChange={(e) => setBusinessUnit(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">Tax ID</label>
                      <input
                        type="text"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="TIN Number"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">Registration Number</label>
                      <input
                        type="text"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="Company Registration Number"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">License Number</label>
                      <input
                        type="text"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="Professional License Number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-black text-[#09111f]">Website</label>
                    <input
                      type="url"
                      className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                      placeholder="https://www.example.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-[#09111f] mt-6 mb-4">Address</h3>
                  <div>
                    <label className="mb-1.5 block text-sm font-black text-[#09111f]">Street Address *</label>
                    <input
                      type="text"
                      className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                      placeholder="123 Main Street"
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">City *</label>
                      <input
                        type="text"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="Kigali"
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">State/Province</label>
                      <input
                        type="text"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="Gasabo"
                        value={addressState}
                        onChange={(e) => setAddressState(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">Country *</label>
                      <input
                        type="text"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        value={addressCountry}
                        onChange={(e) => setAddressCountry(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-black text-[#09111f]">Postal Code</label>
                      <input
                        type="text"
                        className="w-full h-12 rounded-xl border border-[#dcebf0] px-4 text-sm font-bold text-[#09111f] outline-none transition placeholder:text-[#9badbd] focus:border-[#0aa9ad] focus:ring-4 focus:ring-[#0aa9ad]/10"
                        placeholder="00000"
                        value={addressPostalCode}
                        onChange={(e) => setAddressPostalCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#09111f] mb-4">Review Your Information</h2>
                  <div className="space-y-4">
                    <div className="rounded-[1.6rem] border border-[#dcebf0] bg-[#f6fbfb] p-5">
                      <h3 className="font-bold text-[#09111f] mb-3">Organization Type</h3>
                      <div className="text-sm">
                        <span className="font-semibold text-[#5f6d84]">Type:</span> {facilityTypes.find(t => t.value === organizationType)?.label}
                      </div>
                    </div>
                    <div className="rounded-[1.6rem] border border-[#dcebf0] bg-[#f6fbfb] p-5">
                      <h3 className="font-bold text-[#09111f] mb-3">User Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div><span className="font-semibold text-[#5f6d84]">Name:</span> {firstName} {lastName}</div>
                        <div><span className="font-semibold text-[#5f6d84]">Email:</span> {email}</div>
                        {phone && <div><span className="font-semibold text-[#5f6d84]">Phone:</span> {phone}</div>}
                      </div>
                    </div>
                    <div className="rounded-[1.6rem] border border-[#dcebf0] bg-[#f6fbfb] p-5">
                      <h3 className="font-bold text-[#09111f] mb-3">Organization Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-semibold text-[#5f6d84]">Name:</span> {organizationName}
                        </div>
                        {businessUnit && <div><span className="font-semibold text-[#5f6d84]">Business Unit:</span> {businessUnit}</div>}
                        <div><span className="font-semibold text-[#5f6d84]">Address:</span> {addressStreet}, {addressCity}, {addressState}, {addressCountry}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 h-14 rounded-full border border-[#dcebf0] bg-white text-[#09111f] hover:bg-[#eef4f5] text-base font-black"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                )}
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className={`flex-1 h-14 rounded-full text-base font-black ${
                      currentStep > 1 ? "w-full" : "flex-1"
                    } bg-[#0aa9ad] text-white hover:bg-[#07969a] shadow-xl shadow-teal-500/20`}
                  >
                    Next
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 h-14 rounded-full bg-[#0aa9ad] text-white hover:bg-[#07969a] shadow-xl shadow-teal-500/20 text-base font-black"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                )}
              </div>

              <p className="mt-7 text-center text-sm font-semibold text-[#5f6d84]">
                Already have an account?{" "}
                <Link to="/login" className="font-black text-[#07969a] hover:text-[#056e72]">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
