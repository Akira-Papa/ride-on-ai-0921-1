import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Typography variant="h3" fontWeight={700}>
        ページが見つかりません
      </Typography>
      <Typography variant="body2" color="text.secondary">
        リンクが無効か、ページが移動した可能性があります。
      </Typography>
      <Button component={Link} href="/dashboard" variant="contained">
        ダッシュボードに戻る
      </Button>
    </Box>
  );
}
