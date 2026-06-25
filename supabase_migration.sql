-- Run this SQL in your Supabase SQL Editor to add the required columns for Nazalat details

ALTER TABLE sub_units
ADD COLUMN white_marked INTEGER DEFAULT 0,
ADD COLUMN white_extra INTEGER DEFAULT 0,
ADD COLUMN white_applied INTEGER DEFAULT 0,
ADD COLUMN white_date TEXT DEFAULT '',
ADD COLUMN brown_marked INTEGER DEFAULT 0,
ADD COLUMN brown_extra INTEGER DEFAULT 0,
ADD COLUMN brown_applied INTEGER DEFAULT 0,
ADD COLUMN brown_date TEXT DEFAULT '';
