---
title: "Supabase tables + RLS (student progress)"
category: Build/Execution
project: global
tags: ["build", "sql"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla de Gretel — Execution Prompts"
created: 2026-07-12
updated: 2026-07-12
---
create table if not exists student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id),
  lesson_number int not null,
  activity_type text not null,
  completed_at timestamptz default now(),
  score numeric
);
create table if not exists student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id),
  badge_id text not null,
  earned_at timestamptz default now()
);
create table if not exists student_stickers (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id),
  sticker_id text not null,
  earned_at timestamptz default now()
);
create table if not exists student_streaks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id),
  current_streak int default 0,
  last_active_date date,
  longest_streak int default 0
);

alter table student_progress enable row level security;
alter table student_badges  enable row level security;
alter table student_stickers enable row level security;
alter table student_streaks  enable row level security;

create policy "own rows insert" on student_progress for insert with check (student_id = auth.uid());
create policy "own rows select" on student_progress for select using (student_id = auth.uid());
create policy "own streak select" on student_streaks for select using (student_id = auth.uid());
create policy "own streak update" on student_streaks for update using (student_id = auth.uid());
