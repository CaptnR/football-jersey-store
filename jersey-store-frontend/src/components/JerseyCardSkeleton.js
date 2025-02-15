function JerseyCardSkeleton() {
    return (
        <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
            </CardContent>
        </Card>
    );
} 