-- First clean up ALL duplicate expert records (keep only the oldest per user_id)
DELETE FROM experts
WHERE id IN (
  SELECT id FROM (
    SELECT id, user_id, created_at,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
    FROM experts
    WHERE user_id IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- Now add unique constraint to prevent future duplicates
ALTER TABLE experts ADD CONSTRAINT experts_user_id_unique UNIQUE (user_id);