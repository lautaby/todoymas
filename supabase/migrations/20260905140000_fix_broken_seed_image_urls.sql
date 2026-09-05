/*
# Fix: 3 broken product image URLs from the demo seed

1. What happened
- The previous seed migration (20260905130000) guessed that every Pexels photo
  URL follows the pattern `pexels-photo-{id}.jpeg`. That pattern only applies
  to photos uploaded from ~2016 onward. Three of the seeded photos are much
  older uploads (ids 2542, 5553, 6714) that use their original filename
  instead, so those three URLs were 404s.

2. What this does
- Updates just those 3 products' `images` column to the correct, verified
  working Pexels URL. All other seeded product images were verified against
  Pexels and are unaffected.

3. Safe to re-run
- Uses UPDATE ... WHERE name = '...', so running it again is harmless.
*/

UPDATE products
SET images = ARRAY['https://images.pexels.com/photos/2542/fishing-fishing-tackle-fisherman-bait.jpg?auto=compress&cs=tinysrgb&w=800']
WHERE name = 'Kit de señuelos y anzuelos x25';

UPDATE products
SET images = ARRAY['https://images.pexels.com/photos/5553/makeup-brushes.jpg?auto=compress&cs=tinysrgb&w=800']
WHERE name = 'Set de brochas de maquillaje profesional x12';

UPDATE products
SET images = ARRAY['https://images.pexels.com/photos/6714/light-forest-trees-morning.jpg?auto=compress&cs=tinysrgb&w=800']
WHERE name = 'Carpa impermeable 4 personas doble techo';
