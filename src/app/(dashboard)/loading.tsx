import Box from "@mui/material/Box";

import { PostSkeleton } from "@/components/posts/PostSkeleton";

export default function DashboardLoading() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </Box>
  );
}
