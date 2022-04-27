/* eslint-disable @next/next/no-img-element */
import { ChangeEvent, useEffect, useState } from 'react';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  // uploadString,
  getDownloadURL,
  listAll,
} from 'firebase/storage';
import { storage } from '../../config/firebase';
import moment from 'moment';
import { v4 } from 'uuid';
import path from 'path';
import Link from 'next/link';
// import Image from 'next/image';

const formatDateName = (date: Date): string => {
  return moment(date).format('YYYYMMDD');
};

const FileStorageUploadTrain = () => {
  const [fileUpload, setFileUpload] = useState<FileList | null>(null);
  const [_pause, setPause] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const imagesRef = ref(storage, 'images');

    setIsFetching(true);

    listAll(imagesRef).then((response) => {
      response.items.forEach((item) => {
        setIsFetching(true);
        getDownloadURL(item).then((url) => {
          if (isMounted) {
            setUploadedImage((prev) => [...prev, url]);
          }
        });
        setIsFetching(false);
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUploadClick = async () => {
    //
    console.log(fileUpload);
    if (!fileUpload) return;

    const trimmedFileName = path.parse(fileUpload[0].name).name;
    const mimeType = path.parse(fileUpload[0].name).ext;

    const imageRef = ref(
      storage,
      `images/${formatDateName(
        new Date()
      )}_${v4()}uuid_${trimmedFileName}${mimeType}`
    );

    // const metaData = {
    //   contentType: mimeType === '.jpg' || '.jpeg' ? 'image/jpeg' : 'image/png',
    // };

    const metaData = undefined;

    /**
     * UPLOAD FROM A BLOB OR FILE
     */
    // uploadBytes(imageRef, fileUpload[0], metaData).then((snapshot) => {
    //   console.log('Uploaded a blob or file');
    //   console.log(snapshot.ref.fullPath);
    // });

    /**
     * UPLOAD FROM BYTE ARRAY
     */
    // const bytes = new Uint8Array(await fileUpload[0].arrayBuffer());
    // uploadBytes(imageRef, bytes).then((snapshot) => {
    //   console.log(snapshot);
    //   console.log(snapshot.ref.fullPath);
    //   console.log(snapshot.ref.name);
    //   console.log('Uploaded an array!');
    //   console.log(snapshot.metadata.ref);
    // });

    /**
     * UPLOAD FROM A STRING
     */
    // const storageRef = ref(storage, 'some-child');

    // Raw string is the default if no format is provided
    // const message = 'This is my message.';
    // uploadString(storageRef, message).then((snapshot) => {
    //   console.log('Uploaded a raw string!');
    // });

    //// Base64 formatted string
    // const message2 = '5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
    // uploadString(storageRef, message2, 'base64').then((snapshot) => {
    //   console.log('Uploaded a base64 string!');
    // });

    // Base64url formatted string
    // const message3 = '5b6p5Y-344GX44G-44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
    // uploadString(storageRef, message3, 'base64url').then((snapshot) => {
    //   console.log('Uploaded a base64url string!');
    // });

    // Data URL string
    // const message4 =
    //   'data:text/plain;base64,5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
    // uploadString(storageRef, message4, 'data_url').then((snapshot) => {
    //   console.log('Uploaded a data_url string!');
    // });

    /**
     * MANAGE UPLOADS
     */
    const uploadTask = uploadBytesResumable(imageRef, fileUpload[0]);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        console.log(
          'bytesTransfered/totalBytes',
          snapshot.bytesTransferred,
          snapshot.totalBytes
        );

        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        console.log('Upload is ' + progress + '% done');

        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }

        setProgress(progress);
      },
      (error) => {
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;

          // ...

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);

          setUploadedImage((prev) => [...prev, downloadURL]);
          setProgress(null);
        });
      }
    );
  };

  const handleTogglePauseClick = () => {
    setPause((prev) => !prev);
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileUpload(event.target.files);
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
        <h1>Image Upload</h1>
        <Link href={'/images-train'}>
          <a>Go to images</a>
        </Link>
      </div>
      <div>
        <input type="file" onChange={onFileInputChange} />
        <div style={{ padding: 10 }}>
          <button onClick={handleUploadClick}>Upload file or blob</button>
        </div>
        {/* <div style={{ padding: 10 }}>
          <button onClick={handleTogglePauseClick}>Toggle Pause</button>
        </div> */}
      </div>

      {progress && (
        <div>
          <p>upload progress {progress.toFixed(0)}%</p>
        </div>
      )}

      {isFetching && <h3>Loading</h3>}

      <div>
        {uploadedImage.length !== 0 &&
          uploadedImage.reverse().map((url, i) => {
            return (
              <div key={url + i.toString()}>
                {/* <Image src={url} alt={`image/${i.toString()}}`} layout="fill" /> */}
                <img src={url} alt={`image/${i}`} width={500} />
              </div>
            );
          })}
      </div>
    </div>
  );
};

// reference: https://firebase.google.com/docs/storage/web/upload-files?authuser=0
export default FileStorageUploadTrain;
