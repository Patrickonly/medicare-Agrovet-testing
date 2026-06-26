
# Medicare One HMS — Complete Database Tables Guide

This document contains the complete database schema for Medicare One Hospital Management System.

---

## 1. Core System Tables

### 1.1 Organizations (`organizations`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | VARCHAR/UUID   | PRIMARY KEY                          | Unique organization identifier        |
| `name`            | VARCHAR(255)   | NOT NULL                             | Organization name                     |
| `type`            | VARCHAR(50)    | NOT NULL, CHECK (type IN (...))      | Type of organization                 |
| `code`            | VARCHAR(50)    | UNIQUE, NOT NULL                     | Short organization code               |
| `license_number`  | VARCHAR(255)   | NULLABLE                             | License number                        |
| `accreditation`   | VARCHAR(255)   | NULLABLE                             | Accreditation details                 |
| `street`          | VARCHAR(255)   | NOT NULL                             | Address line 1                        |
| `city`            | VARCHAR(100)   | NOT NULL                             | City                                  |
| `state`           | VARCHAR(100)   | NULLABLE                             | State/province                        |
| `country`         | VARCHAR(100)   | NOT NULL                             | Country                               |
| `postal_code`     | VARCHAR(20)    | NULLABLE                             | Postal/ZIP code                       |
| `latitude`        | DECIMAL(10,8)  | NULLABLE                             | GPS latitude                          |
| `longitude`       | DECIMAL(11,8)  | NULLABLE                             | GPS longitude                         |
| `phone`           | VARCHAR(50)    | NOT NULL                             | Phone number                          |
| `email`           | VARCHAR(255)   | NOT NULL                             | Email address                         |
| `website`         | VARCHAR(255)   | NULLABLE                             | Website URL                           |
| `logo_url`        | VARCHAR(500)   | NULLABLE                             | Logo URL                              |
| `is_active`       | BOOLEAN        | DEFAULT TRUE                         | Is organization active?               |
| `subscription_plan` | VARCHAR(50)  | NULLABLE                             | Subscription tier                     |
| `timezone`        | VARCHAR(100)   | NOT NULL DEFAULT 'UTC'               | Timezone setting                      |
| `currency`        | VARCHAR(10)    | NOT NULL DEFAULT 'USD'               | Default currency                      |
| `language`        | VARCHAR(10)    | NOT NULL DEFAULT 'en'                | Default language                      |
| `modules_enabled` | JSONB/TEXT     | NULLABLE                             | Array of enabled modules              |
| `brand_primary_color` | VARCHAR(20) | NULLABLE                             | Primary brand color                   |
| `brand_secondary_color` | VARCHAR(20)| NULLABLE                            | Secondary brand color                 |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Creation timestamp                    |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Last update timestamp                 |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deletion timestamp                    |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | User who created this org             |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | User who last updated this org        |

#### Valid Organization Types
```sql
organization_type ENUM (
  'hospital', 'clinic', 'pharmacy', 'agrovet',
  'medical_center', 'diagnostic_center',
  'specialist_center'
)
```
- `agrovet`: For agricultural/ veterinary pharmacy
- `pharmacy`: Retail or hospital pharmacy
- `hospital`: Full hospital
- Etc.

---

### 1.2 Users (`users`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Unique user ID                        |
| `first_name`      | VARCHAR(100)   | NOT NULL                             | First name                            |
| `last_name`       | VARCHAR(100)   | NOT NULL                             | Last name                             |
| `email`           | VARCHAR(255)   | UNIQUE                               | Email address                         |
| `phone`           | VARCHAR(50)    | NULLABLE                             | Phone number                          |
| `avatar_url`      | VARCHAR(500)   | NULLABLE                             | Avatar/profile picture URL            |
| `password_hash`   | VARCHAR(255)   | NOT NULL                             | Hashed password (bcrypt)              |
| `is_active`       | BOOLEAN        | DEFAULT TRUE                         | Is user account active?               |
| `last_login`      | TIMESTAMP      | NULLABLE                             | Last login timestamp                  |
| `organization_id` | UUID/VARCHAR   | FOREIGN KEY (organizations.id)       | Associated organization               |
| `department_id`   | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (departments.id) | Home department                     |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Last updated at                       |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

