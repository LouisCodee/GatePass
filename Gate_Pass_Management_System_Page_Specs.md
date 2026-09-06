# Page & Screen Specifications
### Gate Pass Management System (GPMS) — Companion to the SRS

| | |
|---|---|
| **Document Version** | 1.0 (Draft) |
| **Companion To** | Gate_Pass_Management_System_SRS.md v1.0 |
| **Status** | Draft — for stakeholder review |

This document specifies every web page/screen required to build GPMS. Each entry lists who accesses it, what it's for, its key elements and actions, and which SRS requirement IDs it fulfils, so it can be handed directly to design/development alongside the SRS.

---

## Quick Reference — All Pages

| ID | Page | Group | Primary Role(s) |
|---|---|---|---|
| PG-01 | Login | Shared | All |
| PG-02 | Forgot / Reset Password | Shared | All |
| PG-03 | Dashboard (Home) | Shared | All |
| PG-04 | Gate Pass Detail | Shared | All internal roles |
| PG-05 | Gate Pass Search / List | Shared | Front Desk, Accounts, Manager, Coordinator, Records, Admin |
| PG-06 | Notifications Center | Shared | All internal roles |
| PG-07 | My Profile / Account Settings | Shared | All |
| PG-08 | New Gate Pass | Module 1 | Front Desk / Gate Pass Officer |
| PG-09 | Payment Verification Queue | Module 2 | Accounts Officer |
| PG-10 | Pre-Release Verification Queue | Module 3 | Workshop/Laboratory Manager |
| PG-11 | Client Inspection & Signature Capture | Module 4 | Client (staff-assisted) |
| PG-12 | Raise a Dispute | Module 4 | Client (staff-assisted) |
| PG-13 | My Approvals | Module 5 | Manager, Coordinator, Accounts Officer |
| PG-14 | Gate Lookup / Scan | Module 6 | Security Personnel |
| PG-15 | Exit Clearance | Module 6 | Security Personnel |
| PG-16 | Records Archive | Module 7 | Records Officer, Admin |
| PG-17 | Printable Gate Pass | Module 7 | Any (triggered from PG-04) |
| PG-18 | User Management | Admin | System Administrator |
| PG-19 | Roles & Permissions | Admin | System Administrator |
| PG-20 | System Configuration | Admin | System Administrator |
| PG-21 | Audit Log Viewer | Admin | System Administrator |

---

## Shared Pages (7)

### PG-01 — Login
**Access:** All roles
**Purpose:** Authenticate users before granting access to any GPMS function.
**Key Elements:**
- Username/email field, password field
- "Forgot password?" link
- Error message area for failed attempts
**Primary Actions:**
- Log in
- Navigate to Forgot Password
**Related Requirements:** NFR-2
**Notes:** Consider a role-based redirect after login — e.g., Security Personnel should land on Gate Lookup (PG-14), not a general dashboard, since their job is time-sensitive.

---

### PG-02 — Forgot / Reset Password
**Access:** All roles (pre-authentication)
**Purpose:** Let a user regain account access without administrator intervention.
**Key Elements:**
- Email/username input
- Reset link or OTP confirmation step
- New password + confirm fields
**Primary Actions:**
- Request reset
- Set new password
**Related Requirements:** NFR-2
**Notes:** Decide whether self-service reset applies to shared/kiosk accounts (e.g., the client-facing signature station) or whether those should route through an Administrator instead.

---

### PG-03 — Dashboard (Home)
**Access:** All roles (content varies by role)
**Purpose:** Single landing page summarizing what needs the logged-in user's attention right now.
**Key Elements:**
- Role-specific summary cards (e.g., "5 passes awaiting payment verification," "2 pending approvals")
- Quick links into the relevant queue page
- Recent activity feed
**Primary Actions:**
- Navigate to a queue or detail page
**Related Requirements:** Supports NFR-4
**Notes:** Content differs meaningfully by role — effectively several dashboard variants sharing one layout.

---

### PG-04 — Gate Pass Detail
**Access:** All internal roles (view/action rights vary by role and current status)
**Purpose:** The single source of truth for one gate pass — full record plus every action available at its current status. This is where Modules 1, 2, 3, and 5's actions actually happen.
**Key Elements:**
- All Data Dictionary fields: Serial No., Date of Issue, Client info, Job Card No., item lines, Payment Receipt No., three Approving Officer blocks, Release Date/Time, Receiving Client Name/Signature
- Status badge
- Full audit trail / timeline
**Primary Actions (contextual — shown/hidden by role + status):**
- Edit (Front Desk, pre-payment-verification only)
- Confirm Payment (Accounts Officer)
- Complete Pre-Release Checklist (Workshop/Laboratory Manager)
- Approve / Reject (the three approvers)
- Place On Hold
- Print (→ PG-17)
**Related Requirements:** FR-1.8, FR-1.9, FR-2.1–FR-2.4, FR-3.1–FR-3.4, FR-5.1–FR-5.5, FR-7.1, FR-7.5, all Business Rules
**Notes:** The most complex page in the system — prioritize it early in design/wireframing.

---

