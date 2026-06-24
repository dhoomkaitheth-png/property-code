-- =============================================
-- Uttarakhand Districts, Tehsils & Villages
-- Complete Seed Data
-- =============================================

-- =============================================
-- DISTRICTS (All 13)
-- =============================================
INSERT INTO districts (district_name, state_name) VALUES
('Almora', 'Uttarakhand'),
('Bageshwar', 'Uttarakhand'),
('Chamoli', 'Uttarakhand'),
('Champawat', 'Uttarakhand'),
('Dehradun', 'Uttarakhand'),
('Haridwar', 'Uttarakhand'),
('Nainital', 'Uttarakhand'),
('Pauri Garhwal', 'Uttarakhand'),
('Pithoragarh', 'Uttarakhand'),
('Rudraprayag', 'Uttarakhand'),
('Tehri Garhwal', 'Uttarakhand'),
('Udham Singh Nagar', 'Uttarakhand'),
('Uttarkashi', 'Uttarakhand');

-- =============================================
-- TEHSILS
-- =============================================

-- Almora Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(1, 'Almora'),
(1, 'Bhikiyasain'),
(1, 'Chaukhutiya'),
(1, 'Dwarahat'),
(1, 'Jalna'),
(1, 'Jainti'),
(1, 'Khad'),
(1, 'Lakhani'),
(1, 'Masi'),
(1, 'Masi Ghat'),
(1, 'Ranikhet'),
(1, 'Someshwar'),
(1, 'Sult'),
(1, 'Syura'),
(1, 'Takula');

-- Bageshwar Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(2, 'Bageshwar'),
(2, 'Bajpur'),
(2, 'Kapkote'),
(2, 'Garud'),
(2, 'Kanda');

-- Chamoli Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(3, 'Chamoli'),
(3, 'Badrinath'),
(3, 'Joshimath'),
(3, 'Karnaprayag'),
(3, 'Narayan Bagar'),
(3, 'Pauri'),
(3, 'Pokhari'),
(3, 'Tharali'),
(3, 'Gairsain');

-- Champawat Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(4, 'Champawat'),
(4, 'Barakot'),
(4, 'Lohaghat'),
(4, 'Pauri'),
(4, 'Pati'),
(4, 'Chandni');

-- Dehradun Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(5, 'Dehradun'),
(5, 'Vikasnagar'),
(5, 'Doiwala'),
(5, 'Rishikesh'),
(5, 'Chakrata'),
(5, 'Kalsi'),
(5, 'Tyuni');

-- Haridwar Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(6, 'Haridwar'),
(6, 'Roorkee'),
(6, 'Laksar'),
(6, 'Bhagwanpur');

-- Nainital Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(7, 'Haldwani'),
(7, 'Nainital'),
(7, 'Ramnagar'),
(7, 'Kaladhungi'),
(7, 'Dhari'),
(7, 'Kosyakutoli'),
(7, 'Betalghat'),
(7, 'Bhimtal'),
(7, 'Okhalkanda'),
(7, 'Kotabagh');

-- Pauri Garhwal Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(8, 'Pauri'),
(8, 'Kotdwar'),
(8, 'Lansdowne'),
(8, 'Satpuli'),
(8, 'Srinagar'),
(8, 'Thalisain'),
(8, 'Khirsu'),
(8, 'Dhumakot'),
(8, 'Yamkeshwar'),
(8, 'Ekeshwar'),
(8, 'Pabo'),
(8, 'Dwarikhal'),
(8, 'Rikhnikhal'),
(8, 'Kandi'),
(8, 'Bironkhal');

-- Pithoragarh Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(9, 'Pithoragarh'),
(9, 'Dharchula'),
(9, 'Didihat'),
(9, 'Gangolihat'),
(9, 'Beringag'),
(9, 'Munsyari'),
(9, 'Kanalichhina'),
(9, 'Patti'),
(9, 'Thal'),
(9, 'Tejam');

-- Rudraprayag Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(10, 'Rudraprayag'),
(10, 'Kedarnath'),
(10, 'Jakholi'),
(10, 'Ukhimath'),
(10, 'Augustmuni');

-- Tehri Garhwal Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(11, 'Tehri'),
(11, 'Devprayag'),
(11, 'Ghansali'),
(11, 'Kirtinagar'),
(11, 'Narendranagar'),
(11, 'Pratapnagar'),
(11, 'Bhatwari'),
(11, 'Dhanolti'),
(11, 'Jakhani'),
(11, 'Jaultsi'),
(11, 'Chamba'),
(11, 'Munikireti');

