/*
  # Create credentials management schema

  1. New Tables
    - `credentials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text) - Name/title of the credential
      - `type` (text) - Type: 'api_key', 'password', or 'note'
      - `username` (text, nullable) - Username for passwords
      - `value` (text) - The actual credential/note content
      - `url` (text, nullable) - Associated website/service URL
      - `description` (text, nullable) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `credentials` table
    - Add policy for users to read their own credentials
    - Add policy for users to insert their own credentials
    - Add policy for users to update their own credentials
    - Add policy for users to delete their own credentials

  3. Indexes
    - Index on user_id for efficient queries
    - Index on type for filtering by credential type
*/

CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('api_key', 'password', 'note')),
  username text,
  value text NOT NULL,
  url text,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credentials"
  ON credentials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials"
  ON credentials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
  ON credentials FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials"
  ON credentials FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_type ON credentials(type);