### 1.3 Roles (`roles`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | VARCHAR(100)   | PRIMARY KEY                          | Role ID (eg "org_owner", "admin")     |
| `name`            | VARCHAR(100)   | UNIQUE, NOT NULL                     | Role internal name                    |
| `display_name`    | VARCHAR(255)   | NOT NULL                             | Human-readable role name              |
| `description`     | TEXT           | NULLABLE                             | Role description                      |
| `is_default`      | BOOLEAN        | DEFAULT FALSE                        | Is this a default system role?        |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |

---

### 1.4 User Roles (`user_roles`) (Many-to-Many)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Join ID                               |
| `user_id`         | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (users.id)     | User                                  |
| `role_id`         | VARCHAR(100)   | NOT NULL, FOREIGN KEY (roles.id)     | Role                                  |
| `organization_id` | UUID/VARCHAR   | FOREIGN KEY (organizations.id)       | For multi-tenant support              |
| `department_id`   | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (departments.id) | Department scope for role          |
| `granted_by`      | UUID/VARCHAR   | FOREIGN KEY (users.id)               | Who granted the role                  |
| `granted_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | When granted                          |
| `expires_at`      | TIMESTAMP      | NULLABLE                             | Role expiration time                  |
| `is_active`       | BOOLEAN        | DEFAULT TRUE                         | Is this role assignment active?       |

---

### 1.5 Permissions (`permissions`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | VARCHAR(100)   | PRIMARY KEY                          | Permission ID (eg "patients.view")    |
| `module`          | VARCHAR(100)   | NOT NULL                             | Feature module (eg "patients")        |
| `action`          | VARCHAR(50)    | NOT NULL                             | Action (eg "view", "manage")          |
| `display_name`    | VARCHAR(255)   | NOT NULL                             | Human-readable name                   |
| `description`     | TEXT           | NULLABLE                             | Permission description                |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |

---

### 1.6 Role Permissions (`role_permissions`) (Many-to-Many)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Join ID                               |
| `role_id`         | VARCHAR(100)   | NOT NULL, FOREIGN KEY (roles.id)     | Role                                  |
| `permission_id`   | VARCHAR(100)   | NOT NULL, FOREIGN KEY (permissions.id) | Permission                          |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |

---

## 2. Hospital & Clinic Tables

### 2.1 Departments (`departments`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Department ID                         |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `name`            | VARCHAR(255)   | NOT NULL                             | Department name                       |
| `code`            | VARCHAR(20)    | NOT NULL                             | Department code (eg "CARD", "ORTH")   |
| `description`     | TEXT           | NULLABLE                             | Description                           |
| `head_id`         | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Department head user                  |
| `is_active`       | BOOLEAN        | DEFAULT TRUE                         | Is active?                            |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

### 2.2 Wards (`wards`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Ward ID                               |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `name`            | VARCHAR(255)   | NOT NULL                             | Ward name                             |
| `category`        | VARCHAR(50)    | NOT NULL                             | Category (general, icu, pediatric, etc) |
| `floor`           | VARCHAR(50)    | NULLABLE                             | Floor number/name                     |
| `total_beds`      | INTEGER        | NOT NULL DEFAULT 0                   | Total number of beds                  |
| `occupied_beds`   | INTEGER        | NOT NULL DEFAULT 0                   | Occupied beds                         |
| `available_beds`  | INTEGER        | NOT NULL DEFAULT 0                   | Available beds                        |
| `nurse_station`   | VARCHAR(255)   | NULLABLE                             | Nurse station info                    |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

#### Valid Ward Categories
```
general, icu, pediatric, maternity, surgical, isolation, nicu, psychiatric
```

---

### 2.3 Beds (`beds`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Bed ID                                |
| `ward_id`         | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (wards.id)     | Ward                                  |
| `bed_number`      | VARCHAR(50)    | NOT NULL                             | Bed number (e.g., A-01)               |
| `status`          | VARCHAR(50)    | NOT NULL                             | available, occupied, maintenance, reserved |
| `patient_id`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (patients.id)  | Assigned patient                      |
| `admission_date`  | TIMESTAMP      | NULLABLE                             | Admission timestamp                   |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |

---

## 3. Patient Management Tables

### 3.1 Patients (`patients`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Patient ID                            |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `patient_code`    | VARCHAR(100)   | UNIQUE, NOT NULL                     | Patient unique code (PT-XXXX)         |
| `first_name`      | VARCHAR(100)   | NOT NULL                             | First name                            |
| `last_name`       | VARCHAR(100)   | NOT NULL                             | Last name                             |
| `date_of_birth`   | DATE           | NOT NULL                             | Date of birth                         |
| `gender`          | VARCHAR(20)    | NOT NULL                             | male, female, other                   |
| `blood_type`      | VARCHAR(5)     | NULLABLE                             | A+, A-, B+, B-, O+, O-, AB+, AB-      |
| `phone`           | VARCHAR(50)    | NOT NULL                             | Phone number                          |
| `email`           | VARCHAR(255)   | NULLABLE                             | Email address                         |
| `national_id`     | VARCHAR(100)   | NULLABLE                             | National ID number                    |
| `street`          | VARCHAR(255)   | NULLABLE                             | Address line 1                        |
| `city`            | VARCHAR(100)   | NULLABLE                             | City                                  |
| `state`           | VARCHAR(100)   | NULLABLE                             | State/province                        |
| `country`         | VARCHAR(100)   | NULLABLE                             | Country                               |
| `postal_code`     | VARCHAR(20)    | NULLABLE                             | ZIP/postal code                       |
| `emergency_contact_name` | VARCHAR(255) | NULLABLE                        | Emergency contact name                |
| `emergency_contact_relationship` | VARCHAR(100) | NULLABLE                | Relationship                          |
| `emergency_contact_phone` | VARCHAR(50) | NULLABLE                        | Phone number                          |
| `insurance_provider` | VARCHAR(255) | NULLABLE                          | Insurance provider                    |
| `insurance_policy_number` | VARCHAR(100) | NULLABLE                    | Policy number                         |
| `insurance_coverage_type` | VARCHAR(100) | NULLABLE                      | Coverage type                         |
| `insurance_valid_until` | DATE | NULLABLE                              | Valid until                           |
| `allergies`       | TEXT[]/JSON    | NULLABLE                             | Array of allergies                    |
| `status`          | VARCHAR(50)    | NOT NULL DEFAULT 'active'            | active, inactive, discharged, critical, follow_up, deceased |
| `avatar_url`      | VARCHAR(500)   | NULLABLE                             | Patient avatar                        |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

### 3.2 Medical Records (`medical_records`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Record ID                             |
| `patient_id`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (patients.id)  | Patient ID                            |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `visit_id`        | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (visits.id)    | Visit ID (if any)                     |
| `record_type`     | VARCHAR(50)    | NOT NULL                             | consultation, lab_result, imaging, prescription, procedure, note |
| `title`           | VARCHAR(255)   | NOT NULL                             | Record title                          |
| `content`         | TEXT           | NOT NULL                             | Record content                        |
| `attachments`     | TEXT[]/JSON    | NULLABLE                             | Array of URLs                         |
| `is_confidential` | BOOLEAN        | DEFAULT FALSE                        | Is confidential (requires special permission) |
| `signed_by`       | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Signed by doctor/user                 |
| `signed_at`       | TIMESTAMP      | NULLABLE                             | Signed at                             |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

### 3.3 Vital Signs (`vital_signs`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Vital ID                              |
| `patient_id`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (patients.id)  | Patient ID                            |
| `visit_id`        | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (visits.id)    | Visit ID                              |
| `recorded_by`     | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (users.id)     | Recorded by                           |
| `recorded_at`     | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Recorded at                           |
| `temperature`     | DECIMAL(5,2)   | NULLABLE                             | Body temperature in °C                |
| `blood_pressure_systolic` | INTEGER | NULLABLE                          | Systolic BP (mmHg)                    |
| `blood_pressure_diastolic` | INTEGER | NULLABLE                          | Diastolic BP (mmHg)                   |
| `heart_rate`      | INTEGER        | NULLABLE                             | Heart rate (BPM)                      |
| `respiratory_rate` | INTEGER       | NULLABLE                             | Respiratory rate                      |
| `oxygen_saturation` | INTEGER      | NULLABLE                             | SpO2 (%)                              |
| `weight`          | DECIMAL(5,2)   | NULLABLE                             | Weight in kg                          |
| `height`          | DECIMAL(5,2)   | NULLABLE                             | Height in cm                          |
| `bmi`             | DECIMAL(5,2)   | NULLABLE                             | Calculated BMI                        |
| `notes`           | TEXT           | NULLABLE                             | Notes                                 |

---

## 4. Appointments & Visits

### 4.1 Appointments (`appointments`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Appointment ID                        |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `patient_id`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (patients.id)  | Patient ID                            |
| `doctor_id`       | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (users.id)     | Doctor user ID                        |
| `department_id`   | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (departments.id) | Department ID                     |
| `appointment_type` | VARCHAR(50)   | NOT NULL                             | new_visit, follow_up, consultation, emergency, telemedicine, vaccination, procedure |
| `scheduled_date`  | DATE           | NOT NULL                             | Scheduled date                        |
| `scheduled_time`  | TIME           | NOT NULL                             | Scheduled time                        |
| `duration_minutes` | INTEGER      | NOT NULL DEFAULT 30                   | Duration in minutes                   |
| `status`          | VARCHAR(50)    | NOT NULL DEFAULT 'requested'         | requested, confirmed, checked_in, waiting, in_progress, completed, cancelled, no_show, rescheduled |
| `chief_complaint` | TEXT           | NULLABLE                             | Reason for appointment                |
| `notes`           | TEXT           | NULLABLE                             | Additional notes                      |
| `queue_number`    | INTEGER        | NULLABLE                             | Queue number                          |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

### 4.2 Visits (`visits`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Visit ID                              |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `patient_id`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (patients.id)  | Patient ID                            |
| `appointment_id`  | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (appointments.id) | Appointment ID                     |
| `visit_type`      | VARCHAR(50)    | NOT NULL                             | outpatient, inpatient, emergency, telemedicine |
| `department_id`   | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (departments.id) | Department ID                     |
| `attending_doctor_id` | UUID/VARCHAR | NOT NULL, FOREIGN KEY (users.id)   | Attending doctor                      |
| `admission_date`  | TIMESTAMP      | NULLABLE                             | Admission timestamp                   |
| `discharge_date`  | TIMESTAMP      | NULLABLE                             | Discharge timestamp                   |
| `status`          | VARCHAR(50)    | NOT NULL DEFAULT 'active'            | active, completed, transferred, discharged |
| `diagnoses`       | JSONB/TEXT     | NULLABLE                             | Array of diagnoses                    |
| `notes`           | TEXT           | NULLABLE                             | Notes                                 |
| `discharge_summary` | TEXT          | NULLABLE                             | Discharge summary                     |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

#### Example Diagnosis JSON
```json
[
  {
    "code": "J45",
    "description": "Asthma",
    "type": "primary",
    "notes": "Moderate persistent"
  }
]
```

---

## 5. Pharmacy & Inventory (Including Agrovet)

### 5.1 Medications/Products (`medications`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Medication/Product ID                 |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `name`            | VARCHAR(255)   | NOT NULL                             | Product name                          |
| `generic_name`    | VARCHAR(255)   | NULLABLE                             | Generic name (for meds)               |
| `category`        | VARCHAR(100)   | NOT NULL                             | Category (Antibiotics, Analgesics, Agrovet-Feed, etc.) |
| `dosage_form`     | VARCHAR(100)   | NULLABLE                             | Tablet, Injection, Syrup, etc.        |
| `strength`        | VARCHAR(100)   | NULLABLE                             | 500mg, 100mg/ml, etc.                 |
| `unit`            | VARCHAR(50)    | NOT NULL                             | Unit (tablets, ml, kg, liters)        |
| `manufacturer`    | VARCHAR(255)   | NULLABLE                             | Manufacturer                          |
| `barcode`         | VARCHAR(100)   | NULLABLE                             | Barcode for scanning                  |
| `requires_prescription` | BOOLEAN   | DEFAULT FALSE                        | Requires prescription? (meds only)    |
| `is_controlled`   | BOOLEAN        | DEFAULT FALSE                        | Controlled substance?                 |
| `contraindications` | TEXT[]/JSON | NULLABLE                            | List of contraindications             |
| `interactions`    | TEXT[]/JSON    | NULLABLE                             | Drug interactions                     |
| `is_active`       | BOOLEAN        | DEFAULT TRUE                         | Is product active for sale?           |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

### 5.2 Inventory Items (`inventory_items`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Inventory item batch ID               |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `medication_id`   | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (medications.id) | Product/medication ID              |
| `item_name`       | VARCHAR(255)   | NOT NULL                             | Item name (redundant but for safety)  |
| `category`        | VARCHAR(100)   | NOT NULL                             | Category                              |
| `batch_number`    | VARCHAR(100)   | NULLABLE                             | Batch/lot number                      |
| `expiry_date`     | DATE           | NULLABLE                             | Expiry date                           |
| `quantity`        | DECIMAL(12,2)  | NOT NULL DEFAULT 0                   | Current quantity                      |
| `min_quantity`    | DECIMAL(12,2)  | NOT NULL DEFAULT 0                   | Minimum quantity alert level          |
| `max_quantity`    | DECIMAL(12,2)  | NULLABLE                             | Maximum quantity                      |
| `unit_price`      | DECIMAL(12,2)  | NOT NULL                             | Purchase price per unit               |
| `selling_price`   | DECIMAL(12,2)  | NOT NULL                             | Selling price per unit                |
| `supplier_id`     | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (suppliers.id) | Supplier                              |
| `location`        | VARCHAR(255)   | NULLABLE                             | Storage location (Shelf A1, etc.)     |
| `status`          | VARCHAR(50)    | NOT NULL                             | in_stock, low_stock, critical, out_of_stock, expiring_soon |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

### 5.3 Suppliers (`suppliers`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Supplier ID                           |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `name`            | VARCHAR(255)   | NOT NULL                             | Supplier name                         |
| `contact_person`  | VARCHAR(255)   | NULLABLE                             | Contact person                        |
| `phone`           | VARCHAR(50)    | NULLABLE                             | Phone number                          |
| `email`           | VARCHAR(255)   | NULLABLE                             | Email address                         |
| `address`         | TEXT           | NULLABLE                             | Address                               |
| `is_active`       | BOOLEAN        | DEFAULT TRUE                         | Is active?                            |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |

---

### 5.4 Prescriptions (`prescriptions`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Prescription ID                       |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `patient_id`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (patients.id)  | Patient ID                            |
| `visit_id`        | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (visits.id)    | Visit ID                              |
| `doctor_id`       | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (users.id)     | Doctor ID                             |
| `notes`           | TEXT           | NULLABLE                             | General notes                         |
| `status`          | VARCHAR(50)    | NOT NULL DEFAULT 'active'            | active, dispensed, partially_dispensed, cancelled, expired |
| `valid_until`     | DATE           | NOT NULL                             | Expiry date                           |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

### 5.5 Prescription Items (`prescription_items`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Item ID                               |
| `prescription_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (prescriptions.id) | Prescription ID                   |
| `medication_id`   | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (medications.id) | Medication ID                    |
| `medication_name` | VARCHAR(255)   | NOT NULL                             | Medication name                       |
| `dosage`          | VARCHAR(255)   | NOT NULL                             | Dosage (e.g., "500mg")                |
| `frequency`       | VARCHAR(255)   | NOT NULL                             | Frequency (e.g., "3x daily")          |
| `duration`        | VARCHAR(255)   | NULLABLE                             | Duration (e.g., "7 days")             |
| `quantity`        | INTEGER        | NOT NULL                             | Quantity prescribed                   |
| `instructions`    | TEXT           | NULLABLE                             | Additional instructions               |
| `is_dispensed`    | BOOLEAN        | DEFAULT FALSE                        | Has this item been dispensed?         |
| `dispensed_at`    | TIMESTAMP      | NULLABLE                             | When dispensed                        |
| `dispensed_by`    | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Who dispensed it                      |

