
let config

export default () => {
  if (!config) {
    config = {
      aws: {
        client: {
          version: process.env.AWS_CLIENT_VERSION,
          region: process.env.AWS_CLIENT_REGION,
        }
      },
      queue: {
        type: (process.env.QUEUE_TYPE || 'sqs').toLowerCase(),
        name: process.env.QUEUE_NAME,
      }
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(config)
    }
  }

  return config
}
