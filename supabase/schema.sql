-- =========================================================
-- PERSONAL FINANCE TRACKER - SUPABASE DATABASE SCHEMA
-- =========================================================
-- This script creates the database structure, Row Level Security (RLS)
-- policies, indexes, and an automated trigger for seeding default categories.

-- 1. Enable UUID Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Transaction Type ENUM
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type transaction_type NOT NULL,
    color VARCHAR(20) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'Tag',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_category_name_type UNIQUE (user_id, name, type)
);

-- 4. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

-- 6. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for Categories
-- Users can only view their own categories
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
CREATE POLICY "Users can view own categories"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own categories
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own categories
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own categories
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- 8. RLS Policies for Transactions
-- Users can only view their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own transactions
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transactions
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- 9. Automatic Trigger to Seed Default Categories on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Seed Default Income Categories
    INSERT INTO public.categories (user_id, name, type, color, icon)
    VALUES
        (NEW.id, 'Gaji', 'income', '#10B981', 'Briefcase'),
        (NEW.id, 'Uang Orang Tua', 'income', '#3B82F6', 'HeartHandshake'),
        (NEW.id, 'Bisnis / Freelance', 'income', '#8B5CF6', 'Laptop'),
        (NEW.id, 'Investasi & Dividen', 'income', '#06B6D4', 'TrendingUp'),
        (NEW.id, 'Lainnya', 'income', '#64748B', 'HelpCircle')
    ON CONFLICT (user_id, name, type) DO NOTHING;

    -- Seed Default Expense Categories
    INSERT INTO public.categories (user_id, name, type, color, icon)
    VALUES
        (NEW.id, 'Makanan & Minuman', 'expense', '#EF4444', 'Utensils'),
        (NEW.id, 'Transportasi', 'expense', '#F59E0B', 'Car'),
        (NEW.id, 'Belanja & Kebutuhan', 'expense', '#EC4899', 'ShoppingBag'),
        (NEW.id, 'Tagihan & Utilitas', 'expense', '#6366F1', 'Receipt'),
        (NEW.id, 'Hiburan & Hobi', 'expense', '#14B8A6', 'Film'),
        (NEW.id, 'Kesehatan', 'expense', '#F43F5E', 'Activity'),
        (NEW.id, 'Pendidikan', 'expense', '#3B82F6', 'GraduationCap'),
        (NEW.id, 'Lainnya', 'expense', '#64748B', 'HelpCircle')
    ON CONFLICT (user_id, name, type) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution whenever a new user signs up in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_categories();
