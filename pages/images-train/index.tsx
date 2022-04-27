/* eslint-disable @next/next/no-img-element */
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { storage } from '../../config/firebase';

const Images = () => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const imagesRef = ref(storage, 'images');

    listAll(imagesRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          if (isMounted) {
            setImages((prev) => [...prev, url]);
          }
        });
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex-center-all">
      <div
        style={{
          padding: 10,
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1>Images</h1>
        <Link href={'/file-storage-upload-train'}>
          <a>Go to upload</a>
        </Link>
        <Link href={'/download-image-train'}>
          <a>Go to single image download</a>
        </Link>
      </div>
      <div>
        {images.map((url, i) => {
          return (
            <div key={url + i}>
              <img src={url} alt="image" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Images;
