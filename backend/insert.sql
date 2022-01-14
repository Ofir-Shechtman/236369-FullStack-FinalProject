INSERT INTO admins(username, password_hash) VALUES (
'admin','pbkdf2:sha256:260000$YWWTbyNwbzRWedEG$79e17a0db0fb300cea32f1d362a232ec60a96cdab2860c43eec261224d85f2b0');


INSERT INTO users(user_id, first_name, last_name)  VALUES
                                                           (569667677, 'Ofir', 'Shechtman');
--                                                            (2, 'Ben2', 'Lugasi');

INSERT INTO polls(poll_name, question, poll_type, allows_multiple_answers, created_by) VALUES
            ('Exposure', 'Are you exposed to verified covid?', 'Telegram_inline_keyboard', FALSE, 1),
            ('Vaccinated', 'What is your vaccine status?', 'Telegram_poll', TRUE, 1),
            ('60 Vaccinated', 'Are you 60+ or in a risk group', 'Telegram_poll', FALSE, 1),
            ('60 Not Vaccinated', 'Are you 60+ or in a risk group', 'Telegram_poll', FALSE, 1),
            ('PCR 60+ Vaccinated', 'preform a PCR test.\n What are the results?', 'Telegram_poll', FALSE, 1),
            ('Antigen at home 60- Vaccinated', 'preform a antigen test at home.\n What are the results?', 'Telegram_poll', FALSE, 1),
            ('PCR 60+ Not Vaccinated', 'preform a PCR test.\n What are the results?', 'Telegram_poll', FALSE, 1),
            ('Antigen at home 60- Not Vaccinated', 'preform a antigen test at home.\n What are the results?', 'Telegram_poll', FALSE, 1),
            ('Quarantine 0 days', 'Quarantine 0 days', 'Telegram_inline_keyboard', FALSE, 1),
            ('Quarantine 7 days', 'Quarantine 7 days', 'Telegram_inline_keyboard', FALSE, 1),
            ('Quarantine 10 days', 'Quarantine 10 days', 'Telegram_inline_keyboard', FALSE, 1),
            ('Supervised Antigen and quarantine 10 days', 'Supervised Antigen and quarantine 10 days', 'Telegram_inline_keyboard', FALSE, 1);



INSERT INTO poll_options(option_id, poll_id, content, followup_poll_id) VALUES
            (0, 1, 'Yes', 2),
            (1, 1, 'No', 9),
            (0, 2, 'vaccinated', 3),
            (0, 2, 'recovered', 3),
            (1, 2, 'None', 4),
            (0, 3, 'Yes', 5),
            (1, 3, 'No', 6),
            (0, 4, 'Yes', 7),
            (1, 4, 'No', 8),
            (0, 5, 'Positive', 11),
            (1, 5, 'Negative', 9),
            (0, 6, 'Positive', 12),
            (1, 6, 'Negative', 9),
            (0, 7, 'Positive', 11),
            (1, 7, 'Negative', 10),
            (0, 8, 'Positive', 11),
            (1, 8, 'Negative', 10),
            (0, 9, 'OK', NULL),
            (0, 10, 'OK', NULL),
            (0, 11, 'OK', NULL),
            (0, 12, 'OK', NULL);







-- CREATE TYPE POLL_TYPE AS ENUM ('Telegram_poll', 'Telegram_inline_keyboard');