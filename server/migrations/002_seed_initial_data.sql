-- Seed default global amenities
INSERT INTO amenities (name) VALUES
    ('Swimming Pool'),
    ('Private Garden'),
    ('Gym / Fitness Center'),
    ('Clubhouse'),
    ('24/7 Concierge'),
    ('Sea View'),
    ('Golf Course View'),
    ('Smart Home Automation'),
    ('Solar Powered'),
    ('High-Speed WiFi'),
    ('Spa & Wellness'),
    ('Covered Parking'),
    ('EV Charging Station'),
    ('Helipad Access'),
    ('Chef on Call')
ON CONFLICT (name) DO NOTHING;
