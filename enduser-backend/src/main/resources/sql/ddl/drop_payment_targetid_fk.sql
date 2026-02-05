-- Safe script to drop FOREIGN KEY on PAYMENT.target_id and adjust index if present
-- This script works on MySQL/MariaDB. It finds FK and index names dynamically and executes DROP/CREATE safely.
-- IMPORTANT: Backup the PAYMENT table (or DB) before running.

USE `fitneedsdb`;

-- 1) Find FK constraint name for target_id (if any)
SELECT CONSTRAINT_NAME
  INTO @fk_name
  FROM information_schema.KEY_COLUMN_USAGE
 WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'PAYMENT'
   AND COLUMN_NAME = 'target_id'
   AND REFERENCED_TABLE_NAME IS NOT NULL
 LIMIT 1;

-- Show found FK name (NULL if none)
SELECT @fk_name as found_fk_name;

-- 2) Drop foreign key if found (execute dynamic SQL)
SET @drop_fk_sql = IF(@fk_name IS NOT NULL AND @fk_name <> '',
    CONCAT('ALTER TABLE `PAYMENT` DROP FOREIGN KEY `', @fk_name, '`;'),
    'SELECT "no_fk_to_drop";');
PREPARE stmt_fk FROM @drop_fk_sql;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- 3) Conditionally drop old index (idx_payment_pay_type_ref) if it exists
SELECT COUNT(*)
  INTO @idx_cnt
  FROM information_schema.STATISTICS
 WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'PAYMENT'
   AND INDEX_NAME = 'idx_payment_pay_type_ref';

SET @drop_idx_sql = IF(@idx_cnt > 0,
    'DROP INDEX idx_payment_pay_type_ref ON `PAYMENT`;',
    'SELECT "no_index_to_drop";');
PREPARE stmt_idx FROM @drop_idx_sql;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

-- 4) Ensure there is an index on target_id for performance (create if not exists)
SELECT COUNT(*) INTO @idx_target_cnt
 FROM information_schema.STATISTICS
 WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'PAYMENT'
   AND INDEX_NAME = 'idx_payment_target_id';

SET @create_idx_sql = IF(@idx_target_cnt = 0,
    'CREATE INDEX idx_payment_target_id ON `PAYMENT` (target_id);',
    'SELECT "index_already_exists";');
PREPARE stmt_create_idx FROM @create_idx_sql;
EXECUTE stmt_create_idx;
DEALLOCATE PREPARE stmt_create_idx;

-- 5) Verification: list indexes covering target_id
SELECT INDEX_NAME, COLUMN_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'PAYMENT'
  AND COLUMN_NAME = 'target_id';
