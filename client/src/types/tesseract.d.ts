declare module 'tesseract.js' {
  export interface WorkerOptions {
    logger?: (m: { status: string; progress: number }) => void;
  }

  export interface RecognizeResult {
    data: {
      text: string;
    };
  }

  export default class Tesseract {
    static recognize(file: File | string, lang: string, options?: WorkerOptions): Promise<RecognizeResult>;
  }
}
