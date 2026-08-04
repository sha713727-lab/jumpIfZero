--
-- PostgreSQL database dump
--

\restrict yA2lqTxa9r08a0Z8twmfbeNeZnoKXp6FFm632N6xyAdY3jtKb4sRgYyuOOjmwZb

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
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id uuid DEFAULT uuidv7() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT admins_email_len CHECK (((char_length(email) >= 3) AND (char_length(email) <= 320))),
    CONSTRAINT admins_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 200))),
    CONSTRAINT admins_password_hash_len CHECK (((char_length(password_hash) >= 20) AND (char_length(password_hash) <= 255))),
    CONSTRAINT admins_version_pos CHECK ((version >= 1))
);


--
-- Name: admins_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.admins_active AS
 SELECT id,
    email,
    password_hash,
    name,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.admins
  WHERE (archived_at IS NULL);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT uuidv7() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text DEFAULT ''::text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
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
    image_path,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.blog_posts
  WHERE (archived_at IS NULL);


--
-- Name: callbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.callbacks (
    id uuid DEFAULT uuidv7() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    note text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT callbacks_email_len CHECK (((char_length(email) >= 3) AND (char_length(email) <= 320))),
    CONSTRAINT callbacks_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 200))),
    CONSTRAINT callbacks_status_check CHECK ((status = ANY (ARRAY['new'::text, 'resolved'::text]))),
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
    status,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.callbacks
  WHERE (archived_at IS NULL);


--
-- Name: client_employee_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_employee_assignments (
    client_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT uuidv7() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    company text DEFAULT ''::text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    initials text DEFAULT ''::text NOT NULL,
    member_since date DEFAULT CURRENT_DATE NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT clients_email_len CHECK (((char_length(email) >= 3) AND (char_length(email) <= 320))),
    CONSTRAINT clients_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 200))),
    CONSTRAINT clients_password_hash_len CHECK (((char_length(password_hash) >= 20) AND (char_length(password_hash) <= 255))),
    CONSTRAINT clients_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text]))),
    CONSTRAINT clients_version_pos CHECK ((version >= 1))
);


--
-- Name: clients_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.clients_active AS
 SELECT id,
    email,
    password_hash,
    name,
    company,
    phone,
    status,
    initials,
    member_since,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.clients
  WHERE (archived_at IS NULL);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT uuidv7() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text DEFAULT ''::text NOT NULL,
    body text NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT contact_messages_body_len CHECK (((char_length(body) >= 1) AND (char_length(body) <= 20000))),
    CONSTRAINT contact_messages_email_len CHECK (((char_length(email) >= 3) AND (char_length(email) <= 320))),
    CONSTRAINT contact_messages_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 200))),
    CONSTRAINT contact_messages_status_check CHECK ((status = ANY (ARRAY['new'::text, 'read'::text]))),
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
    status,
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
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    department text DEFAULT ''::text NOT NULL,
    kind text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    team_member_id uuid,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT employees_email_len CHECK (((char_length(email) >= 3) AND (char_length(email) <= 320))),
    CONSTRAINT employees_kind_check CHECK ((kind = ANY (ARRAY['delivery'::text, 'sales'::text]))),
    CONSTRAINT employees_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 200))),
    CONSTRAINT employees_password_hash_len CHECK (((char_length(password_hash) >= 20) AND (char_length(password_hash) <= 255))),
    CONSTRAINT employees_version_pos CHECK ((version >= 1))
);


--
-- Name: employees_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.employees_active AS
 SELECT id,
    email,
    password_hash,
    name,
    title,
    department,
    kind,
    image_path,
    team_member_id,
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
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
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
    version,
    created_at,
    updated_at,
    archived_at
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
    uploaded_by_subject_id uuid NOT NULL,
    uploaded_by_role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT files_checksum_sha256_len CHECK ((char_length(checksum_sha256) = 64)),
    CONSTRAINT files_content_type_len CHECK (((char_length(content_type) >= 1) AND (char_length(content_type) <= 255))),
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
    uploaded_by_subject_id,
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
    client_id uuid NOT NULL,
    number text NOT NULL,
    title text NOT NULL,
    amount numeric(14,2) NOT NULL,
    currency character(3) NOT NULL,
    status text NOT NULL,
    due_date date,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT invoices_amount_nonneg CHECK ((amount >= (0)::numeric)),
    CONSTRAINT invoices_currency_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
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
    status,
    due_date,
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.invoices
  WHERE (archived_at IS NULL);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT uuidv7() NOT NULL,
    client_id uuid NOT NULL,
    sender_role text NOT NULL,
    body text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT messages_body_len CHECK (((char_length(body) >= 1) AND (char_length(body) <= 20000))),
    CONSTRAINT messages_sender_role_check CHECK ((sender_role = ANY (ARRAY['admin'::text, 'client'::text, 'employee'::text])))
);


