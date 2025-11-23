import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  const sizeClasses = {
    small: "w-[80px] h-[80px]",
    medium: "w-[160px] h-[160px]",
    large: "w-[300px] h-[300px]",
    full: "w-full h-auto",
    square: "aspect-square w-full",
  }

  return (
    <Container
      className={clx(
        "relative overflow-hidden bg-gray-50 shadow-sm rounded-lg group transition-all duration-200 ease-in-out hover:shadow-md",
        className,
        sizeClasses[size],
        { "aspect-[3/2]": !isFeatured && size !== "square" }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} />
    </Container>
  )
}

const ImageOrPlaceholder = ({ image }: { image?: string | null }) => {
  const validImage = image && image.trim().length > 0

  return validImage ? (
    <Image
      src={image}
      alt="Product thumbnail"
      fill
      className="object-cover object-center"
      draggable={false}
      sizes="(max-width: 576px) 80px, (max-width: 768px) 160px, 300px"
    />
  ) : (
    <div className="flex items-center justify-center w-full h-full bg-gray-100">
      <PlaceholderImage size={40} />
    </div>
  )
}

export default Thumbnail
