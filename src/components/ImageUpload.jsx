import { Box, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";

export default function ImageUpload({ images, setImages }) {
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    // Revoke the object URL to free up memory
    URL.revokeObjectURL(images[index].preview);
  };

  // Clean up object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  return (
    <Box>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        style={{ marginBottom: "10px" }}
      />
      <Box display="flex" flexWrap="wrap" gap={2}>
        {images.map((image, index) => (
          <Box key={index} position="relative">
            <img
              src={URL.createObjectURL(image)}
              alt={`preview-${index}`}
              width={100}
              height={100}
              style={{
                borderRadius: "8px",
                objectFit: "cover",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
            <IconButton
              size="small"
              onClick={() => removeImage(index)}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "white",
                '&:hover': { backgroundColor: "rgba(0,0,0,0.8)" },
              }}
              aria-label="remove image"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}