---

## 6. Lab & Diagnostics

### 6.1 Lab Orders (`lab_orders`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Lab order ID                          |
| `order_code`      | VARCHAR(100)   | UNIQUE, NOT NULL                     | Order code (LAB-XXXX)                 |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `patient_id`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (patients.id)  | Patient ID                            |
| `visit_id`        | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (visits.id)    | Visit ID                              |
| `ordered_by`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (users.id)     | Who ordered this                      |
| `test_name`       | VARCHAR(255)   | NOT NULL                             | Test name                             |
| `test_category`   | VARCHAR(100)   | NOT NULL                             | Category (Hematology, Radiology, etc.) |
| `priority`        | VARCHAR(50)    | NOT NULL DEFAULT 'normal'            | normal, urgent, stat                  |
| `status`          | VARCHAR(50)    | NOT NULL DEFAULT 'ordered'           | ordered, specimen_collected, in_progress, completed, verified, critical, cancelled |
| `specimen_type`   | VARCHAR(100)   | NULLABLE                             | Specimen type (Blood, Urine, etc.)    |
| `specimen_collected_at` | TIMESTAMP | NULLABLE                            | When specimen was collected           |
| `specimen_collected_by` | UUID/VARCHAR | NULLABLE, FOREIGN KEY (users.id) | Who collected it                      |
| `results`         | JSONB/TEXT     | NULLABLE                             | Lab results data                      |
| `turnaround_hours` | INTEGER       | NULLABLE                             | Expected turnaround time in hours     |
| `notes`           | TEXT           | NULLABLE                             | Notes                                 |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

