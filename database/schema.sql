--
-- PostgreSQL database dump
--

\restrict oln1ZA8psSFTCnE42OPwtZdgiusiLq9fv0xNjwBQfunzu3iDl6gk491v5JxmQsK

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT uuidv7() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text DEFAULT ''::text NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    category text DEFAULT ''::text NOT NULL,
    published_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT blog_posts_body_len CHECK ((char_length(body) <= 200000)),
    CONSTRAINT blog_posts_category_len CHECK ((char_length(category) <= 128)),
    CONSTRAINT blog_posts_excerpt_len CHECK ((char_length(excerpt) <= 2000)),
    CONSTRAINT blog_posts_image_path_len CHECK ((char_length(image_path) <= 1024)),
    CONSTRAINT blog_posts_slug_len CHECK (((char_length(slug) >= 1) AND (char_length(slug) <= 200))),
    CONSTRAINT blog_posts_title_len CHECK (((char_length(title) >= 1) AND (char_length(title) <= 200))),
    CONSTRAINT blog_posts_version_pos CHECK ((version >= 1))
);


--
-- Name: blog_posts_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.blog_posts_active AS
 SELECT id,
    title,
    slug,
    excerpt,
    body,
    image_path,
    category,
    published_at,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.blog_posts
  WHERE (archived_at IS NULL);


--
-- Name: callback_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.callback_statuses (
    code text NOT NULL,
    label text NOT NULL,
    sort_order integer NOT NULL,
    color text,
    CONSTRAINT callback_statuses_code_len CHECK (((char_length(code) >= 1) AND (char_length(code) <= 64))),
    CONSTRAINT callback_statuses_label_len CHECK (((char_length(label) >= 1) AND (char_length(label) <= 128)))
);


--
-- Name: callbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.callbacks (
    id uuid DEFAULT uuidv7() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    note text DEFAULT ''::text NOT NULL,
    status_code text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT callbacks_email_len CHECK (((char_length(email) >= 3) AND (char_length(email) <= 320))),
    CONSTRAINT callbacks_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 200))),
    CONSTRAINT callbacks_note_len CHECK ((char_length(note) <= 5000)),
    CONSTRAINT callbacks_phone_len CHECK ((char_length(phone) <= 64)),
    CONSTRAINT callbacks_version_pos CHECK ((version >= 1))
);


--
-- Name: callbacks_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.callbacks_active AS
 SELECT id,
    name,
    email,
    phone,
    note,
    status_code,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.callbacks
  WHERE (archived_at IS NULL);


--
-- Name: carriers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carriers (
    id uuid DEFAULT uuidv7() NOT NULL,
    us_dot text NOT NULL,
    mc text NOT NULL,
    legal_name text NOT NULL,
    dba text DEFAULT ''::text NOT NULL,
    business_address text DEFAULT ''::text NOT NULL,
    owner_operator_driver text DEFAULT ''::text NOT NULL,
    tax_id_ciphertext bytea NOT NULL,
    business_telephone text DEFAULT ''::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT carriers_business_address_len CHECK ((char_length(business_address) <= 500)),
    CONSTRAINT carriers_dba_len CHECK ((char_length(dba) <= 300)),
    CONSTRAINT carriers_legal_name_len CHECK (((char_length(legal_name) >= 1) AND (char_length(legal_name) <= 300))),
    CONSTRAINT carriers_mc_len CHECK (((char_length(mc) >= 1) AND (char_length(mc) <= 32))),
    CONSTRAINT carriers_owner_len CHECK ((char_length(owner_operator_driver) <= 200)),
    CONSTRAINT carriers_phone_len CHECK ((char_length(business_telephone) <= 64)),
    CONSTRAINT carriers_us_dot_len CHECK (((char_length(us_dot) >= 1) AND (char_length(us_dot) <= 32))),
    CONSTRAINT carriers_version_pos CHECK ((version >= 1))
);


--
-- Name: carriers_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.carriers_active AS
 SELECT id,
    us_dot,
    mc,
    legal_name,
    dba,
    business_address,
    owner_operator_driver,
    tax_id_ciphertext,
    business_telephone,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.carriers
  WHERE (archived_at IS NULL);


--
-- Name: client_employee_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_employee_assignments (
    client_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_statuses (
    code text NOT NULL,
    label text NOT NULL,
    sort_order integer NOT NULL,
    color text,
    CONSTRAINT client_statuses_code_len CHECK (((char_length(code) >= 1) AND (char_length(code) <= 64))),
    CONSTRAINT client_statuses_label_len CHECK (((char_length(label) >= 1) AND (char_length(label) <= 128)))
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT uuidv7() NOT NULL,
    user_id uuid NOT NULL,
    company text DEFAULT ''::text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    status_code text NOT NULL,
    member_since date DEFAULT CURRENT_DATE NOT NULL,
    client_contact_title text DEFAULT ''::text NOT NULL,
    location text DEFAULT ''::text NOT NULL,
    plan text DEFAULT ''::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT clients_company_len CHECK ((char_length(company) <= 200)),
    CONSTRAINT clients_contact_title_len CHECK ((char_length(client_contact_title) <= 200)),
    CONSTRAINT clients_location_len CHECK ((char_length(location) <= 200)),
    CONSTRAINT clients_phone_len CHECK ((char_length(phone) <= 64)),
    CONSTRAINT clients_plan_len CHECK ((char_length(plan) <= 200)),
    CONSTRAINT clients_version_pos CHECK ((version >= 1))
);


--
-- Name: clients_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.clients_active AS
 SELECT id,
    user_id,
    company,
    phone,
    status_code,
    member_since,
    client_contact_title,
    location,
    plan,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.clients
  WHERE (archived_at IS NULL);


--
-- Name: contact_message_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_message_statuses (
    code text NOT NULL,
    label text NOT NULL,
    sort_order integer NOT NULL,
    color text,
    CONSTRAINT contact_message_statuses_code_len CHECK (((char_length(code) >= 1) AND (char_length(code) <= 64))),
    CONSTRAINT contact_message_statuses_label_len CHECK (((char_length(label) >= 1) AND (char_length(label) <= 128)))
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT uuidv7() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text DEFAULT ''::text NOT NULL,
    body text NOT NULL,
    status_code text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT contact_messages_body_len CHECK (((char_length(body) >= 1) AND (char_length(body) <= 20000))),
    CONSTRAINT contact_messages_email_len CHECK (((char_length(email) >= 3) AND (char_length(email) <= 320))),
    CONSTRAINT contact_messages_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 200))),
    CONSTRAINT contact_messages_subject_len CHECK ((char_length(subject) <= 300)),
    CONSTRAINT contact_messages_version_pos CHECK ((version >= 1))
);


