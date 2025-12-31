import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface ImageCropDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropDrawer = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageCropDrawerProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const aspect = 1; // Square crop for profile picture

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    },
    [aspect]
  );

  const getCroppedImg = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to the cropped area
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Resize to max 400x400 to save storage
    const maxSize = 400;
    if (canvas.width > maxSize || canvas.height > maxSize) {
      const resizeCanvas = document.createElement("canvas");
      const resizeCtx = resizeCanvas.getContext("2d");
      if (!resizeCtx) return null;

      const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
      resizeCanvas.width = canvas.width * scale;
      resizeCanvas.height = canvas.height * scale;

      resizeCtx.drawImage(
        canvas,
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        resizeCanvas.width,
        resizeCanvas.height
      );

      return resizeCanvas.toDataURL("image/jpeg", 0.85);
    }

    return canvas.toDataURL("image/jpeg", 0.85);
  }, [completedCrop]);

  const handleConfirm = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      onCropComplete(croppedImage);
      onClose();
    }
  };

  const handleCancel = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DrawerContent className="bg-background border-t border-border max-h-[90vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <DrawerTitle className="text-center text-foreground font-display">
            Выбери область фото
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4 flex flex-col items-center gap-4 overflow-auto">
          <div className="w-full max-w-md flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop
              className="max-h-[50vh]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-h-[50vh] max-w-full object-contain"
              />
            </ReactCrop>
          </div>

          <div className="flex gap-3 w-full max-w-md">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-border text-muted-foreground hover:text-foreground"
            >
              Отмена
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 h-12 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold shadow-neon"
            >
              Применить
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ImageCropDrawer;
