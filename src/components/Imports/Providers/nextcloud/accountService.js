import { Q } from 'cozy-client'

export async function createNextcloudAccount(client, { login, password, url }) {
  if (!login || !password || !url) {
    throw new Error('Missing credentials for Nextcloud account creation')
  }

  const account = {
    _type: 'io.cozy.accounts',
    account_type: 'nextcloud',
    auth: {
      login,
      password,
      url
    },
    identifier: 'login',
    name: login,
    state: null
  }

  const { data } = await client.save(account)
  return data
}

export async function findNextcloudAccounts(client) {
  const { data } = await client.query(
    Q('io.cozy.accounts').where({
      account_type: 'nextcloud'
    })
  )

  return data
}

export async function deleteNextcloudAccount(client, account) {
  const collection = client.collection('io.cozy.accounts')
  const { data } = await collection.destroy(account)
  return data
}