--
-- Name: contact_messages_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.contact_messages_active AS
 SELECT id,
    name,
    email,
    subject,
    body,
    status_code,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.contact_messages
  WHERE (archived_at IS NULL);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid DEFAULT uuidv7() NOT NULL,
    user_id uuid NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    department text DEFAULT ''::text NOT NULL,
    kind text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT employees_department_len CHECK ((char_length(department) <= 200)),
    CONSTRAINT employees_image_path_len CHECK ((char_length(image_path) <= 1024)),
    CONSTRAINT employees_kind_check CHECK ((kind = ANY (ARRAY['delivery'::text, 'sales'::text]))),
    CONSTRAINT employees_title_len CHECK ((char_length(title) <= 200)),
    CONSTRAINT employees_version_pos CHECK ((version >= 1))
);


--
-- Name: employees_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.employees_active AS
 SELECT id,
    user_id,
    title,
    department,
    kind,
    image_path,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.employees
  WHERE (archived_at IS NULL);


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faqs (
    id uuid DEFAULT uuidv7() NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    published_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    sort_order integer DEFAULT 0 NOT NULL,
    CONSTRAINT faqs_answer_len CHECK (((char_length(answer) >= 1) AND (char_length(answer) <= 10000))),
    CONSTRAINT faqs_question_len CHECK (((char_length(question) >= 1) AND (char_length(question) <= 500))),
    CONSTRAINT faqs_version_pos CHECK ((version >= 1))
);


--
-- Name: faqs_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.faqs_active AS
 SELECT id,
    question,
    answer,
    published_at,
    version,
    created_at,
    updated_at,
    archived_at,
    sort_order
   FROM public.faqs
  WHERE (archived_at IS NULL);


--
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.files (
    id uuid DEFAULT uuidv7() NOT NULL,
    client_id uuid NOT NULL,
    original_name text NOT NULL,
    storage_key text NOT NULL,
    content_type text NOT NULL,
    size_bytes bigint NOT NULL,
    checksum_sha256 text NOT NULL,
    kind text DEFAULT ''::text NOT NULL,
    uploaded_by_user_id uuid NOT NULL,
    uploaded_by_role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT files_checksum_sha256_len CHECK ((char_length(checksum_sha256) = 64)),
    CONSTRAINT files_content_type_len CHECK (((char_length(content_type) >= 1) AND (char_length(content_type) <= 255))),
    CONSTRAINT files_kind_len CHECK ((char_length(kind) <= 64)),
    CONSTRAINT files_original_name_len CHECK (((char_length(original_name) >= 1) AND (char_length(original_name) <= 500))),
    CONSTRAINT files_size_bytes_nonneg CHECK ((size_bytes >= 0)),
    CONSTRAINT files_storage_key_len CHECK (((char_length(storage_key) >= 1) AND (char_length(storage_key) <= 1024))),
    CONSTRAINT files_uploaded_by_role_check CHECK ((uploaded_by_role = ANY (ARRAY['admin'::text, 'client'::text, 'employee'::text])))
);


--
-- Name: files_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.files_active AS
 SELECT id,
    client_id,
    original_name,
    storage_key,
    content_type,
    size_bytes,
    checksum_sha256,
    kind,
    uploaded_by_user_id,
    uploaded_by_role,
    created_at,
    updated_at,
    archived_at
   FROM public.files
  WHERE (archived_at IS NULL);


--
-- Name: hmac_nonces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hmac_nonces (
    nonce text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT hmac_nonces_nonce_len CHECK (((char_length(nonce) >= 16) AND (char_length(nonce) <= 128)))
);


--
-- Name: idempotency_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idempotency_keys (
    id uuid DEFAULT uuidv7() NOT NULL,
    idempotency_key text NOT NULL,
    method text NOT NULL,
    path text NOT NULL,
    subject_id uuid,
    response_status integer NOT NULL,
    response_body jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT idempotency_keys_key_len CHECK (((char_length(idempotency_key) >= 1) AND (char_length(idempotency_key) <= 128))),
    CONSTRAINT idempotency_keys_method_len CHECK (((char_length(method) >= 1) AND (char_length(method) <= 16))),
    CONSTRAINT idempotency_keys_path_len CHECK (((char_length(path) >= 1) AND (char_length(path) <= 512))),
    CONSTRAINT idempotency_keys_status_check CHECK (((response_status >= 100) AND (response_status <= 599)))
);


