-- Hide orphan seed expert records that have no user_id (not manageable, no availability)
UPDATE experts SET is_available = false WHERE user_id IS NULL;