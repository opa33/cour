-- Test: простой insert для проверки что всё работает

-- Очистим таблицы для чистого теста
DELETE FROM shifts;
DELETE FROM users;

-- Добавим тестового пользователя
INSERT INTO users (telegram_id, username, leaderboard_opt_in)
VALUES ('dev-test-123', 'Test User', true);

-- Добавим тестовую смену
INSERT INTO shifts (
  telegram_id, date, minutes, zone1, zone2, zone3, 
  kilometers, "fuelCost", "timeIncome", "ordersIncome", 
  "totalWithTax", "totalWithoutTax", "netProfit"
)
VALUES (
  'dev-test-123', '2026-01-19', 480, 5, 3, 2, 
  82, 1000, 1200, 2300, 3500, 3045, 2045
);

-- Проверим что вставилось
SELECT 'Users:' as info;
SELECT * FROM users;

SELECT 'Shifts:' as info;
SELECT * FROM shifts;

-- Если видим данные - значит всё работает!
-- Если нет данных - проблема с перм правами