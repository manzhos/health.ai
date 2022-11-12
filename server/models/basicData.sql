-- User type:::  1 - Admin, 2 - Doctor, 3 - Client 4 - Staff
INSERT INTO user_types ("usertype") VALUES 
('Admin user'),
('Doctor / Practitioner'),
('Client'),
('Staff / Manager');

INSERT INTO procedure_types ("proceduretype") VALUES 
('Face'),
('Body'),
('Breast'),
('Non-surgical'),
('Cosmetic treatments'),
('Female genital surgery'),
('Male surgery');

INSERT INTO procedures (
  "procedure", 
  "proceduretype_id", 
  "time", 
  "cost"
) VALUES 
-- type 4
('BTX-A treatment', 4, 60, 50),
('Cosmetic fillers', 4, 60, 50),
('Hand rejuvenation', 4, 60, 50),
('Hyperhidrosis therapy', 4, 60, 50),
('Lip augmentation', 4, 60, 50),
('PRP therapy (Vampire lift)', 4, 60, 50),
('Sclerotherapy (Spider veins treatment)', 4, 60, 50),
('Scar Correction', 4, 60, 50),
-- type 1
('Eyebrow lift', 1, 120, 200),
('Eyelid surgery (blepharoplasty)', 1, 120, 200),
('Facelift', 1, 120, 200),
('Neck lift', 1, 120, 200),
('Fat grafting', 1, 120, 200),
('Face implants', 1, 120, 200),
('Rhinoplasty', 1, 120, 200),
('Septorhinoplasty endonasal approach', 1, 120, 200),
('Minimally invasive rhinoplasty', 1, 120, 200),
('Combined facial rejuvenation', 1, 120, 200),
('Ear reshaping', 1, 120, 200),
-- type 2
('Tummy tuck (Abdominoplasty)', 2, 480, 1600),
('Lipo abdominoplasty with tummy tuck liposuction', 2, 480, 1600),
('Tummy tuck without drainage', 2, 480, 1600),
('Mini tummy tuck', 2, 480, 1600),
('Liposuction', 2, 480, 1600),
('Plastic surgery after massive weight loss', 2, 480, 1600),
('Arms lift', 2, 480, 1600),
('Tigh lift', 2, 480, 1600),
('Brazilian butt lift', 2, 480, 1600),
('Lower Body Lift', 2, 480, 1600),
('Mommy makeover', 2, 480, 1600),
('Cuff implants', 2, 480, 1600),
-- type 3
('Breast augmentation', 3, 480, 1800),
('Large breast augmentation', 3, 480, 1800),
('Rapid recovery breast augmentation', 3, 480, 1800),
('Combined breast augmentation (implants + fat transfer)', 3, 480, 1800),
('Secondary breast augmentation', 3, 480, 1800),
('Breast reconstruction', 3, 480, 1800),
('Oncoplastic breast surgery', 3, 480, 1800),
('Breast augmentation with new generation super-light implants', 3, 480, 1800),
('Breast lift (Mastopexy)', 3, 480, 1800),
('Breast reduction', 3, 480, 1800),
('Nipple reconstruction', 3, 480, 1800),
('Nipple reduction', 3, 480, 1800),
('Combined breast augmentation with implants and lip filling', 3, 480, 1800),
-- type 5 
('Chemical peeling', 5, 60, 80),
-- type 6
('Female genital surgery procedures', 6, 360, 3200),
-- type 7
('Abdominoplasty', 7, 480, 2400),
('Gynecomastia operation for men', 7, 480, 2400),
('Facelift for men', 7, 480, 2400),
('Liposuction and body reshaping for men', 7, 480, 2400),
('Rhinoplasty for men', 7, 480, 2400),
('Ear reshaping', 7, 480, 2400);