--
-- Name: invoice_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_statuses (
    code text NOT NULL,
    label text NOT NULL,
    sort_order integer NOT NULL,
    color text,
    CONSTRAINT invoice_statuses_code_len CHECK (((char_length(code) >= 1) AND (char_length(code) <= 64))),
    CONSTRAINT invoice_statuses_label_len CHECK (((char_length(label) >= 1) AND (char_length(label) <= 128)))
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT uuidv7() NOT NULL,
    client_id uuid,
    number text NOT NULL,
    title text NOT NULL,
    amount numeric(14,2) NOT NULL,
    currency character(3) NOT NULL,
    status_code text NOT NULL,
    due_date date,
    issued_on date,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    bill_to_company text DEFAULT ''::text NOT NULL,
    bill_to_name text DEFAULT ''::text NOT NULL,
    bill_to_email text DEFAULT ''::text NOT NULL,
    bill_to_phone text DEFAULT ''::text NOT NULL,
    bill_to_location text DEFAULT ''::text NOT NULL,
    from_company text DEFAULT ''::text NOT NULL,
    from_email text DEFAULT ''::text NOT NULL,
    from_phone text DEFAULT ''::text NOT NULL,
    CONSTRAINT invoices_amount_nonneg CHECK ((amount >= (0)::numeric)),
    CONSTRAINT invoices_bill_to_company_len CHECK ((char_length(bill_to_company) <= 200)),
    CONSTRAINT invoices_bill_to_email_len CHECK ((char_length(bill_to_email) <= 320)),
    CONSTRAINT invoices_bill_to_location_len CHECK ((char_length(bill_to_location) <= 200)),
    CONSTRAINT invoices_bill_to_name_len CHECK ((char_length(bill_to_name) <= 200)),
    CONSTRAINT invoices_bill_to_phone_len CHECK ((char_length(bill_to_phone) <= 64)),
    CONSTRAINT invoices_currency_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT invoices_from_company_len CHECK ((char_length(from_company) <= 200)),
    CONSTRAINT invoices_from_email_len CHECK ((char_length(from_email) <= 320)),
    CONSTRAINT invoices_from_phone_len CHECK ((char_length(from_phone) <= 64)),
    CONSTRAINT invoices_number_len CHECK (((char_length(number) >= 1) AND (char_length(number) <= 64))),
    CONSTRAINT invoices_title_len CHECK (((char_length(title) >= 1) AND (char_length(title) <= 200))),
    CONSTRAINT invoices_version_pos CHECK ((version >= 1))
);


--
-- Name: invoices_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.invoices_active AS
 SELECT id,
    client_id,
    number,
    title,
    amount,
    currency,
    status_code,
    due_date,
    issued_on,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.invoices
  WHERE (archived_at IS NULL);


--
-- Name: lead_follow_ups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_follow_ups (
    id uuid DEFAULT uuidv7() NOT NULL,
    lead_id uuid NOT NULL,
    occurred_at timestamp with time zone NOT NULL,
    note text DEFAULT ''::text NOT NULL,
    outcome text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lead_follow_ups_note_len CHECK ((char_length(note) <= 10000)),
    CONSTRAINT lead_follow_ups_outcome_len CHECK ((char_length(outcome) <= 500))
);


--
-- Name: lead_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_statuses (
    code text NOT NULL,
    label text NOT NULL,
    sort_order integer NOT NULL,
    color text,
    CONSTRAINT lead_statuses_code_len CHECK (((char_length(code) >= 1) AND (char_length(code) <= 64))),
    CONSTRAINT lead_statuses_label_len CHECK (((char_length(label) >= 1) AND (char_length(label) <= 128)))
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT uuidv7() NOT NULL,
    rep_id uuid NOT NULL,
    company text NOT NULL,
    contact_name text DEFAULT ''::text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    email text DEFAULT ''::text NOT NULL,
    source text DEFAULT ''::text NOT NULL,
    status_code text NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT leads_company_len CHECK (((char_length(company) >= 1) AND (char_length(company) <= 300))),
    CONSTRAINT leads_contact_name_len CHECK ((char_length(contact_name) <= 200)),
    CONSTRAINT leads_email_len CHECK ((char_length(email) <= 320)),
    CONSTRAINT leads_notes_len CHECK ((char_length(notes) <= 10000)),
    CONSTRAINT leads_phone_len CHECK ((char_length(phone) <= 64)),
    CONSTRAINT leads_source_len CHECK ((char_length(source) <= 128)),
    CONSTRAINT leads_version_pos CHECK ((version >= 1))
);


--
-- Name: leads_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.leads_active AS
 SELECT id,
    rep_id,
    company,
    contact_name,
    phone,
    email,
    source,
    status_code,
    notes,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.leads
  WHERE (archived_at IS NULL);


--
-- Name: message_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_attachments (
    message_id uuid NOT NULL,
    file_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT uuidv7() NOT NULL,
    client_id uuid NOT NULL,
    sender_role text NOT NULL,
    sender_user_id uuid NOT NULL,
    body text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT messages_body_len CHECK ((char_length(body) <= 20000)),
    CONSTRAINT messages_sender_role_check CHECK ((sender_role = ANY (ARRAY['admin'::text, 'client'::text, 'employee'::text])))
);


--
-- Name: messages_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.messages_active AS
 SELECT id,
    client_id,
    sender_role,
    sender_user_id,
    body,
    read_at,
    created_at,
    updated_at,
    archived_at
   FROM public.messages
  WHERE (archived_at IS NULL);


--
-- Name: parties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parties (
    id uuid DEFAULT uuidv7() NOT NULL,
    kind text NOT NULL,
    name text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    street text DEFAULT ''::text NOT NULL,
    city_state_zip text DEFAULT ''::text NOT NULL,
    email text DEFAULT ''::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT parties_city_state_zip_len CHECK ((char_length(city_state_zip) <= 200)),
    CONSTRAINT parties_email_len CHECK ((char_length(email) <= 320)),
    CONSTRAINT parties_kind_check CHECK ((kind = ANY (ARRAY['insurance'::text, 'factoring'::text]))),
    CONSTRAINT parties_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 300))),
    CONSTRAINT parties_phone_len CHECK ((char_length(phone) <= 64)),
    CONSTRAINT parties_street_len CHECK ((char_length(street) <= 300)),
    CONSTRAINT parties_version_pos CHECK ((version >= 1))
);


--
-- Name: parties_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.parties_active AS
 SELECT id,
    kind,
    name,
    phone,
    street,
    city_state_zip,
    email,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.parties
  WHERE (archived_at IS NULL);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT uuidv7() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT password_reset_tokens_token_hash_len CHECK (((char_length(token_hash) >= 32) AND (char_length(token_hash) <= 128)))
);


