/*
  # Add client number to users table

  1. Changes
    - Add client_number column to users table
    - Create function to generate unique client numbers
    - Create trigger to automatically assign client numbers to new users
    - Add index for faster lookups

  2. Security
    - No changes to RLS policies needed as client_number is part of users table
*/

-- Add client_number column
ALTER TABLE users ADD COLUMN client_number text UNIQUE;

-- Create sequence for client numbers
CREATE SEQUENCE IF NOT EXISTS client_number_seq START 1000;

-- Create function to generate client number
CREATE OR REPLACE FUNCTION generate_client_number()
RETURNS text AS $$
DECLARE
  new_number text;
  unique_number boolean := false;
BEGIN
  WHILE NOT unique_number LOOP
    -- Generate number in format DK-XXXXX where X is a digit
    new_number := 'DK-' || LPAD(nextval('client_number_seq')::text, 5, '0');
    
    -- Check if number already exists
    SELECT NOT EXISTS (
      SELECT 1 FROM users WHERE client_number = new_number
    ) INTO unique_number;
    
    -- If number exists, loop will continue and generate a new one
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign client number on insert
CREATE OR REPLACE FUNCTION set_client_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set client number if it's not already set
  IF NEW.client_number IS NULL THEN
    NEW.client_number := generate_client_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_client_number
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_client_number();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS users_client_number_idx ON users(client_number);