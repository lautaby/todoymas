/*
# Fix category name accents

The demo seed migration originally inserted "Tecnologia" and
"Fotografia y Electronica" without their correct Spanish accents.
This migration corrects those two category names for any database
where the seed already ran, using the (unaffected) slug to target
the rows safely. Safe to re-run.
*/

UPDATE categories SET name = 'Tecnología' WHERE slug = 'tecnologia' AND name = 'Tecnologia';
UPDATE categories SET name = 'Fotografía y Electrónica' WHERE slug = 'fotografia-y-electronica' AND name = 'Fotografia y Electronica';
