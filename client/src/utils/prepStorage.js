const STORAGE_KEY = 'placeintel_prep_chats'

export function getPrepChats() {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY)

        if (!stored) {
            return {}
        }

        return JSON.parse(stored)
    } catch (error) {
        console.error('Failed to read prep chats:', error)
        return {}
    }
}

export function getPrepChat(companyId) {
    const chats = getPrepChats()
    return chats[companyId] || null
}

export function savePrepChat(companyId, chat) {
    try {
        const chats = getPrepChats()

        chats[companyId] = {
            ...chat,
            companyId
        }

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    } catch (error) {
        console.error('Failed to save prep chat:', error)
    }
}

export function clearPrepChat(companyId) {
    try {
        const chats = getPrepChats()

        delete chats[companyId]

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    } catch (error) {
        console.error('Failed to clear prep chat:', error)
    }
}