-- Udham Singh Nagar Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(12, 'Kashipur'),
(12, 'Kichha'),
(12, 'Khatima'),
(12, 'Bajpur'),
(12, 'Jaspur'),
(12, 'Rudrapur'),
(12, 'Sitarganj'),
(12, 'Gadarpur'),
(12, 'Shaktigarh'),
(12, 'Sultanpur Patti'),
(12, 'Dhakrani'),
(12, 'Mahua Dabra Haripura');

-- Uttarkashi Tehsils
INSERT INTO tehsils (district_id, tehsil_name) VALUES
(13, 'Uttarkashi'),
(13, 'Chinyalisaur'),
(13, 'Dunda'),
(13, 'Gangotri'),
(13, 'Purola'),
(13, 'Yamunotri'),
(13, 'Bhatwari'),
(13, 'Naugaon'),
(13, 'Mori'),
(13, 'Puraula');

-- =============================================
-- VILLAGES (Sample villages for key tehsils)
-- =============================================

-- Dehradun District - Vikasnagar Tehsil Villages
INSERT INTO villages (district_id, tehsil_id, village_name)
SELECT 5, t.id, v.village_name
FROM (SELECT id FROM tehsils WHERE district_id = 5 AND tehsil_name = 'Vikasnagar') t
CROSS JOIN (VALUES
    ('Herbertpur'), ('Dhakrani'), ('Dakpathar'), ('Sahaspur'), ('Selaqui'),
    ('Bhalol'), ('Barwa'), ('Bidholi'), ('Chak Garh'), ('Chandpur'),
    ('Damta'), ('Dang'), ('Deoband'), ('Deoranian'), ('Dhalipur'),
    ('Dhanpura'), ('Dharkot'), ('Dhaulakhand'), ('Dhaula'), ('Dheela'),
    ('Gajiyawala'), ('Garhi'), ('Ghamandpur'), ('Ghat'), ('Ghurkudi'),
    ('Gudiyal'), ('Gumtala'), ('Haldukhal'), ('Haripur'), ('Hatnala'),
    ('Jhabrera'), ('Jiwangarh'), ('Jodhpur'), ('Kalsi'), ('Kandoli'),
    ('Karamwala'), ('Khalani'), ('Khanpur'), ('Khata'), ('Kheri'),
    ('Khodiyal'), ('Kishanpur'), ('Kuanwala'), ('Kudian'), ('Kumharsain'),
    ('Kunja'), ('Kuthal'), ('Lachhiwala'), ('Ladpur'), ('Lakshmipur'),
    ('Lalpur'), ('Lambagarh'), ('Lamtar'), ('Ledar'), ('Lohari'),
    ('Madarsu'), ('Mahal'), ('Maju'), ('Malkot'), ('Manduwala'),
    ('Mangaon'), ('Mathura'), ('Mehuwala'), ('Mohabbewala'), ('Mohi'),
    ('Mori'), ('Motapur'), ('Muni Kirai'), ('Nagal'), ('Nagdev'),
    ('Nakroti'), ('Nandanagar'), ('Nandi'), ('Nathuwala'), ('Nayagaon'),
    ('Nehrugram'), ('Nimbuwala'), ('Pabali'), ('Padampur'), ('Palas'),
    ('Palli'), ('Panwar'), ('Patlawa'), ('Phulsani'), ('Pirwa'),
    ('Pithuwala'), ('Pratitnagar'), ('Raiwala'), ('Rajawala'), ('Rampur'),
    ('Rampur Ghat'), ('Rani Pokhari'), ('Rasoolpur'), ('Ratanpur'),
    ('Rauli'), ('Rishikesh'), ('Roorki'), ('Sahiyapur'), ('Sain'),
    ('Sakhan'), ('Salempur'), ('Saliyar'), ('Samaspur'), ('Sangamwala'),
    ('Sanshpur'), ('Sarangpur'), ('Saraswati'), ('Satyanarayan'),
    ('Sauli'), ('Sem'), ('Shahpur'), ('Shakhan'), ('Shampur'),
    ('Shankarpur'), ('Shantinagar'), ('Sharab'), ('Shastri Nagar'),
    ('Sheeshambhara'), ('Shivpuri'), ('Shyampur'), ('Singhpur'),
    ('Sinsyaru'), ('Sipwala'), ('Sitapur'), ('Surala'),
    ('Surya'), ('Taknaur'), ('Talla'), ('Tanda'), ('Tikola'),
    ('Tilakpur'), ('Timli'), ('Toli'), ('Tons'), ('Tunwala')
) AS v(village_name);

