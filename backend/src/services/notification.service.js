/**
 * Server-Sent Events (SSE) notification service for real-time video transcoding progress.
 */
class NotificationService {
    constructor() {
        // Map<videoId, Set<res>>
        this.subscribers = new Map();

        // Send periodic heartbeat to keep connections alive
        this.heartbeatInterval = setInterval(() => {
            this.broadcastHeartbeat();
        }, 25000);
    }

    /**
     * Add an SSE client connection for a specific video
     * @param {string} videoId
     * @param {import('express').Response} res
     */
    addSubscriber(videoId, res) {
        const id = String(videoId);
        if (!this.subscribers.has(id)) {
            this.subscribers.set(id, new Set());
        }
        this.subscribers.get(id).add(res);

        // Remove subscriber when connection closes
        res.on("close", () => {
            this.removeSubscriber(id, res);
        });

        // Send immediate handshake event
        res.write(`: connected\n\n`);
    }

    /**
     * Remove an SSE client connection
     * @param {string} videoId
     * @param {import('express').Response} res
     */
    removeSubscriber(videoId, res) {
        const id = String(videoId);
        if (this.subscribers.has(id)) {
            const clientSet = this.subscribers.get(id);
            clientSet.delete(res);
            if (clientSet.size === 0) {
                this.subscribers.delete(id);
            }
        }
    }

    /**
     * Emit progress/status update to all active subscribers for a video
     * @param {string} videoId
     * @param {{ progress?: number, status?: string, message?: string, error?: string, video?: any }} data
     */
    emitVideoProgress(videoId, data) {
        const id = String(videoId);
        const clientSet = this.subscribers.get(id);
        if (!clientSet || clientSet.size === 0) {
            return;
        }

        const payload = JSON.stringify({
            videoId: id,
            timestamp: new Date().toISOString(),
            ...data,
        });

        const eventMessage = `event: progress\ndata: ${payload}\n\n`;

        for (const res of clientSet) {
            try {
                res.write(eventMessage);
                if (data.status === "ready" || data.status === "failed") {
                    // Send final complete event and close connection
                    res.write(`event: done\ndata: ${payload}\n\n`);
                    res.end();
                    clientSet.delete(res);
                }
            } catch (err) {
                console.warn(`[SSE Notification Error] Failed to send update to client:`, err.message);
                clientSet.delete(res);
            }
        }

        if (clientSet.size === 0) {
            this.subscribers.delete(id);
        }
    }

    /**
     * Send heartbeat comment to all active SSE connections
     */
    broadcastHeartbeat() {
        for (const [id, clientSet] of this.subscribers.entries()) {
            for (const res of clientSet) {
                try {
                    res.write(`: ping\n\n`);
                } catch (err) {
                    clientSet.delete(res);
                }
            }
            if (clientSet.size === 0) {
                this.subscribers.delete(id);
            }
        }
    }
}

export const notificationService = new NotificationService();
export default notificationService;

