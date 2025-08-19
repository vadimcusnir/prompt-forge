-- 0017_update_stripe_price_ids.sql — Actualizarea stripe_price_id cu ID-urile reale din Stripe
begin;

-- Actualizează stripe_price_id cu ID-urile reale din Stripe
update stripe_prices set stripe_price_id = 'price_1RxrNyGcCmkUZPV6TeIU1Jhy' where stripe_price_id = 'price_creator_monthly';
update stripe_prices set stripe_price_id = 'price_1RxrNzGcCmkUZPV6ElRXw5az' where stripe_price_id = 'price_pro_monthly';
update stripe_prices set stripe_price_id = 'price_1RxrO1GcCmkUZPV64ouWPUuI' where stripe_price_id = 'price_ecommerce_yearly';
update stripe_prices set stripe_price_id = 'price_1RxrO2GcCmkUZPV6dHDp2lL7' where stripe_price_id = 'price_education_yearly';
update stripe_prices set stripe_price_id = 'price_1RxrO3GcCmkUZPV6oqDrp6Zr' where stripe_price_id = 'price_fintech_yearly';
update stripe_prices set stripe_price_id = 'price_1RxrO3GcCmkUZPV6beUtMQmT' where stripe_price_id = 'price_creator_yearly';
update stripe_prices set stripe_price_id = 'price_1RxrO3GcCmkUZPV66LozjmPm' where stripe_price_id = 'price_pro_yearly';

commit;
