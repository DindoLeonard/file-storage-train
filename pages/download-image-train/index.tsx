/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import Link from 'next/link';
import { storage } from '../../config/firebase';
import { getBlob, getBytes, getDownloadURL, ref } from 'firebase/storage';

const DownloadImageTrain = () => {
  const [images, setImages] = useState<string[]>([]);

  const imageRef = ref(
    storage,
    'images/20220427_0086d1e4-9e3b-4e6a-9e5d-5da85dcd7b72uuid_103003748_10217305895868590_9071528735797362478_n.jpg'
  );

  const handleGetImages = async () => {
    console.log('clicked');
    getDownloadURL(imageRef).then((url) => {
      console.log(url);
      setImages((prev) => [...prev, url]);

      // This can be downloaded directly
      // const xhr = new XMLHttpRequest();
      // xhr.responseType = 'blob';
      // xhr.onload = (event) => {
      //   const blob = xhr.response;
      //   const arrayBuffer = new Uint8Array(xhr.response);
      // };

      // xhr.open('GET', url);
      // xhr.send();

      getBlob(imageRef).then((value) => {
        console.log('BLOB', value);
      });

      getBytes(imageRef).then((value) => {
        console.log('BYTES', value);
      });

      getDownloadURL(imageRef).then((value) => {
        console.log('DOWNLOAD_URL', value);
      });
    });
  };

  const download = async () => {
    const element = document.createElement('a');

    const arrayBuffer = await getBytes(imageRef);
    const file = new Blob([arrayBuffer], { type: 'image/*' });

    element.href = URL.createObjectURL(file);
    element.download = 'downloaded_image.jpg';
    element.click();
  };

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
        <h1>Image download</h1>
        <Link href={'/file-storage-upload-train'}>
          <a>Go to upload</a>
        </Link>
        <Link href={'/images-train'}>
          <a>Go to images</a>
        </Link>
      </div>

      <div style={{ padding: 10 }}>
        <button
          onClick={() => {
            handleGetImages();
          }}
        >
          get images
        </button>
      </div>

      <div>
        {images.map((url, i) => {
          return (
            <div
              key={`${url}-${i}`}
              className="flex-center-all"
              style={{ marginBottom: '100px' }}
            >
              <img src={url} alt={url} style={{ width: '480px' }} />
              <button type="button" onClick={download}>
                DOWNLOAD
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DownloadImageTrain;
