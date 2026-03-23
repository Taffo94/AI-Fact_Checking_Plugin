declare module 'youtube-transcript' {
  export interface TranscriptItem {
    text: string;
    duration: number;
    offset: number;
  }
  export class YoutubeTranscript {
    static fetchTranscript(videoId: string, config?: any): Promise<TranscriptItem[]>;
  }
}