--
-- Name: portfolio_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_items (
    id uuid DEFAULT uuidv7() NOT NULL,
    title text NOT NULL,
    category text DEFAULT ''::text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    published_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    slug text NOT NULL,
    CONSTRAINT portfolio_items_category_len CHECK ((char_length(category) <= 128)),
    CONSTRAINT portfolio_items_image_path_len CHECK ((char_length(image_path) <= 1024)),
    CONSTRAINT portfolio_items_slug_len CHECK (((char_length(slug) >= 1) AND (char_length(slug) <= 200))),
    CONSTRAINT portfolio_items_summary_len CHECK ((char_length(summary) <= 5000)),
    CONSTRAINT portfolio_items_title_len CHECK (((char_length(title) >= 1) AND (char_length(title) <= 200))),
    CONSTRAINT portfolio_items_version_pos CHECK ((version >= 1))
);


--
-- Name: portfolio_items_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.portfolio_items_active AS
 SELECT id,
    title,
    category,
    summary,
    image_path,
    published_at,
    version,
    created_at,
    updated_at,
    archived_at,
    slug
   FROM public.portfolio_items
  WHERE (archived_at IS NULL);


--
-- Name: project_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_statuses (
    code text NOT NULL,
    label text NOT NULL,
    sort_order integer NOT NULL,
    color text,
    CONSTRAINT project_statuses_code_len CHECK (((char_length(code) >= 1) AND (char_length(code) <= 64))),
    CONSTRAINT project_statuses_label_len CHECK (((char_length(label) >= 1) AND (char_length(label) <= 128)))
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT uuidv7() NOT NULL,
    client_id uuid NOT NULL,
    service_id uuid NOT NULL,
    title text NOT NULL,
    status_code text NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    manager_employee_id uuid,
    next_milestone text DEFAULT ''::text NOT NULL,
    next_milestone_date date,
    progress smallint DEFAULT 0 NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT projects_next_milestone_len CHECK ((char_length(next_milestone) <= 500)),
    CONSTRAINT projects_notes_len CHECK ((char_length(notes) <= 10000)),
    CONSTRAINT projects_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT projects_title_len CHECK (((char_length(title) >= 1) AND (char_length(title) <= 200))),
    CONSTRAINT projects_version_pos CHECK ((version >= 1))
);


--
-- Name: projects_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.projects_active AS
 SELECT id,
    client_id,
    service_id,
    title,
    status_code,
    notes,
    manager_employee_id,
    next_milestone,
    next_milestone_date,
    progress,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.projects
  WHERE (archived_at IS NULL);


--
-- Name: rate_limit_buckets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limit_buckets (
    bucket_key text NOT NULL,
    tokens numeric(12,4) NOT NULL,
    last_refill_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT rate_limit_buckets_key_len CHECK (((char_length(bucket_key) >= 1) AND (char_length(bucket_key) <= 256))),
    CONSTRAINT rate_limit_buckets_tokens_nonneg CHECK ((tokens >= (0)::numeric))
);


--
-- Name: sale_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_statuses (
    code text NOT NULL,
    label text NOT NULL,
    sort_order integer NOT NULL,
    color text,
    CONSTRAINT sale_statuses_code_len CHECK (((char_length(code) >= 1) AND (char_length(code) <= 64))),
    CONSTRAINT sale_statuses_label_len CHECK (((char_length(label) >= 1) AND (char_length(label) <= 128)))
);


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id uuid DEFAULT uuidv7() NOT NULL,
    carrier_id uuid NOT NULL,
    rep_id uuid NOT NULL,
    status_code text NOT NULL,
    amount numeric(14,2) NOT NULL,
    currency character(3) NOT NULL,
    truck_type text DEFAULT ''::text NOT NULL,
    contact_name text DEFAULT ''::text NOT NULL,
    contact_phone text DEFAULT ''::text NOT NULL,
    contact_email text DEFAULT ''::text NOT NULL,
    truck text DEFAULT ''::text NOT NULL,
    trailer text DEFAULT ''::text NOT NULL,
    insurance_party_id uuid,
    factoring_party_id uuid,
    approved_by_user_id uuid,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT sales_amount_nonneg CHECK ((amount >= (0)::numeric)),
    CONSTRAINT sales_contact_email_len CHECK ((char_length(contact_email) <= 320)),
    CONSTRAINT sales_contact_name_len CHECK ((char_length(contact_name) <= 200)),
    CONSTRAINT sales_contact_phone_len CHECK ((char_length(contact_phone) <= 64)),
    CONSTRAINT sales_currency_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT sales_trailer_len CHECK ((char_length(trailer) <= 200)),
    CONSTRAINT sales_truck_len CHECK ((char_length(truck) <= 200)),
    CONSTRAINT sales_truck_type_len CHECK ((char_length(truck_type) <= 128)),
    CONSTRAINT sales_version_pos CHECK ((version >= 1))
);


--
-- Name: sales_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_active AS
 SELECT id,
    carrier_id,
    rep_id,
    status_code,
    amount,
    currency,
    truck_type,
    contact_name,
    contact_phone,
    contact_email,
    truck,
    trailer,
    insurance_party_id,
    factoring_party_id,
    approved_by_user_id,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.sales
  WHERE (archived_at IS NULL);


--
-- Name: sales_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_messages (
    id uuid DEFAULT uuidv7() NOT NULL,
    from_rep_id uuid NOT NULL,
    to_rep_id uuid NOT NULL,
    body text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sales_messages_body_len CHECK (((char_length(body) >= 1) AND (char_length(body) <= 20000)))
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version text NOT NULL,
    checksum text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT schema_migrations_checksum_len CHECK ((char_length(checksum) = 64)),
    CONSTRAINT schema_migrations_version_len CHECK (((char_length(version) >= 1) AND (char_length(version) <= 128)))
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT uuidv7() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    path text DEFAULT ''::text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    published_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT services_description_len CHECK ((char_length(description) <= 10000)),
    CONSTRAINT services_image_path_len CHECK ((char_length(image_path) <= 1024)),
    CONSTRAINT services_path_len CHECK ((char_length(path) <= 512)),
    CONSTRAINT services_slug_len CHECK (((char_length(slug) >= 1) AND (char_length(slug) <= 200))),
    CONSTRAINT services_title_len CHECK (((char_length(title) >= 1) AND (char_length(title) <= 200))),
    CONSTRAINT services_version_pos CHECK ((version >= 1))
);