#### Example Results JSON
```json
[
  {
    "parameter": "Hemoglobin",
    "value": "14.5",
    "unit": "g/dL",
    "reference_range": "12 - 17",
    "is_abnormal": false
  }
]
```

---

## 7. Billing & Finance

### 7.1 Invoices (`invoices`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Invoice ID                            |
| `invoice_number`  | VARCHAR(100)   | UNIQUE, NOT NULL                     | Invoice number (INV-XXXX)             |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `patient_id`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (patients.id)  | Patient ID                            |
| `visit_id`        | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (visits.id)    | Visit ID                              |
| `subtotal`        | DECIMAL(12,2)  | NOT NULL                             | Subtotal before tax/discount          |
| `tax`             | DECIMAL(12,2)  | NOT NULL DEFAULT 0                   | Tax amount                            |
| `discount`        | DECIMAL(12,2)  | NOT NULL DEFAULT 0                   | Discount amount                       |
| `total`           | DECIMAL(12,2)  | NOT NULL                             | Total amount due                      |
| `amount_paid`     | DECIMAL(12,2)  | NOT NULL DEFAULT 0                   | Amount paid so far                    |
| `balance`         | DECIMAL(12,2)  | NOT NULL                             | Remaining balance                     |
| `status`          | VARCHAR(50)    | NOT NULL DEFAULT 'draft'             | draft, pending, partial, paid, overdue, insurance_pending, refunded, waived |
| `due_date`        | DATE           | NULLABLE                             | Due date                              |
| `payment_method`  | VARCHAR(100)   | NULLABLE                             | Payment method used                   |
| `insurance_claim_id` | UUID/VARCHAR | NULLABLE, FOREIGN KEY (insurance_claims.id) | Insurance claim (if any)     |
| `notes`           | TEXT           | NULLABLE                             | Notes                                 |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