### PG-05 — Gate Pass Search / List
**Access:** Front Desk, Accounts, Workshop/Laboratory Manager, Coordinator, Records/Production, Admin
**Purpose:** Find any gate pass by filtering on status, client, date range, serial number, or job card number.
**Key Elements:**
- Filter bar (status, date range, client name, serial no., job card no.)
- Results table (Serial No., Client, Status, Date of Issue, Release Date)
- Pagination
**Primary Actions:**
- Search / filter
- Open a result (→ PG-04)
- Export (Records role)
**Related Requirements:** FR-7.2
**Notes:** Overlaps with Records Archive (PG-16) — see that page's note on whether to merge them.

---

### PG-06 — Notifications Center
**Access:** All internal roles
**Purpose:** Surface holds, rejections, disputes, and pending-approval alerts needing this user's attention.
**Key Elements:**
- Notification list with type icon, gate pass reference, timestamp, read/unread state
**Primary Actions:**
- Open notification (→ PG-04)
- Mark as read / clear
**Related Requirements:** FR-3.3, FR-4.3, FR-5.4
**Notes:** Should mirror email/SMS notifications (§5.3 of the SRS) — this page is the in-app record of the same events.

---

### PG-07 — My Profile / Account Settings
**Access:** All roles
**Purpose:** Let a user manage their own account details.
**Key Elements:**
- Name, contact info, password change
- Notification preferences (email/SMS on/off)
**Primary Actions:**
- Update profile
- Change password
**Related Requirements:** Supports NFR-2
**Notes:** —

---

## Module 1 — Gate Pass Creation (1)

### PG-08 — New Gate Pass
**Access:** Front Desk / Gate Pass Officer
**Purpose:** Capture all initial data to open a new gate pass record.
**Key Elements:**
- Auto-generated Serial No. (read-only once saved)
- Date of Issue (auto)
- Client Name & Contact Details
- Job Card/Work Order Number (with lookup/validation)
- Repeatable Item Description + Quantity lines
- Payment Receipt Number field
- Inline validation messages
**Primary Actions:**
- Save / Submit (→ status "Pending Payment Verification")
- Save as Draft
- Cancel
**Related Requirements:** FR-1.1–FR-1.11
**Notes:** Approving Officer, Release Date/Time, and Receiving Client fields are intentionally absent here — locked out until later modules (FR-1.8, FR-1.9).

---

## Module 2 — Proof of Payment (1)

### PG-09 — Payment Verification Queue
**Access:** Accounts Officer
**Purpose:** Work through gate passes awaiting payment confirmation.
**Key Elements:**
- Queue of passes in "Pending Payment Verification" status
- Per-row: Serial No., Client, Job Card No., amount due/receipt reference
**Primary Actions:**
- Open a pass (→ PG-04) to confirm payment or flag a partial/outstanding balance
**Related Requirements:** FR-2.1–FR-2.5
**Notes:** Could ship as a filtered view of PG-05 rather than a fully separate page — a reasonable build-time simplification.

---

## Module 3 — Pre-Release Verification (1)

### PG-10 — Pre-Release Verification Queue
**Access:** Workshop/Laboratory Manager
**Purpose:** Work through gate passes awaiting the completed-work/quality/documentation checklist.
**Key Elements:**
- Queue of passes in "Payment Verified" status
- Checklist: work completed & inspected; meets spec/quality; charges paid in full; pass and receipt correspond to item
**Primary Actions:**
- Open a pass (→ PG-04) to complete the checklist or place it On Hold
**Related Requirements:** FR-3.1–FR-3.4
**Notes:** Same simplification option as PG-09 — could be a filtered view of PG-05.

---

## Module 4 — Client Inspection & Signing (2)

### PG-11 — Client Inspection & Signature Capture
**Access:** Client (staff-assisted)
**Purpose:** A deliberately simple, kiosk-style screen where the client reviews their item(s) and signs off — no login, no clutter.
**Key Elements:**
- Item Description + Quantity (read-only, large/clear text)
- Plain-language confirmation prompt
- Signature capture pad (touch/stylus)
- "I don't agree" link
**Primary Actions:**
- Sign to Acknowledge
- Raise a Dispute (→ PG-12)
**Related Requirements:** FR-4.1, FR-4.2, FR-4.4
**Notes:** Should be the most tightly-scoped screen in the system — anything not needed by the client in this moment doesn't belong on it.

---

### PG-12 — Raise a Dispute
**Access:** Client (staff-assisted)
**Purpose:** Capture what's wrong when the client won't sign off, instead of forcing a signature.
**Key Elements:**
- Reason selector (e.g., item damaged, wrong item, quality concern, other)
- Optional comment field
**Primary Actions:**
- Submit dispute (→ pauses the gate pass, notifies Workshop/Laboratory Manager)
**Related Requirements:** FR-4.3
**Notes:** —

---

## Module 5 — Signature & Approval (1)

