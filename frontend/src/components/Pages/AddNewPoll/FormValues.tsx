const types = ['Telegram_poll', 'Telegram_inline_keyboard'] as const;
export type PollType = typeof types[number];

export type FormValues = {
    PollName: string;
    PollQuestion: string;
    PollType: string;
    MultipleAnswers: string;
    AutoClosingSwitch: string;
    AutoCloseTime: string;
    MultipleOptions: string;
};