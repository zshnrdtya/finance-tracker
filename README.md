# 💰 FinanceTrack - Personal & Family Finance Tracker

A modern, full-stack Personal & Family Finance Tracker web application built with **Next.js (App Router)**, **Supabase (PostgreSQL & Supabase Auth)**, **Tailwind CSS**, and **Recharts**.

---

## ✨ Features

1. **🔐 Multi-User Authentication & Isolation**
   - User Registration & Login via Supabase Auth (Email & Password).
   - Strict **Row Level Security (RLS)** in PostgreSQL guarantees that each user only views and modifies their own categories and transactions.
   - Automatic route protection using Next.js Middleware.

2. **📊 Dynamic Financial Dashboard (Overview)**
   - **Summary Cards**: Total Net Balance, Monthly Income Inflow, Monthly Expense Outflow, and Monthly Savings Rate.
   - **Cash Flow Visual Chart**: Multi-month bar chart for income vs. expense comparison.
   - **Recent Transactions**: Quick view of the last 5 financial entries with badges and category icons.
   - **Quick Action**: 1-click modal to record new income or expenses from anywhere in the app.

3. **📈 Visual Reports & Analytics Page**
   - **Expense Breakdown Donut/Pie Chart**: Interactive Recharts pie chart showing spending percentages per category.
   - **Income vs. Expense Trend**: Comparative multi-month bar chart with custom time-ranges (3M, 6M, 12M).
   - **Category Rankings Table**: Progress-bar driven volume breakdown.

4. **💸 Transaction Management**
   - Full history table with real-time keyword search.
   - Filters by **Type** (All, Income, Expense) and **Category**.
   - Add, Edit, and Delete transactions with instant balance recalculation.
   - **Dynamic "Other" (Lainnya) Logic**: When selecting "Other" (or "Lainnya"), the form dynamically highlights and requires the description/source field (e.g. *"Dikasih teman"*, *"Jual barang"*).

5. **🏷️ Custom Categories & Settings**
   - Create, edit, and delete custom Income and Expense categories.
   - Assign custom palette colors and Lucide icons.
   - Automated seeding trigger on user signup (e.g., *Gaji*, *Uang Orang Tua*, *Makanan & Minuman*, *Transportasi*, *Belanja*, *Lainnya*).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend**: React 19, TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS)

---

## 🚀 Quick Setup Instructions

### 1. Configure Environment Variables
Create a `.env.local` file in the root directory (or edit the provided `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Set Up Supabase Database (SQL Schema & RLS)
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab.
3. Paste and run the SQL code from [`supabase/schema.sql`](./supabase/schema.sql):

```sql
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Transaction Type ENUM
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Categories Table
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

-- Transactions Table
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

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Categories RLS Policies
CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Transactions RLS Policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Automatic Trigger for Default Categories on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (user_id, name, type, color, icon)
    VALUES
        (NEW.id, 'Gaji', 'income', '#10B981', 'Briefcase'),
        (NEW.id, 'Uang Orang Tua', 'income', '#3B82F6', 'HeartHandshake'),
        (NEW.id, 'Bisnis / Freelance', 'income', '#8B5CF6', 'Laptop'),
        (NEW.id, 'Investasi & Dividen', 'income', '#06B6D4', 'TrendingUp'),
        (NEW.id, 'Lainnya', 'income', '#64748B', 'HelpCircle'),
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_categories();
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start tracking!

---

## 📁 Project Structure

```
finance-tracker/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx         # Auth branding layout
│   │   ├── login/page.tsx     # Login page
│   │   └── register/page.tsx  # Register page
│   ├── (dashboard)/
│   │   ├── layout.tsx         # Dashboard layout with FinanceProvider & Shell
│   │   ├── page.tsx           # Dashboard Overview (Cards, Recent, Quick Charts)
│   │   ├── transactions/      # Full Transactions table with filters
│   │   ├── analytics/         # Reports & Recharts visual analytics
│   │   └── categories/        # Settings & Custom Categories
│   ├── auth/callback/route.ts # Supabase OAuth & email confirmation handler
│   ├── globals.css            # Tailwind CSS styling & font variables
│   └── layout.tsx             # Root HTML & Plus Jakarta Sans typography
├── components/
│   ├── auth/                  # LoginForm & RegisterForm components
│   ├── dashboard/             # SummaryCards, RecentTransactions, MonthlyOverviewChart
│   ├── transactions/          # TransactionList, TransactionFormModal
│   ├── analytics/             # ExpensePieChart, IncomeExpenseBarChart, CategoryBreakdownTable
│   ├── categories/            # CategoryList, CategoryFormModal
│   ├── layout/                # Sidebar, Header, DashboardShell
│   └── ui/                    # Button, Input, Select, Modal, Card, Badge, Toast, CategoryIcon
├── lib/
│   ├── context/               # FinanceContext provider with real-time calculations & mutations
│   ├── supabase/              # Browser, server, and middleware Supabase clients
│   ├── constants.ts           # Category icons, colors, defaults
│   ├── types.ts               # TypeScript types for Database, Auth & UI
│   └── utils.ts               # Indonesian Rupiah / USD formatting, date utils, calculations
├── middleware.ts              # Route protection middleware
└── supabase/
    └── schema.sql             # Complete PostgreSQL database schema
```
