CREATE TABLE IF NOT EXISTS users(
    chat_id NUMERIC UNIQUE PRIMARY KEY NOT NULL, --need a signed 64 bit integer by Telegram API
    first_name TEXT NOT NULL,
    last_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    time_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS polls(
    poll_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    question VARCHAR(300) NOT NULL, -- Limit from Telegram API
    allows_multiple_answers BOOLEAN NOT NULL,
    close_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS poll_receivers(
    chat_id NUMERIC NOT NULL,
    poll_id INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    telegram_poll_id TEXT NOT NULL, -- Telegram poll_id is str
    time_sent TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(chat_id, poll_id),
    UNIQUE (chat_id, message_id),
    UNIQUE (chat_id, telegram_poll_id),
    CONSTRAINT fk_user FOREIGN KEY(chat_id) REFERENCES users(chat_id),
    CONSTRAINT fk_poll FOREIGN KEY(poll_id) REFERENCES polls(poll_id)
);

CREATE TABLE IF NOT EXISTS poll_options(
    option_id INTEGER NOT NULL,
    poll_id INTEGER NOT NULL,
    content VARCHAR(300) NOT NULL, -- Limit from Telegram API,
    PRIMARY KEY(option_id, poll_id),
    CONSTRAINT fk_poll FOREIGN KEY(poll_id) REFERENCES polls(poll_id)
 );

CREATE TABLE IF NOT EXISTS poll_answers(
    chat_id NUMERIC NOT NULL,
    poll_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    time_answered TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(chat_id, poll_id, option_id),
    CONSTRAINT fk_poll_receiver FOREIGN KEY(chat_id, poll_id) REFERENCES poll_receivers(chat_id, poll_id),
    CONSTRAINT fk_answer FOREIGN KEY(option_id, poll_id) REFERENCES poll_options(option_id, poll_id)
 );

