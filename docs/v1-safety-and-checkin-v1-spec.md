# Get Yo A$$ Outside - Safety, Buddy Check-In, and Experience Sharing v1 Spec

## 1. Purpose
This document defines a practical, ethical, and equitable v1 safety architecture for:
- Optional buddy check-ins
- Park visit notifications to trusted contacts
- Private experience sharing
- Lawful, minimal data handling that can assist investigations when needed

This v1 is intentionally scoped to reduce harm and legal risk while still giving users useful safety tools.

## 2. Product Positioning and Boundaries
### 2.1 Product role
The app is a wellness and outdoor motivation app with optional safety utilities.

### 2.2 Not an emergency service
The app must never imply real-time emergency response or guaranteed rescue.

### 2.3 Required safety copy
- This app is not an emergency service.
- If you are in immediate danger, call emergency services.
- Safety features depend on device connectivity, permissions, and user settings.

## 3. Ethical and Equity Principles (v1 Guardrails)
1. Safety by default, not surveillance by default.
2. Explicit consent before any sharing or contact notifications.
3. Data minimization and short retention windows.
4. Private by default for experience content.
5. No exact live location sharing to public feeds.
6. Accessibility and low-bandwidth fallback support.
7. Support chosen family and non-traditional support networks.
8. Clear deletion controls and transparent policy language.

## 4. v1 Scope
### 4.1 In scope
- Trusted contacts (buddy list)
- Timed check-ins linked to a selected park
- Missed check-in reminders and contact alerts
- Private experience logs with optional contact visibility
- Limited audit trail and lawful disclosure workflow

### 4.2 Out of scope (v1)
- Public social feed with exact locations
- Live location streaming to other users
- Background location tracking without active session
- Automated law enforcement notifications

## 5. Primary User Flows
### 5.1 Set up trusted contacts
1. User opens Safety Settings.
2. User adds 1-3 trusted contacts (name + phone/email).
3. User verifies contact method (OTP for SMS/email where feasible).
4. User chooses escalation preference per contact.

### 5.2 Start park check-in
1. User selects a park from nearby parks.
2. User sets expected duration (for example 30, 60, 90 minutes).
3. User confirms contact notification option.
4. App creates an active check-in with expected return timestamp.
5. Optional notification sent to trusted contacts: "[Name] started a park check-in at [Park Name]."

### 5.3 End check-in
1. User taps "I am heading home" then "I got home".
2. Check-in status transitions to completed.
3. Optional completion notice sent to contacts.

### 5.4 Missed check-in escalation
1. Expected return time passes with grace window (for example 15 min).
2. App sends reminder to user.
3. If no response in escalation window (for example 10 min), app sends alert to trusted contacts.
4. Alert includes minimal details: park, start time, last user-confirmed state.

### 5.5 Experience sharing (v1 private-first)
1. User submits visit summary (text + mood + optional safety notes).
2. Visibility defaults to private.
3. User can optionally share with trusted contacts.
4. Public sharing is disabled in v1.

## 6. Consent and Disclaimers UX
### 6.1 Consent checkpoints
- Enabling safety feature set
- Sending first contact notification
- Sharing any location-linked experience content
- Changing retention preferences (if user-configurable)

### 6.2 Consent record
Each consent action stores:
- user_id
- consent_type
- policy_version
- presented_text_snapshot_hash
- accepted_at
- locale

### 6.3 Required disclaimer surfaces
- Safety onboarding modal
- Check-in confirmation sheet
- Settings > Safety > Legal
- Footer text in contact alerts (short version)

## 7. Cloudflare Architecture (v1)
### 7.1 Components
- Cloudflare Workers: API and business logic
- Cloudflare D1: relational storage
- Cloudflare Queues: async notifications and moderation tasks
- Cloudflare Cron Triggers: retention cleanup and stale check-in sweeps
- Cloudflare R2 (optional v1.1): media attachments for experiences
- Cloudflare Turnstile: abuse/spam protection on submission endpoints

### 7.2 Runtime pattern
- Worker validates auth token and request schema.
- Worker writes transactional safety events to D1.
- Worker enqueues outbound notifications to Queue.
- Notification consumer Worker sends SMS/email via provider.

