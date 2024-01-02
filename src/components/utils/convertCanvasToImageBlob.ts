import { MutableRefObject } from "react";
import AvatarEditor from "react-avatar-editor";

export default function convertCanvasToImageBlob(
  imageEditor: MutableRefObject<AvatarEditor>
): Promise<Blob | null> {
  const canvas: HTMLCanvasElement | null =
    imageEditor.current?.getImageScaledToCanvas();

  if (!canvas) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
}