### PG-13 — My Approvals
**Access:** Workshop/Laboratory Manager, Production/Consultancy Coordinator, Accounts Officer
**Purpose:** One shared queue template, reused by all three approver roles, for reviewing and acting on passes awaiting their sign-off.
**Key Elements:**
- Queue of passes where this user's specific approval is still outstanding
- Approval progress indicator (e.g., "1 of 3 complete")
**Primary Actions:**
- Open a pass (→ PG-04) to Approve or Reject with a mandatory comment
**Related Requirements:** FR-5.1–FR-5.5, BR-4
**Notes:** Enforce FR-5.3 (segregation of duties) here — a user shouldn't see a pass in their queue if they've already filled a different approval role on it, unless Admin has explicitly allowed it.

---

## Module 6 — Gate Security Verification (2)

### PG-14 — Gate Lookup / Scan
**Access:** Security Personnel
**Purpose:** Fast lookup of a gate pass at the point of exit.
**Key Elements:**
- Large search input (serial number or client name)
- QR/barcode scan trigger (if hardware available)
- Recent lookups list
**Primary Actions:**
- Search / Scan
- Open result (→ PG-15)
**Related Requirements:** FR-6.1, FR-6.2, FR-6.6
**Notes:** Needs to work offline/queued per NFR-3 — this is the page most exposed to connectivity gaps.

---

### PG-15 — Exit Clearance
**Access:** Security Personnel
**Purpose:** Confirm the physical item(s) match the record and release it.
**Key Elements:**
- Item Description/Quantity checklist for visual confirmation
- Receiving Client Name/Signature (capture or re-confirm from PG-11)
- Large, unambiguous "Approved – Ready for Exit" / invalid-pass indicator
**Primary Actions:**
- Confirm Match & Release
- Flag Invalid Pass
**Related Requirements:** FR-6.3–FR-6.7, BR-5, BR-7
**Notes:** An invalid/already-used/unapproved pass should be impossible to miss visually (FR-6.6).

---

## Module 7 — Copy Maintenance & Archival (2)

### PG-16 — Records Archive
**Access:** Production Department / Records Officer, Admin
**Purpose:** Search, filter, and export the full historical record of gate passes for traceability.
**Key Elements:**
- Same filter set as PG-05 (date range, client, status, serial no., job card no.)
- Export controls
**Primary Actions:**
- Search / filter
- Export (CSV/PDF)
- Open a record (→ PG-04, read-only once archived)
**Related Requirements:** FR-7.1, FR-7.2, FR-7.4
**Notes:** As flagged under PG-05 — decide during design whether this and the general Search/List page are actually one page with role-based export rights, rather than two.

---

### PG-17 — Printable Gate Pass
**Access:** Any role with access to the underlying pass; typically triggered from PG-04
**Purpose:** A clean, print-formatted single-record view for institutions that still need a physical copy on file.
**Key Elements:**
- All Data Dictionary fields, laid out for print
- Signatures rendered as captured images
**Primary Actions:**
- Print
- Download PDF
**Related Requirements:** FR-7.3
**Notes:** Not a page users navigate to directly — a print/PDF view triggered from PG-04.

---

## Administration (4)

### PG-18 — User Management
**Access:** System Administrator
**Purpose:** Create and manage staff accounts.
**Key Elements:**
- User list
- Add/edit user form (name, contact, role assignment, department/site)
**Primary Actions:**
- Add / edit / deactivate user
**Related Requirements:** UC-9, NFR-2
**Notes:** —

---

### PG-19 — Roles & Permissions
**Access:** System Administrator
**Purpose:** Configure what each role can see and do.
**Key Elements:**
- Role list
- Permission matrix per module/page
**Primary Actions:**
- Edit role permissions
- Toggle the FR-5.3 segregation-of-duties override for small teams
**Related Requirements:** NFR-2, FR-5.3
**Notes:** —

---

### PG-20 — System Configuration
**Access:** System Administrator
**Purpose:** Institution-wide settings that affect business-rule behavior.
**Key Elements:**
- Approval rules (number/order of Stage 5 approvers)
- Record retention period
- Department/site list (multi-site support)
- Notification settings
**Primary Actions:**
- Edit and save configuration values
**Related Requirements:** NFR-7, FR-7.4, §2.5 of the SRS
**Notes:** This is what makes NFR-7 (Maintainability) real — these should be config values, not hard-coded rules.

---

### PG-21 — Audit Log Viewer
**Access:** System Administrator (Records Officer, read-only, optional)
**Purpose:** System-wide, cross-record view of every logged action — distinct from the per-record timeline on PG-04.
**Key Elements:**
- Filterable log (by user, action type, date range, gate pass reference)
- Export
**Primary Actions:**
- Filter
- Export
**Related Requirements:** FR-7.5, NFR-5
**Notes:** —

---

## System States (not counted in the 21 pages)

- **403 / 404 / Generic Error** — standard access-denied and not-found states.
- **Offline / Sync Indicator** — persistent status shown on PG-14 and PG-15 indicating connection state and any queued, not-yet-synced actions, per NFR-3.

---

*This document is a companion to Gate_Pass_Management_System_SRS.md and should be read alongside it — requirement IDs referenced here (FR-x.x, NFR-x, BR-x) are defined there.*
