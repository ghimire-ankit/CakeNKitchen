

USE cakenk;

-- 1. Inject baseline categories
INSERT INTO categories (name, description, image_url) VALUES
('Tiered Wedding Cakes', 'Multi-layered custom elegant structures for weddings.', 'wedding_category.jpg'),
('Premium Chocolate Series', 'Rich, deep Dutch-process cocoa variants and ganache.', 'chocolate_category.jpg'),
('Fresh Fruit Delights', 'Light sponge blocks layered with organic seasonal fruits.', 'fruit_category.jpg');

-- 2. Inject core product menu
TRUNCATE TABLE cakes;

INSERT INTO cakes (name, description, base_price, cat_id, image_url, is_available) VALUES
('Classic Rose Anniversary', 'Double-tiered red velvet sponge with elegant white buttercream piping.', 1200.00, 1, 'Anniversary.jpeg', TRUE),
('Luxury Golden Anniversary', 'Three-tier vanilla sponge accented with gold leaf sheets and white roses.', 2800.00, 1, 'Deluxe_Anniversary.jpeg', TRUE),
('Elegant Floral Engagement', 'Delightful strawberry chiffon block garnished with delicate sugar flowers.', 1500.00, 1, 'Engagement_cake.jpeg', TRUE),
('Bridal Lace White Forest', 'Traditional white forest base decorated with cream pearls and floral lace tiering.', 1800.00, 1, 'White_forest_anniversary.jpeg', TRUE),
('Midnight Snow Birthday Cake', 'Rich chocolate cake with white snowflake frosting highlights.', 900.00, 2, 'snow_birthday_cake.jpeg', TRUE),
('Royal Barbie Doll Birthday', 'Vanilla chiffon cake shaped beautifully like a barbie doll dress with pink frosting.', 1600.00, 2, 'Barbie_birthday.jpeg', TRUE),
('Blueberry Cream Birthday Bliss', 'Zesty blueberry puree sponge layered with creamy heavy frosting toppings.', 950.00, 2, 'Blueberry_birthday.jpeg', TRUE),
('Cricket Pitch Birthday Special', 'Green velvet grass-textured cake themed for cricket fans with fondant wickets.', 1100.00, 2, 'Cricket_birthday_cake.jpeg', TRUE),
('Royal Baby Shower Dream', 'Light and fluffy strawberry card layers decorated with blue/pink cloud frosting.', 1350.00, 3, 'Baby_shower.jpeg', TRUE),
('Artisanal Mother Day Fondant', 'Heart-shaped strawberry cream cake dedicated with fondant calligraphy greetings.', 1000.00, 3, 'Mothers_day.jpeg', TRUE);