--
-- Name: messages_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.messages_active AS
 SELECT id,
    client_id,
    sender_role,
    body,
    read_at,
    created_at,
    updated_at,
    archived_at
   FROM public.messages
  WHERE (archived_at IS NULL);


--
-- Name: portfolio_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_items (
    id uuid DEFAULT uuidv7() NOT NULL,
    title text NOT NULL,
    category text DEFAULT ''::text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    image_path text DEFAULT ''::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
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
    version,
    created_at,
    updated_at,
    archived_at
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
    title text NOT NULL,
    service text DEFAULT ''::text NOT NULL,
    status text NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT projects_title_len CHECK (((char_length(title) >= 1) AND (char_length(title) <= 200))),
    CONSTRAINT projects_version_pos CHECK ((version >= 1))
);


--
-- Name: projects_active; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.projects_active AS
 SELECT id,
    client_id,
    title,
    service,
    status,
    notes,
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
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version text NOT NULL,
    checksum text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
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
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
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
    role text NOT NULL,
    employee_kind text,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sessions_employee_kind_check CHECK ((((role = 'employee'::text) AND (employee_kind = ANY (ARRAY['delivery'::text, 'sales'::text]))) OR ((role <> 'employee'::text) AND (employee_kind IS NULL)))),
    CONSTRAINT sessions_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'client'::text, 'employee'::text])))
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
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT team_members_name_len CHECK (((char_length(name) >= 1) AND (char_length(name) <= 200))),
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
    version,
    created_at,
    updated_at,
    archived_at
   FROM public.team_members
  WHERE (archived_at IS NULL);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: callbacks callbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.callbacks
    ADD CONSTRAINT callbacks_pkey PRIMARY KEY (id);


--
-- Name: client_employee_assignments client_employee_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_employee_assignments
    ADD CONSTRAINT client_employee_assignments_pkey PRIMARY KEY (client_id, employee_id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


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
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


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
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: admins_email_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admins_email_active_key ON public.admins USING btree (email) WHERE (archived_at IS NULL);


--
-- Name: blog_posts_slug_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blog_posts_slug_active_key ON public.blog_posts USING btree (slug) WHERE (archived_at IS NULL);


--
-- Name: client_employee_assignments_employee_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX client_employee_assignments_employee_id_idx ON public.client_employee_assignments USING btree (employee_id);


--
-- Name: clients_email_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX clients_email_active_key ON public.clients USING btree (email) WHERE (archived_at IS NULL);


--
-- Name: employees_email_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_email_active_key ON public.employees USING btree (email) WHERE (archived_at IS NULL);


--
-- Name: employees_kind_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employees_kind_idx ON public.employees USING btree (kind) WHERE (archived_at IS NULL);


--
-- Name: files_client_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX files_client_id_idx ON public.files USING btree (client_id) WHERE (archived_at IS NULL);


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

CREATE UNIQUE INDEX idempotency_keys_lookup_idx ON public.idempotency_keys USING btree (idempotency_key, method, path, subject_id);


--
-- Name: invoices_client_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_client_id_idx ON public.invoices USING btree (client_id) WHERE (archived_at IS NULL);


--
-- Name: invoices_number_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX invoices_number_active_key ON public.invoices USING btree (number) WHERE (archived_at IS NULL);


--
-- Name: messages_client_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_client_id_idx ON public.messages USING btree (client_id) WHERE (archived_at IS NULL);


--
-- Name: projects_client_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_client_id_idx ON public.projects USING btree (client_id) WHERE (archived_at IS NULL);


--
-- Name: projects_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_status_idx ON public.projects USING btree (status) WHERE (archived_at IS NULL);


--
-- Name: services_slug_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX services_slug_active_key ON public.services USING btree (slug) WHERE (archived_at IS NULL);


--
-- Name: sessions_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_expires_at_idx ON public.sessions USING btree (expires_at);


--
-- Name: sessions_subject_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_subject_id_idx ON public.sessions USING btree (subject_id);


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
-- Name: employees employees_team_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE SET NULL;


--
-- Name: files files_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: invoices invoices_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: invoices invoices_status_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_status_fkey FOREIGN KEY (status) REFERENCES public.invoice_statuses(code) ON DELETE RESTRICT;


--
-- Name: messages messages_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: projects projects_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: projects projects_status_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_status_fkey FOREIGN KEY (status) REFERENCES public.project_statuses(code) ON DELETE RESTRICT;


--
-- Name: team_members team_members_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict yA2lqTxa9r08a0Z8twmfbeNeZnoKXp6FFm632N6xyAdY3jtKb4sRgYyuOOjmwZb

