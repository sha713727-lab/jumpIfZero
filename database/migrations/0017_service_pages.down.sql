-- 0017_service_pages.down.sql

BEGIN;

DROP VIEW IF EXISTS service_page_faqs_active;
DROP VIEW IF EXISTS service_page_benefits_active;
DROP VIEW IF EXISTS service_page_technologies_active;
DROP VIEW IF EXISTS service_page_process_steps_active;
DROP VIEW IF EXISTS service_page_build_items_active;
DROP VIEW IF EXISTS service_page_offerings_active;
DROP VIEW IF EXISTS service_pages_active;

DROP TABLE IF EXISTS service_page_faqs;
DROP TABLE IF EXISTS service_page_benefits;
DROP TABLE IF EXISTS service_page_technologies;
DROP TABLE IF EXISTS service_page_process_steps;
DROP TABLE IF EXISTS service_page_build_items;
DROP TABLE IF EXISTS service_page_offerings;
DROP TABLE IF EXISTS service_pages;

COMMIT;
