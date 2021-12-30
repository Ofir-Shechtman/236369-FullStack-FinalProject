CREATE TABLE IF NOT EXISTS users(
    chat_id NUMERIC UNIQUE PRIMARY KEY NOT NULL, --need a signed 64 bit integer by Telegram API
    first_name TEXT NOT NULL,
    last_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    time_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS polls(
    poll_id TEXT PRIMARY KEY NOT NULL, -- Telegram poll_id is str
    question VARCHAR(300) NOT NULL, -- Limit from Telegram API
    message_id INTEGER NOT NULL,
    allows_multiple_answers BOOLEAN NOT NULL,
    open_date TIMESTAMP WITH TIME ZONE NOT NULL,
    close_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS poll_option(
    option_id INTEGER NOT NULL,
    poll_id TEXT NOT NULL,
    content VARCHAR(300) NOT NULL, -- Limit from Telegram API,
    PRIMARY KEY(option_id, poll_id),
    CONSTRAINT fk_poll FOREIGN KEY(poll_id) REFERENCES polls(poll_id)
 );

CREATE TABLE IF NOT EXISTS poll_answer(
    chat_id NUMERIC NOT NULL,
    poll_id TEXT NOT NULL,
    option_id INTEGER NOT NULL,
    time_answered TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(chat_id, poll_id, option_id),
    CONSTRAINT fk_user FOREIGN KEY(chat_id) REFERENCES users(chat_id),
    CONSTRAINT fk_poll FOREIGN KEY(poll_id) REFERENCES polls(poll_id),
    CONSTRAINT fk_answer FOREIGN KEY(option_id, poll_id) REFERENCES poll_option(option_id, poll_id)
 );

