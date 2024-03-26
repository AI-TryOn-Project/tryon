import React, { useEffect } from 'react';
import { Upload } from 'antd';
import { useAppDispatch, useAppSelector } from "~src/store/store";
import { changeImg } from '~src/store/data-slice';
import './index.less';
import UploadImg from '../../resources/icon-upload-img.svg';
import { processAndGenerateThumbnail } from '~src/utils';

const { Dragger } = Upload;

type Props = {
  handleOnChange?: (file: File) => void;
};


const Index: React.FC<Props> = ({ handleOnChange }) => {
  const dispatch = useAppDispatch();
  const base64_image = useAppSelector((state) => state.data.base64_image);
  const handleUploadOnchange = async (file: File, maxSize = 5) => {
    const result = await processAndGenerateThumbnail(file, maxSize);
    dispatch(changeImg(result.thumbnailDataUrl));
  };
  return (
    <div className={base64_image ? 'imgWrapper' : 'wrapper'}
      style={base64_image ? { backgroundImage: `url(${base64_image})` } : {}}
    >
      <Dragger
        maxCount={1}
        accept=".png, .jpg, .jpeg"
        showUploadList={false}
        customRequest={() => { }}
        beforeUpload={() => false}
        onChange={({ file }) => {
          handleUploadOnchange(file as any);
        }}
      >
        {base64_image ?
          (<div></div>
          ) : (
            <div className={'tips-wrapper'}>
              <div className="ant-upload-drag-icon">
                <img src={UploadImg} alt="" />
              </div>
              <p className="ant-upload-text">Drag image here or Select image to upload</p>
            </div>
          )}
      </Dragger>

    </div>
  );
};

export default Index;