## 8. D1 Data Schema (v1)
Notes:
- IDs use TEXT (ULID/UUID) for portability.
- Timestamps stored in ISO-8601 UTC text.
- Lat/lon precision reduced for storage minimization.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  external_auth_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  phone_e164 TEXT,
  email TEXT,
  locale TEXT DEFAULT 'en-US',
  timezone TEXT DEFAULT 'UTC',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE user_safety_profiles (
  user_id TEXT PRIMARY KEY,
  safety_enabled INTEGER NOT NULL DEFAULT 0 CHECK (safety_enabled IN (0,1)),
  escalation_enabled INTEGER NOT NULL DEFAULT 1 CHECK (escalation_enabled IN (0,1)),
  grace_minutes INTEGER NOT NULL DEFAULT 15 CHECK (grace_minutes BETWEEN 1 AND 120),
  escalation_minutes INTEGER NOT NULL DEFAULT 10 CHECK (escalation_minutes BETWEEN 1 AND 120),
  retention_days INTEGER NOT NULL DEFAULT 30 CHECK (retention_days BETWEEN 1 AND 365),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE trusted_contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  relation_label TEXT,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('sms','email')),
  channel_value TEXT NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 0 CHECK (is_verified IN (0,1)),
  notify_on_start INTEGER NOT NULL DEFAULT 1 CHECK (notify_on_start IN (0,1)),
  notify_on_missed INTEGER NOT NULL DEFAULT 1 CHECK (notify_on_missed IN (0,1)),
  notify_on_complete INTEGER NOT NULL DEFAULT 1 CHECK (notify_on_complete IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_trusted_contacts_user_id ON trusted_contacts(user_id);

CREATE TABLE parks_catalog (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('overpass','manual')),
  provider_park_id TEXT,
  name TEXT NOT NULL,
  lat_approx REAL NOT NULL,
  lon_approx REAL NOT NULL,
  city TEXT,
  region TEXT,
  country_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_parks_catalog_provider_park_id ON parks_catalog(provider_park_id);

CREATE TABLE safety_checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  park_id TEXT,
  park_name_snapshot TEXT NOT NULL,
  started_at TEXT NOT NULL,
  expected_return_at TEXT NOT NULL,
  grace_until TEXT NOT NULL,
  escalation_at TEXT NOT NULL,
  ended_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('active','grace','escalated','completed','cancelled')),
  start_lat_approx REAL,
  start_lon_approx REAL,
  end_lat_approx REAL,
  end_lon_approx REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (park_id) REFERENCES parks_catalog(id) ON DELETE SET NULL
);

CREATE INDEX idx_safety_checkins_user_status ON safety_checkins(user_id, status);
CREATE INDEX idx_safety_checkins_expected_return_at ON safety_checkins(expected_return_at);

CREATE TABLE checkin_events (
  id TEXT PRIMARY KEY,
  checkin_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'created',
      'reminder_sent',
      'user_extended',
      'user_marked_leaving',
      'user_marked_home',
      'escalation_sent',
      'cancelled'
    )
  ),
  event_payload_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (checkin_id) REFERENCES safety_checkins(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_checkin_events_checkin_id ON checkin_events(checkin_id);

CREATE TABLE experiences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  checkin_id TEXT,
  park_id TEXT,
  title TEXT,
  body TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great','good','neutral','rough')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','trusted_contacts')),
  contains_sensitive_safety_note INTEGER NOT NULL DEFAULT 0 CHECK (contains_sensitive_safety_note IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (checkin_id) REFERENCES safety_checkins(id) ON DELETE SET NULL,
  FOREIGN KEY (park_id) REFERENCES parks_catalog(id) ON DELETE SET NULL
);

CREATE INDEX idx_experiences_user_visibility ON experiences(user_id, visibility);

CREATE TABLE consent_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (
    consent_type IN (
      'safety_feature_enable',
      'contact_notifications',
      'location_linked_sharing',
      'legal_disclaimer_ack'
    )
  ),
  policy_version TEXT NOT NULL,
  copy_hash TEXT NOT NULL,
  accepted_at TEXT NOT NULL,
  locale TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_consent_records_user_type ON consent_records(user_id, consent_type);

CREATE TABLE notification_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  checkin_id TEXT,
  trusted_contact_id TEXT,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('sms','email')),
  template_key TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','sent','failed','cancelled')),
  provider_message_id TEXT,
  failure_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (checkin_id) REFERENCES safety_checkins(id) ON DELETE SET NULL,
  FOREIGN KEY (trusted_contact_id) REFERENCES trusted_contacts(id) ON DELETE SET NULL
);

