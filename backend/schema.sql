CREATE TABLE IF NOT EXISTS admins(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(30) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_by INTEGER,
    time_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_created_by FOREIGN KEY(created_by) REFERENCES admins(id)
);


CREATE TABLE IF NOT EXISTS users(
    user_id NUMERIC UNIQUE PRIMARY KEY NOT NULL, --chat_id need a signed 64 bit integer by Telegram API
    first_name TEXT NOT NULL,
    last_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    time_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS polls(
    poll_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    question VARCHAR(300) NOT NULL, -- Limit from Telegram API
    allows_multiple_answers BOOLEAN NOT NULL,
    close_date TIMESTAMP WITH TIME ZONE,
    created_by INTEGER NOT NULL,
    CONSTRAINT fk_created_by FOREIGN KEY(created_by) REFERENCES admins(id)


);

CREATE TABLE IF NOT EXISTS poll_receivers(
    user_id NUMERIC NOT NULL,
    poll_id INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    telegram_poll_id TEXT, -- Telegram poll_id is str, return value from PollAnswerHandler
    time_sent TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_by INTEGER NOT NULL,
    PRIMARY KEY(user_id, poll_id),
    UNIQUE (user_id, message_id),
    CONSTRAINT fk_user_pr FOREIGN KEY(user_id) REFERENCES users(user_id),
    CONSTRAINT fk_poll_pr FOREIGN KEY(poll_id) REFERENCES polls(poll_id),
    CONSTRAINT fk_sent_by FOREIGN KEY(sent_by) REFERENCES admins(id)
);

CREATE TABLE IF NOT EXISTS poll_options(
    option_id INTEGER NOT NULL, --Index
    poll_id INTEGER NOT NULL,
    content VARCHAR(300) NOT NULL, -- Limit from Telegram API,
    PRIMARY KEY(option_id, poll_id),
    CONSTRAINT fk_poll_po FOREIGN KEY(poll_id) REFERENCES polls(poll_id)
 );

CREATE TABLE IF NOT EXISTS poll_answers(
    user_id NUMERIC NOT NULL,
    poll_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    time_answered TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, poll_id, option_id),
    CONSTRAINT fk_poll_receiver_pa FOREIGN KEY(user_id, poll_id) REFERENCES poll_receivers(user_id, poll_id),
    CONSTRAINT fk_option_pa FOREIGN KEY(option_id, poll_id) REFERENCES poll_options(option_id, poll_id)
 );



