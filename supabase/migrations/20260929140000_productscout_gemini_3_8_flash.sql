-- Migration: Update ProductScout default Gemini model to gemini-3.8-flash
-- CevonX Products Monorepo - ProductScout
ALTER TABLE public.productscout_settings ALTER COLUMN gemini_model SET DEFAULT 'gemini-3.8-flash';