### 7.2 Invoice Items (`invoice_items`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Item ID                               |
| `invoice_id`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (invoices.id)  | Invoice ID                            |
| `description`     | VARCHAR(255)   | NOT NULL                             | Item description                      |
| `category`        | VARCHAR(50)    | NOT NULL                             | consultation, lab, imaging, pharmacy, procedure, room, other |
| `quantity`        | DECIMAL(10,2)  | NOT NULL DEFAULT 1                   | Quantity                              |
| `unit_price`      | DECIMAL(12,2)  | NOT NULL                             | Price per unit                        |
| `total`           | DECIMAL(12,2)  | NOT NULL                             | Line total                            |

---

### 7.3 Insurance Claims (`insurance_claims`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Claim ID                              |
| `claim_number`    | VARCHAR(100)   | UNIQUE, NOT NULL                     | Claim number                          |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `patient_id`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (patients.id)  | Patient ID                            |
| `invoice_id`      | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (invoices.id)  | Invoice ID                            |
| `insurer_id`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (insurers.id)  | Insurer ID (if stored)                |
| `insurer_name`    | VARCHAR(255)   | NULLABLE                             | Insurer name                          |
| `amount_claimed`  | DECIMAL(12,2)  | NOT NULL                             | Amount claimed from insurer           |
| `amount_approved` | DECIMAL(12,2)  | NULLABLE                             | Amount approved by insurer            |
| `status`          | VARCHAR(50)    | NOT NULL DEFAULT 'submitted'         | submitted, under_review, approved, rejected, resubmitted, paid |
| `submitted_at`    | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Submitted at                          |
| `responded_at`    | TIMESTAMP      | NULLABLE                             | Response date                         |
| `rejection_reason` | TEXT         | NULLABLE                             | Reason if rejected                    |
| `notes`           | TEXT           | NULLABLE                             | Notes                                 |

