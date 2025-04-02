
import { Box, Button } from "@mui/material";

export default function ImageUpload({ images, setImages }) {
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

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
              style={{ borderRadius: "5px", objectFit: "cover" }}
            />
            <Button
              size="small"
              onClick={() => removeImage(index)}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "red",
                color: "white",
                fontSize: "10px",
              }}
            >
              X
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};