-- Haridwar District - Roorkee Tehsil Villages
INSERT INTO villages (district_id, tehsil_id, village_name)
SELECT 6, t.id, v.village_name
FROM (SELECT id FROM tehsils WHERE district_id = 6 AND tehsil_name = 'Roorkee') t
CROSS JOIN (VALUES
    ('Alipur'), ('Asafpur'), ('Bahadrabad'), ('Bajheri'), ('Bakarpur'),
    ('BALLA KHERA'), ('Bamnikhera'), ('Barkatpur'), ('Bashirpur'), ('Bhadfar'),
    ('Bhagwanpur'), ('Bhanpur'), ('Bhatpura'), ('Bhatwala'), ('Bhavanpur'),
    ('Bhikampur'), ('Bhopalpur'), ('Bhorakalan'), ('Bhur'), ('Bhurgarh'),
    ('Bilwa'), ('Bishanpur'), ('Bishnupur'), ('Bohalpur'), ('Brahmanwala'),
    ('Buda Khera'), ('Budhanpur'), ('Chakmohiuddinpur'), ('Chakwala'), ('Chandehri'),
    ('Chatarpur'), ('Chharba'), ('Chidderwala'), ('Chita Khera'),
    ('Dahu'), ('Daulatpur'), ('Deoband'), ('Deoranian'), ('Dhandera'),
    ('Dhaniya Khera'), ('Dholra'), ('Falavada'), ('Fatehpur'),
    ('Gadhi'), ('Gadhipur'), ('Gajnera'), ('Ganeshpur'), ('Gangheri'),
    ('Garhi Himmat Singh'), ('Garhi Taj'), ('Ghatam'),
    ('Gijyana Khera'), ('Gokalpur'), ('Gonda'), ('Gorakhnagar'),
    ('Govindpur'), ('Gujedu'), ('Guljarpur'), ('Gumanpura'),
    ('Gurukul'), ('Hakikpur'), ('Haldoi'), ('Haldukhal'),
    ('Harchandpur'), ('Hardo Khera'), ('Haripur'), ('Harjipur'),
    ('Harnampur'), ('Hariyawala'), ('Hasanpur'), ('Hathipur'),
    ('Hukmipur'), ('Ibrahim'), ('Ichhawal'), ('Iqbalpur'),
    ('Ismailpur'), ('Ishanpur'), ('Izzatuddinpur'), ('Jabda'),
    ('Jadla'), ('Jahanabad'), ('Jakhera'), ('Jalalpur'),
    ('Jalandhar'), ('Jalapur'), ('Jamalpur'), ('Jamtha'),
    ('Janauli'), ('Jandhera'), ('Jatan Khera'), ('Jawalapur'),
    ('Jhabiran'), ('Jhal'), ('Jhandapur'), ('Jhilmil'),
    ('Jiwangarh'), ('Jogipur'), ('Kachnal Gosain'),
    ('Kadhupur'), ('Kailashpur'), ('Kajiyana'), ('Kakdipur'),
    ('Kalanpur'), ('KALIYANA'), ('Kampur'), ('Kandoli'),
    ('Kankari'), ('Kannauj'), ('Kano Ka Nagla'),
    ('Kapasan'), ('Karheda'), ('Karoli'), ('Karora'),
    ('Kasamalpur'), ('Kasampur'), ('Kashi Ram'), ('Kashmira'),
    ('Kaul'), ('Kaunchi'), ('Kazampur'), ('Kesarwala')
) AS v(village_name);

