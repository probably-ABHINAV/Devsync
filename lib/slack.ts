import { WebClient } from '@slack/web-api'

const getClient = () => {
    const token = process.env.SLACK_BOT_TOKEN
    return new WebClient(token)
}

export async function fetchChannelHistory(channelId: string, limit = 10) {
    try {
        const client = getClient()
        const result = await client.conversations.history({
            channel: channelId,
            limit
        })
        
        return result.messages?.map(m => ({
            text: m.text,
            user: m.user,
            ts: m.ts,
            thread_ts: m.thread_ts,
            reply_count: m.reply_count
        })) || []
    } catch (error) {
        console.error(`Failed to fetch Slack history for ${channelId}`, error)
        return []
    }
}

export async function resolveUser(userId: string) {
    try {
        const client = getClient()
        const result = await client.users.info({ user: userId })
        return {
            name: result.user?.real_name || result.user?.name,
            image: result.user?.profile?.image_48,
            is_bot: result.user?.is_bot
        }
    } catch (error) {
        // console.error(`Failed to resolve Slack user ${userId}`, error)
        return null
    }
}

export async function postMessage(channelId: string, text: string, blocks?: any[]) {
    try {
        const client = getClient()
        await client.chat.postMessage({
            channel: channelId,
            text,
            blocks
        })
    } catch (error) {
        console.error(`Failed to post to Slack ${channelId}`, error)
    }
}