--
-- Name: services_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.services_active AS
 SELECT id,
    title,
    slug,
    description,
    path,
    image_path,
    published_at,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.services
  WHERE (archived_at IS NULL);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT uuidv7() NOT NULL,
    subject_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sessions_token_hash_len CHECK (((char_length(token_hash) >= 32) AND (char_length(token_hash) <= 128)))
);


--
-- Name: site_contact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_contact (
    id uuid DEFAULT uuidv7() NOT NULL,
    singleton_key text DEFAULT 'default'::text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    phone_href text DEFAULT ''::text NOT NULL,
    address_label text DEFAULT ''::text NOT NULL,
    address_line_1 text DEFAULT ''::text NOT NULL,
    address_line_2 text DEFAULT ''::text NOT NULL,
    address_line_3 text DEFAULT ''::text NOT NULL,
    location_lede text DEFAULT ''::text NOT NULL,
    map_embed_url text DEFAULT ''::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_contact_address_label_len CHECK ((char_length(address_label) <= 200)),
    CONSTRAINT site_contact_address_line_1_len CHECK ((char_length(address_line_1) <= 300)),
    CONSTRAINT site_contact_address_line_2_len CHECK ((char_length(address_line_2) <= 300)),
    CONSTRAINT site_contact_address_line_3_len CHECK ((char_length(address_line_3) <= 300)),
    CONSTRAINT site_contact_email_len CHECK (((char_length(email) >= 3) AND (char_length(email) <= 320))),
    CONSTRAINT site_contact_location_lede_len CHECK ((char_length(location_lede) <= 500)),
    CONSTRAINT site_contact_map_embed_url_len CHECK ((char_length(map_embed_url) <= 2000)),
    CONSTRAINT site_contact_phone_href_len CHECK ((char_length(phone_href) <= 128)),
    CONSTRAINT site_contact_phone_len CHECK (((char_length(phone) >= 1) AND (char_length(phone) <= 64))),
    CONSTRAINT site_contact_singleton_key_check CHECK ((singleton_key = 'default'::text)),
    CONSTRAINT site_contact_version_pos CHECK ((version >= 1))
);


--
-- Name: site_gallery_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_gallery_images (
    id uuid DEFAULT uuidv7() NOT NULL,
    section_key text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    alt_text text DEFAULT ''::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    published_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT site_gallery_images_alt_text_len CHECK ((char_length(alt_text) <= 500)),
    CONSTRAINT site_gallery_images_image_path_len CHECK ((char_length(image_path) <= 1024)),
    CONSTRAINT site_gallery_images_section_key_check CHECK ((section_key = ANY (ARRAY['about_gallery'::text, 'studio_flow'::text]))),
    CONSTRAINT site_gallery_images_version_pos CHECK ((version >= 1))
);


--
-- Name: site_gallery_images_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.site_gallery_images_active AS
 SELECT id,
    section_key,
    image_path,
    alt_text,
    sort_order,
    published_at,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.site_gallery_images
  WHERE (archived_at IS NULL);


--
-- Name: site_principles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_principles (
    id uuid DEFAULT uuidv7() NOT NULL,
    index_label text DEFAULT ''::text NOT NULL,
    title text NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    accent text DEFAULT 'brand'::text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    image_alt text DEFAULT ''::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    published_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT site_principles_accent_check CHECK ((accent = ANY (ARRAY['brand'::text, 'secondary'::text]))),
    CONSTRAINT site_principles_body_len CHECK ((char_length(body) <= 5000)),
    CONSTRAINT site_principles_image_alt_len CHECK ((char_length(image_alt) <= 500)),
    CONSTRAINT site_principles_image_path_len CHECK ((char_length(image_path) <= 1024)),
    CONSTRAINT site_principles_index_label_len CHECK ((char_length(index_label) <= 16)),
    CONSTRAINT site_principles_title_len CHECK (((char_length(title) >= 1) AND (char_length(title) <= 200))),
    CONSTRAINT site_principles_version_pos CHECK ((version >= 1))
);


--
-- Name: site_principles_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.site_principles_active AS
 SELECT id,
    index_label,
    title,
    body,
    accent,
    image_path,
    image_alt,
    sort_order,
    published_at,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.site_principles
  WHERE (archived_at IS NULL);


--
-- Name: site_testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_testimonials (
    id uuid DEFAULT uuidv7() NOT NULL,
    quote text NOT NULL,
    author_name text NOT NULL,
    role_title text DEFAULT ''::text NOT NULL,
    company text DEFAULT ''::text NOT NULL,
    accent text DEFAULT 'brand'::text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    published_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT site_testimonials_accent_check CHECK ((accent = ANY (ARRAY['brand'::text, 'secondary'::text, 'dark'::text]))),
    CONSTRAINT site_testimonials_author_name_len CHECK (((char_length(author_name) >= 1) AND (char_length(author_name) <= 200))),
    CONSTRAINT site_testimonials_company_len CHECK ((char_length(company) <= 200)),
    CONSTRAINT site_testimonials_image_path_len CHECK ((char_length(image_path) <= 1024)),
    CONSTRAINT site_testimonials_quote_len CHECK (((char_length(quote) >= 1) AND (char_length(quote) <= 2000))),
    CONSTRAINT site_testimonials_role_title_len CHECK ((char_length(role_title) <= 200)),
    CONSTRAINT site_testimonials_version_pos CHECK ((version >= 1))
);


--
-- Name: site_testimonials_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.site_testimonials_active AS
 SELECT id,
    quote,
    author_name,
    role_title,
    company,
    accent,
    image_path,
    sort_order,
    published_at,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.site_testimonials
  WHERE (archived_at IS NULL);


