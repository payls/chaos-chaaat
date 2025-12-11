module.exports = {
  connection: {
    uri: null, // 'amqp://localhost'
    host: 'localhost', // 'b-7059e950-6c41-4ba6-b5ea-968bb5eb6fea.mq.ap-southeast-1.amazonaws.com',
    port: 5672,
    username: 'root',
    password: 'root', // 'J6Q9wAPQfB9zUJNY0JgM'
  },
  queues: [
    // local
    {
      exchangeName: 'IN.LOCAL.ALLPROCESS',
      queueName: 'IN.LOCAL.ALLPROCESS',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.LOCAL.ALLPROCESS',
        routingKey: 'BATCH'
      }
    },
    // staging
    {
      exchangeName: 'IN.STAGING.ALLPROCESS',
      queueName: 'IN.STAGING.ALLPROCESS',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.STAGING.ALLPROCESS',
        routingKey: 'BATCH'
      }
    },
    //DEMO
    {
      exchangeName: 'IN.DEMO.ALLPROCESS',
      queueName: 'IN.DEMO.ALLPROCESS',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.DEMO.ALLPROCESS',
        routingKey: 'BATCH'
      }
    },
    // QA
    {
      exchangeName: 'IN.QA.ALLPROCESS',
      queueName: 'IN.QA.ALLPROCESS',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.QA.ALLPROCESS',
        routingKey: 'BATCH'
      }
    },
    // // PROD
    {
      exchangeName: 'IN.PROD.ALLPROCESS',
      queueName: 'IN.PROD.ALLPROCESS',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.ALLPROCESS',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.BulkProcessLineCampaign',
      queueName: 'IN.PROD.BulkProcessLineCampaign',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.BulkProcessLineCampaign',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.CreateProposal',
      queueName: 'IN.PROD.CreateProposal',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.CreateProposal',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.CreateProposalBulk',
      queueName: 'IN.PROD.CreateProposalBulk',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.CreateProposalBulk',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.LineWebhook',
      queueName: 'IN.PROD.LineWebhook',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.LineWebhook',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.LiveChatWebhook',
      queueName: 'IN.PROD.LiveChatWebhook',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.LiveChatWebhook',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.MessengerWebhook',
      queueName: 'IN.PROD.MessengerWebhook',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.MessengerWebhook',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.SendLineCampaign',
      queueName: 'IN.PROD.SendLineCampaign',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.SendLineCampaign',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.WhatsappWebhook',
      queueName: 'IN.PROD.WhatsappWebhook',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.WhatsappWebhook',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.WhatsappStatusWebhook',
      queueName: 'IN.PROD.WhatsappStatusWebhook',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.WhatsappStatusWebhook',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.WhatsappV2Webhook',
      queueName: 'IN.PROD.WhatsappV2Webhook',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.WhatsappV2Webhook',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.RedisStateGeneration',
      queueName: 'IN.PROD.RedisStateGeneration',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.RedisStateGeneration',
        routingKey: 'BATCH'
      }
    },
    {
      exchangeName: 'IN.PROD.AppointmentBookingReminder',
      queueName: 'IN.PROD.AppointmentBookingReminder',
      binding: {
        routingKey: 'BATCH'
      },
      deadLetter: {
        exchangeName: 'DL.IN.PROD.AppointmentBookingReminder',
        routingKey: 'BATCH'
      }
    },
  ]
};