---

## 8. Emergency Management

### 8.1 Emergency Cases (`emergency_cases`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Case ID                               |
| `case_code`       | VARCHAR(100)   | UNIQUE, NOT NULL                     | Case code (EM-XXXX)                   |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `patient_id`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (patients.id)  | Patient ID (if registered)            |
| `patient_name`    | VARCHAR(255)   | NOT NULL                             | Patient name (for walk-ins)           |
| `age`             | INTEGER        | NULLABLE                             | Age                                   |
| `gender`          | VARCHAR(20)    | NULLABLE                             | Gender                                |
| `triage_level`    | VARCHAR(20)    | NOT NULL                             | red, orange, yellow, green, blue      |
| `chief_complaint` | TEXT           | NOT NULL                             | Reason for emergency                  |
| `arrival_mode`    | VARCHAR(50)    | NOT NULL                             | walk_in, ambulance, referral, police  |
| `arrival_time`    | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Arrival time                          |
| `assigned_doctor_id` | UUID/VARCHAR | NULLABLE, FOREIGN KEY (users.id)   | Assigned doctor                       |
| `status`          | VARCHAR(50)    | NOT NULL DEFAULT 'triage'            | triage, assessment, treatment, observation, admitted, discharged, transferred, deceased |
| `vital_signs`     | JSONB/TEXT     | NULLABLE                             | Vital signs data                      |
| `notes`           | TEXT           | NULLABLE                             | Notes                                 |
| `disposition`     | TEXT           | NULLABLE                             | Disposition details                   |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

