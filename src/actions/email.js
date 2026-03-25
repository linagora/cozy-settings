import { cozyFetch } from '@/actions'
import { STACK_DOMAIN } from '@/actions'

export const SEND_EMAIL = 'SEND_EMAIL'
export const SEND_EMAIL_SUCCESS = 'SEND_EMAIL_SUCCESS'
export const SEND_EMAIL_FAILURE = 'SEND_EMAIL_FAILURE'

const CONTACT_ADDRESS = 'support@twake.app'

const CONTACT_RECIPIENT_LIST = [{ name: 'Support', email: CONTACT_ADDRESS }]

function textPlainContentParts(message) {
  return [
    { type: 'text/plain', body: message || 'No reason/message provided.' }
  ]
}

export function sendMessageToSupport(client, message, t) {
  return dispatch => {
    dispatch({ type: SEND_EMAIL })
    if (!message) {
      return dispatch({
        type: SEND_EMAIL_FAILURE,
        error: new Error('No message provided.')
      })
    }
    const domain = STACK_DOMAIN.replace('//', '')
    return sendEmail(
      client,
      CONTACT_RECIPIENT_LIST,
      textPlainContentParts(message),
      `[cozy-support] Ask support for ${domain}`
    )
      .then(() => {
        dispatch({ type: SEND_EMAIL_SUCCESS })
        // eslint-disable-next-line promise/always-return
        try {
          return sendEmail(
            client,
            null,
            [
              {
                type: 'text/plain',
                body: t('support.response_email.body', { message })
              }
            ],
            `[cozy-support] ${t('support.response_email.subject')}`,
            'noreply'
          )
        } catch (_e) {
          // ignore errors for this sending
          // eslint-disable-next-line no-console
          console.warn(
            'Something went wrong when copying the support request to the user.'
          )
        }
      })
      .catch(error => {
        // error if no emails found
        if (error.message && error.message.match(/no email in its settings/)) {
          dispatch({
            type: SEND_EMAIL_FAILURE,
            error: { i18n: 'errors.noEmailFound' }
          })
        } else {
          dispatch({ type: SEND_EMAIL_FAILURE, error })
        }
      })
  }
}

export function sendDeleteAccountReasonEmail(client, subject, message) {
  if (!message) return

  return sendEmail(
    client,
    CONTACT_RECIPIENT_LIST,
    textPlainContentParts(message),
    subject
  )
}

export function sendDeleteAccountByEmailOnlyEmail(client, subject, message) {
  if (!message) return

  return sendEmail(
    client,
    CONTACT_RECIPIENT_LIST,
    textPlainContentParts(message),
    subject
  )
}

export function sendEmail(
  client,
  recipientsList,
  contentParts,
  subject = '',
  mode = 'from'
) {
  if (!contentParts.length) throw new Error('No email content parts found')
  if (mode === 'from' && !recipientsList.length)
    throw new Error('No recipients found')
  const options = {
    mode,
    subject,
    parts: contentParts
  }
  if (mode === 'from') options.to = recipientsList
  const jobCollection = client.collection('io.cozy.jobs')
  return jobCollection
    .create('sendmail', options, {
      priority: 10,
      max_exec_count: 1
    })
    .then(({ data: { attributes: job } }) => waitForJobFinished(client, job))
}

// monitor the status of the job and resolve when the email is sent
export const JOB_STATE = {
  READY: 'ready',
  ERRORED: 'errored',
  DONE: 'done'
}
function waitForJobFinished(client, job) {
  return new Promise((resolve, reject) => {
    let idInterval

    idInterval = setInterval(() => {
      cozyFetch(client, 'GET', `/jobs/${job._id}`)
        .then(response => {
          const job = response.data
          if (job.attributes.state === JOB_STATE.ERRORED) {
            clearInterval(idInterval)
            reject(new Error(job.attributes.error))
          }
          // eslint-disable-next-line promise/always-return
          if (job.attributes.state === JOB_STATE.DONE) {
            clearInterval(idInterval)
            resolve(job)
          }
        })
        .catch(error => {
          clearInterval(idInterval)
          reject(error)
        })
    }, 1000)
  })
}
