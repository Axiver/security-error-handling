import MainLayout from "@/components/MainLayout";
import { Alert, Box, Button, CircularProgress, Container, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation } from "react-query";

const CreateSellPost = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const {
    isLoading: createSellPostIsLoading,
    isSuccess: createSellPostIsSuccess,
    error: createSellPostError,
    mutate: createSellPost,
  } = useMutation(async ({ name, description }: { name: string; description: string }) => {
    const resp = await fetch("/api/sell-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        status: "active",
      }),
    });
    if (!resp.ok) {
      throw new Error("Failed to create sell post");
    }
  });

  return (
    <MainLayout>
      <Container maxWidth="xl">
        <Stack
          sx={({ spacing }) => ({
            width: "100%",
            color: "grey.300",
            paddingX: spacing(2),
            paddingY: spacing(4),
          })}
          gap={2}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              color: "grey.700",
            }}
            component="h1"
            variant="h5"
          >
            Create Sell Post
          </Typography>
          <TextField
            variant="outlined"
            label="Name"
            placeholder="Name"
            value={name}
            inputProps={{ minLength: 8, maxLength: 128 }}
            onChange={(e) => {
              setName(e.target.value);
            }}
            required
          />
          <TextField
            variant="outlined"
            type="text"
            multiline
            label="Description"
            placeholder="Description"
            value={description}
            inputProps={{ minLength: 0, maxLength: 2048 }}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
          <>
            {createSellPostError && (
              <Alert severity="error">{createSellPostError instanceof Error ? createSellPostError.message : "An unknown error occured."}</Alert>
            )}
            {createSellPostIsSuccess && <Alert severity="success">Created Sell Post! Redirecting to sell post.</Alert>}
          </>
          <Box>
            <Button
              sx={{
                boxShadow: "none",
              }}
              variant="contained"
              onClick={async () => {
                createSellPost({ name, description });
              }}
              disabled={createSellPostIsLoading}
            >
              <CircularProgress size={24} sx={{ color: "white", marginRight: 1 }} style={{ display: createSellPostIsLoading ? "block" : "none" }} />
              Create
            </Button>
          </Box>
        </Stack>
      </Container>
    </MainLayout>
  );
};

export default CreateSellPost;
