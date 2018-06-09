
import Aws from 'aws-sdk'
import request from 'request'

import config from './config'

function createQueue(sqsClient) {
  return new Promise((resolve, reject) => {
    const params = {
      QueueName: config().queue.name,
      Attributes: {
        DelaySeconds: '60',
        MessageRetentionPeriod: '86400',
      }
    }

    sqsClient.createQueue(params, (err, result) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(result.QueueUrl)
      }
    })
  })
}

function acknowledge(sqsClient, queueUrl, messageId) {
  return new Promise((resolve, reject) => {
    var params = {
      QueueUrl: queueUrl,
      ReceiptHandle: messageId,
    }

    sqsClient.deleteMessage(params, (err, result) => {
      if (err) {
        reject(err)
      }
      else {
        resolve()
      }
    })
  })
}

function processTransmission(transmissionId) {
  return new Promise((resolve, reject) => {
    const req = request({
      method: 'POST',
      url: `${config().transmit.url}/transmissions/${transmissionId}`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }, (err, res, body) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(body)
      }
    })
  })
}

async function process(sqsClient) {
  const queueUrl = await createQueue(sqsClient)

  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    VisibilityTimeout: 25,
    WaitTimeSeconds: 10,
  }

  while(true) {
    console.log("Waiting...")

    const message = await new Promise((resolve, reject) => {
      sqsClient.receiveMessage(params, (err, result) => {
        if (err) {
          reject(err)
        }
        else {
          if (result.Messages && result.Messages.length > 0) {
            resolve(result.Messages[0])
          }
          else {
            resolve()
          }
        }
      })
    })

    if (message) {
      //console.log(message)

      const body = JSON.parse(message.Body)
      console.log(body)

      try {
        switch (body.type) {
          case 'transmission': {
            const result = await processTransmission(body.data.id)
            console.log(result)
          }
          break
        }

        await acknowledge(sqsClient, queueUrl, message.ReceiptHandle)
      }
      catch(err) {
        console.log(err)

        // TODO: Reschedule
      }
    }
  }
}

const sqsClient = new Aws.SQS({
  region: config().aws.client.region,
  version: config().aws.client.version,
})

process(sqsClient)

console.log("Transmit worker running")
