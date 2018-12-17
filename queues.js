const Queue = require('bull');

const notifyUrl = 'NOTIFY_URL';

module.exports = {
    NOTIFY_URL: notifyUrl,
    queues: {
      [notifyUrl]: new Queue(
        notifyUrl,
        process.env.REDIS_URL,
      ),
    },
};
