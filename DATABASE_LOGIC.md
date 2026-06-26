
# Medicare One - Database & Tables Logic
A comprehensive guide to the Medicare One database schema, tables, and data flow.

---

## Table of Contents
1. [Overview](#overview)
2. [Core Database Tables](#core-database-tables)
3. [Auth & Security Tables](#auth--security-tables)
4. [Relationships & Data Flow](#relationships--data-flow)
5. [Enums](#enums)
6. [RBAC System](#rbac-system)
7. [Security & Audit](#security--audit)
8. [Key Feature Workflows](#key-feature-workflows)
9. [Key Workflows](#key-workflows)

---

## Overview

Medicare One is an enterprise hospital, clinic, and pharmacy management system built on **Supabase** (PostgreSQL). The database is designed to manage all aspects of healthcare operations, including:
- Patient management
- Appointments & visits
- Pharmacy & inventory
- Billing & finance
- Lab orders & results
- Staff & HR
- Security & auditing
- Multi-organization support
- Authentication (login/signup)
- Two-factor authentication (2FA)
- Trusted devices
- Recovery codes
- Subscription management

---

## Core Database Tables

### 1. Organizations
Manages healthcare facilities (hospitals, clinics, pharmacies, etc.)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | String | Organization name |
| `code` | String | Unique organization code |
| `type` | Enum (`org_type`) | Type: hospital, clinic, pharmacy, etc. |
| `license_number` | String | Facility license |
| `address_street/city/country` | String | Location |
| `phone` | String | Contact number |
| `email` | String | Contact email |
| `website` | String | Website URL |
| `logo_url` | String | Logo |
| `is_active` | Boolean | Active status |
| `settings` | JSON | Custom settings (timezone, currency, language, etc.) |
| `created_at` / `updated_at` | Timestamps | Audit fields |
| `deleted_at` | Timestamp | Soft delete |

### 2. User Roles
Assigns roles to users for RBAC

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Supabase Auth user ID |
| `role` | Enum (`app_role`) | User's role (doctor, nurse, pharmacist, etc.) |
| `organization_id` | UUID | Associated organization |
| `department_id` | UUID | Associated department |
| `granted_at` | Timestamp | When role was granted |
| `is_active` | Boolean | Active status |

### 3. Patients
Patient demographic and medical information

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Organization |
| `patient_code` | String | Unique patient code |
| `first_name` / `last_name` | String | Patient name |
| `date_of_birth` | Date | DOB |
| `gender` | String | Gender |
| `blood_type` | String | Blood group |
| `phone` / `email` | String | Contact info |
| `emergency_contact_name/phone` | String | Emergency contact |
| `insurance_provider/policy_number` | String | Insurance |
| `allergies` | String[] | Known allergies |
| `national_id` | String | National ID |
| `status` | Enum (`patient_status`) | Patient status |
| `avatar_url` | String | Avatar |
| `user_id` | UUID | Linked Supabase Auth user (if applicable) |
| `created_at` / `updated_at` / `deleted_at` | Timestamps | Audit fields |

### 4. Appointments
Scheduled appointments

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Organization |
| `patient_id` | UUID | Patient |
| `doctor_id` | UUID | Doctor |
| `department_id` | UUID | Department |
| `appointment_type` | String | Type (new, follow-up, emergency, etc.) |
| `scheduled_date` | Date | Date |
| `scheduled_time` | Time | Time |
| `duration_minutes` | Number | Duration |
| `status` | Enum (`appointment_status`) | Status (requested, confirmed, cancelled, etc.) |
| `chief_complaint` | String | Patient's complaint |
| `queue_number` | Number | Queue position |
| `notes` | String | Notes |
| `created_at` / `updated_at` | Timestamps | Audit fields |

### 5. Visits (Encounters)
Patient visits (inpatient, outpatient, emergency)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Organization |
| `patient_id` | UUID | Patient |
| `appointment_id` | UUID | Linked appointment (if any) |
| `visit_type` | String | Outpatient, inpatient, emergency, telemedicine |
| `department_id` | UUID | Department |
| `attending_doctor_id` | UUID | Doctor |
| `status` | Enum (`visit_status`) | Active, completed, discharged, etc. |
| `admitted_at` / `discharged_at` | Timestamps | Admission/discharge times |
| `diagnosis` | String | Diagnosis |
| `notes` | String | Visit notes |
| `discharge_summary` | String | Discharge summary |
| `created_at` / `updated_at` | Timestamps | Audit fields |

### 6. Visit Timeline
Tracks visit history/status changes

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `visit_id` | UUID | Linked visit |
| `status` | Enum (`visit_status`) | Status at this step |
| `label` | String | Step label (e.g., "Triage", "Treatment") |
| `detail` | String | Details |
| `occurred_at` | Timestamp | When it happened |
| `performed_by` | UUID | User who performed the action |

### 7. Prescriptions
Doctor-prescribed medications

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Organization |
| `patient_id` | UUID | Patient |
| `doctor_id` | UUID | Prescribing doctor |
| `visit_id` | UUID | Linked visit (if any) |
| `status` | String | Active, dispensed, cancelled, expired |
| `notes` | String | Prescription notes |
| `valid_until` | Date | Expiration date |
| `created_at` / `updated_at` | Timestamps | Audit fields |

### 8. Prescription Items
Individual medications in a prescription

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `prescription_id` | UUID | Linked prescription |
| `medication_name` | String | Medication name |
| `dosage` | String | Dosage |
| `frequency` | String | Frequency |
| `duration` | String | Duration |
| `quantity` | Number | Quantity |
| `instructions` | String | Instructions |
| `is_dispensed` | Boolean | Has it been dispensed? |

### 9. Medications
Medication catalog

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Organization |
| `name` | String | Medication name |
| `generic_name` | String | Generic name |
| `category` | String | Category |
| `dosage_form` | String | Form (tablet, syrup, etc.) |
| `strength` | String | Strength |
| `unit` | String | Unit |
| `requires_prescription` | Boolean | Prescription required? |
| `is_controlled` | Boolean | Controlled substance? |
| `created_at` / `updated_at` | Timestamps | Audit fields |

### 10. Inventory
Tracks medication and supply inventory

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Organization |
| `medication_id` | UUID | Linked medication (if applicable) |
| `item_name` | String | Item name |
| `category` | String | Category |
| `batch_number` | String | Batch number |
| `expiry_date` | Date | Expiry date |
| `quantity` | Number | Quantity in stock |
| `min_quantity` | Number | Reorder threshold |
| `unit_price` / `selling_price` | Number | Pricing |
| `location` | String | Storage location |
| `status` | String | In stock, low, out of stock, expiring soon |
| `created_at` / `updated_at` | Timestamps | Audit fields |

### 11. Lab Orders
Lab test orders

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Organization |
| `patient_id` | UUID | Patient |
| `visit_id` | UUID | Linked visit |
| `ordered_by` | UUID | Ordering user |
| `order_code` | String | Unique order code |
| `test_name` | String | Test name |
| `test_category` | String | Category |
| `specimen_type` | String | Specimen type |
| `priority` | String | Normal, urgent, stat |
| `status` | Enum (`lab_order_status`) | Ordered, in progress, completed, etc. |
| `results` | JSON | Test results |
| `notes` | String | Notes |
| `created_at` / `updated_at` | Timestamps | Audit fields |

### 12. Invoices
Billing invoices

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Organization |
| `patient_id` | UUID | Patient |
| `visit_id` | UUID | Linked visit |
| `invoice_number` | String | Unique invoice number |
| `subtotal` / `tax` / `discount` / `total` | Number | Pricing |
| `amount_paid` / `balance` | Number | Payment info |
| `status` | Enum (`billing_status`) | Draft, pending, paid, etc. |
| `due_date` | Date | Due date |
| `notes` | String | Notes |
| `created_at` / `updated_at` | Timestamps | Audit fields |

### 13. Departments
Hospital/clinic departments

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Organization |
| `name` / `code` | String | Department name & code |
| `head_id` | UUID | Department head |
| `is_active` | Boolean | Active status |
| `created_at` / `updated_at` | Timestamps | Audit fields |

### 14. Audit Logs
Tracks all system actions for audit/security

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Organization |
| `user_id` / `user_name` | String | User info |
| `action` | String | Action taken |
| `resource_type` / `resource_id` | String | What was affected |
| `details` | String | Details |
| `ip_address` | String | User IP |
| `risk_level` | String | Low, medium, high, critical |
| `created_at` | Timestamp | When it happened |

---

## Auth & Security Tables

These tables handle user authentication, two-factor authentication (2FA), trusted devices, and account recovery.

### 15. Profiles
Stores basic user profile information (extends Supabase Auth)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (matches Supabase Auth user ID) |
| `first_name` / `last_name` | String | User's name |
| `avatar_url` | String | Profile avatar |
| `phone` | String | Phone number |
| `is_active` | Boolean | Active status |
| `created_at` / `updated_at` | Timestamps | Audit fields |

### 16. User 2FA
Manages two-factor authentication settings

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Linked user |
| `factor_id` | String | Supabase Auth factor ID |
| `is_enabled` | Boolean | Is 2FA enabled? |
| `enrolled_at` | Timestamp | When 2FA was enrolled |
| `last_verified_at` | Timestamp | Last verification time |
| `created_at` / `updated_at` | Timestamps | Audit fields |

### 17. User Recovery Codes
Stores hashed recovery codes for account recovery

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Linked user |
| `code_hash` | String | Hashed recovery code (never store plain text!) |
| `used_at` | Timestamp | When code was used (null = unused) |
| `created_at` | Timestamp | Audit field |

### 18. Trusted Devices
Tracks devices that users trust for login

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Linked user |
| `device_hash` | String | Unique device identifier (hashed) |
| `device_label` | String | User-friendly device name |
| `expires_at` | Timestamp | When trust expires |
| `last_seen_at` | Timestamp | Last login from this device |
| `last_ip` | String | Last IP used with this device |
| `created_at` | Timestamp | Audit field |

### 19. Security Reminders
Tracks security-related reminders sent to users

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Linked organization |
| `recipient_user_id` | UUID | Recipient user |
| `recipient_email` | String | Recipient email |
| `sent_by` | UUID | Sender user |
| `reason` | String | Reason for reminder |
| `sent_at` | Timestamp | When sent |
| `created_at` | Timestamp | Audit field |

---

## Relationships & Data Flow
Here's how key tables relate:
1. **Organizations** → Parent of most tables (patients, appointments, visits, etc.)
2. **Users** → Linked to `user_roles` for role assignment
3. **Patients** → Linked to appointments, visits, prescriptions, invoices
4. **Appointments** → Can be linked to visits
5. **Visits** → Linked to prescriptions, lab orders, invoices, and visit timeline
6. **Prescriptions** → Have many prescription items, linked to visits
7. **Inventory** → Linked to medications

---

## Enums

### `app_role`
Roles available for users:
```
super_admin, org_owner, director, medical_director, admin, dept_head, doctor, nurse, receptionist, pharmacist, cashier, accountant, hr_manager, storekeeper, lab_technician, radiologist, ambulance_staff, case_manager, social_worker, counselor, legal_officer, insurance_officer, it_manager, patient, auditor, cfo, finance_manager, procurement_officer, warehouse_manager, biomedical_engineer, compliance_officer, billing_officer, ot_coordinator, ward_manager, quality_officer
```

### `appointment_status`
```
requested, confirmed, checked_in, waiting, in_progress, completed, cancelled, no_show, rescheduled
```

### `patient_status`
```
active, inactive, discharged, critical, follow_up, deceased
```

### `lab_order_status`
```
ordered, specimen_collected, in_progress, completed, verified, critical, cancelled
```

### `billing_status`
```
draft, pending, partial, paid, overdue, insurance_pending, refunded, waived
```

### `visit_status`
```
active, completed, transferred, discharged
```

### `org_type`
```
hospital, clinic, pharmacy, medical_center, diagnostic_center, specialist_center
```

---

## RBAC System
The system uses a comprehensive Role-Based Access Control system:
1. **Roles** are defined in the `app_role` enum
2. **Role Hierarchy**: Roles have a hierarchy (see `src/types/rbac.ts` for details)
3. **Permissions** are grouped by module (patients, appointments, pharmacy, billing, etc.)
4. **Default Permissions**: Each role has a set of default permissions
5. **Checking Permissions**: Use the `hasPermission()` helper function

---

## Security & Audit
1. **Supabase Auth**: Handles user authentication
2. **Audit Logs**: All key actions are logged in the `audit_logs` table
3. **Soft Deletes**: Many tables use `deleted_at` for soft deletion
4. **Trusted Devices**: Tracks trusted user devices
5. **2FA**: Supports two-factor authentication via `user_2fa` table
6. **Recovery Codes**: Stores recovery code hashes in `user_recovery_codes`

---

## Key Feature Workflows

### 1. Create Account (Sign Up)
The sign-up process uses Supabase Auth with custom profile data.

#### Steps:
1. User enters email, password, first name, last name
2. `supabase.auth.signUp()` is called with user data
3. Supabase creates a new Auth user
4. A new `profiles` record is created with the user's name
5. (Optional) Email verification is sent (depends on Supabase settings)
6. User is automatically signed in (or waits for verification)
7. Action is logged in `audit_logs`

#### Tables Involved:
- Supabase Auth (built-in)
- `profiles`
- `audit_logs`

#### Frontend Code Reference:
- `src/pages/RegisterPage.tsx`
- `src/hooks/useAuth.tsx` (signUp function)

---

### 2. Login
Login supports email/password authentication with optional 2FA.

#### Steps:
1. User enters email and password
2. `supabase.auth.signInWithPassword()` is called
3. If 2FA is enabled, user is prompted for 2FA code
4. If login is successful:
   - Session is stored in Supabase Auth
   - User's role is fetched from `user_roles`
   - `last_login` is (optionally) updated in profile
   - Login is logged in `audit_logs`
   - User is redirected to dashboard based on role

#### Tables Involved:
- Supabase Auth (built-in)
- `user_roles`
- `profiles`
- `audit_logs`
- `trusted_devices` (if applicable)

#### Frontend Code Reference:
- `src/pages/LoginPage.tsx`
- `src/hooks/useAuth.tsx` (signIn function)
- `src/components/auth/TwoFactorGate.tsx`
- `src/components/auth/MfaChallengeGate.tsx`

---

### 3. OTP / Two-Factor Authentication (2FA)
Adds an extra layer of security for logins.

#### Steps (Enrollment):
1. User goes to security settings
2. System generates a 2FA factor via Supabase Auth
3. QR code is displayed to user
4. User scans QR code with authenticator app
5. User enters verification code to confirm enrollment
6. `user_2fa` record is created/updated
7. Recovery codes are generated, hashed, and stored in `user_recovery_codes`
8. User is prompted to save recovery codes
9. Action is logged in `audit_logs`

#### Steps (Login with 2FA):
1. User enters email/password
2. After successful password, user is prompted for 2FA code
3. User enters code from authenticator app
4. System verifies code via Supabase Auth
5. If code is valid, user is logged in
6. `user_2fa.last_verified_at` is updated
7. (Optional) User is asked if they want to trust this device
8. Login is logged in `audit_logs`

#### Tables Involved:
- Supabase Auth (built-in)
- `user_2fa`
- `user_recovery_codes`
- `trusted_devices` (if applicable)
- `audit_logs`

#### Frontend Code Reference:
- `src/components/settings/TwoFactorSetup.tsx`
- `src/components/settings/RecoveryCodesSection.tsx`
- `src/components/auth/TwoFactorGate.tsx`
- `src/components/auth/MfaChallengeGate.tsx`

---

### 4. Recovery Codes
Used to recover an account if 2FA device is lost.

#### Steps (Generating Codes):
1. User enrolls in 2FA
2. System generates multiple recovery codes (usually 8-10)
3. Plain text codes are shown to user ONCE to save
4. Codes are hashed and stored in `user_recovery_codes` (never store plain text!)

#### Steps (Using a Recovery Code):
1. User is at login 2FA step
2. User clicks "Use recovery code"
3. User enters a recovery code
4. System looks up code hash in `user_recovery_codes`
5. If valid and unused:
   - User is logged in
   - `used_at` timestamp is set on the used code
   - User is prompted to generate new recovery codes
6. Action is logged in `audit_logs`

#### Tables Involved:
- `user_recovery_codes`
- `audit_logs`

---

### 5. Trusted Devices
Allows users to skip 2FA on trusted devices for convenience.

#### Steps (Adding a Trusted Device):
1. User logs in with 2FA
2. After successful login, user is asked "Trust this device?"
3. If yes:
   - Device information is collected and hashed
   - `trusted_devices` record is created with expiry date
   - Device is labeled (e.g., "John's Laptop")
4. Action is logged in `audit_logs`

#### Steps (Using a Trusted Device):
1. User logs in with email/password
2. System checks if device is in `trusted_devices` (and not expired)
3. If yes, 2FA step is skipped
4. `last_seen_at` and `last_ip` are updated in `trusted_devices`
5. User is logged in

#### Tables Involved:
- `trusted_devices`
- `audit_logs`

#### Frontend Code Reference:
- `src/components/settings/TrustedDevicesSection.tsx`

---

### 6. Subscription Management
(Note: Current schema doesn't have explicit subscription tables, but this is a common feature to add!)

#### Suggested Subscription Tables (If Adding):
| Table | Purpose |
|-------|---------|
| `subscriptions` | Tracks user/organization subscriptions |
| `subscription_plans` | Available plans (free, basic, premium, etc.) |
| `invoices` (already exists) | Can be linked to subscriptions for billing |

#### Suggested Subscription Workflow:
1. User selects a subscription plan
2. Payment is processed (via Stripe, PayPal, etc.)
3. `subscriptions` record is created with start/end dates
4. Organization features are updated based on plan
5. Renewal reminders are sent as expiration approaches
6. Action is logged in `audit_logs`

---

### 7. Password Reset
Allows users to reset forgotten passwords.

#### Steps:
1. User clicks "Forgot password?" on login page
2. User enters their email
3. `supabase.auth.resetPasswordForEmail()` is called
4. Supabase sends a password reset email
5. User clicks link in email
6. User enters new password
7. Password is updated in Supabase Auth
8. Action is logged in `audit_logs`

#### Tables Involved:
- Supabase Auth (built-in)
- `audit_logs`

---

### 8. Profile Management
Allows users to update their profile information.

#### Steps:
1. User goes to profile settings
2. User updates information (name, avatar, phone, etc.)
3. `profiles` record is updated
4. Action is logged in `audit_logs`

#### Tables Involved:
- `profiles`
- `audit_logs`

#### Frontend Code Reference:
- `src/components/settings/ProfileSection.tsx`

---

## Key Workflows

### Patient Visit Flow
1. **Appointment** scheduled (if not emergency)
2. Patient checks in, appointment status updates
3. **Visit** created
4. Doctor adds notes, diagnosis
5. **Lab Orders** created (if needed)
6. **Prescription** created (if needed)
7. **Invoice** generated
8. Visit completes, patient discharged

### Prescription Dispensing Flow
1. Doctor creates **Prescription** with items
2. Pharmacist reviews prescription
3. Pharmacist checks **Inventory** for medications
4. Pharmacist marks items as dispensed
5. Prescription status updated
6. Invoice created (if applicable)

---

## Database Functions
The database includes several helper functions:
- `get_user_org_id`: Get user's organization ID
- `has_role`: Check if user has a specific role
- `is_org_admin`: Check if user is an organization admin
- `log_security_event`: Log security-related events
- `role_rank`: Get rank of a role (for hierarchy checks)
- `max_active_role_rank`: Get highest role rank for a user

---

## How to Work with This
1. **Supabase Client**: Use `src/integrations/supabase/client.ts`
2. **Type Safety**: Use types from `src/integrations/supabase/types.ts` and `src/types/`
3. **Auth**: Use `useAuth` hook from `src/hooks/useAuth.tsx` for user state and role checks
4. **Permissions**: Use `hasPermission` function from `src/types/rbac.ts`