CREATE INDEX idx_notification_jobs_status_created_at ON notification_jobs(status, created_at);

CREATE TABLE authority_request_log (
  id TEXT PRIMARY KEY,
  requesting_agency TEXT NOT NULL,
  request_reference TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  requested_user_id TEXT,
  requested_checkin_id TEXT,
  reviewed_by TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected','partial')),
  decision_notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user','system','admin_worker')),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
```

## 9. Core API Surface (Worker)
### 9.1 Safety settings
- `GET /api/v1/safety/profile`
- `PUT /api/v1/safety/profile`

### 9.2 Trusted contacts
- `GET /api/v1/safety/contacts`
- `POST /api/v1/safety/contacts`
- `PATCH /api/v1/safety/contacts/:id`
- `DELETE /api/v1/safety/contacts/:id`

### 9.3 Check-ins
- `POST /api/v1/checkins/start`
- `POST /api/v1/checkins/:id/extend`
- `POST /api/v1/checkins/:id/mark-leaving`
- `POST /api/v1/checkins/:id/mark-home`
- `POST /api/v1/checkins/:id/cancel`
- `GET /api/v1/checkins/active`

### 9.4 Experiences
- `POST /api/v1/experiences`
- `GET /api/v1/experiences`
- `PATCH /api/v1/experiences/:id`
- `DELETE /api/v1/experiences/:id`

### 9.5 Compliance and consent
- `POST /api/v1/consents`
- `GET /api/v1/legal/disclaimer`

## 10. Security and Abuse Prevention
1. Authentication required for all safety endpoints.
2. Per-user and per-IP rate limits on contact and experience endpoints.
3. Turnstile challenge for suspicious traffic patterns.
4. Strict server-side ownership checks on every resource.
5. No raw exact GPS persisted for public experience views.
6. Encrypt provider secrets via Worker secrets.

## 11. Data Retention and Deletion
### 11.1 Default retention
- safety_checkins: 30 days
- checkin_events: 30 days
- notification_jobs: 30 days
- audit_log: 90 days (or legal requirement)
- experiences: user-controlled, soft delete then hard delete after retention period

### 11.2 Cleanup jobs
Use Cloudflare Cron:
- Hourly: stale active check-ins sweep
- Daily: retention purge for expired records
- Daily: hard-delete previously soft-deleted data past grace period

## 12. Incident and Authority Response Workflow
1. Validate legal request authenticity.
2. Route through designated reviewer role.
3. Retrieve minimal scoped records only.
4. Log every access and decision in `authority_request_log` and `audit_log`.
5. Notify user when legally permissible.

## 13. Accessibility and Equity Requirements
1. All safety actions must be keyboard operable.
2. Minimum touch target size 44px.
3. Consent copy in plain language, localized.
4. Low-bandwidth mode for check-in actions.
5. SMS fallback for notifications when app push is unavailable.
6. Contact model supports chosen family labels, not only parent/guardian terms.

## 14. v1 Rollout Plan
### Phase A: Private safety core
- trusted contacts
- start/end check-ins
- reminder and escalation pipeline

### Phase B: Experience logging
- private and trusted-contact visibility
- moderation and report endpoint stub

### Phase C: Compliance hardening
- authority request SOP integration
- retention automation and audit reporting

## 15. QA and Testing Matrix
### 15.1 Unit tests
- check-in state transitions
- consent recording correctness
- retention policy calculations

### 15.2 Integration tests
- Worker + D1 transactional integrity
- notification queue enqueue/dequeue
- escalation timing behavior

### 15.3 Abuse tests
- repeated contact spam attempts
- unauthorized access to another user's check-ins
- malformed payload and SQL injection attempts

### 15.4 Accessibility tests
- screen reader labels and announcements
- keyboard-only completion of full safety flow
- reduced motion and high contrast checks

## 16. Open Decisions (Product + Legal)
1. Which jurisdictions are launch markets for legal language.
2. Whether minor accounts are in v1 scope or deferred.
3. Whether user can configure retention below default safety threshold.
4. Which notification provider to use for SMS/email and SLA expectations.

## 17. Suggested Disclaimer Copy (Draft)
This app offers optional safety check-ins, but it is not an emergency service and does not guarantee personal safety. If you are in immediate danger, call emergency services right away. Safety notifications depend on your device, connectivity, permissions, and settings.

---
Owner: Product + Engineering + Legal
Status: Draft v1 spec
Last updated: 2026-05-19
