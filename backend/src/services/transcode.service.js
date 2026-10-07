import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

// Configure fluent-ffmpeg binary paths
if (ffmpegInstaller?.path) {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
}
if (ffprobeInstaller?.path) {
    ffmpeg.setFfprobePath(ffprobeInstaller.path);
}

/**
 * Service to handle FFmpeg video probing, thumbnail generation, and HLS transcoding.
 */
export class TranscodeService {
    /**
     * Get video metadata and duration using ffprobe
     * @param {string} filePath
     * @returns {Promise<{ duration: number, width: number, height: number }>}
     */
    static getVideoMetadata(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    return reject(new Error(`FFprobe failed: ${err.message}`));
                }
                const duration = metadata?.format?.duration || 0;
                const videoStream = metadata?.streams?.find((s) => s.codec_type === "video") || {};
                const width = videoStream.width || 1920;
                const height = videoStream.height || 1080;
                resolve({ duration, width, height });
            });
        });
    }

    /**
     * Extract automated thumbnails at 10%, 50%, and 90% of duration
     * @param {string} inputPath
     * @param {string} outputDir
     * @param {number} duration
     * @param {string} videoId
     * @returns {Promise<string[]>} List of relative thumbnail URLs
     */
    static async extractThumbnails(inputPath, outputDir, duration, videoId) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const validDuration = duration && duration > 0 ? duration : 10;
        const t10 = Math.max(0.1, +(validDuration * 0.1).toFixed(2));
        const t50 = Math.max(0.5, +(validDuration * 0.5).toFixed(2));
        const t90 = Math.max(1.0, +(validDuration * 0.9).toFixed(2));

        const timestamps = [
            { name: "thumb_10.jpg", time: t10 },
            { name: "thumb_50.jpg", time: t50 },
            { name: "thumb_90.jpg", time: t90 },
        ];

        const generatedThumbnails = [];

        for (const item of timestamps) {
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .seekInput(item.time)
                    .frames(1)
                    .output(path.join(outputDir, item.name))
                    .size("1280x720")
                    .outputOptions("-q:v 2") // High quality jpeg
                    .on("end", () => {
                        generatedThumbnails.push(`/thumbnails/${videoId}/${item.name}`);
                        resolve();
                    })
                    .on("error", (err) => {
                        console.warn(`[Thumbnail Warning] Failed to generate ${item.name}:`, err.message);
                        // Continue even if one thumbnail frame extraction fails
                        resolve();
                    })
                    .run();
            });
        }

        return generatedThumbnails;
    }

    /**
     * Transcode video into multi-variant HLS stream (360p, 720p, 1080p)
     * @param {string} inputPath
     * @param {string} outputDir
     * @param {number} duration
     * @param {string} videoId
     * @param {(percent: number) => void} onProgress
     * @returns {Promise<string>} Relative HLS master manifest URL
     */
    static async generateHlsStream(inputPath, outputDir, duration, videoId, onProgress) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const variants = [
            {
                name: "360p",
                width: 640,
                height: 360,
                bitrate: "800k",
                maxrate: "856k",
                bufsize: "1200k",
                audioBitrate: "96k",
                progressRange: [20, 45],
            },
            {
                name: "720p",
                width: 1280,
                height: 720,
                bitrate: "2500k",
                maxrate: "2675k",
                bufsize: "3750k",
                audioBitrate: "128k",
                progressRange: [45, 70],
            },
            {
                name: "1080p",
                width: 1920,
                height: 1080,
                bitrate: "5000k",
                maxrate: "5350k",
                bufsize: "7500k",
                audioBitrate: "192k",
                progressRange: [70, 95],
            },
        ];

        for (const variant of variants) {
            const variantPlaylist = path.join(outputDir, `${variant.name}.m3u8`);
            const segmentPattern = path.join(outputDir, `${variant.name}_%03d.ts`);

            await new Promise((resolve, reject) => {
                const command = ffmpeg(inputPath)
                    .output(variantPlaylist)
                    .outputOptions([
                        "-c:v libx264",
                        "-c:a aac",
                        "-ac 2",
                        "-ar 44100",
                        `-b:v ${variant.bitrate}`,
                        `-maxrate ${variant.maxrate}`,
                        `-bufsize ${variant.bufsize}`,
                        `-b:a ${variant.audioBitrate}`,
                        `-vf scale=w=${variant.width}:h=${variant.height}:force_original_aspect_ratio=decrease,pad=${variant.width}:${variant.height}:(ow-iw)/2:(oh-ih)/2`,
                        "-hls_time 6",
                        "-hls_playlist_type vod",
                        `-hls_segment_filename ${segmentPattern}`,
                    ]);

                command.on("progress", (p) => {
                    if (onProgress && p && typeof p.percent === "number") {
                        const [minP, maxP] = variant.progressRange;
                        const current = Math.min(
                            maxP,
                            Math.round(minP + (p.percent / 100) * (maxP - minP))
                        );
                        onProgress(current);
                    }
                });

                command.on("end", () => {
                    if (onProgress) {
                        onProgress(variant.progressRange[1]);
                    }
                    resolve();
                });

                command.on("error", (err) => {
                    reject(new Error(`FFmpeg transcoding failed for ${variant.name}: ${err.message}`));
                });

                command.run();
            });
        }

        // Generate Master Playlist (master.m3u8)
        const masterManifestContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8
`;

        const masterPath = path.join(outputDir, "master.m3u8");
        fs.writeFileSync(masterPath, masterManifestContent, "utf8");

        return `/hls/${videoId}/master.m3u8`;
    }

    /**
     * Safely remove temporary raw file from disk
     * @param {string} filePath
     */
    static cleanupFile(filePath) {
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`[Cleanup] Removed temporary file: ${filePath}`);
            } catch (err) {
                console.warn(`[Cleanup Warning] Could not remove ${filePath}:`, err.message);
            }
        }
    }
}

export default TranscodeService;