## 9. Audit & Security

### 9.1 Audit Logs (`audit_logs`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Log ID                                |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `user_id`         | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | User ID who performed action         |
| `user_name`       | VARCHAR(255)   | NOT NULL                             | User name at the time                 |
| `action`          | VARCHAR(255)   | NOT NULL                             | Action taken (view, edit, delete, login, etc.) |
| `resource_type`   | VARCHAR(100)   | NOT NULL                             | Type of resource (patient, user, etc.) |
| `resource_id`     | UUID/VARCHAR   | NULLABLE                             | Resource ID                           |
| `details`         | TEXT           | NULLABLE                             | Additional details                    |
| `ip_address`      | VARCHAR(50)    | NULLABLE                             | IP address                            |
| `user_agent`      | VARCHAR(500)   | NULLABLE                             | Browser/device info                   |
| `risk_level`      | VARCHAR(20)    | NOT NULL DEFAULT 'low'               | low, medium, high, critical           |
| `timestamp`       | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Timestamp                             |

---

## 10. Notifications

### 10.1 Notifications (`notifications`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Notification ID                       |
| `user_id`         | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (users.id)     | Recipient user ID                     |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `title`           | VARCHAR(255)   | NOT NULL                             | Notification title                    |
| `message`         | TEXT           | NOT NULL                             | Notification message                  |
| `type`            | VARCHAR(50)    | NOT NULL                             | info, success, warning, danger        |
| `category`        | VARCHAR(50)    | NOT NULL                             | appointment, lab, pharmacy, billing, emergency, system, security |
| `is_read`         | BOOLEAN        | NOT NULL DEFAULT FALSE               | Has been read?                        |
| `action_url`      | VARCHAR(500)   | NULLABLE                             | URL to open when clicked              |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |

---

## 11. Staff & HR

### 11.1 Staff Members (`staff`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Staff ID                              |
| `user_id`         | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (users.id)     | Linked user ID                        |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `department_id`   | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (departments.id) | Department ID                     |
| `employee_code`   | VARCHAR(100)   | UNIQUE, NOT NULL                     | Employee code (EMP-XXXX)              |
| `job_title`       | VARCHAR(255)   | NOT NULL                             | Job title                             |
| `contract_type`   | VARCHAR(50)    | NOT NULL                             | permanent, contract, temporary, intern |
| `hire_date`       | DATE           | NOT NULL                             | Hire date                             |
| `shift`           | VARCHAR(100)   | NULLABLE                             | Shift (Day, Night, etc.)              |
| `salary`          | DECIMAL(12,2)  | NULLABLE                             | Salary (optional, sensitive)          |
| `status`          | VARCHAR(50)    | NOT NULL DEFAULT 'on_duty'           | on_duty, off_duty, on_leave, suspended, terminated |
| `qualifications`  | TEXT[]/JSON    | NULLABLE                             | Array of qualifications               |
| `licenses`        | JSONB/TEXT     | NULLABLE                             | Array of license objects              |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