-- Nainital District - Haldwani Tehsil Villages
INSERT INTO villages (district_id, tehsil_id, village_name)
SELECT 7, t.id, v.village_name
FROM (SELECT id FROM tehsils WHERE district_id = 7 AND tehsil_name = 'Haldwani') t
CROSS JOIN (VALUES
    ('Aara Gair'), ('Aaspur Kham'), ('Aaspur Rao'), ('Akhtiyarpur'),
    ('Aliganj'), ('Amguri'), ('Amkhera'), ('Amritpur'),
    ('Baheri Gair'), ('Baheri Kham'), ('Baheri Rawa'), ('Bajpur'),
    ('Bajunia'), ('Bakhrakot'), ('Balan'), ('Ballia'),
    ('Bamdhauni'), ('Bamri'), ('Bamori'), ('Bandarpatta'),
    ('Bangawali'), ('Baniyakhera'), ('Bankoo'), ('Bans Khera'),
    ('Bara'), ('Barakot'), ('Barampur'), ('Bari Khera'),
    ('Barhani'), ('Barkot'), ('Basnolia'), ('Basti'),
    ('Bastoli'), ('Bel'), ('Bel Khera'), ('Bel Dana'),
    ('Belbara'), ('Belkheta'), ('Belsi'), ('Bhalo'),
    ('Bhandar Gaon'), ('Bhandarkot'), ('Bhandariya'), ('Bhandarpura'),
    ('Bhataula'), ('Bhatigair'), ('Bhatkoti'), ('Bhatroli'),
    ('Bhatsal'), ('Bhaur'), ('Bhimtala'), ('Bhimtal'),
    ('Bhitari'), ('Bhojpur'), ('Bhole'), ('Bhool'),
    ('Bhumka'), ('Bhumki'), ('Bichan'), ('Bila'),
    ('Bilaspur'), ('Binayakpur'), ('Bisalpur'), ('Bisrakh'),
    ('Bithoria'), ('Bohrakot'), ('Borhani'), ('Budha'),
    ('Budhana'), ('Chakarpur'), ('Chakia'), ('Chaluwad'),
    ('Champapur'), ('Chamrikhera'), ('Chandaus'), ('Chandpurnagar'),
    ('Changa'), ('Chani'), ('Charapatti'), ('Chargaon'),
    ('Chaukia'), ('Chaugola'), ('Chauki'), ('Chaurali'),
    ('Chaurasi'), ('Chaurikhet'), ('Chausar'), ('Chauti'),
    ('Chhana'), ('Chhani'), ('Chhanikhera'), ('Chhapra'),
    ('Chhitai'), ('Chhoti Haldwani'), ('Chilkiya'), ('Chorgalliya'),
    ('Chunakhan'), ('Dabka'), ('Dabrani'), ('Dagwal'),
    ('Daita'), ('Dakhal'), ('Dal'), ('Dalmau'),
    ('Dalsing'), ('Danda'), ('Danda Dhunni'), ('Danda Gair'),
    ('Danda Kanal'), ('Danda Talli'), ('Danda Talli'), ('Dandasar'),
    ('Dandiya'), ('Dane Khan'), ('Dang'), ('Dangi'),
    ('Dangpuri'), ('Daniya'), ('Darima'), ('Dau'),
    ('Daula'), ('Daulbagarh'), ('Dauli'),
    ('Daun'), ('Daurli'), ('Dechauri'), ('Dehlia'),
    ('Dehri'), ('Deo Gaon'), ('Deopur'), ('Deopura'),
    ('Dewal'), ('Dhab'), ('Dhadhi'), ('Dhaipur'),
    ('Dhak'), ('Dhakrani'), ('Dhamola'), ('Dhamu'),
    ('Dhanak Bhader'), ('Dhanak Jan'), ('Dhanak Tal'), ('Dhanari'),
    ('Dhandri'), ('Dhani'), ('Dhania Khera'), ('Dhanpur'),
    ('Dhanauli'), ('Dharampur'), ('Dharani'), ('Dhari'),
    ('Dharkot'), ('Dhaul'), ('Dhaura'), ('Dhauri'),
    ('Dhekia'), ('Dheli'), ('Dhelma'), ('Dhola'),
    ('Dhool'), ('Dhoor'), ('Dhrampur'), ('Dhunadhar'),
    ('Dhunadhar'), ('Dhunatam'), ('Dhunera'), ('Dhunia'),
    ('Digri'), ('Dil'), ('Dindai'), ('Dobha'),
    ('Dogaon'), ('Dohari'), ('Dolia'), ('Donia'),
    ('Doon'), ('Doraha'), ('Dual Khera'), ('Dudha'),
    ('Dudhli'), ('Dugli'), ('Dumar'), ('Dundu'),
    ('Dunela'), ('Dungra'), ('Dwara'), ('Falda'),
    ('Farasan'), ('Fattehpur'), ('Fulari'), ('Gabhau'),
    ('Gabua'), ('Gadi'), ('Gagal'), ('Gagar'),
    ('Gagaroli'), ('Gageshwar'), ('Gair'), ('Gajara')
) AS v(village_name);

-- =============================================
-- DEFAULT ADMIN USER
-- =============================================
-- Password: admin123 (bcrypt hash)
INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@uttarakhandrealestate.com',
    '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf4MIo1W5FNVqGq1JgKjG8yXqK6',
    'Super Admin',
    'super_admin'
);