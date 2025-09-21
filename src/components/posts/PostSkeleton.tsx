import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export function PostSkeleton() {
  return (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton width="40%" height={20} />
          <Skeleton width="25%" height={16} />
        </Box>
      </Box>
      <Skeleton height={18} sx={{ mb: 1 }} />
      <Skeleton height={18} sx={{ mb: 1 }} />
      <Skeleton height={18} width="60%" />
    </Box>
  );
}
