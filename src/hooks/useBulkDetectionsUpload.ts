import { useState, useCallback } from "react";

type UploadResult = any;

export default function useBulkDetectionsUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<UploadResult | null>(null);

  const uploadDetections = useCallback(async (payload: Array<any>) => {
    setIsUploading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8989";
      const url = `${base}/blueprints/images/detections/bulk`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const msg = `Bulk detections upload failed: ${res.status} ${text}`;
        setError(msg);
        throw new Error(msg);
      }

      const body = await res.json().catch(() => null);
      setResponse(body);
      return body;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { isUploading, error, response, uploadDetections };
}