--
-- Name: tax_id_access_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_id_access_audit (
    id uuid DEFAULT uuidv7() NOT NULL,
    carrier_id uuid,
    carrier_us_dot text NOT NULL,
    carrier_mc text NOT NULL,
    carrier_legal_name text NOT NULL,
    viewer_user_id uuid NOT NULL,
    viewer_role text NOT NULL,
    viewer_email text NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL,
    correlation_id text NOT NULL,
    CONSTRAINT tax_id_access_audit_correlation_id_len CHECK (((char_length(correlation_id) >= 1) AND (char_length(correlation_id) <= 128))),
    CONSTRAINT tax_id_access_audit_legal_name_len CHECK (((char_length(carrier_legal_name) >= 1) AND (char_length(carrier_legal_name) <= 300))),
    CONSTRAINT tax_id_access_audit_mc_len CHECK (((char_length(carrier_mc) >= 1) AND (char_length(carrier_mc) <= 32))),
    CONSTRAINT tax_id_access_audit_us_dot_len CHECK (((char_length(carrier_us_dot) >= 1) AND (char_length(carrier_us_dot) <= 32))),
    CONSTRAINT tax_id_access_audit_viewer_email_len CHECK (((char_length(viewer_email) >= 3) AND (char_length(viewer_email) <= 320))),
    CONSTRAINT tax_id_access_audit_viewer_role_check CHECK ((viewer_role = ANY (ARRAY['admin'::text, 'client'::text, 'employee'::text])))
);


--
-- Name: team_member_socials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_member_socials (
    id uuid DEFAULT uuidv7() NOT NULL,
    team_member_id uuid NOT NULL,
    network text NOT NULL,
    label text NOT NULL,
    href text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT team_member_socials_href_len CHECK (((char_length(href) >= 1) AND (char_length(href) <= 2048))),
    CONSTRAINT team_member_socials_label_len CHECK (((char_length(label) >= 1) AND (char_length(label) <= 64))),
    CONSTRAINT team_member_socials_network_check CHECK ((network = ANY (ARRAY['linkedin'::text, 'instagram'::text, 'x'::text])))
);


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id uuid DEFAULT uuidv7() NOT NULL,
    name text NOT NULL,
    role_title text DEFAULT ''::text NOT NULL,
    bio text DEFAULT ''::text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    employee_id uuid,
    published_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    sort_order integer DEFAULT 0 NOT NULL,
    CONSTRAINT team_members_bio_len CHECK ((char_length(bio) <= 10000)),
    CONSTRAINT team_members_image_path_len CHECK ((char_length(image_path) <= 1024)),
    CONSTRAINT team_members_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 200))),
    CONSTRAINT team_members_role_title_len CHECK ((char_length(role_title) <= 200)),
    CONSTRAINT team_members_version_pos CHECK ((version >= 1))
);


--
-- Name: team_members_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.team_members_active AS
 SELECT id,
    name,
    role_title,
    bio,
    image_path,
    employee_id,
    published_at,
    version,
    created_at,
    updated_at,
    archived_at,
    sort_order
   FROM public.team_members
  WHERE (archived_at IS NULL);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT uuidv7() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    title text,
    role text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT users_email_len CHECK (((char_length(email) >= 3) AND (char_length(email) <= 320))),
    CONSTRAINT users_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 200))),
    CONSTRAINT users_password_hash_len CHECK (((char_length(password_hash) >= 20) AND (char_length(password_hash) <= 255))),
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'client'::text, 'employee'::text]))),
    CONSTRAINT users_title_len CHECK (((title IS NULL) OR ((char_length(title) >= 1) AND (char_length(title) <= 200)))),
    CONSTRAINT users_version_pos CHECK ((version >= 1))
);


--
-- Name: users_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.users_active AS
 SELECT id,
    email,
    password_hash,
    name,
    title,
    role,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.users
  WHERE (archived_at IS NULL);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: callback_statuses callback_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.callback_statuses
    ADD CONSTRAINT callback_statuses_pkey PRIMARY KEY (code);


--
-- Name: callbacks callbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.callbacks
    ADD CONSTRAINT callbacks_pkey PRIMARY KEY (id);


--
-- Name: carriers carriers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carriers
    ADD CONSTRAINT carriers_pkey PRIMARY KEY (id);


--
-- Name: client_employee_assignments client_employee_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_employee_assignments
    ADD CONSTRAINT client_employee_assignments_pkey PRIMARY KEY (client_id, employee_id);


--
-- Name: client_statuses client_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_statuses
    ADD CONSTRAINT client_statuses_pkey PRIMARY KEY (code);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clients clients_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_key UNIQUE (user_id);


