"use client";
import React, { useEffect, useState } from "react";

interface BlueprintImage {
  id: string;
  url: string;
  // other fields if present
}

const BluePrintDetection: React.FC<{ id?: string }> = ({ id: propId }) => {
  const [images, setImages] = useState<BlueprintImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve id from prop or from current URL (/blueprint_detection/:id)
  const resolveId = (): string | null => {
    if (propId) return propId;
    if (typeof window === "undefined") return null;
    const path = window.location.pathname || "";
    const m = path.match(/\/blueprint_detection\/([^\/\?]+)/);
    return m ? m[1] : null;
  };

  useEffect(() => {
    const id = resolveId();
    if (!id) {
      setError("No blueprint id found in route or props");
      return;
    }

    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8989/api/v1/blueprints/get-blueprint-images/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();

        // Expect data to be an array or an object with images field
        let imgs: BlueprintImage[] = [];
        if (Array.isArray(data)) imgs = data;
        else if (data?.images && Array.isArray(data.images)) imgs = data.images;
        else if (data?.data && Array.isArray(data.data)) imgs = data.data;

        setImages(imgs.map((it: any) => ({ id: it.id ?? it._id ?? String(Math.random()), url: it.url ?? it.file_url ?? it.dataUrl ?? it.src })));
      } catch (err: any) {
        console.error("Failed to fetch blueprint images", err);
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [propId]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Blueprint Detection</h2>
      {loading && <div>Loading images...</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}
      {!loading && !error && images.length === 0 && <div className="text-sm text-gray-500">No images found for this blueprint.</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {images.map((img) => (
          <div key={img.id} className="border rounded overflow-hidden bg-white">
            {img.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.url} alt={`img-${img.id}`} className="w-full h-40 object-cover" />
            ) : (
              <div className="p-4 text-sm">No preview</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BluePrintDetection;