#### Example License JSON
```json
[
  {
    "type": "Medical License",
    "number": "LIC-12345",
    "issued_by": "Medical Board",
    "valid_until": "2030-12-31"
  }
]
```

---

## 12. One-Stop Center (For GBV/Protection Cases)

### 12.1 One-Stop Cases (`one_stop_cases`)
| Column Name       | Data Type      | Constraints                          | Description                           |
|-------------------|----------------|--------------------------------------|---------------------------------------|
| `id`              | UUID/VARCHAR   | PRIMARY KEY                          | Case ID                               |
| `case_code`       | VARCHAR(100)   | UNIQUE, NOT NULL                     | Case code (OSC-XXXX)                  |
| `organization_id` | UUID/VARCHAR   | NOT NULL, FOREIGN KEY (organizations.id) | Organization ID                   |
| `client_code`     | VARCHAR(255)   | NOT NULL DEFAULT 'Confidential'      | Anonymous client code for confidentiality |
| `age`             | INTEGER        | NULLABLE                             | Age                                   |
| `gender`          | VARCHAR(20)    | NULLABLE                             | Gender                                |
| `case_type`       | VARCHAR(255)   | NOT NULL                             | GBV, Child Protection, etc.           |
| `priority`        | VARCHAR(50)    | NOT NULL DEFAULT 'medium'            | critical, high, medium, low           |
| `status`          | VARCHAR(50)    | NOT NULL DEFAULT 'active'            | active, follow_up, closed, escalated, referred |
| `assigned_team`   | JSONB/TEXT     | NULLABLE                             | Array of team members                 |
| `medical_notes`   | TEXT           | NULLABLE                             | Confidential medical notes            |
| `counseling_notes` | TEXT          | NULLABLE                             | Confidential counseling notes         |
| `legal_notes`     | TEXT           | NULLABLE                             | Confidential legal notes              |
| `social_notes`    | TEXT           | NULLABLE                             | Confidential social worker notes      |
| `protection_plan` | TEXT           | NULLABLE                             | Protection plan                       |
| `referrals`       | JSONB/TEXT     | NULLABLE                             | Array of referrals                    |
| `follow_up_date`  | DATE           | NULLABLE                             | Follow up date                        |
| `is_confidential` | BOOLEAN        | DEFAULT TRUE                         | Is this case strictly confidential?   |
| `created_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Created at                            |
| `updated_at`      | TIMESTAMP      | NOT NULL DEFAULT CURRENT_TIMESTAMP   | Updated at                            |
| `deleted_at`      | TIMESTAMP      | NULLABLE                             | Deleted at                            |
| `created_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Created by                            |
| `updated_by`      | UUID/VARCHAR   | NULLABLE, FOREIGN KEY (users.id)     | Updated by                            |

---

## Index Suggestions (For Performance)
```sql
-- Indexes for quick lookups
CREATE INDEX idx_patients_org ON patients(organization_id);
CREATE INDEX idx_patients_code ON patients(patient_code);
CREATE INDEX idx_patients_status ON patients(status);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date, scheduled_time);
CREATE INDEX idx_appointments_org ON appointments(organization_id);

CREATE INDEX idx_inventory_med ON inventory_items(medication_id);
CREATE INDEX idx_inventory_status ON inventory_items(status);
CREATE INDEX idx_inventory_org ON inventory_items(organization_id);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_time ON audit_logs(timestamp);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

---

## Required Default Roles

```sql
INSERT INTO roles (id, name, display_name, description, is_default)
VALUES
('role-01', 'org_owner', 'Organization Owner', 'Full access to all features', true),
('role-02', 'admin', 'Administrator', 'Almost all access', true),
('role-03', 'doctor', 'Doctor', 'Clinical staff', true),
('role-04', 'nurse', 'Nurse', 'Nursing staff', true),
('role-05', 'pharmacist', 'Pharmacist', 'Pharmacy operations', true),
('role-06', 'lab_technician', 'Lab Technician', 'Lab operations', true),
('role-07', 'cashier', 'Cashier', 'Billing & payments', true),
('role-08', 'receptionist', 'Receptionist', 'Front desk & appointments', true),
('role-09', 'hr_manager', 'HR Manager', 'Human resources', true),
('role-10', 'store_manager', 'Store Manager', 'Inventory & stock', true);
```

---

## Required Default Permissions
Use all permissions from `MODULE_PERMISSIONS` in `src/types/rbac.ts`