--
-- Name: contact_message_statuses contact_message_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_message_statuses
    ADD CONSTRAINT contact_message_statuses_pkey PRIMARY KEY (code);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_key UNIQUE (user_id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: files files_storage_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_storage_key_key UNIQUE (storage_key);


--
-- Name: hmac_nonces hmac_nonces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hmac_nonces
    ADD CONSTRAINT hmac_nonces_pkey PRIMARY KEY (nonce);


--
-- Name: idempotency_keys idempotency_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idempotency_keys
    ADD CONSTRAINT idempotency_keys_pkey PRIMARY KEY (id);


--
-- Name: invoice_statuses invoice_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_statuses
    ADD CONSTRAINT invoice_statuses_pkey PRIMARY KEY (code);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: lead_follow_ups lead_follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_follow_ups
    ADD CONSTRAINT lead_follow_ups_pkey PRIMARY KEY (id);


--
-- Name: lead_statuses lead_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_statuses
    ADD CONSTRAINT lead_statuses_pkey PRIMARY KEY (code);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: message_attachments message_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_pkey PRIMARY KEY (message_id, file_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: parties parties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parties
    ADD CONSTRAINT parties_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: portfolio_items portfolio_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_items
    ADD CONSTRAINT portfolio_items_pkey PRIMARY KEY (id);


--
-- Name: project_statuses project_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_pkey PRIMARY KEY (code);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: rate_limit_buckets rate_limit_buckets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limit_buckets
    ADD CONSTRAINT rate_limit_buckets_pkey PRIMARY KEY (bucket_key);


--
-- Name: sale_statuses sale_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_statuses
    ADD CONSTRAINT sale_statuses_pkey PRIMARY KEY (code);


--
-- Name: sales_messages sales_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_messages
    ADD CONSTRAINT sales_messages_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_hash_key UNIQUE (token_hash);


--
-- Name: site_contact site_contact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_contact
    ADD CONSTRAINT site_contact_pkey PRIMARY KEY (id);


--
-- Name: site_contact site_contact_singleton_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_contact
    ADD CONSTRAINT site_contact_singleton_key_unique UNIQUE (singleton_key);


--
-- Name: site_gallery_images site_gallery_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_gallery_images
    ADD CONSTRAINT site_gallery_images_pkey PRIMARY KEY (id);


--
-- Name: site_principles site_principles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_principles
    ADD CONSTRAINT site_principles_pkey PRIMARY KEY (id);


--
-- Name: site_testimonials site_testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_testimonials
    ADD CONSTRAINT site_testimonials_pkey PRIMARY KEY (id);


--
-- Name: tax_id_access_audit tax_id_access_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_id_access_audit
    ADD CONSTRAINT tax_id_access_audit_pkey PRIMARY KEY (id);


--
-- Name: team_member_socials team_member_socials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_socials
    ADD CONSTRAINT team_member_socials_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_published_at_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_published_at_active_idx ON public.blog_posts USING btree (published_at DESC, id) WHERE ((archived_at IS NULL) AND (published_at IS NOT NULL));


--
-- Name: blog_posts_slug_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blog_posts_slug_active_key ON public.blog_posts USING btree (slug) WHERE (archived_at IS NULL);


--
-- Name: callbacks_status_created_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX callbacks_status_created_active_idx ON public.callbacks USING btree (status_code, created_at, id) WHERE (archived_at IS NULL);


--
-- Name: carriers_mc_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX carriers_mc_active_key ON public.carriers USING btree (mc) WHERE (archived_at IS NULL);


--
-- Name: carriers_us_dot_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX carriers_us_dot_active_key ON public.carriers USING btree (us_dot) WHERE (archived_at IS NULL);


--
-- Name: client_employee_assignments_employee_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX client_employee_assignments_employee_id_idx ON public.client_employee_assignments USING btree (employee_id);


--
-- Name: clients_status_code_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clients_status_code_active_idx ON public.clients USING btree (status_code, created_at, id) WHERE (archived_at IS NULL);


--
-- Name: contact_messages_status_created_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_messages_status_created_active_idx ON public.contact_messages USING btree (status_code, created_at, id) WHERE (archived_at IS NULL);


--
-- Name: employees_kind_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employees_kind_active_idx ON public.employees USING btree (kind) WHERE (archived_at IS NULL);


--
-- Name: faqs_sort_order_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX faqs_sort_order_active_idx ON public.faqs USING btree (sort_order, id) WHERE (archived_at IS NULL);


--
-- Name: files_client_id_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX files_client_id_active_idx ON public.files USING btree (client_id) WHERE (archived_at IS NULL);


--
-- Name: files_client_id_name_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX files_client_id_name_active_key ON public.files USING btree (client_id, original_name) WHERE (archived_at IS NULL);


--
-- Name: hmac_nonces_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hmac_nonces_expires_at_idx ON public.hmac_nonces USING btree (expires_at);


--
-- Name: idempotency_keys_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idempotency_keys_expires_at_idx ON public.idempotency_keys USING btree (expires_at);


--
-- Name: idempotency_keys_lookup_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idempotency_keys_lookup_idx ON public.idempotency_keys USING btree (idempotency_key, method, path, subject_id) NULLS NOT DISTINCT;


--
-- Name: invoices_client_id_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_client_id_active_idx ON public.invoices USING btree (client_id) WHERE (archived_at IS NULL);


--
-- Name: invoices_number_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX invoices_number_active_key ON public.invoices USING btree (number) WHERE (archived_at IS NULL);


--
-- Name: invoices_status_code_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_status_code_active_idx ON public.invoices USING btree (status_code, created_at, id) WHERE (archived_at IS NULL);


--
-- Name: lead_follow_ups_lead_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lead_follow_ups_lead_id_idx ON public.lead_follow_ups USING btree (lead_id, occurred_at);


--
-- Name: leads_rep_id_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_rep_id_active_idx ON public.leads USING btree (rep_id, id) WHERE (archived_at IS NULL);


--
-- Name: leads_status_code_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_status_code_active_idx ON public.leads USING btree (status_code, id) WHERE (archived_at IS NULL);


--
-- Name: message_attachments_file_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX message_attachments_file_id_idx ON public.message_attachments USING btree (file_id);


--
-- Name: messages_client_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_client_id_created_at_idx ON public.messages USING btree (client_id, created_at, id) WHERE (archived_at IS NULL);


--
-- Name: parties_kind_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX parties_kind_active_idx ON public.parties USING btree (kind, id) WHERE (archived_at IS NULL);


--
-- Name: password_reset_tokens_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX password_reset_tokens_expires_at_idx ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: password_reset_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX password_reset_tokens_user_id_idx ON public.password_reset_tokens USING btree (user_id);


--
-- Name: portfolio_items_slug_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX portfolio_items_slug_active_key ON public.portfolio_items USING btree (slug) WHERE (archived_at IS NULL);


--
-- Name: projects_client_id_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_client_id_active_idx ON public.projects USING btree (client_id) WHERE (archived_at IS NULL);


--
-- Name: projects_service_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_service_id_idx ON public.projects USING btree (service_id);


--
-- Name: projects_status_code_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_status_code_active_idx ON public.projects USING btree (status_code) WHERE (archived_at IS NULL);


--
-- Name: rate_limit_buckets_last_refill_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rate_limit_buckets_last_refill_at_idx ON public.rate_limit_buckets USING btree (last_refill_at);


--
-- Name: sales_carrier_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_carrier_id_idx ON public.sales USING btree (carrier_id);


--
-- Name: sales_factoring_party_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_factoring_party_id_idx ON public.sales USING btree (factoring_party_id) WHERE (factoring_party_id IS NOT NULL);


--
-- Name: sales_insurance_party_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_insurance_party_id_idx ON public.sales USING btree (insurance_party_id) WHERE (insurance_party_id IS NOT NULL);


--
-- Name: sales_messages_from_rep_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_messages_from_rep_id_idx ON public.sales_messages USING btree (from_rep_id, sent_at);


--
-- Name: sales_messages_to_rep_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_messages_to_rep_id_idx ON public.sales_messages USING btree (to_rep_id, sent_at);


--
-- Name: sales_rep_id_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_rep_id_active_idx ON public.sales USING btree (rep_id, id) WHERE (archived_at IS NULL);


--
-- Name: sales_status_code_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_status_code_active_idx ON public.sales USING btree (status_code) WHERE (archived_at IS NULL);


--
-- Name: services_slug_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX services_slug_active_key ON public.services USING btree (slug) WHERE (archived_at IS NULL);


--
-- Name: sessions_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_expires_at_idx ON public.sessions USING btree (expires_at);


--
-- Name: sessions_revoked_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_revoked_at_idx ON public.sessions USING btree (revoked_at) WHERE (revoked_at IS NOT NULL);


--
-- Name: sessions_subject_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_subject_id_idx ON public.sessions USING btree (subject_id);


--
-- Name: site_gallery_images_section_sort_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_gallery_images_section_sort_idx ON public.site_gallery_images USING btree (section_key, sort_order, id) WHERE (archived_at IS NULL);


--
-- Name: site_principles_sort_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_principles_sort_idx ON public.site_principles USING btree (sort_order, id) WHERE (archived_at IS NULL);


--
-- Name: site_testimonials_sort_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_testimonials_sort_idx ON public.site_testimonials USING btree (sort_order, id) WHERE (archived_at IS NULL);


--
-- Name: tax_id_access_audit_viewed_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tax_id_access_audit_viewed_at_idx ON public.tax_id_access_audit USING btree (viewed_at);


--
-- Name: tax_id_access_audit_viewer_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tax_id_access_audit_viewer_user_id_idx ON public.tax_id_access_audit USING btree (viewer_user_id);


--
-- Name: team_member_socials_team_member_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_member_socials_team_member_id_idx ON public.team_member_socials USING btree (team_member_id);


--
-- Name: team_members_sort_order_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_members_sort_order_active_idx ON public.team_members USING btree (sort_order, id) WHERE (archived_at IS NULL);


--
-- Name: users_email_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_active_key ON public.users USING btree (email) WHERE (archived_at IS NULL);


--
-- Name: users_role_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_active_idx ON public.users USING btree (role, id) WHERE (archived_at IS NULL);


--
-- Name: callbacks callbacks_status_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.callbacks
    ADD CONSTRAINT callbacks_status_code_fkey FOREIGN KEY (status_code) REFERENCES public.callback_statuses(code) ON DELETE RESTRICT;


--
-- Name: client_employee_assignments client_employee_assignments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_employee_assignments
    ADD CONSTRAINT client_employee_assignments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_employee_assignments client_employee_assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_employee_assignments
    ADD CONSTRAINT client_employee_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: clients clients_status_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_status_code_fkey FOREIGN KEY (status_code) REFERENCES public.client_statuses(code) ON DELETE RESTRICT;


--
-- Name: clients clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: contact_messages contact_messages_status_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_status_code_fkey FOREIGN KEY (status_code) REFERENCES public.contact_message_statuses(code) ON DELETE RESTRICT;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: files files_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: files files_uploaded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: invoices invoices_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: invoices invoices_status_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_status_code_fkey FOREIGN KEY (status_code) REFERENCES public.invoice_statuses(code) ON DELETE RESTRICT;


--
-- Name: lead_follow_ups lead_follow_ups_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_follow_ups
    ADD CONSTRAINT lead_follow_ups_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: leads leads_rep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_rep_id_fkey FOREIGN KEY (rep_id) REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: leads leads_status_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_status_code_fkey FOREIGN KEY (status_code) REFERENCES public.lead_statuses(code) ON DELETE RESTRICT;


--
-- Name: message_attachments message_attachments_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE RESTRICT;


--
-- Name: message_attachments message_attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: messages messages_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: messages messages_sender_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: projects projects_manager_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_manager_employee_id_fkey FOREIGN KEY (manager_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: projects projects_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT;


--
-- Name: projects projects_status_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_status_code_fkey FOREIGN KEY (status_code) REFERENCES public.project_statuses(code) ON DELETE RESTRICT;


--
-- Name: sales sales_approved_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_approved_by_user_id_fkey FOREIGN KEY (approved_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: sales sales_carrier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_carrier_id_fkey FOREIGN KEY (carrier_id) REFERENCES public.carriers(id) ON DELETE RESTRICT;


--
-- Name: sales sales_factoring_party_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_factoring_party_id_fkey FOREIGN KEY (factoring_party_id) REFERENCES public.parties(id) ON DELETE SET NULL;


--
-- Name: sales sales_insurance_party_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_insurance_party_id_fkey FOREIGN KEY (insurance_party_id) REFERENCES public.parties(id) ON DELETE SET NULL;


--
-- Name: sales_messages sales_messages_from_rep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_messages
    ADD CONSTRAINT sales_messages_from_rep_id_fkey FOREIGN KEY (from_rep_id) REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: sales_messages sales_messages_to_rep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_messages
    ADD CONSTRAINT sales_messages_to_rep_id_fkey FOREIGN KEY (to_rep_id) REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: sales sales_rep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_rep_id_fkey FOREIGN KEY (rep_id) REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: sales sales_status_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_status_code_fkey FOREIGN KEY (status_code) REFERENCES public.sale_statuses(code) ON DELETE RESTRICT;


--
-- Name: sessions sessions_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_member_socials team_member_socials_team_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_socials
    ADD CONSTRAINT team_member_socials_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict oln1ZA8psSFTCnE42OPwtZdgiusiLq9fv0xNjwBQfunzu3iDl6gk491v5JxmQsK

